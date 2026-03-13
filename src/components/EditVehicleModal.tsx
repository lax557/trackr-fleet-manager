import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateVehicle } from '@/services/vehicles.service';
import { VehicleCategory } from '@/types';
import { categoryLabels, categoryDescriptions } from '@/data/mockData';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const categories: VehicleCategory[] = ['A', 'B', 'C', 'D', 'EV'];
const currentYear = new Date().getFullYear();

interface EditVehicleModalProps {
  vehicle: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditVehicleModal({ vehicle, open, onOpenChange }: EditVehicleModalProps) {
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
    deliveredAt: '',
    ownerType: '',
    ownerName: '',
    ownerDocument: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (vehicle && open) {
      setFormData({
        plate: vehicle.plate || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        version: vehicle.version || '',
        yearMfg: vehicle.yearMfg?.toString() || '',
        yearModel: vehicle.yearModel?.toString() || '',
        category: vehicle.category || '',
        color: vehicle.color || '',
        vin: vehicle.vin || '',
        renavam: vehicle.renavam || '',
        deliveredAt: vehicle.deliveredAt ? new Date(vehicle.deliveredAt).toISOString().split('T')[0] : '',
        ownerType: vehicle.ownerType || '',
        ownerName: vehicle.ownerName || '',
        ownerDocument: vehicle.ownerDocument || '',
      });
      setErrors({});
    }
  }, [vehicle, open]);

  const mutation = useMutation({
    mutationFn: (fields: Parameters<typeof updateVehicle>[1]) => updateVehicle(vehicle.id, fields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicle.id] });
      toast.success('Veículo atualizado com sucesso!');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (formData.plate && formData.plate.length !== 7) e.plate = 'Placa deve ter 7 caracteres';
    if (!formData.make.trim()) e.make = 'Marca é obrigatória';
    if (!formData.model.trim()) e.model = 'Modelo é obrigatório';
    if (!formData.category) e.category = 'Categoria é obrigatória';
    if (formData.vin && !/^[A-Za-z0-9]{17}$/.test(formData.vin)) e.vin = 'Chassi deve ter 17 caracteres alfanuméricos';
    if (formData.renavam && !/^\d{11}$/.test(formData.renavam)) e.renavam = 'RENAVAM deve ter 11 dígitos';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    mutation.mutate({
      plate: formData.plate.toUpperCase() || undefined,
      brand: formData.make,
      model: formData.model,
      version: formData.version,
      category: formData.category || 'B',
      year_mfg: formData.yearMfg ? parseInt(formData.yearMfg) : undefined,
      year_model: formData.yearModel ? parseInt(formData.yearModel) : undefined,
      color: formData.color,
      vin: formData.vin.toUpperCase() || undefined,
      renavam: formData.renavam || undefined,
      delivered_at: formData.deliveredAt || null,
      owner_type: formData.ownerType || null,
      owner_name: formData.ownerName || null,
      owner_document: formData.ownerDocument || null,
    });
  };

  const fieldError = (field: string) =>
    errors[field] ? <p className="text-sm text-destructive mt-1">{errors[field]}</p> : null;

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Veículo</DialogTitle>
          <DialogDescription>{vehicle.vehicleCode || vehicle.id.slice(0, 8)} — {vehicle.make} {vehicle.model}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div>
            <Label>Placa</Label>
            <Input value={formData.plate} onChange={(e) => handleChange('plate', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7))} maxLength={7} className={errors.plate ? 'border-destructive' : ''} />
            {fieldError('plate')}
          </div>
          <div>
            <Label>Marca *</Label>
            <Input value={formData.make} onChange={(e) => handleChange('make', e.target.value)} className={errors.make ? 'border-destructive' : ''} />
            {fieldError('make')}
          </div>
          <div>
            <Label>Modelo *</Label>
            <Input value={formData.model} onChange={(e) => handleChange('model', e.target.value)} className={errors.model ? 'border-destructive' : ''} />
            {fieldError('model')}
          </div>
          <div>
            <Label>Versão</Label>
            <Input value={formData.version} onChange={(e) => handleChange('version', e.target.value)} />
          </div>
          <div>
            <Label>Categoria *</Label>
            <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
              <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{categoryLabels[cat]} — {categoryDescriptions[cat]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError('category')}
          </div>
          <div>
            <Label>Cor</Label>
            <Input value={formData.color} onChange={(e) => handleChange('color', e.target.value)} />
          </div>
          <div>
            <Label>Ano Fabricação</Label>
            <Input type="number" value={formData.yearMfg} onChange={(e) => handleChange('yearMfg', e.target.value)} min={1990} max={currentYear + 1} />
          </div>
          <div>
            <Label>Ano Modelo</Label>
            <Input type="number" value={formData.yearModel} onChange={(e) => handleChange('yearModel', e.target.value)} min={1990} max={currentYear + 1} />
          </div>
          <div>
            <Label>Chassi (VIN)</Label>
            <Input value={formData.vin} onChange={(e) => handleChange('vin', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 17))} maxLength={17} className={errors.vin ? 'border-destructive' : ''} />
            {fieldError('vin')}
          </div>
          <div>
            <Label>RENAVAM</Label>
            <Input value={formData.renavam} onChange={(e) => handleChange('renavam', e.target.value.replace(/\D/g, '').slice(0, 11))} maxLength={11} className={errors.renavam ? 'border-destructive' : ''} />
            {fieldError('renavam')}
          </div>
          <div>
            <Label>Data de Entrega</Label>
            <Input type="date" value={formData.deliveredAt} onChange={(e) => handleChange('deliveredAt', e.target.value)} />
          </div>

          {/* Owner section */}
          <div className="md:col-span-2 border-t pt-4 mt-2">
            <h3 className="text-sm font-semibold text-foreground mb-3">Proprietário do Veículo</h3>
          </div>
          <div>
            <Label>Tipo</Label>
            <Select value={formData.ownerType} onValueChange={(v) => handleChange('ownerType', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TARGA">Targa (Próprio)</SelectItem>
                <SelectItem value="PF">Pessoa Física</SelectItem>
                <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nome do Proprietário</Label>
            <Input value={formData.ownerName} onChange={(e) => handleChange('ownerName', e.target.value)} placeholder="Nome completo ou razão social" />
          </div>
          <div>
            <Label>CPF/CNPJ do Proprietário</Label>
            <Input value={formData.ownerDocument} onChange={(e) => handleChange('ownerDocument', e.target.value)} placeholder="Documento" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
