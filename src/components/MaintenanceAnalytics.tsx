import { useState, useMemo } from 'react';
import { 
  getMaintenancesWithDetails, 
  mockVehicles,
  maintenanceTypeLabels,
  serviceAreaLabels,
  getAverageFleetForPeriod
} from '@/data/mockData';
import { MaintenanceType, ServiceArea } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Legend,
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  Car,
  Filter,
  X,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, subMonths, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrencyBRL } from '@/lib/utils';

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--primary))",
  },
  preventive: {
    label: "Preventiva",
    color: "hsl(221.2 83.2% 53.3%)",
  },
  corrective: {
    label: "Corretiva",
    color: "hsl(24.6 95% 53.1%)",
  },
} satisfies ChartConfig;

const COLORS = [
  'hsl(var(--primary))',
  'hsl(221.2 83.2% 53.3%)',
  'hsl(24.6 95% 53.1%)',
  'hsl(142.1 76.2% 36.3%)',
  'hsl(262.1 83.3% 57.8%)',
  'hsl(0 72.2% 50.6%)',
];

export function MaintenanceAnalytics() {
  const [dateFrom, setDateFrom] = useState(format(subMonths(new Date(), 12), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [vehicleId, setVehicleId] = useState('');
  const [typeFilter, setTypeFilter] = useState<MaintenanceType | 'ALL'>('ALL');
  const [areaFilter, setAreaFilter] = useState<ServiceArea | 'ALL'>('ALL');

  const filteredData = useMemo(() => {
    let data = getMaintenancesWithDetails();
    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      data = data.filter(m => isWithinInterval(m.occurredAt, { start: from, end: to }));
    }
    if (vehicleId) data = data.filter(m => m.vehicleId === vehicleId);
    if (typeFilter !== 'ALL') data = data.filter(m => m.maintenanceType === typeFilter);
    if (areaFilter !== 'ALL') data = data.filter(m => m.serviceArea === areaFilter);
    return data;
  }, [dateFrom, dateTo, vehicleId, typeFilter, areaFilter]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; total: number; preventive: number; corrective: number }> = {};
    filteredData.forEach(m => {
      const monthKey = format(m.occurredAt, 'yyyy-MM');
      const monthLabel = format(m.occurredAt, 'MMM/yy', { locale: ptBR });
      if (!months[monthKey]) months[monthKey] = { month: monthLabel, total: 0, preventive: 0, corrective: 0 };
      months[monthKey].total += m.totalCost;
      if (m.maintenanceType === 'PREVENTIVE') months[monthKey].preventive += m.totalCost;
      else months[monthKey].corrective += m.totalCost;
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData]);

  const typeDistribution = useMemo(() => {
    const preventive = filteredData.filter(m => m.maintenanceType === 'PREVENTIVE');
    const corrective = filteredData.filter(m => m.maintenanceType === 'CORRECTIVE');
    return [
      { name: 'Preventiva', value: preventive.length, cost: preventive.reduce((s, m) => s + m.totalCost, 0) },
      { name: 'Corretiva', value: corrective.length, cost: corrective.reduce((s, m) => s + m.totalCost, 0) },
    ];
  }, [filteredData]);

  const areaDistribution = useMemo(() => {
    const areas: Record<string, { name: string; value: number; cost: number }> = {};
    filteredData.forEach(m => {
      const areaName = serviceAreaLabels[m.serviceArea];
      if (!areas[m.serviceArea]) areas[m.serviceArea] = { name: areaName, value: 0, cost: 0 };
      areas[m.serviceArea].value += 1;
      areas[m.serviceArea].cost += m.totalCost;
    });
    return Object.values(areas).sort((a, b) => b.cost - a.cost);
  }, [filteredData]);

  const kpis = useMemo(() => {
    const totalSpent = filteredData.reduce((sum, m) => sum + m.totalCost, 0);
    const monthCount = monthlyData.length || 1;
    const avgMonthly = totalSpent / monthCount;
    const preventiveCount = filteredData.filter(m => m.maintenanceType === 'PREVENTIVE').length;
    const preventiveRate = filteredData.length > 0 ? (preventiveCount / filteredData.length) * 100 : 0;

    const vehicleCosts: Record<string, { id: string; plate: string | null; cost: number }> = {};
    filteredData.forEach(m => {
      if (!vehicleCosts[m.vehicleId]) vehicleCosts[m.vehicleId] = { id: m.vehicleId, plate: m.vehicle.plate, cost: 0 };
      vehicleCosts[m.vehicleId].cost += m.totalCost;
    });
    const topVehicle = Object.values(vehicleCosts).sort((a, b) => b.cost - a.cost)[0];

    let avgCostPerCar = 0;
    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      const avgFleet = getAverageFleetForPeriod(from, to);
      avgCostPerCar = avgFleet > 0 ? totalSpent / avgFleet : 0;
    }

    return { totalSpent, avgMonthly, preventiveRate, topVehicle, avgCostPerCar };
  }, [filteredData, monthlyData, dateFrom, dateTo]);

  const clearFilters = () => {
    setDateFrom(format(subMonths(new Date(), 12), 'yyyy-MM-dd'));
    setDateTo(format(new Date(), 'yyyy-MM-dd'));
    setVehicleId('');
    setTypeFilter('ALL');
    setAreaFilter('ALL');
  };

  const hasActiveFilters = vehicleId || typeFilter !== 'ALL' || areaFilter !== 'ALL';

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
            <Select value={vehicleId || 'ALL'} onValueChange={(v) => setVehicleId(v === 'ALL' ? '' : v)}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Veículo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos Veículos</SelectItem>
                {mockVehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.plate || v.id} - {v.model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as MaintenanceType | 'ALL')}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos Tipos</SelectItem>
                <SelectItem value="PREVENTIVE">Preventiva</SelectItem>
                <SelectItem value="CORRECTIVE">Corretiva</SelectItem>
              </SelectContent>
            </Select>
            <Select value={areaFilter} onValueChange={(v) => setAreaFilter(v as ServiceArea | 'ALL')}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Área" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas Áreas</SelectItem>
                {Object.entries(serviceAreaLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPIs - Removed "Frota média" card */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Total no período</p>
            </div>
            <p className="text-2xl font-bold mt-1">{formatCurrencyBRL(kpis.totalSpent)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-muted-foreground">Média mensal</p>
            </div>
            <p className="text-2xl font-bold mt-1">{formatCurrencyBRL(kpis.avgMonthly)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Preventiva vs Corretiva</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-blue-600">{kpis.preventiveRate.toFixed(0)}%</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-2xl font-bold text-orange-600">{(100 - kpis.preventiveRate).toFixed(0)}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Custo médio/carro</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Custo total de manutenção ÷ Frota média no período.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Considera apenas veículos operacionais (Disponível, Alugado, Manutenção, Sinistro).
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold mt-1">{formatCurrencyBRL(kpis.avgCostPerCar)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-amber-600" />
              <p className="text-sm text-muted-foreground">Veículo mais caro</p>
            </div>
            {kpis.topVehicle ? (
              <div className="mt-1">
                <p className="font-bold">{kpis.topVehicle.plate || kpis.topVehicle.id}</p>
                <p className="text-sm text-muted-foreground">{formatCurrencyBRL(kpis.topVehicle.cost)}</p>
              </div>
            ) : (
              <p className="text-muted-foreground mt-1">—</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spend - with Legend */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Gasto por Mês</CardTitle>
            <CardDescription>Evolução dos gastos com manutenção</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <BarChart data={monthlyData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis 
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  className="text-xs"
                  width={60}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => formatCurrencyBRL(value)}
                />
                <Legend 
                  formatter={(value) => value === 'preventive' ? 'Preventiva' : 'Corretiva'}
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Bar dataKey="preventive" stackId="a" fill="hsl(221.2 83.2% 53.3%)" name="preventive" />
                <Bar dataKey="corrective" stackId="a" fill="hsl(24.6 95% 53.1%)" name="corrective" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Type Distribution */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
            <CardDescription>Preventiva vs Corretiva</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip 
                  formatter={(value: number, name: string, props: { payload?: { cost?: number } }) => [
                    `${value} registros (${formatCurrencyBRL(props.payload?.cost ?? 0)})`,
                    name
                  ]}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Area Distribution - Opção A: resumo compacto abaixo */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Distribuição por Área</CardTitle>
            <CardDescription>Gastos por área de serviço</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <BarChart data={areaDistribution} layout="vertical" margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number"
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  className="text-xs"
                />
                <YAxis type="category" dataKey="name" className="text-xs" width={90} />
                <ChartTooltip formatter={(value: number) => formatCurrencyBRL(value)} />
                <Bar dataKey="cost" fill="hsl(var(--primary))" name="Custo Total" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
            {/* Compact legend below */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t">
              {areaDistribution.map((area, i) => (
                <div key={area.name} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{area.name}</p>
                    <p className="text-sm font-medium">{formatCurrencyBRL(area.cost)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
