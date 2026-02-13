import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  getFinesWithDetails, 
  getFineStats 
} from '@/data/finesData';
import { mockVehicles, mockDrivers } from '@/data/mockData';
import { 
  FineStatusType, 
  FineSeverity,
  fineStatusLabels, 
  fineStatusColors,
  fineSeverityLabels 
} from '@/types/fines';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Plus, 
  Search, 
  Filter, 
  X,
  AlertTriangle,
  Clock,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  User,
  Eye,
} from 'lucide-react';
import { format, isWithinInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FinesAnalytics } from '@/components/FinesAnalytics';
import { formatCurrencyBRL } from '@/lib/utils';

const severityColors: Record<FineSeverity, string> = {
  LEVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  MEDIA: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  GRAVE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  GRAVISSIMA: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function FinesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialVehicle = searchParams.get('vehicleId') || '';
  const initialDriver = searchParams.get('driverId') || '';

  const [activeTab, setActiveTab] = useState('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FineStatusType | 'ALL'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<FineSeverity | 'ALL'>('ALL');
  const [vehicleFilter, setVehicleFilter] = useState(initialVehicle);
  const [driverFilter, setDriverFilter] = useState(initialDriver);
  const [dateFrom, setDateFrom] = useState(format(subMonths(new Date(), 6), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));

  const stats = useMemo(() => getFineStats(), []);

  const filteredFines = useMemo(() => {
    let data = getFinesWithDetails();
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(f => 
        f.vehiclePlate?.toLowerCase().includes(s) ||
        f.vehicleId.toLowerCase().includes(s) ||
        f.infractionDescription.toLowerCase().includes(s) ||
        f.driverName?.toLowerCase().includes(s)
      );
    }
    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      data = data.filter(f => isWithinInterval(f.occurredAt, { start: from, end: to }));
    }
    if (statusFilter !== 'ALL') data = data.filter(f => f.status === statusFilter);
    if (severityFilter !== 'ALL') data = data.filter(f => f.severity === severityFilter);
    if (vehicleFilter) data = data.filter(f => f.vehicleId === vehicleFilter);
    if (driverFilter) data = data.filter(f => f.driverId === driverFilter);
    return data.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }, [search, statusFilter, severityFilter, vehicleFilter, driverFilter, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setSeverityFilter('ALL');
    setVehicleFilter('');
    setDriverFilter('');
    setDateFrom(format(subMonths(new Date(), 6), 'yyyy-MM-dd'));
    setDateTo(format(new Date(), 'yyyy-MM-dd'));
  };

  const hasActiveFilters = search || statusFilter !== 'ALL' || severityFilter !== 'ALL' || vehicleFilter || driverFilter;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Multas</h1>
          <p className="text-muted-foreground text-sm">Gestão de multas e infrações da frota</p>
        </div>
        <Button onClick={() => navigate('/fines/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Multa
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Operacional</TabsTrigger>
          <TabsTrigger value="analytics">Análise</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600" />
                  <p className="text-sm text-muted-foreground">Em Aberto</p>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.open}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <p className="text-sm text-muted-foreground">Vence em Breve</p>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.dueSoon}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-muted-foreground">Vencidas</p>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.overdue}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-muted-foreground">Pagas</p>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.paid}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Total em Aberto</p>
                </div>
                <p className="text-2xl font-bold mt-1">{formatCurrencyBRL(stats.totalOpenAmount)}</p>
              </CardContent>
            </Card>
          </div>

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
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar placa, descrição, motorista..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <div className="flex gap-2">
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FineStatusType | 'ALL')}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos Status</SelectItem>
                    {Object.entries(fineStatusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as FineSeverity | 'ALL')}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Gravidade" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todas</SelectItem>
                    {Object.entries(fineSeverityLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={vehicleFilter || 'ALL'} onValueChange={(v) => setVehicleFilter(v === 'ALL' ? '' : v)}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Veículo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos Veículos</SelectItem>
                    {mockVehicles.filter(v => v.plate).map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.plate} - {v.model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Multas</CardTitle>
                <span className="text-sm text-muted-foreground">{filteredFines.length} registro(s)</span>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Infração</TableHead>
                    <TableHead>Gravidade</TableHead>
                    <TableHead>Pts</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Indicação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFines.map((fine) => (
                    <TableRow key={fine.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/fines/${fine.id}`)}>
                      <TableCell>{format(fine.occurredAt, 'dd/MM/yy', { locale: ptBR })}</TableCell>
                      <TableCell>
                        <div>
                          <span className="font-mono font-medium">{fine.vehiclePlate}</span>
                          <span className="text-xs text-muted-foreground block">{fine.vehicleId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate block">{fine.infractionDescription}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{fine.infractionDescription}</p>
                            <p className="text-xs text-muted-foreground">Código: {fine.infractionCode}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Badge className={severityColors[fine.severity]} variant="secondary">
                          {fineSeverityLabels[fine.severity]}
                        </Badge>
                      </TableCell>
                      <TableCell>{fine.points}</TableCell>
                      <TableCell>
                        <div>
                          <span className={fine.discountAvailable ? 'line-through text-muted-foreground text-xs' : ''}>
                            {formatCurrencyBRL(fine.originalAmount)}
                          </span>
                          {fine.discountAvailable && (
                            <span className="text-green-600 block text-sm font-medium">
                              {formatCurrencyBRL(fine.discountedAmount)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{format(fine.dueDate, 'dd/MM/yy', { locale: ptBR })}</TableCell>
                      <TableCell>
                        <Badge className={fineStatusColors[fine.status]} variant="secondary">
                          {fineStatusLabels[fine.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {fine.indicatedDriver ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <User className="h-4 w-4 text-green-600" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Indicado: {fine.indicatedDriverName}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/fines/${fine.id}`); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredFines.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        Nenhuma multa encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <FinesAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FinesPage;
