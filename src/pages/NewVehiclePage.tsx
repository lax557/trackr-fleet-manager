import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VehicleCategory, VehicleStatus, AcquisitionStage } from '@/types';
import { categoryLabels, categoryDescriptions, statusLabels, stageLabels } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Car } from 'lucide-react';
import { toast } from 'sonner';

const categories: VehicleCategory[] = ['A', 'B', 'C', 'D', 'EV'];
const initialStatuses: VehicleStatus[] = ['DISPONIVEL', 'EM_LIBERACAO'];
const pipelineStages: AcquisitionStage[] = [
  'EM_LIBERACAO',
  'APROVADO',
  'FATURADO',
  'RECEBIDO',
  'INSTALACAO_EQUIPAMENTOS',
  'PRONTO_PARA_ALUGAR',
];

export function NewVehiclePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    vehicleId: '',
    plate: '',
    make: '',
    model: '',
    version: '',
    yearMfg: '',
    yearModel: '',
    category: '' as VehicleCategory | '',
    status: 'EM_LIBERACAO' as VehicleStatus,
    stage: 'EM_LIBERACAO' as AcquisitionStage,
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vehicleId || !formData.make || !formData.model || !formData.category) {
      toast.error('Preencha os campos obrigatórios: VehicleID, Marca, Modelo e Categoria.');
      return;
    }

    // In a real app this would persist to the database
    console.log('Creating vehicle:', formData);

    toast.success(`Veículo ${formData.vehicleId} cadastrado com sucesso!`);
    navigate(`/vehicles/${formData.vehicleId}`);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/vehicles')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Novo Veículo</h1>
          <p className="text-muted-foreground text-sm">Cadastre um novo veículo na frota</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              <CardTitle>Dados do Veículo</CardTitle>
            </div>
            <CardDescription>Informações básicas de cadastro</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicleId">VehicleID *</Label>
              <Input
                id="vehicleId"
                value={formData.vehicleId}
                onChange={(e) => handleChange('vehicleId', e.target.value.toUpperCase())}
                placeholder="Ex: TRK-011"
                required
              />
            </div>
            <div>
              <Label htmlFor="plate">Placa</Label>
              <Input
                id="plate"
                value={formData.plate}
                onChange={(e) => handleChange('plate', e.target.value.toUpperCase())}
                placeholder="ABC1D23 (opcional)"
              />
            </div>
            <div>
              <Label htmlFor="make">Marca *</Label>
              <Input
                id="make"
                value={formData.make}
                onChange={(e) => handleChange('make', e.target.value)}
                placeholder="Ex: Chevrolet"
                required
              />
            </div>
            <div>
              <Label htmlFor="model">Modelo *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="Ex: Onix Plus"
                required
              />
            </div>
            <div>
              <Label htmlFor="version">Versão</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => handleChange('version', e.target.value)}
                placeholder="Ex: 1.0 Turbo LTZ (opcional)"
              />
            </div>
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {categoryLabels[cat]} — {categoryDescriptions[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="yearMfg">Ano Fabricação</Label>
              <Input
                id="yearMfg"
                type="number"
                value={formData.yearMfg}
                onChange={(e) => handleChange('yearMfg', e.target.value)}
                placeholder="2024"
              />
            </div>
            <div>
              <Label htmlFor="yearModel">Ano Modelo</Label>
              <Input
                id="yearModel"
                type="number"
                value={formData.yearModel}
                onChange={(e) => handleChange('yearModel', e.target.value)}
                placeholder="2025"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status e Pipeline</CardTitle>
            <CardDescription>Defina o estado inicial do veículo</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status Inicial</Label>
              <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {initialStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.status === 'EM_LIBERACAO' && (
              <div>
                <Label htmlFor="stage">Etapa do Pipeline</Label>
                <Select value={formData.stage} onValueChange={(v) => handleChange('stage', v)}>
                  <SelectTrigger id="stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pipelineStages.map((s) => (
                      <SelectItem key={s} value={s}>
                        {stageLabels[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/vehicles')}>
            Cancelar
          </Button>
          <Button type="submit">
            Cadastrar Veículo
          </Button>
        </div>
      </form>
    </div>
  );
}

export default NewVehiclePage;
