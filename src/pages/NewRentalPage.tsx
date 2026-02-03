import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAvailableDrivers, 
  getAvailableVehicles, 
  getActiveContractTemplates,
  mockDrivers,
  priceFrequencyLabels
} from '@/data/mockData';
import { Driver, Vehicle, ContractTemplate, PriceFrequency } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  User, 
  Car, 
  FileText, 
  DollarSign,
  Search,
  Plus,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CategoryBadge } from '@/components/CategoryBadge';

type WizardStep = 1 | 2 | 3 | 4;

interface RentalFormData {
  driverId: string | null;
  vehicleId: string | null;
  startDate: string;
  priceAmount: string;
  priceFrequency: PriceFrequency;
  dueDay: string;
  depositAmount: string;
  notes: string;
  templateId: string | null;
  signatureStatus: 'DRAFT' | 'SENT' | 'SIGNED';
}

const stepLabels = {
  1: 'Motorista',
  2: 'Veículo',
  3: 'Termos',
  4: 'Contrato',
};

export function NewRentalPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [driverSearch, setDriverSearch] = useState('');
  
  const [formData, setFormData] = useState<RentalFormData>({
    driverId: null,
    vehicleId: null,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    priceAmount: '600',
    priceFrequency: 'WEEKLY',
    dueDay: '1',
    depositAmount: '1200',
    notes: '',
    templateId: null,
    signatureStatus: 'DRAFT',
  });

  const availableDrivers = useMemo(() => getAvailableDrivers(), []);
  const availableVehicles = useMemo(() => getAvailableVehicles(), []);
  const templates = useMemo(() => getActiveContractTemplates(), []);

  const selectedDriver = useMemo(() => 
    mockDrivers.find(d => d.id === formData.driverId), 
    [formData.driverId]
  );
  
  const selectedVehicle = useMemo(() => 
    availableVehicles.find(v => v.id === formData.vehicleId), 
    [formData.vehicleId, availableVehicles]
  );

  const selectedTemplate = useMemo(() =>
    templates.find(t => t.id === formData.templateId),
    [formData.templateId, templates]
  );

  const filteredDrivers = useMemo(() => {
    if (!driverSearch) return availableDrivers;
    const search = driverSearch.toLowerCase();
    return availableDrivers.filter(d => 
      d.fullName.toLowerCase().includes(search) ||
      d.phone.includes(search) ||
      (d.cpf && d.cpf.includes(search))
    );
  }, [availableDrivers, driverSearch]);

  const progressValue = (currentStep / 4) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!formData.driverId;
      case 2: return !!formData.vehicleId;
      case 3: return !!formData.priceAmount && !!formData.startDate;
      case 4: return !!formData.templateId;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  const renderContractPreview = () => {
    if (!selectedTemplate || !selectedDriver || !selectedVehicle) return null;

    let content = selectedTemplate.templateBody;
    content = content.replace(/{{driver_name}}/g, selectedDriver.fullName);
    content = content.replace(/{{driver_cpf}}/g, selectedDriver.cpf || 'Não informado');
    content = content.replace(/{{driver_cnh}}/g, selectedDriver.cnh || 'Não informado');
    content = content.replace(/{{vehicle_id}}/g, selectedVehicle.id);
    content = content.replace(/{{vehicle_plate}}/g, selectedVehicle.plate || 'Sem placa');
    content = content.replace(/{{start_date}}/g, format(new Date(formData.startDate), 'dd/MM/yyyy'));
    content = content.replace(/{{price_amount}}/g, formData.priceAmount);
    content = content.replace(/{{price_frequency}}/g, priceFrequencyLabels[formData.priceFrequency]);
    content = content.replace(/{{due_day}}/g, formData.dueDay || 'N/A');
    content = content.replace(/{{deposit_amount}}/g, formData.depositAmount || '0');

    return content;
  };

  const handleSave = () => {
    if (!canProceed()) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    // Simula criação
    toast.success('Locação criada com sucesso!');
    navigate('/rentals');
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
            Passo {currentStep} de 4: {stepLabels[currentStep]}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <Progress value={progressValue} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          {Object.entries(stepLabels).map(([step, label]) => (
            <div 
              key={step} 
              className={`flex items-center gap-1 ${Number(step) <= currentStep ? 'text-primary font-medium' : ''}`}
            >
              {Number(step) < currentStep ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : Number(step) === currentStep ? (
                <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground">
                  {step}
                </div>
              ) : (
                <div className="h-4 w-4 rounded-full border flex items-center justify-center text-[10px]">
                  {step}
                </div>
              )}
              <span className="hidden sm:inline">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="min-h-[400px]">
        <CardContent className="p-6">
          {/* Step 1: Select Driver */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">Selecionar Motorista</h2>
                  <p className="text-sm text-muted-foreground">
                    Escolha um motorista disponível ou cadastre um novo
                  </p>
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

              <div className="grid gap-2 max-h-[300px] overflow-y-auto">
                {filteredDrivers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Nenhum motorista disponível encontrado</p>
                    <Button variant="outline" onClick={() => navigate('/drivers/new')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Motorista
                    </Button>
                  </div>
                ) : (
                  filteredDrivers.map((driver) => (
                    <div
                      key={driver.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.driverId === driver.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-muted-foreground/50'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, driverId: driver.id }))}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{driver.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {driver.phone} {driver.cpf && `• CPF: ${driver.cpf}`}
                          </p>
                        </div>
                        {formData.driverId === driver.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t pt-4">
                <Button variant="outline" onClick={() => navigate('/drivers/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Novo Motorista
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Select Vehicle */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Car className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">Selecionar Veículo</h2>
                  <p className="text-sm text-muted-foreground">
                    Apenas veículos disponíveis são listados
                  </p>
                </div>
              </div>

              <div className="grid gap-2 max-h-[350px] overflow-y-auto">
                {availableVehicles.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum veículo disponível no momento</p>
                  </div>
                ) : (
                  availableVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.vehicleId === vehicle.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-muted-foreground/50'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, vehicleId: vehicle.id }))}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">
                              {vehicle.plate || 'Sem placa'} 
                              <span className="text-muted-foreground ml-2">({vehicle.id})</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {vehicle.make} {vehicle.model} {vehicle.version}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CategoryBadge category={vehicle.category} />
                          {formData.vehicleId === vehicle.id && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 3: Terms */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">Definir Termos</h2>
                  <p className="text-sm text-muted-foreground">
                    Configure valor, frequência e condições
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Início *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceAmount">Valor (R$) *</Label>
                  <Input
                    id="priceAmount"
                    type="number"
                    value={formData.priceAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, priceAmount: e.target.value }))}
                    placeholder="600"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Frequência de Pagamento *</Label>
                  <RadioGroup
                    value={formData.priceFrequency}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priceFrequency: value as PriceFrequency }))}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="WEEKLY" id="weekly" />
                      <Label htmlFor="weekly" className="font-normal">Semanal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="MONTHLY" id="monthly" />
                      <Label htmlFor="monthly" className="font-normal">Mensal</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDay">Dia de Vencimento</Label>
                  <Input
                    id="dueDay"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dueDay}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDay: e.target.value }))}
                    placeholder="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depositAmount">Caução (R$)</Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, depositAmount: e.target.value }))}
                    placeholder="1200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Anotações adicionais sobre a locação..."
                  rows={3}
                />
              </div>

              {/* Summary */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-2">Resumo</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Motorista: <span className="text-foreground font-medium">{selectedDriver?.fullName}</span></p>
                    <p>Veículo: <span className="text-foreground font-medium">{selectedVehicle?.plate || selectedVehicle?.id}</span></p>
                    <p>Valor: <span className="text-foreground font-medium">R$ {formData.priceAmount} / {priceFrequencyLabels[formData.priceFrequency]}</span></p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Contract */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">Gerar Contrato</h2>
                  <p className="text-sm text-muted-foreground">
                    Selecione um modelo e visualize o contrato
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Modelo de Contrato *</Label>
                <Select
                  value={formData.templateId || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, templateId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um modelo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} ({template.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate && (
                <>
                  <div className="space-y-2">
                    <Label>Status da Assinatura</Label>
                    <RadioGroup
                      value={formData.signatureStatus}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, signatureStatus: value as 'DRAFT' | 'SENT' | 'SIGNED' }))}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="DRAFT" id="sig-draft" />
                        <Label htmlFor="sig-draft" className="font-normal">Rascunho</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="SENT" id="sig-sent" />
                        <Label htmlFor="sig-sent" className="font-normal">Enviado</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="SIGNED" id="sig-signed" />
                        <Label htmlFor="sig-signed" className="font-normal">Assinado</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Preview do Contrato</Label>
                      <Badge variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        {selectedTemplate.version}
                      </Badge>
                    </div>
                    <div 
                      className="border rounded-lg p-4 max-h-[300px] overflow-y-auto bg-white prose prose-sm"
                      dangerouslySetInnerHTML={{ __html: renderContractPreview() || '' }}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {currentStep < 4 ? (
          <Button onClick={handleNext} disabled={!canProceed()}>
            Próximo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={!canProceed()}>
            <Check className="h-4 w-4 mr-2" />
            Salvar Locação
          </Button>
        )}
      </div>
    </div>
  );
}

export default NewRentalPage;
