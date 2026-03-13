import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listOrders,
  deleteOrder,
  statusLabels,
  typeLabels,
  areaLabels,
  MaintenanceOrderStatus,
  MaintenanceTypeDB,
  ServiceAreaDB,
  MaintenanceOrderRow,
} from '@/services/maintenance.service';
import { fetchVehicles } from '@/services/vehicles.service';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus, Search, Eye, Edit, Wrench, BarChart3, Filter, X, Trash2,
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MaintenanceAnalytics } from '@/components/MaintenanceAnalytics';
import { MaintenancePlansPage } from '@/pages/MaintenancePlansPage';
import { formatCurrencyBRL } from '@/lib/utils';
import { toast } from 'sonner';

function StatusBadge({ status }: { status: MaintenanceOrderStatus }) {
  const map: Record<string, { variant: 'default' | 'secondary' | 'outline'; className: string }> = {
    open: { variant: 'outline', className: 'border-amber-500 text-amber-600 dark:text-amber-400' },
    in_progress: { variant: 'secondary', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    done: { variant: 'default', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    cancelled: { variant: 'outline', className: 'border-muted-foreground text-muted-foreground' },
  };
  const { variant, className } = map[status] || map.open;
  return <Badge variant={variant} className={className}>{statusLabels[status]}</Badge>;
}

function TypeBadge({ type }: { type: MaintenanceTypeDB }) {
  const isPrev = type === 'preventive';
  return (
    <Badge variant="outline" className={isPrev ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-orange-500 text-orange-600 dark:text-orange-400'}>
      {typeLabels[type]}
    </Badge>
  );
}

export function MaintenancesPage() {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const vehicleFilter = searchParams.get('vehicle') || '';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MaintenanceOrderStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<MaintenanceTypeDB | 'ALL'>('ALL');
  const [areaFilter, setAreaFilter] = useState<ServiceAreaDB | 'ALL'>('ALL');
  const [vehicleId, setVehicleId] = useState(vehicleFilter);
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 90), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [activeTab, setActiveTab] = useState('list');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['maintenance-orders', statusFilter, typeFilter, areaFilter, vehicleId, dateFrom, dateTo, search],
    queryFn: () => listOrders({ status: statusFilter, type: typeFilter, area: areaFilter, vehicleId, dateFrom, dateTo, search }),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles-list'],
    queryFn: fetchVehicles,
  });

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setAreaFilter('ALL');
    setVehicleId('');
    setDateFrom(format(subDays(new Date(), 90), 'yyyy-MM-dd'));
    setDateTo(format(new Date(), 'yyyy-MM-dd'));
  };

  const hasActiveFilters = search || statusFilter !== 'ALL' || typeFilter !== 'ALL' || areaFilter !== 'ALL' || vehicleId;

  const totalCost = orders.reduce((s, m) => s + (m.total_cost || 0), 0);
  const preventiveCount = orders.filter(m => m.type === 'preventive').length;
  const correctiveCount = orders.filter(m => m.type === 'corrective').length;
  const openCount = orders.filter(m => m.status === 'open' || m.status === 'in_progress').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Manutenções
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie registros de manutenção da frota</p>
        </div>
        {can('maintenance:create') && (
          <Button onClick={() => navigate('/maintenance/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Manutenção
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2"><Wrench className="h-4 w-4" />Registros</TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2"><BarChart3 className="h-4 w-4" />Análise</TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2"><Filter className="h-4 w-4" />Planos</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{orders.length}</p><p className="text-sm text-muted-foreground">Registros</p></CardContent></Card>
            <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-primary">{formatCurrencyBRL(totalCost)}</p><p className="text-sm text-muted-foreground">Total no período</p></CardContent></Card>
            <Card><CardContent className="pt-4"><div className="flex items-center gap-4"><div><p className="text-lg font-bold text-blue-600">{preventiveCount}</p><p className="text-xs text-muted-foreground">Preventivas</p></div><div><p className="text-lg font-bold text-orange-600">{correctiveCount}</p><p className="text-xs text-muted-foreground">Corretivas</p></div></div></CardContent></Card>
            <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-amber-600">{openCount}</p><p className="text-sm text-muted-foreground">Em andamento</p></CardContent></Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-muted-foreground" /><CardTitle className="text-base">Filtros</CardTitle></div>
                {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters}><X className="h-4 w-4 mr-1" />Limpar</Button>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar por placa, código, fornecedor, peça..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <div className="flex gap-2">
                  <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-40" />
                  <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-40" />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos Status</SelectItem>
                    <SelectItem value="open">Aberta</SelectItem>
                    <SelectItem value="in_progress">Em Execução</SelectItem>
                    <SelectItem value="done">Finalizada</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={v => setTypeFilter(v as any)}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos Tipos</SelectItem>
                    <SelectItem value="preventive">Preventiva</SelectItem>
                    <SelectItem value="corrective">Corretiva</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={areaFilter} onValueChange={v => setAreaFilter(v as any)}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="Área" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todas Áreas</SelectItem>
                    {Object.entries(areaLabels).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={vehicleId || 'ALL'} onValueChange={v => setVehicleId(v === 'ALL' ? '' : v)}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Veículo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos Veículos</SelectItem>
                    {vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.plate || (v as any).vehicleCode || v.id.slice(0,8)} - {v.model}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead className="text-right">Odômetro</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={10} className="h-32 text-center text-muted-foreground">Carregando...</TableCell></TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow><TableCell colSpan={10} className="h-32 text-center text-muted-foreground">Nenhuma manutenção encontrada</TableCell></TableRow>
                  ) : (
                    orders.map(m => (
                      <TableRow key={m.id}>
                        <TableCell className="text-sm">{format(new Date(m.opened_at), 'dd/MM/yy HH:mm', { locale: ptBR })}</TableCell>
                        <TableCell className="font-medium">{m.vehicles?.plate || '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{m.vehicles?.vehicle_code || '—'}</TableCell>
                        <TableCell><TypeBadge type={m.type} /></TableCell>
                        <TableCell className="text-sm">{areaLabels[m.service_area]}</TableCell>
                        <TableCell className="text-sm">{m.supplier_name || '—'}</TableCell>
                        <TableCell className="text-right text-sm">{m.odometer_at_open ? `${m.odometer_at_open.toLocaleString()} km` : '—'}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrencyBRL(m.total_cost || 0)}</TableCell>
                        <TableCell><StatusBadge status={m.status} /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/maintenance/${m.id}`)}><Eye className="h-4 w-4" /></Button>
                            {can('maintenance:create') && (
                              <Button variant="ghost" size="icon" onClick={() => navigate(`/maintenance/${m.id}/edit`)}><Edit className="h-4 w-4" /></Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <MaintenanceAnalytics />
        </TabsContent>

        <TabsContent value="plans" className="mt-4">
          <MaintenancePlansPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MaintenancesPage;
