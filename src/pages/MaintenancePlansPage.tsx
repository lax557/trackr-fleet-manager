import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCatalogItems,
  createCatalogItem,
  deleteCatalogItem,
  fetchModelPlans,
  createModelPlan,
  deleteModelPlan,
  fetchDistinctModels,
  CatalogItem,
} from '@/services/maintenanceCatalog.service';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Check, ChevronsUpDown, Package, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function MaintenancePlansPage() {
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const canManage = can('vehicle:create'); // manager/admin

  // State
  const [selectedModel, setSelectedModel] = useState('');
  const [modelOpen, setModelOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [intervalKm, setIntervalKm] = useState('');
  const [intervalDays, setIntervalDays] = useState('');

  // Catalog modal
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');

  // Queries
  const { data: models = [] } = useQuery({
    queryKey: ['distinct-vehicle-models'],
    queryFn: fetchDistinctModels,
  });

  const { data: catalogItems = [] } = useQuery({
    queryKey: ['maintenance-catalog-items'],
    queryFn: fetchCatalogItems,
  });

  const { data: plans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ['model-maintenance-plans', selectedModel],
    queryFn: () => fetchModelPlans(selectedModel || undefined),
  });

  const filteredPlans = useMemo(() => {
    if (!selectedModel) return plans;
    return plans.filter(p => p.vehicle_model === selectedModel);
  }, [plans, selectedModel]);

  // Group plans by model
  const groupedPlans = useMemo(() => {
    const groups: Record<string, typeof plans> = {};
    filteredPlans.forEach(p => {
      if (!groups[p.vehicle_model]) groups[p.vehicle_model] = [];
      groups[p.vehicle_model].push(p);
    });
    return groups;
  }, [filteredPlans]);

  // Mutations
  const createItemMut = useMutation({
    mutationFn: () => createCatalogItem(newItemName, newItemDesc),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-catalog-items'] });
      setSelectedItemId(data.id);
      setShowCatalogModal(false);
      setNewItemName('');
      setNewItemDesc('');
      toast.success('Item cadastrado!');
    },
    onError: (e: any) => toast.error(e.message || 'Erro ao cadastrar item'),
  });

  const deleteItemMut = useMutation({
    mutationFn: deleteCatalogItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-catalog-items'] });
      toast.success('Item removido!');
    },
    onError: (e: any) => toast.error(e.message || 'Erro ao remover'),
  });

  const addPlanMut = useMutation({
    mutationFn: () => createModelPlan({
      vehicle_model: selectedModel,
      item_id: selectedItemId,
      interval_km: intervalKm ? parseInt(intervalKm) : null,
      interval_days: intervalDays ? parseInt(intervalDays) : null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-maintenance-plans'] });
      setSelectedItemId('');
      setIntervalKm('');
      setIntervalDays('');
      toast.success('Item adicionado ao plano!');
    },
    onError: (e: any) => toast.error(e.message || 'Erro ao adicionar'),
  });

  const deletePlanMut = useMutation({
    mutationFn: deleteModelPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-maintenance-plans'] });
      toast.success('Removido do plano!');
    },
    onError: (e: any) => toast.error(e.message || 'Erro'),
  });

  const selectedItem = catalogItems.find(i => i.id === selectedItemId);

  if (!canManage) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Apenas gerentes e administradores podem configurar planos de manutenção.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catálogo de Itens */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Catálogo de Itens</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowCatalogModal(true)}>
                <Plus className="h-4 w-4 mr-1" />Novo
              </Button>
            </div>
            <CardDescription>Itens disponíveis para planos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
            {catalogItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum item cadastrado</p>
            ) : catalogItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItemMut.mutate(item.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Plano por Modelo */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Plano por Modelo</CardTitle>
              </div>
              <CardDescription>Defina itens de manutenção preventiva por modelo de veículo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Model selector */}
              <div className="space-y-2">
                <Label>Modelo do Veículo *</Label>
                <Popover open={modelOpen} onOpenChange={setModelOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                      {selectedModel || 'Selecione o modelo'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar modelo..." />
                      <CommandList>
                        <CommandEmpty>Nenhum modelo encontrado.</CommandEmpty>
                        <CommandGroup>
                          {models.map(m => (
                            <CommandItem key={m} value={m} onSelect={() => { setSelectedModel(m); setModelOpen(false); }}>
                              <Check className={cn('mr-2 h-4 w-4', selectedModel === m ? 'opacity-100' : 'opacity-0')} />
                              {m}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Add item to plan */}
              {selectedModel && (
                <div className="border rounded-lg p-4 space-y-3">
                  <Label className="text-sm font-medium">Adicionar item ao plano</Label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <Popover open={itemOpen} onOpenChange={setItemOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" role="combobox" className="w-full justify-between font-normal text-sm">
                            {selectedItem?.name || 'Selecione o item'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar item..." />
                            <CommandList>
                              <CommandEmpty>Nenhum item.</CommandEmpty>
                              <CommandGroup>
                                {catalogItems.map(i => (
                                  <CommandItem key={i.id} value={i.name} onSelect={() => { setSelectedItemId(i.id); setItemOpen(false); }}>
                                    <Check className={cn('mr-2 h-4 w-4', selectedItemId === i.id ? 'opacity-100' : 'opacity-0')} />
                                    {i.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              <CommandGroup>
                                <CommandItem onSelect={() => { setItemOpen(false); setShowCatalogModal(true); }} className="text-primary">
                                  <Plus className="mr-2 h-4 w-4" />Novo item
                                </CommandItem>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Input type="number" placeholder="Intervalo (km)" value={intervalKm} onChange={e => setIntervalKm(e.target.value)} />
                    </div>
                    <div>
                      <Input type="number" placeholder="Intervalo (dias)" value={intervalDays} onChange={e => setIntervalDays(e.target.value)} />
                    </div>
                  </div>
                  <Button size="sm" onClick={() => addPlanMut.mutate()} disabled={!selectedItemId || addPlanMut.isPending}>
                    <Plus className="h-4 w-4 mr-1" />Adicionar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plans table */}
          {Object.keys(groupedPlans).length > 0 && (
            <Card>
              <CardContent className="p-0">
                {Object.entries(groupedPlans).map(([model, items]) => (
                  <div key={model}>
                    <div className="px-4 py-2 bg-muted/50 border-b">
                      <span className="font-medium text-sm">{model}</span>
                      <Badge variant="secondary" className="ml-2 text-xs">{items.length} itens</Badge>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-right">Intervalo (km)</TableHead>
                          <TableHead className="text-right">Intervalo (dias)</TableHead>
                          <TableHead className="text-right">Alerta (km antes)</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map(p => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.maintenance_catalog_items?.name || '—'}</TableCell>
                            <TableCell className="text-right">{p.interval_km ? `${p.interval_km.toLocaleString()} km` : '—'}</TableCell>
                            <TableCell className="text-right">{p.interval_days ? `${p.interval_days} dias` : '—'}</TableCell>
                            <TableCell className="text-right">{p.alert_before_km ? `${p.alert_before_km} km` : '—'}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deletePlanMut.mutate(p.id)}>
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {selectedModel && filteredPlans.length === 0 && !loadingPlans && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum item configurado para o modelo "{selectedModel}".
            </p>
          )}
        </div>
      </div>

      {/* New Catalog Item Modal */}
      <Dialog open={showCatalogModal} onOpenChange={setShowCatalogModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Item de Manutenção</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Ex: Troca de óleo" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} placeholder="Descrição opcional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCatalogModal(false)}>Cancelar</Button>
            <Button onClick={() => createItemMut.mutate()} disabled={!newItemName || createItemMut.isPending}>
              {createItemMut.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MaintenancePlansPage;
