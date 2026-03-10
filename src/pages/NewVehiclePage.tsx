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
const currentYear = new Date().getFullYear();

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

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!formData.plate || formData.plate.length !== 7) e.plate = 'Placa deve ter exatamente 7 caracteres';
    if (!formData.make.trim()) e.make = 'Marca é obrigatória';
    if (!formData.model.trim()) e.model = 'Modelo é obrigatório';
    if (!formData.version.trim()) e.version = 'Versão é obrigatória';
    if (!formData.category) e.category = 'Categoria é obrigatória';
    if (!formData.color.trim()) e.color = 'Cor é obrigatória';

    const yMfg = parseInt(formData.yearMfg);
    if (!formData.yearMfg || isNaN(yMfg) || yMfg < 1990 || yMfg > currentYear + 1) {
      e.yearMfg = `Ano fabricação entre 1990 e ${currentYear + 1}`;
    }
    const yMod = parseInt(formData.yearModel);
    if (!formData.yearModel || isNaN(yMod) || yMod < 1990 || yMod > currentYear + 1) {
      e.yearModel = `Ano modelo entre 1990 e ${currentYear + 1}`;
    }

    if (!formData.vin || !/^[A-Za-z0-9]{17}$/.test(formData.vin)) {
      e.vin = 'Chassi deve ter exatamente 17 caracteres alfanuméricos';
    }
    if (!formData.renavam || !/^\d{11}$/.test(formData.renavam)) {
      e.renavam = 'RENAVAM deve ter exatamente 11 dígitos numéricos';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Corrija os campos destacados antes de prosseguir.');
      return;
    }

    mutation.mutate({
      brand: formData.make,
      model: formData.model,
      version: formData.version,
      plate: formData.plate.toUpperCase(),
      category: formData.category || 'B',
      year_mfg: parseInt(formData.yearMfg),
      year_model: parseInt(formData.yearModel),
      color: formData.color,
      vin: formData.vin.toUpperCase(),
      renavam: formData.renavam,
    });
  };

  const fieldError = (field: string) =>
    errors[field] ? <p className="text-sm text-destructive mt-1">{errors[field]}</p> : null;

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
            <CardDescription>O código (TRG-XXXX) será gerado automaticamente. Todos os campos são obrigatórios.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plate">Placa *</Label>
              <Input
                id="plate"
                value={formData.plate}
                onChange={(e) => handleChange('plate', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7))}
                placeholder="ABC1D23"
                maxLength={7}
                className={errors.plate ? 'border-destructive' : ''}
              />
              {fieldError('plate')}
            </div>
            <div>
              <Label htmlFor="make">Marca *</Label>
              <Input
                id="make"
                value={formData.make}
                onChange={(e) => handleChange('make', e.target.value)}
                placeholder="Ex: Chevrolet"
                className={errors.make ? 'border-destructive' : ''}
              />
              {fieldError('make')}
            </div>
            <div>
              <Label htmlFor="model">Modelo *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="Ex: Onix Plus"
                className={errors.model ? 'border-destructive' : ''}
              />
              {fieldError('model')}
            </div>
            <div>
              <Label htmlFor="version">Versão *</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => handleChange('version', e.target.value)}
                placeholder="Ex: 1.0 Turbo LTZ"
                className={errors.version ? 'border-destructive' : ''}
              />
              {fieldError('version')}
            </div>
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                <SelectTrigger id="category" className={errors.category ? 'border-destructive' : ''}>
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
              {fieldError('category')}
            </div>
            <div>
              <Label htmlFor="color">Cor *</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                placeholder="Ex: Branco"
                className={errors.color ? 'border-destructive' : ''}
              />
              {fieldError('color')}
            </div>
            <div>
              <Label htmlFor="yearMfg">Ano Fabricação *</Label>
              <Input
                id="yearMfg"
                type="number"
                value={formData.yearMfg}
                onChange={(e) => handleChange('yearMfg', e.target.value)}
                placeholder="2024"
                min={1990}
                max={currentYear + 1}
                className={errors.yearMfg ? 'border-destructive' : ''}
              />
              {fieldError('yearMfg')}
            </div>
            <div>
              <Label htmlFor="yearModel">Ano Modelo *</Label>
              <Input
                id="yearModel"
                type="number"
                value={formData.yearModel}
                onChange={(e) => handleChange('yearModel', e.target.value)}
                placeholder="2025"
                min={1990}
                max={currentYear + 1}
                className={errors.yearModel ? 'border-destructive' : ''}
              />
              {fieldError('yearModel')}
            </div>
            <div>
              <Label htmlFor="vin">Chassi (VIN) *</Label>
              <Input
                id="vin"
                value={formData.vin}
                onChange={(e) => handleChange('vin', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 17))}
                placeholder="17 caracteres alfanuméricos"
                maxLength={17}
                className={errors.vin ? 'border-destructive' : ''}
              />
              {fieldError('vin')}
            </div>
            <div>
              <Label htmlFor="renavam">RENAVAM *</Label>
              <Input
                id="renavam"
                value={formData.renavam}
                onChange={(e) => handleChange('renavam', e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="11 dígitos numéricos"
                maxLength={11}
                className={errors.renavam ? 'border-destructive' : ''}
              />
              {fieldError('renavam')}
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
