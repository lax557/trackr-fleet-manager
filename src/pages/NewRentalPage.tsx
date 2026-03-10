import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDrivers } from '@/services/drivers.service';
import { fetchVehicles } from '@/services/vehicles.service';
import { createRental } from '@/services/rentals.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, ArrowRight, Check, User, Car, DollarSign, Search, Plus, Loader2,
} from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { toast } from 'sonner';
import { CategoryBadge } from '@/components/CategoryBadge';

type WizardStep = 1 | 2 | 3;

interface RentalFormData {
  driverId: string | null;
  vehicleId: string | null;
  startDate: string;
  endDate: string;
  weeklyRate: string;
  deposit: string;
  notes: string;
}

const stepLabels: Record<number, string> = {
  1: 'Motorista',
  2: 'Veículo',
  3: 'Termos',
};

export function NewRentalPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const preSelectedDriverId = searchParams.get('driverId');

  const [currentStep, setCurrentStep] = useState<WizardStep>(() =>
    preSelectedDriverId ? 2 : 1
  );
  const [driverSearch, setDriverSearch] = useState('');
  const isDriverPreSelected = !!preSelectedDriverId;

  const initialStartDate = format(new Date(), 'yyyy-MM-dd');
  const initialEndDate = format(addMonths(new Date(), 12), 'yyyy-MM-dd');

  const [formData, setFormData] = useState<RentalFormData>({
    driverId: preSelectedDriverId,
    vehicleId: null,
    startDate: initialStartDate,
    endDate: initialEndDate,
    weeklyRate: '600',
    deposit: '1200',
    notes: '',
  });

  const { data: drivers = [], isLoading: loadingDrivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: fetchDrivers,
  });

  const { data: allVehicles = [], isLoading: loadingVehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles,
  });

  const availableVehicles = useMemo(
    () => allVehicles.filter(v => v.status === 'available'),
    [allVehicles]
  );

  const selectedDriver = useMemo(
    () => drivers.find(d => d.id === formData.driverId),
    [formData.driverId, drivers]
  );

  const selectedVehicle = useMemo(
    () => availableVehicles.find(v => v.id === formData.vehicleId),
    [formData.vehicleId, availableVehicles]
  );

  const filteredDrivers = useMemo(() => {
    if (!driverSearch) return drivers;
    const s = driverSearch.toLowerCase();
    return drivers.filter(d =>
      d.full_name.toLowerCase().includes(s) ||
      (d.phone && d.phone.includes(s)) ||
      (d.cpf && d.cpf.includes(s))
    );
  }, [drivers, driverSearch]);

  const saveMutation = useMutation({
    mutationFn: () =>
      createRental({
        driver_id: formData.driverId!,
        vehicle_id: formData.vehicleId!,
        start_date: formData.startDate,
        end_date: formData.endDate || undefined,
        weekly_rate: formData.weeklyRate ? Number(formData.weeklyRate) : undefined,
        deposit: formData.deposit ? Number(formData.deposit) : undefined,
        notes: formData.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      toast.success('Locação criada com sucesso!');
      navigate('/rentals');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const progressValue = (currentStep / 3) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!formData.driverId;
      case 2: return !!formData.vehicleId;
      case 3: return !!formData.weeklyRate && !!formData.startDate;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 3 && canProceed()) setCurrentStep((p) => (p + 1) as WizardStep);
  };
  const handleBack = () => {
    if (currentStep > 1) {
      if (isDriverPreSelected && currentStep === 2) { navigate(-1); return; }
      setCurrentStep((p) => (p - 1) as WizardStep);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/rentals')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Locação</h1>
          <p className="text-muted-foreground text-sm">
            Passo {currentStep} de 3: {stepLabels[currentStep]}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <Progress value={progressValue} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          {Object.entries(stepLabels).map(([step, label]) => {
            const stepNum = Number(step);
            const isCompleted = isDriverPreSelected
              ? (stepNum === 1 || stepNum < currentStep)
              : stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            return (
              <div key={step} className={`flex items-center gap-1 ${isCompleted || isCurrent ? 'text-primary font-medium' : ''}`}>
                {isCompleted ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : isCurrent ? (
                  <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground">{step}</div>
                ) : (
                  <div className="h-4 w-4 rounded-full border flex items-center justify-center text-[10px]">{step}</div>
                )}
                <span className="hidden sm:inline">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="min-h-[400px]">
        <CardContent className="p-6">
          {/* Step 1: Driver */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">Selecionar Motorista</h2>
                  <p className="text-sm text-muted-foreground">Escolha um motorista disponível</p>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, CPF ou telefone..."
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {loadingDrivers ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (
                <div className="grid gap-2 max-h-[300px] overflow-y-auto">
                  {filteredDrivers.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">Nenhum motorista encontrado</p>
                      <Button variant="outline" onClick={() => navigate('/drivers/new')}>
                        <Plus className="h-4 w-4 mr-2" />Cadastrar Motorista
                      </Button>
                    </div>
                  ) : filteredDrivers.map(driver => (
                    <div
                      key={driver.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.driverId === driver.id ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/50'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, driverId: driver.id }))}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{driver.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {driver.phone || ''} {driver.cpf && `• CPF: ${driver.cpf}`}
                          </p>
                        </div>
                        {formData.driverId === driver.id && <Check className="h-5 w-5 text-primary" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t pt-4">
                <Button variant="outline" onClick={() => navigate('/drivers/new')}>
                  <Plus className="h-4 w-4 mr-2" />Cadastrar Novo Motorista
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Vehicle */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Car className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">Selecionar Veículo</h2>
                  <p className="text-sm text-muted-foreground">Apenas veículos disponíveis são listados</p>
                </div>
              </div>
              {loadingVehicles ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (
                <div className="grid gap-2 max-h-[350px] overflow-y-auto">
                  {availableVehicles.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Nenhum veículo disponível no momento</p>
                    </div>
                  ) : availableVehicles.map(vehicle => (
                    <div
                      key={vehicle.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.vehicleId === vehicle.id ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/50'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, vehicleId: vehicle.id }))}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {vehicle.plate || 'Sem placa'}
                            <span className="text-muted-foreground ml-2">({vehicle.vehicle_code || vehicle.id.slice(0,8)})</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.brand} {vehicle.model} {vehicle.version || ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <CategoryBadge category={vehicle.category as any} />
                          {formData.vehicleId === vehicle.id && <Check className="h-5 w-5 text-primary" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Terms */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">Definir Termos</h2>
                  <p className="text-sm text-muted-foreground">Configure valor e condições</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Início *</Label>
                  <Input
                    id="startDate" type="date" value={formData.startDate}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      const newEnd = newStart ? format(addMonths(new Date(newStart), 12), 'yyyy-MM-dd') : formData.endDate;
                      setFormData(prev => ({ ...prev, startDate: newStart, endDate: newEnd }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data de Término</Label>
                  <Input
                    id="endDate" type="date" value={formData.endDate} min={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weeklyRate">Valor Semanal (R$) *</Label>
                  <Input
                    id="weeklyRate" type="number" value={formData.weeklyRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, weeklyRate: e.target.value }))}
                    placeholder="600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit">Caução (R$)</Label>
                  <Input
                    id="deposit" type="number" value={formData.deposit}
                    onChange={(e) => setFormData(prev => ({ ...prev, deposit: e.target.value }))}
                    placeholder="1200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes" value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Anotações adicionais sobre a locação..." rows={3}
                />
              </div>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-2">Resumo</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Motorista: <span className="text-foreground font-medium">{selectedDriver?.full_name || '—'}</span></p>
                    <p>Veículo: <span className="text-foreground font-medium">{selectedVehicle?.plate || selectedVehicle?.vehicle_code || '—'}</span></p>
                    <p>Período: <span className="text-foreground font-medium">
                      {formData.startDate ? format(new Date(formData.startDate), 'dd/MM/yyyy') : '—'} a {formData.endDate ? format(new Date(formData.endDate), 'dd/MM/yyyy') : '—'}
                    </span></p>
                    <p>Valor: <span className="text-foreground font-medium">R$ {formData.weeklyRate} / semana</span></p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 && !isDriverPreSelected}>
          <ArrowLeft className="h-4 w-4 mr-2" />Voltar
        </Button>
        {currentStep < 3 ? (
          <Button onClick={handleNext} disabled={!canProceed()}>
            Próximo<ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={() => saveMutation.mutate()} disabled={!canProceed() || saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
            Salvar Locação
          </Button>
        )}
      </div>
    </div>
  );
}

export default NewRentalPage;
