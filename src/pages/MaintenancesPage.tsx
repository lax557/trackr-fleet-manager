import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  getMaintenancesWithDetails, 
  mockVehicles,
  maintenanceStatusLabels,
  maintenanceTypeLabels,
  serviceAreaLabels
} from '@/data/mockData';
import { MaintenanceStatus, MaintenanceType, ServiceArea } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit,
  Wrench,
  BarChart3,
  Calendar,
  Filter,
  X
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MaintenanceAnalytics } from '@/components/MaintenanceAnalytics';

function MaintenanceStatusBadge({ status }: { status: MaintenanceStatus }) {
  const variants: Record<MaintenanceStatus, { variant: 'default' | 'secondary' | 'outline'; className: string }> = {
    OPEN: { variant: 'outline', className: 'border-amber-500 text-amber-600 dark:text-amber-400' },
    IN_PROGRESS: { variant: 'secondary', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    DONE: { variant: 'default', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  };
  const { variant, className } = variants[status];
  return <Badge variant={variant} className={className}>{maintenanceStatusLabels[status]}</Badge>;
}

function MaintenanceTypeBadge({ type }: { type: MaintenanceType }) {
  const isPreventive = type === 'PREVENTIVE';
  return (
    <Badge 
      variant="outline" 
      className={isPreventive 
        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
        : 'border-orange-500 text-orange-600 dark:text-orange-400'
      }
    >
      {maintenanceTypeLabels[type]}
    </Badge>
  );
}

export function MaintenancesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleFilter = searchParams.get('vehicle') || '';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<MaintenanceType | 'ALL'>('ALL');
  const [areaFilter, setAreaFilter] = useState<ServiceArea | 'ALL'>('ALL');
  const [vehicleId, setVehicleId] = useState(vehicleFilter);
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [activeTab, setActiveTab] = useState('list');

  const maintenances = useMemo(() => {
    let data = getMaintenancesWithDetails();
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter(m => 
        m.vehicle.plate?.toLowerCase().includes(searchLower) ||
        m.vehicleId.toLowerCase().includes(searchLower) ||
        m.supplierName?.toLowerCase().includes(searchLower) ||
        m.items.some(item => item.itemName.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      data = data.filter(m => m.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'ALL') {
      data = data.filter(m => m.maintenanceType === typeFilter);
    }

    // Area filter
    if (areaFilter !== 'ALL') {
      data = data.filter(m => m.serviceArea === areaFilter);
    }

    // Vehicle filter
    if (vehicleId) {
      data = data.filter(m => m.vehicleId === vehicleId || m.vehicle.plate === vehicleId);
    }

    // Date filter
    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      data = data.filter(m => isWithinInterval(m.occurredAt, { start: from, end: to }));
    }

    return data.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }, [search, statusFilter, typeFilter, areaFilter, vehicleId, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setAreaFilter('ALL');
    setVehicleId('');
    setDateFrom(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    setDateTo(format(new Date(), 'yyyy-MM-dd'));
  };

  const hasActiveFilters = search || statusFilter !== 'ALL' || typeFilter !== 'ALL' || 
    areaFilter !== 'ALL' || vehicleId;

  // Stats
  const totalCost = maintenances.reduce((sum, m) => sum + m.totalCost, 0);
  const preventiveCount = maintenances.filter(m => m.maintenanceType === 'PREVENTIVE').length;
  const correctiveCount = maintenances.filter(m => m.maintenanceType === 'CORRECTIVE').length;
  const openCount = maintenances.filter(m => m.status !== 'DONE').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Manutenções
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie registros de manutenção da frota
          </p>
        </div>
        <Button onClick={() => navigate('/maintenance/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Manutenção
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Registros
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Análise
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-2xl font-bold">
                  {maintenances.length}
                </p>
                <p className="text-sm text-muted-foreground">Registros</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-2xl font-bold text-primary">
                  R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Total no período</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-lg font-bold text-blue-600">{preventiveCount}</p>
                    <p className="text-xs text-muted-foreground">Preventivas</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-orange-600">{correctiveCount}</p>
                    <p className="text-xs text-muted-foreground">Corretivas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-2xl font-bold text-amber-600">
                  {openCount}
                </p>
                <p className="text-sm text-muted-foreground">Em andamento</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Filtros</CardTitle>
                </div>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por placa, VehicleID, fornecedor, peça..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-40"
                  />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as MaintenanceStatus | 'ALL')}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos Status</SelectItem>
                    <SelectItem value="OPEN">Aberta</SelectItem>
                    <SelectItem value="IN_PROGRESS">Em Execução</SelectItem>
                    <SelectItem value="DONE">Finalizada</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as MaintenanceType | 'ALL')}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos Tipos</SelectItem>
                    <SelectItem value="PREVENTIVE">Preventiva</SelectItem>
                    <SelectItem value="CORRECTIVE">Corretiva</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={areaFilter} onValueChange={(v) => setAreaFilter(v as ServiceArea | 'ALL')}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todas Áreas</SelectItem>
                    <SelectItem value="MECHANICAL">Mecânica</SelectItem>
                    <SelectItem value="ELECTRICAL">Elétrica</SelectItem>
                    <SelectItem value="BODYSHOP">Funilaria</SelectItem>
                    <SelectItem value="TIRES">Pneus</SelectItem>
                    <SelectItem value="INSPECTION">Revisão</SelectItem>
                    <SelectItem value="OTHER">Outros</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={vehicleId} onValueChange={setVehicleId}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos Veículos</SelectItem>
                    {mockVehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.plate || v.id} - {v.model}
                      </SelectItem>
                    ))}
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
                    <TableHead>VehicleID</TableHead>
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
                  {maintenances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                        Nenhuma manutenção encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    maintenances.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-mono text-sm">
                          {format(m.occurredAt, "dd/MM/yy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          {m.vehicle.plate || '—'}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {m.vehicleId}
                        </TableCell>
                        <TableCell>
                          <MaintenanceTypeBadge type={m.maintenanceType} />
                        </TableCell>
                        <TableCell className="text-sm">
                          {serviceAreaLabels[m.serviceArea]}
                        </TableCell>
                        <TableCell className="text-sm">
                          {m.supplierName || '—'}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {m.odometerKm ? `${m.odometerKm.toLocaleString()} km` : '—'}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          R$ {m.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <MaintenanceStatusBadge status={m.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => navigate(`/maintenance/${m.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => navigate(`/maintenance/${m.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
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
      </Tabs>
    </div>
  );
}

export default MaintenancesPage;
