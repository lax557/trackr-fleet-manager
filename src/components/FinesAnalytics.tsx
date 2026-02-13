import { useState, useMemo } from 'react';
import { getFinesWithDetails } from '@/data/finesData';
import { mockVehicles } from '@/data/mockData';
import { 
  FineStatusType, 
  FineSeverity,
  fineStatusLabels, 
  fineSeverityLabels 
} from '@/types/fines';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig
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
  User,
  CheckCircle2
} from 'lucide-react';
import { format, subMonths, isWithinInterval, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyBRL } from '@/lib/utils';

const chartConfig = {
  count: {
    label: "Quantidade",
    color: "hsl(var(--primary))",
  },
  amount: {
    label: "Valor",
    color: "hsl(24.6 95% 53.1%)",
  },
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
  const [severityFilter, setSeverityFilter] = useState<FineSeverity | 'ALL'>('ALL');

  const filteredData = useMemo(() => {
    let data = getFinesWithDetails();
    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      data = data.filter(f => isWithinInterval(f.occurredAt, { start: from, end: to }));
    }
    if (vehicleFilter) data = data.filter(f => f.vehicleId === vehicleFilter);
    if (severityFilter !== 'ALL') data = data.filter(f => f.severity === severityFilter);
    return data;
  }, [dateFrom, dateTo, vehicleFilter, severityFilter]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; count: number; amount: number }> = {};
    filteredData.forEach(f => {
      const monthKey = format(f.occurredAt, 'yyyy-MM');
      const monthLabel = format(f.occurredAt, 'MMM/yy', { locale: ptBR });
      if (!months[monthKey]) months[monthKey] = { month: monthLabel, count: 0, amount: 0 };
      months[monthKey].count += 1;
      months[monthKey].amount += f.originalAmount;
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData]);

  const statusDistribution = useMemo(() => {
    const statuses: Record<FineStatusType, number> = {
      OPEN: 0, DUE_SOON: 0, OVERDUE: 0, PAID: 0, CONTESTED: 0, CANCELED: 0,
    };
    filteredData.forEach(f => { statuses[f.status]++; });
    return Object.entries(statuses)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({ name: fineStatusLabels[key as FineStatusType], value }));
  }, [filteredData]);

  const severityDistribution = useMemo(() => {
    const severities: Record<FineSeverity, { count: number; amount: number }> = {
      LEVE: { count: 0, amount: 0 }, MEDIA: { count: 0, amount: 0 },
      GRAVE: { count: 0, amount: 0 }, GRAVISSIMA: { count: 0, amount: 0 },
    };
    filteredData.forEach(f => {
      severities[f.severity].count++;
      severities[f.severity].amount += f.originalAmount;
    });
    return Object.entries(severities).map(([key, val]) => ({
      name: fineSeverityLabels[key as FineSeverity], count: val.count, amount: val.amount,
    }));
  }, [filteredData]);

  const topVehicles = useMemo(() => {
    const vehicles: Record<string, { plate: string; count: number; amount: number }> = {};
    filteredData.forEach(f => {
      if (!vehicles[f.vehicleId]) vehicles[f.vehicleId] = { plate: f.vehiclePlate || f.vehicleId, count: 0, amount: 0 };
      vehicles[f.vehicleId].count++;
      vehicles[f.vehicleId].amount += f.originalAmount;
    });
    return Object.values(vehicles).sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [filteredData]);

  const kpis = useMemo(() => {
    const totalAmount = filteredData.reduce((sum, f) => sum + f.originalAmount, 0);
    const totalWithDiscount = filteredData.reduce((sum, f) => sum + (f.discountedAmount || f.originalAmount), 0);
    const indicatedCount = filteredData.filter(f => f.indicatedDriver).length;
    const indicatedRate = filteredData.length > 0 ? (indicatedCount / filteredData.length) * 100 : 0;
    const paidFines = filteredData.filter(f => f.status === 'PAID' && f.paymentDate);
    const paidOnTime = paidFines.filter(f => isBefore(f.paymentDate!, f.dueDate)).length;
    const paidOnTimeRate = paidFines.length > 0 ? (paidOnTime / paidFines.length) * 100 : 0;
    return { count: filteredData.length, totalAmount, totalWithDiscount, indicatedRate, paidOnTimeRate };
  }, [filteredData]);

  const clearFilters = () => {
    setDateFrom(format(subMonths(new Date(), 12), 'yyyy-MM-dd'));
    setDateTo(format(new Date(), 'yyyy-MM-dd'));
    setVehicleFilter('');
    setSeverityFilter('ALL');
  };

  const hasActiveFilters = vehicleFilter || severityFilter !== 'ALL';

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
            <Select value={vehicleFilter || 'ALL'} onValueChange={(v) => setVehicleFilter(v === 'ALL' ? '' : v)}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Veículo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos Veículos</SelectItem>
                {mockVehicles.filter(v => v.plate).map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.plate} - {v.model}</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
              <p className="text-sm text-muted-foreground">Valor Original</p>
            </div>
            <p className="text-2xl font-bold mt-1">{formatCurrencyBRL(kpis.totalAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <p className="text-sm text-muted-foreground">Com Desconto</p>
            </div>
            <p className="text-2xl font-bold mt-1">{formatCurrencyBRL(kpis.totalWithDiscount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-muted-foreground">% Indicadas</p>
            </div>
            <p className="text-2xl font-bold mt-1">{kpis.indicatedRate.toFixed(0)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm text-muted-foreground">Pagas no prazo</p>
            </div>
            <p className="text-2xl font-bold mt-1">{kpis.paidOnTimeRate.toFixed(0)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 [&_.recharts-responsive-container]:!h-[280px]">
        <Card>
          <CardHeader>
            <CardTitle>Multas por Mês</CardTitle>
            <CardDescription>Quantidade de multas por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px]">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} name="Quantidade" />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valor por Mês</CardTitle>
            <CardDescription>Total de multas (R$) por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px]">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} className="text-xs" />
                <ChartTooltip formatter={(value: number) => formatCurrencyBRL(value)} />
                <Bar dataKey="amount" fill="hsl(24.6 95% 53.1%)" name="Valor" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
            <CardDescription>Multas por situação</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px]">
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

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Gravidade</CardTitle>
            <CardDescription>Multas por gravidade da infração</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px]">
              <BarChart data={severityDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="name" className="text-xs" width={80} />
                <ChartTooltip 
                  formatter={(value: number, name: string, props: { payload?: { amount?: number } }) => [
                    `${value} multas (${formatCurrencyBRL(props.payload?.amount ?? 0)})`,
                    name
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

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top 5 Veículos por Valor</CardTitle>
            <CardDescription>Veículos com maior valor de multas no período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topVehicles.map((v, index) => (
                <div key={v.plate} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <span className="text-lg font-bold text-muted-foreground w-6">{index + 1}</span>
                  <div className="flex-1">
                    <p className="font-mono font-medium">{v.plate}</p>
                    <p className="text-xs text-muted-foreground">{v.count} multas</p>
                  </div>
                  <p className="font-bold">{formatCurrencyBRL(v.amount)}</p>
                </div>
              ))}
              {topVehicles.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Nenhuma multa encontrada no período.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
