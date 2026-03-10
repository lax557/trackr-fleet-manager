import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchFines,
  deriveFineStatus,
  fineStatusLabels,
  severityLabels,
  FineStatus,
} from '@/services/fines.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  DollarSign,
  AlertTriangle,
  Filter,
  X,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { format, subMonths, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyBRL } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  count: { label: 'Quantidade', color: 'hsl(var(--primary))' },
  amount: { label: 'Valor', color: 'hsl(24.6 95% 53.1%)' },
} satisfies ChartConfig;

const STATUS_COLORS = [
  'hsl(221.2 83.2% 53.3%)',
  'hsl(45 93% 47%)',
  'hsl(0 72.2% 50.6%)',
  'hsl(142.1 76.2% 36.3%)',
  'hsl(262.1 83.3% 57.8%)',
  'hsl(220 8.9% 46.1%)',
];

const SEVERITY_COLORS = [
  'hsl(142.1 76.2% 36.3%)',
  'hsl(45 93% 47%)',
  'hsl(24.6 95% 53.1%)',
  'hsl(0 72.2% 50.6%)',
];

export function FinesAnalytics() {
  const [dateFrom, setDateFrom] = useState(format(subMonths(new Date(), 12), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const { data: rawFines = [], isLoading } = useQuery({
    queryKey: ['fines'],
    queryFn: fetchFines,
  });

  const enrichedFines = useMemo(() => {
    return rawFines.map(f => ({
      ...f,
      derivedStatus: deriveFineStatus(f),
      vehiclePlate: f.vehicles?.plate || null,
      vehicleLabel: f.vehicles ? `${f.vehicles.brand} ${f.vehicles.model}` : '',
      driverName: f.drivers?.full_name || null,
    }));
  }, [rawFines]);

  const filteredData = useMemo(() => {
    let data = enrichedFines;
    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      data = data.filter(f => {
        const d = new Date(f.occurred_at);
        return isWithinInterval(d, { start: from, end: to });
      });
    }
    if (vehicleFilter) data = data.filter(f => f.vehicle_id === vehicleFilter);
    if (severityFilter !== 'ALL') data = data.filter(f => f.severity === severityFilter);
    return data;
  }, [enrichedFines, dateFrom, dateTo, vehicleFilter, severityFilter]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; count: number; amount: number }> = {};
    filteredData.forEach(f => {
      const monthKey = format(new Date(f.occurred_at), 'yyyy-MM');
      const monthLabel = format(new Date(f.occurred_at), 'MMM/yy', { locale: ptBR });
      if (!months[monthKey]) months[monthKey] = { month: monthLabel, count: 0, amount: 0 };
      months[monthKey].count += 1;
      months[monthKey].amount += f.amount;
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData]);

  const statusDistribution = useMemo(() => {
    const statuses: Record<FineStatus, number> = {
      open: 0, nearing_due: 0, overdue: 0, paid: 0, disputed: 0, cancelled: 0,
    };
    filteredData.forEach(f => { statuses[f.derivedStatus]++; });
    return Object.entries(statuses)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({ name: fineStatusLabels[key as FineStatus], value }));
  }, [filteredData]);

  const severityDistribution = useMemo(() => {
    const sevs: Record<string, { count: number; amount: number }> = {
      leve: { count: 0, amount: 0 },
      media: { count: 0, amount: 0 },
      grave: { count: 0, amount: 0 },
      gravissima: { count: 0, amount: 0 },
    };
    filteredData.forEach(f => {
      if (f.severity && sevs[f.severity]) {
        sevs[f.severity].count++;
        sevs[f.severity].amount += f.amount;
      }
    });
    return Object.entries(sevs).map(([key, val]) => ({
      name: severityLabels[key] || key,
      count: val.count,
      amount: val.amount,
    }));
  }, [filteredData]);

  const topVehicles = useMemo(() => {
    const vehicles: Record<string, { plate: string; count: number; amount: number }> = {};
    filteredData.forEach(f => {
      if (!vehicles[f.vehicle_id]) vehicles[f.vehicle_id] = { plate: f.vehiclePlate || f.vehicle_id, count: 0, amount: 0 };
      vehicles[f.vehicle_id].count++;
      vehicles[f.vehicle_id].amount += f.amount;
    });
    return Object.values(vehicles).sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [filteredData]);

  const topDrivers = useMemo(() => {
    const drivers: Record<string, { name: string; count: number; amount: number }> = {};
    filteredData.forEach(f => {
      const dId = f.driver_id || 'unknown';
      const dName = f.driverName || 'Não identificado';
      if (!drivers[dId]) drivers[dId] = { name: dName, count: 0, amount: 0 };
      drivers[dId].count++;
      drivers[dId].amount += f.amount;
    });
    return Object.values(drivers).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filteredData]);

  const maxDriverCount = topDrivers.length > 0 ? topDrivers[0].count : 1;
  const maxVehicleAmount = topVehicles.length > 0 ? topVehicles[0].amount : 1;

  const kpis = useMemo(() => {
    const totalAmount = filteredData.reduce((sum, f) => sum + f.amount, 0);
    const avgTicket = filteredData.length > 0 ? totalAmount / filteredData.length : 0;
    const paidCount = filteredData.filter(f => f.derivedStatus === 'paid').length;
    return { count: filteredData.length, totalAmount, avgTicket, paidCount };
  }, [filteredData]);

  const clearFilters = () => {
    setDateFrom(format(subMonths(new Date(), 12), 'yyyy-MM-dd'));
    setDateTo(format(new Date(), 'yyyy-MM-dd'));
    setVehicleFilter('');
    setSeverityFilter('ALL');
  };

  const hasActiveFilters = vehicleFilter || severityFilter !== 'ALL';

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>;
  }

  return (
    <div className="space-y-6">
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
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Gravidade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                {Object.entries(severityLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Qtde no período</p>
            </div>
            <p className="text-2xl font-bold mt-1">{kpis.count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <p className="text-sm text-muted-foreground">Valor Total</p>
            </div>
            <p className="text-2xl font-bold mt-1">{formatCurrencyBRL(kpis.totalAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Ticket Médio</p>
            </div>
            <p className="text-2xl font-bold mt-1">{formatCurrencyBRL(kpis.avgTicket)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm text-muted-foreground">Pagas</p>
            </div>
            <p className="text-2xl font-bold mt-1">{kpis.paidCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
            <CardDescription>Multas por situação</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <PieChart>
                <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip formatter={(value: number, name: string) => [`${value} multas`, name]} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Distribuição por Gravidade</CardTitle>
            <CardDescription>Multas por gravidade</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <BarChart data={severityDistribution} layout="vertical" margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="name" className="text-xs" width={90} />
                <ChartTooltip
                  formatter={(value: number, name: string, props: { payload?: { amount?: number } }) => [
                    `${value} multas (${formatCurrencyBRL(props.payload?.amount ?? 0)})`,
                    name,
                  ]}
                />
                <Bar dataKey="count" name="Quantidade" radius={[0, 4, 4, 0]}>
                  {severityDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Evolução no Período</CardTitle>
            <CardDescription>Quantidade de multas por mês</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <LineChart data={monthlyData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} name="Quantidade" />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Top 5 Veículos por Valor</CardTitle>
            <CardDescription>Veículos com maior valor de multas</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <div className="space-y-2.5">
              {topVehicles.map((v, index) => (
                <div key={v.plate} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-5 text-right">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-medium">{v.plate}</span>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-xs text-muted-foreground">{v.count}x</span>
                        <span className="text-sm font-bold">{formatCurrencyBRL(v.amount)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500/70" style={{ width: `${(v.amount / maxVehicleAmount) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              {topVehicles.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma multa no período.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Top 5 Motoristas
            </CardTitle>
            <CardDescription>Motoristas com mais multas</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <div className="space-y-2.5">
              {topDrivers.map((d, index) => (
                <div key={d.name + index} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-5 text-right">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-medium truncate">{d.name}</span>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-xs text-muted-foreground">{d.count}x</span>
                        <span className="text-sm font-bold">{formatCurrencyBRL(d.amount)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500/70" style={{ width: `${(d.count / maxDriverCount) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              {topDrivers.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma multa no período.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Indicadores Agregados</CardTitle>
            <CardDescription>Resumo financeiro de multas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total de multas</span>
                <span className="font-bold">{kpis.count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Valor total</span>
                <span className="font-bold">{formatCurrencyBRL(kpis.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Ticket médio</span>
                <span className="font-bold">{formatCurrencyBRL(kpis.avgTicket)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Multas pagas</span>
                <span className="font-bold">{kpis.paidCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
