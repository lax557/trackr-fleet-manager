import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder, areaLabels, MaintenanceTypeDB, ServiceAreaDB, MaintenanceOrderStatus } from '@/services/maintenance.service';
import { fetchVehicles } from '@/services/vehicles.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, Wrench, Car, DollarSign, Save } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ItemForm {
  id: string;
  description: string;
  qty: number;
  unitCost: number;
}

export function NewMaintenancePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const vehicleIdParam = searchParams.get('vehicleId') || '';

  const [vehicleId, setVehicleId] = useState(vehicleIdParam);
  const [openedAt, setOpenedAt] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [odometerKm, setOdometerKm] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceTypeDB>('preventive');
  const [serviceArea, setServiceArea] = useState<ServiceAreaDB>('mechanical');
  const [status, setStatus] = useState<MaintenanceOrderStatus>('done');
  const [notes, setNotes] = useState('');
  const [laborCost, setLaborCost] = useState('0');
  const [items, setItems] = useState<ItemForm[]>([]);

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles-list'],
    queryFn: fetchVehicles,
  });

  const selectedVehicle = useMemo(() => vehicles.find(v => v.id === vehicleId), [vehicles, vehicleId]);

  const partsCost = items.reduce((s, i) => s + i.qty * i.unitCost, 0);
  const totalCost = partsCost + parseFloat(laborCost || '0');

  const addItem = () => setItems([...items, { id: `item-${Date.now()}`, description: '', qty: 1, unitCost: 0 }]);
  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));
  const updateItem = (id: string, field: keyof ItemForm, value: any) =>
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));

  const saveMut = useMutation({
    mutationFn: () => createOrder({
      vehicle_id: vehicleId,
      opened_at: new Date(openedAt).toISOString(),
      type: maintenanceType,
      service_area: serviceArea,
      status,
      supplier_name: supplierName || null,
      odometer_at_open: odometerKm ? parseInt(odometerKm) : null,
      notes: notes || null,
      labor_cost: parseFloat(laborCost || '0'),
      items: items.filter(i => i.description).map(i => ({ description: i.description, qty: i.qty, unit_cost: i.unitCost })),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-orders'] });
      toast.success('Manutenção registrada com sucesso!');
      navigate('/maintenance');
    },
    onError: (e: any) => toast.error(e.message || 'Erro ao salvar manutenção'),
  });

  const handleSave = () => {
    if (!vehicleId) { toast.error('Selecione um veículo'); return; }
    saveMut.mutate();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/maintenance')}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Wrench className="h-6 w-6 text-primary" />Nova Manutenção</h1>
          <p className="text-muted-foreground mt-1">Registre uma nova manutenção de veículo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Identification */}
          <Card>
            <CardHeader className="pb-3"><div className="flex items-center gap-2"><Car className="h-5 w-5 text-primary" /><CardTitle>Identificação</CardTitle></div><CardDescription>Dados do veículo e serviço</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Veículo *</Label>
                  <Select value={vehicleId} onValueChange={setVehicleId}>
                    <SelectTrigger><SelectValue placeholder="Selecione o veículo" /></SelectTrigger>
                    <SelectContent>
                      {vehicles.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.plate || v.vehicle_code || v.id.slice(0,8)} - {v.brand} {v.model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Data/Hora *</Label><Input type="datetime-local" value={openedAt} onChange={e => setOpenedAt(e.target.value)} /></div>
                <div className="space-y-2"><Label>Odômetro (km)</Label><Input type="number" placeholder="Ex: 45000" value={odometerKm} onChange={e => setOdometerKm(e.target.value)} /></div>
                <div className="space-y-2"><Label>Fornecedor</Label><Input placeholder="Nome do fornecedor" value={supplierName} onChange={e => setSupplierName(e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select value={maintenanceType} onValueChange={v => setMaintenanceType(v as MaintenanceTypeDB)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventive">Preventiva</SelectItem>
                      <SelectItem value="corrective">Corretiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Área *</Label>
                  <Select value={serviceArea} onValueChange={v => setServiceArea(v as ServiceAreaDB)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(areaLabels).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={v => setStatus(v as MaintenanceOrderStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Aberta</SelectItem>
                      <SelectItem value="in_progress">Em Execução</SelectItem>
                      <SelectItem value="done">Finalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary" /><CardTitle>Itens/Peças</CardTitle></div>
                <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-4 w-4 mr-1" />Adicionar Item</Button>
              </div>
              <CardDescription>Peças e serviços realizados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhum item adicionado.</div>
              ) : items.map((item, idx) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Item {idx + 1}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2"><Label className="text-xs">Descrição</Label><Input placeholder="Ex: Filtro de óleo" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} /></div>
                    <div><Label className="text-xs">Quantidade</Label><Input type="number" min="1" value={item.qty} onChange={e => updateItem(item.id, 'qty', parseInt(e.target.value) || 1)} /></div>
                    <div><Label className="text-xs">Custo Unitário</Label><Input type="number" step="0.01" value={item.unitCost} onChange={e => updateItem(item.id, 'unitCost', parseFloat(e.target.value) || 0)} /></div>
                  </div>
                  <div className="text-sm text-right font-medium">Total: R$ {(item.qty * item.unitCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Labor */}
          <Card>
            <CardHeader className="pb-3"><CardTitle>Mão de Obra</CardTitle></CardHeader>
            <CardContent><div className="space-y-2"><Label>Custo de Mão de Obra</Label><Input type="number" step="0.01" placeholder="0,00" value={laborCost} onChange={e => setLaborCost(e.target.value)} className="max-w-xs" /></div></CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3"><CardTitle>Observações</CardTitle></CardHeader>
            <CardContent><Textarea placeholder="Observações adicionais..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} /></CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {selectedVehicle && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Veículo Selecionado</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Código</span><span className="font-medium">{selectedVehicle.vehicle_code || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Placa</span><span>{selectedVehicle.plate || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Modelo</span><span>{selectedVehicle.brand} {selectedVehicle.model}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Ano</span><span>{selectedVehicle.year_model || '—'}</span></div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-primary/50">
            <CardHeader className="pb-3"><CardTitle className="text-base">Resumo de Custos</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Peças ({items.length} itens)</span><span>R$ {partsCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Mão de Obra</span><span>R$ {parseFloat(laborCost || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              <div className="border-t pt-3"><div className="flex justify-between font-medium"><span>Total</span><span className="text-lg text-primary">R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div></div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button className="w-full" size="lg" onClick={handleSave} disabled={saveMut.isPending}><Save className="h-4 w-4 mr-2" />Salvar Manutenção</Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/maintenance')}>Cancelar</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewMaintenancePage;
