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
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  Car,
  Filter,
  X,
  Users,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, subMonths, isWithinInterval, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  // Filters
  const [dateFrom, setDateFrom] = useState(format(subMonths(new Date(), 12), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [vehicleId, setVehicleId] = useState('');
  const [typeFilter, setTypeFilter] = useState<MaintenanceType | 'ALL'>('ALL');
  const [areaFilter, setAreaFilter] = useState<ServiceArea | 'ALL'>('ALL');

  // Filtered data
  const filteredData = useMemo(() => {
    let data = getMaintenancesWithDetails();

    // Date filter
    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      data = data.filter(m => isWithinInterval(m.occurredAt, { start: from, end: to }));
    }

    // Vehicle filter
    if (vehicleId) {
      data = data.filter(m => m.vehicleId === vehicleId);
    }

    // Type filter
    if (typeFilter !== 'ALL') {
      data = data.filter(m => m.maintenanceType === typeFilter);
    }

    // Area filter
    if (areaFilter !== 'ALL') {
      data = data.filter(m => m.serviceArea === areaFilter);
    }

    return data;
  }, [dateFrom, dateTo, vehicleId, typeFilter, areaFilter]);

  // Monthly spend chart data
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; total: number; preventive: number; corrective: number }> = {};
    
    filteredData.forEach(m => {
      const monthKey = format(m.occurredAt, 'yyyy-MM');
      const monthLabel = format(m.occurredAt, 'MMM/yy', { locale: ptBR });
      
      if (!months[monthKey]) {
        months[monthKey] = { month: monthLabel, total: 0, preventive: 0, corrective: 0 };
      }
      
      months[monthKey].total += m.totalCost;
      if (m.maintenanceType === 'PREVENTIVE') {
        months[monthKey].preventive += m.totalCost;
      } else {
        months[monthKey].corrective += m.totalCost;
      }
    });

    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData]);

  // Type distribution
  const typeDistribution = useMemo(() => {
    const preventive = filteredData.filter(m => m.maintenanceType === 'PREVENTIVE');
    const corrective = filteredData.filter(m => m.maintenanceType === 'CORRECTIVE');
    
    return [
      { name: 'Preventiva', value: preventive.length, cost: preventive.reduce((s, m) => s + m.totalCost, 0) },
      { name: 'Corretiva', value: corrective.length, cost: corrective.reduce((s, m) => s + m.totalCost, 0) },
    ];
  }, [filteredData]);

  // Area distribution
  const areaDistribution = useMemo(() => {
    const areas: Record<string, { name: string; value: number; cost: number }> = {};
    
    filteredData.forEach(m => {
      const areaName = serviceAreaLabels[m.serviceArea];
      if (!areas[m.serviceArea]) {
        areas[m.serviceArea] = { name: areaName, value: 0, cost: 0 };
      }
      areas[m.serviceArea].value += 1;
      areas[m.serviceArea].cost += m.totalCost;
    });

    return Object.values(areas).sort((a, b) => b.cost - a.cost);
  }, [filteredData]);

  // KPIs including fleet average cost
  const kpis = useMemo(() => {
    const totalSpent = filteredData.reduce((sum, m) => sum + m.totalCost, 0);
    const monthCount = monthlyData.length || 1;
    const avgMonthly = totalSpent / monthCount;
    
    const preventiveCount = filteredData.filter(m => m.maintenanceType === 'PREVENTIVE').length;
    const preventiveRate = filteredData.length > 0 
      ? (preventiveCount / filteredData.length) * 100 
      : 0;

    // Top vehicle by cost
    const vehicleCosts: Record<string, { id: string; plate: string | null; cost: number }> = {};
    filteredData.forEach(m => {
      if (!vehicleCosts[m.vehicleId]) {
        vehicleCosts[m.vehicleId] = { id: m.vehicleId, plate: m.vehicle.plate, cost: 0 };
      }
      vehicleCosts[m.vehicleId].cost += m.totalCost;
    });
    const topVehicle = Object.values(vehicleCosts).sort((a, b) => b.cost - a.cost)[0];

    // Calculate average fleet for the period
    let avgFleet = 0;
    let avgCostPerCar = 0;
    
    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      avgFleet = getAverageFleetForPeriod(from, to);
      avgCostPerCar = avgFleet > 0 ? totalSpent / avgFleet : 0;
    }

    return {
      totalSpent,
      avgMonthly,
      preventiveRate,
      topVehicle,
      avgFleet,
      avgCostPerCar,
    };
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

            <Select value={vehicleId || 'ALL'} onValueChange={(v) => setVehicleId(v === 'ALL' ? '' : v)}>
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
                {Object.entries(serviceAreaLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPIs - Updated with fleet average cost */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Total no período</p>
            </div>
            <p className="text-2xl font-bold mt-1">
              R$ {kpis.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-muted-foreground">Média mensal</p>
            </div>
            <p className="text-2xl font-bold mt-1">
              R$ {kpis.avgMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Preventiva vs Corretiva</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-blue-600">
                {kpis.preventiveRate.toFixed(0)}%
              </span>
              <span className="text-muted-foreground">/</span>
              <span className="text-2xl font-bold text-orange-600">
                {(100 - kpis.preventiveRate).toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              <p className="text-sm text-muted-foreground">Frota média</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Média diária de veículos operacionais no período.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Exclui: Em Liberação, Para Venda
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold mt-1">
              {kpis.avgFleet.toFixed(1)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
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
            <p className="text-2xl font-bold mt-1 text-primary">
              R$ {kpis.avgCostPerCar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
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
                <p className="font-bold font-mono">
                  {kpis.topVehicle.plate || kpis.topVehicle.id}
                </p>
                <p className="text-sm text-muted-foreground">
                  R$ {kpis.topVehicle.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground mt-1">—</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spend */}
        <Card>
          <CardHeader>
            <CardTitle>Gasto por Mês</CardTitle>
            <CardDescription>Evolução dos gastos com manutenção</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis 
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  className="text-xs"
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => 
                    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  }
                />
                <Bar dataKey="preventive" stackId="a" fill="hsl(221.2 83.2% 53.3%)" name="Preventiva" />
                <Bar dataKey="corrective" stackId="a" fill="hsl(24.6 95% 53.1%)" name="Corretiva" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
            <CardDescription>Preventiva vs Corretiva</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
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
                    `${value} registros (R$ ${(props.payload?.cost ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`,
                    name
                  ]}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Area Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Distribuição por Área</CardTitle>
            <CardDescription>Gastos por área de serviço</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={areaDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number"
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  className="text-xs"
                />
                <YAxis type="category" dataKey="name" className="text-xs" width={80} />
                <ChartTooltip 
                  formatter={(value: number) => 
                    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  }
                />
                <Bar dataKey="cost" fill="hsl(var(--primary))" name="Custo Total" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
