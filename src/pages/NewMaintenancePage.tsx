import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder, getOrderById, updateOrder, addItem as addItemService, deleteItem as deleteItemService, areaLabels, MaintenanceTypeDB, ServiceAreaDB, MaintenanceOrderStatus } from '@/services/maintenance.service';
import { fetchCatalogItems, createCatalogItem, saveExecutedItems, fetchExecutedItems, CatalogItem } from '@/services/maintenanceCatalog.service';
import { supabase } from '@/integrations/supabase/client';
import { fetchVehicles } from '@/services/vehicles.service';
import { fetchSuppliers, createSupplier, SupplierRow } from '@/services/suppliers.service';
import { usePermissions } from '@/hooks/usePermissions';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Trash2, Wrench, Car, DollarSign, Save, Search, Check, ChevronsUpDown, Package, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ItemForm {
  id: string;
  description: string;
  qty: number;
  unitCost: number;
}

export function NewMaintenancePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id: editId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const vehicleIdParam = searchParams.get('vehicleId') || '';
  const isEditing = !!editId;
  const { can, role } = usePermissions();
  const canManageSuppliers = can('vehicle:create'); // manager/admin
  const canOverrideOdometer = role === 'manager' || role === 'admin';

  const [vehicleId, setVehicleId] = useState(vehicleIdParam);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [odometerKm, setOdometerKm] = useState('');
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [supplierName, setSupplierName] = useState('');
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceTypeDB>('preventive');
  const [serviceArea, setServiceArea] = useState<ServiceAreaDB>('mechanical');
  const [status, setStatus] = useState<MaintenanceOrderStatus>('done');
  const [notes, setNotes] = useState('');
  const [laborCost, setLaborCost] = useState('0');
  const [items, setItems] = useState<ItemForm[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [executedItemIds, setExecutedItemIds] = useState<string[]>([]);
  const [executedItemOpen, setExecutedItemOpen] = useState(false);
  const [showCatalogModal2, setShowCatalogModal2] = useState(false);
  const [newCatalogName, setNewCatalogName] = useState('');
  const [newCatalogDesc, setNewCatalogDesc] = useState('');
  const [odometerOverrideOpen, setOdometerOverrideOpen] = useState(false);
  const [pendingSaveAfterOverride, setPendingSaveAfterOverride] = useState(false);
  // Supplier modal
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', document: '', phone: '', email: '', address: '' });

  // Load existing order for edit mode
  const { data: existingOrder, isLoading: loadingOrder } = useQuery({
    queryKey: ['maintenance-order', editId],
    queryFn: () => getOrderById(editId!),
    enabled: isEditing,
  });

  // Populate form when existing order loads
  useEffect(() => {
    if (existingOrder && !loaded) {
      setVehicleId(existingOrder.vehicle_id);
      setOpenedAt(format(new Date(existingOrder.opened_at), "yyyy-MM-dd'T'HH:mm"));
      setOdometerKm(existingOrder.odometer_at_open?.toString() || '');
      setSupplierId((existingOrder as any).supplier_id || null);
      setSupplierName(existingOrder.supplier_name || '');
      setMaintenanceType(existingOrder.type);
      setServiceArea(existingOrder.service_area);
      setStatus(existingOrder.status);
      setNotes(existingOrder.notes || '');
      setLaborCost((existingOrder.labor_cost || 0).toString());
      setItems((existingOrder.maintenance_items || []).map(i => ({
        id: i.id,
        description: i.description,
        qty: i.qty,
        unitCost: i.unit_cost,
      })));
      setLoaded(true);
    }
  }, [existingOrder, loaded]);

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles-list'],
    queryFn: fetchVehicles,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers,
  });

  const { data: catalogItems = [] } = useQuery({
    queryKey: ['maintenance-catalog-items'],
    queryFn: fetchCatalogItems,
  });

  const { data: existingExecutedItems } = useQuery({
    queryKey: ['executed-items', editId],
    queryFn: () => fetchExecutedItems(editId!),
    enabled: isEditing && !!editId,
  });

  // Populate executed items when editing
  useEffect(() => {
    if (existingExecutedItems && loaded) {
      setExecutedItemIds(existingExecutedItems.map(e => e.item_id));
    }
  }, [existingExecutedItems, loaded]);

  const selectedVehicle = useMemo(() => vehicles.find(v => v.id === vehicleId), [vehicles, vehicleId]);
  const selectedSupplier = useMemo(() => suppliers.find(s => s.id === supplierId), [suppliers, supplierId]);

  // Odometer validation
  const enteredOdometer = odometerKm ? parseInt(odometerKm) : null;
  const vehicleCurrentOdometer = (selectedVehicle as any)?.odometerCurrent ?? 0;
  const isOdometerLower = enteredOdometer !== null && vehicleCurrentOdometer > 0 && enteredOdometer < vehicleCurrentOdometer;

  // Display name for supplier field: prefer selected supplier, fall back to legacy text
  const supplierDisplayName = selectedSupplier?.name || supplierName || '';

  const partsCost = items.reduce((s, i) => s + i.qty * i.unitCost, 0);
  const totalCost = partsCost + parseFloat(laborCost || '0');

  const addItem = () => setItems([...items, { id: `item-${Date.now()}`, description: '', qty: 1, unitCost: 0 }]);
  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));
  const updateItem = (id: string, field: keyof ItemForm, value: any) =>
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));

  const createSupplierMut = useMutation({
    mutationFn: () => createSupplier(newSupplier),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setSupplierId(data.id);
      setSupplierName(data.name);
      setShowSupplierModal(false);
      setNewSupplier({ name: '', document: '', phone: '', email: '', address: '' });
      toast.success('Fornecedor cadastrado!');
    },
    onError: (e: any) => toast.error(e.message || 'Erro ao cadastrar fornecedor'),
  });

  const createCatalogMut = useMutation({
    mutationFn: () => createCatalogItem(newCatalogName, newCatalogDesc),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-catalog-items'] });
      setExecutedItemIds(prev => [...prev, data.id]);
      setShowCatalogModal2(false);
      setNewCatalogName('');
      setNewCatalogDesc('');
      toast.success('Item cadastrado!');
    },
    onError: (e: any) => toast.error(e.message || 'Erro'),
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const order = await createOrder({
        vehicle_id: vehicleId,
        opened_at: new Date(openedAt).toISOString(),
        type: maintenanceType,
        service_area: serviceArea,
        status,
        supplier_name: selectedSupplier?.name || supplierName || null,
        odometer_at_open: odometerKm ? parseInt(odometerKm) : null,
        notes: notes || null,
        labor_cost: parseFloat(laborCost || '0'),
        items: items.filter(i => i.description).map(i => ({ description: i.description, qty: i.qty, unit_cost: i.unitCost })),
      });
      // Save executed catalog items
      if (executedItemIds.length > 0) {
        await saveExecutedItems(order.id, executedItemIds);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-orders'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['maintenance-analytics'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['dashboard-executive'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['vehicles-list'] });
      toast.success('Manutenção registrada com sucesso!');
      navigate('/maintenance');
    },
    onError: (e: any) => toast.error(e.message || 'Erro ao salvar manutenção'),
  });

  const updateMut = useMutation({
    mutationFn: async () => {
      await updateOrder(editId!, {
        type: maintenanceType,
        service_area: serviceArea,
        status,
        supplier_name: selectedSupplier?.name || supplierName || null,
        odometer_at_open: odometerKm ? parseInt(odometerKm) : null,
        notes: notes || null,
        labor_cost: parseFloat(laborCost || '0'),
        opened_at: new Date(openedAt).toISOString(),
      });

      const existingItems = existingOrder?.maintenance_items || [];
      for (const item of existingItems) {
        await deleteItemService(item.id);
      }

      const validItems = items.filter(i => i.description);
      if (validItems.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        const { data: profile } = await supabase.from('profiles').select('company_id').eq('user_id', user.id).single();
        if (!profile) throw new Error('Profile not found');

        const itemsToInsert = validItems.map(i => ({
          company_id: profile.company_id,
          maintenance_order_id: editId!,
          description: i.description,
          qty: i.qty,
          unit_cost: i.unitCost,
          total_cost: i.qty * i.unitCost,
        }));
        const { error: itemsErr } = await supabase.from('maintenance_items').insert(itemsToInsert);
        if (itemsErr) throw itemsErr;
      }

      // Save executed catalog items
      await saveExecutedItems(editId!, executedItemIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-orders'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['maintenance-order', editId] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-analytics'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['dashboard-executive'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['vehicles-list'] });
      toast.success('Manutenção atualizada com sucesso!');
      navigate('/maintenance');
    },
    onError: (e: any) => toast.error(e.message || 'Erro ao atualizar manutenção'),
  });

  const doSave = () => {
    if (!vehicleId) { toast.error('Selecione um veículo'); return; }
    if (isEditing) {
      updateMut.mutate();
    } else {
      createMut.mutate();
    }
  };

  const handleSave = () => {
    if (!vehicleId) { toast.error('Selecione um veículo'); return; }
    // Odometer validation
    if (isOdometerLower) {
      if (!canOverrideOdometer) {
        toast.error(`Odômetro informado (${enteredOdometer?.toLocaleString()} km) é menor que o atual do veículo (${vehicleCurrentOdometer.toLocaleString()} km). Somente gerentes/admins podem sobrescrever.`);
        return;
      }
      // Show override confirmation
      setOdometerOverrideOpen(true);
      setPendingSaveAfterOverride(true);
      return;
    }
    doSave();
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  if (isEditing && loadingOrder) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/maintenance')}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            {isEditing ? 'Editar Manutenção' : 'Nova Manutenção'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? 'Atualize os dados da manutenção' : 'Registre uma nova manutenção de veículo'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Identification */}
          <Card>
            <CardHeader className="pb-3"><div className="flex items-center gap-2"><Car className="h-5 w-5 text-primary" /><CardTitle>Identificação</CardTitle></div><CardDescription>Dados do veículo e serviço</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vehicle Combobox */}
                <div className="space-y-2">
                  <Label>Veículo *</Label>
                  <Popover open={vehicleOpen} onOpenChange={setVehicleOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={vehicleOpen} className="w-full justify-between font-normal" disabled={isEditing}>
                        {selectedVehicle
                          ? `${selectedVehicle.plate || (selectedVehicle as any).vehicleCode || selectedVehicle.id.slice(0, 8)} - ${selectedVehicle.make} ${selectedVehicle.model}`
                          : 'Selecione o veículo'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar por placa ou modelo..." />
                        <CommandList>
                          <CommandEmpty>Nenhum veículo encontrado.</CommandEmpty>
                          <CommandGroup>
                            {vehicles.map(v => (
                              <CommandItem
                                key={v.id}
                                value={`${v.plate || ''} ${(v as any).vehicleCode || ''} ${v.make} ${v.model}`}
                                onSelect={() => { setVehicleId(v.id); setVehicleOpen(false); }}
                              >
                                <Check className={cn('mr-2 h-4 w-4', vehicleId === v.id ? 'opacity-100' : 'opacity-0')} />
                                {v.plate || (v as any).vehicleCode || v.id.slice(0, 8)} - {v.make} {v.model}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2"><Label>Data/Hora *</Label><Input type="datetime-local" value={openedAt} onChange={e => setOpenedAt(e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Odômetro (km)</Label>
                  <Input type="number" placeholder="Ex: 45000" value={odometerKm} onChange={e => setOdometerKm(e.target.value)} />
                  {isOdometerLower && (
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs mt-1">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Odômetro menor que o atual ({vehicleCurrentOdometer.toLocaleString()} km).
                        {canOverrideOdometer ? ' Será necessária confirmação ao salvar.' : ' Bloqueado — somente gerente/admin pode sobrescrever.'}
                      </span>
                    </div>
                  )}
                  {selectedVehicle && vehicleCurrentOdometer > 0 && !isOdometerLower && (
                    <p className="text-xs text-muted-foreground">Atual: {vehicleCurrentOdometer.toLocaleString()} km</p>
                  )}
                </div>

                {/* Supplier Combobox */}
                <div className="space-y-2">
                  <Label>Fornecedor</Label>
                  <Popover open={supplierOpen} onOpenChange={setSupplierOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={supplierOpen} className="w-full justify-between font-normal">
                        {supplierDisplayName || 'Selecione o fornecedor'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar fornecedor..." />
                        <CommandList>
                          <CommandEmpty>Nenhum fornecedor encontrado.</CommandEmpty>
                          <CommandGroup>
                            {suppliers.map(s => (
                              <CommandItem
                                key={s.id}
                                value={s.name}
                                onSelect={() => { setSupplierId(s.id); setSupplierName(s.name); setSupplierOpen(false); }}
                              >
                                <Check className={cn('mr-2 h-4 w-4', supplierId === s.id ? 'opacity-100' : 'opacity-0')} />
                                {s.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          {canManageSuppliers && (
                            <CommandGroup>
                              <CommandItem onSelect={() => { setSupplierOpen(false); setShowSupplierModal(true); }} className="text-primary">
                                <Plus className="mr-2 h-4 w-4" />
                                Cadastrar fornecedor
                              </CommandItem>
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

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

          {/* Executed Catalog Items */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Package className="h-5 w-5 text-primary" /><CardTitle>Itens Trocados</CardTitle></div>
              </div>
              <CardDescription>Selecione os itens do catálogo que foram trocados nesta manutenção</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Popover open={executedItemOpen} onOpenChange={setExecutedItemOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                    {executedItemIds.length > 0 ? `${executedItemIds.length} item(s) selecionado(s)` : 'Selecione itens trocados...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar item..." />
                    <CommandList>
                      <CommandEmpty>Nenhum item no catálogo.</CommandEmpty>
                      <CommandGroup>
                        {catalogItems.map(ci => {
                          const isSelected = executedItemIds.includes(ci.id);
                          return (
                            <CommandItem
                              key={ci.id}
                              value={ci.name}
                              onSelect={() => {
                                setExecutedItemIds(prev =>
                                  isSelected ? prev.filter(x => x !== ci.id) : [...prev, ci.id]
                                );
                              }}
                            >
                              <Check className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                              {ci.name}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                      <CommandGroup>
                        <CommandItem onSelect={() => { setExecutedItemOpen(false); setShowCatalogModal2(true); }} className="text-primary">
                          <Plus className="mr-2 h-4 w-4" />Novo item
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {executedItemIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {executedItemIds.map(id => {
                    const ci = catalogItems.find(c => c.id === id);
                    return ci ? (
                      <Badge key={id} variant="secondary" className="gap-1">
                        {ci.name}
                        <button onClick={() => setExecutedItemIds(prev => prev.filter(x => x !== id))} className="ml-1 hover:text-destructive">×</button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </CardContent>
          </Card>

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
                  <div className="flex justify-between"><span className="text-muted-foreground">Código</span><span className="font-medium">{(selectedVehicle as any).vehicleCode || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Placa</span><span>{selectedVehicle.plate || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Modelo</span><span>{selectedVehicle.make} {selectedVehicle.model}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Ano</span><span>{selectedVehicle.yearModel || '—'}</span></div>
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
            <Button className="w-full" size="lg" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Atualizar Manutenção' : 'Salvar Manutenção'}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/maintenance')}>Cancelar</Button>
          </div>
        </div>
      </div>

      {/* Supplier Creation Modal */}
      <Dialog open={showSupplierModal} onOpenChange={setShowSupplierModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar Fornecedor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={newSupplier.name} onChange={e => setNewSupplier(p => ({ ...p, name: e.target.value }))} placeholder="Nome do fornecedor" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CPF/CNPJ</Label>
                <Input value={newSupplier.document} onChange={e => setNewSupplier(p => ({ ...p, document: e.target.value }))} placeholder="Documento" />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={newSupplier.phone} onChange={e => setNewSupplier(p => ({ ...p, phone: e.target.value }))} placeholder="(11) 99999-9999" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={newSupplier.email} onChange={e => setNewSupplier(p => ({ ...p, email: e.target.value }))} placeholder="email@fornecedor.com" />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input value={newSupplier.address} onChange={e => setNewSupplier(p => ({ ...p, address: e.target.value }))} placeholder="Endereço completo" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSupplierModal(false)}>Cancelar</Button>
            <Button onClick={() => createSupplierMut.mutate()} disabled={!newSupplier.name || createSupplierMut.isPending}>
              {createSupplierMut.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Catalog Item Modal */}
      <Dialog open={showCatalogModal2} onOpenChange={setShowCatalogModal2}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Item de Manutenção</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={newCatalogName} onChange={e => setNewCatalogName(e.target.value)} placeholder="Ex: Troca de óleo" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={newCatalogDesc} onChange={e => setNewCatalogDesc(e.target.value)} placeholder="Descrição opcional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCatalogModal2(false)}>Cancelar</Button>
            <Button onClick={() => createCatalogMut.mutate()} disabled={!newCatalogName || createCatalogMut.isPending}>
              {createCatalogMut.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Odometer Override Confirmation */}
      <AlertDialog open={odometerOverrideOpen} onOpenChange={(open) => {
        setOdometerOverrideOpen(open);
        if (!open) setPendingSaveAfterOverride(false);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Odômetro menor que o atual
            </AlertDialogTitle>
            <AlertDialogDescription>
              O odômetro informado ({enteredOdometer?.toLocaleString()} km) é menor que o atual do veículo ({vehicleCurrentOdometer.toLocaleString()} km). 
              O odômetro do veículo <strong>não será reduzido</strong> automaticamente. Deseja prosseguir mesmo assim?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setOdometerOverrideOpen(false);
              setPendingSaveAfterOverride(false);
              doSave();
            }}>
              Prosseguir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default NewMaintenancePage;
