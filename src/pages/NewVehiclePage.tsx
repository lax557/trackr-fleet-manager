import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { VehicleCategory } from '@/types';
import { categoryLabels, categoryDescriptions } from '@/data/mockData';
import { createVehicle } from '@/services/vehicles.service';
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
import { ArrowLeft, Car, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const categories: VehicleCategory[] = ['A', 'B', 'C', 'D', 'EV'];

export function NewVehiclePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    plate: '',
    make: '',
    model: '',
    version: '',
    yearMfg: '',
    yearModel: '',
    category: '' as VehicleCategory | '',
    color: '',
    vin: '',
    renavam: '',
  });

  const mutation = useMutation({
    mutationFn: createVehicle,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Veículo cadastrado com sucesso!');
      navigate(`/vehicles/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(`Erro ao cadastrar: ${error.message}`);
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.make || !formData.model || !formData.category) {
      toast.error('Preencha os campos obrigatórios: Marca, Modelo e Categoria.');
      return;
    }

    if (formData.plate && formData.plate.length !== 7) {
      toast.error('A placa deve ter exatamente 7 caracteres (ex: ABC1D23).');
      return;
    }

    mutation.mutate({
      brand: formData.make,
      model: formData.model,
      version: formData.version || undefined,
      plate: formData.plate || undefined,
      category: formData.category || 'B',
      year_mfg: formData.yearMfg ? parseInt(formData.yearMfg) : undefined,
      year_model: formData.yearModel ? parseInt(formData.yearModel) : undefined,
      color: formData.color || undefined,
      vin: formData.vin || undefined,
      renavam: formData.renavam || undefined,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
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
            <CardDescription>O código (TRK-XXX) será gerado automaticamente</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="color">Cor</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                placeholder="Ex: Branco"
              />
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
            <div>
              <Label htmlFor="vin">Chassi (VIN)</Label>
              <Input
                id="vin"
                value={formData.vin}
                onChange={(e) => handleChange('vin', e.target.value)}
                placeholder="Opcional"
              />
            </div>
            <div>
              <Label htmlFor="renavam">RENAVAM</Label>
              <Input
                id="renavam"
                value={formData.renavam}
                onChange={(e) => handleChange('renavam', e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/vehicles')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Cadastrar Veículo
          </Button>
        </div>
      </form>
    </div>
  );
}

export default NewVehiclePage;
