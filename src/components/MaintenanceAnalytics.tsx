import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listOrders, typeLabels, areaLabels, MaintenanceTypeDB, ServiceAreaDB, MaintenanceOrderRow } from '@/services/maintenance.service';
import { fetchVehicles } from '@/services/vehicles.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartLegend, ChartLegendContent, ChartConfig } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { DollarSign, TrendingUp, Car, Filter, X, HelpCircle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCurrencyBRL } from '@/lib/utils';

const chartConfig = {
  total: { label: 'Total', color: 'hsl(var(--primary))' },
  preventive: { label: 'Preventiva', color: 'hsl(221.2 83.2% 53.3%)' },
  corrective: { label: 'Corretiva', color: 'hsl(24.6 95% 53.1%)' },
} satisfies ChartConfig;

const COLORS = ['hsl(var(--primary))', 'hsl(221.2 83.2% 53.3%)', 'hsl(24.6 95% 53.1%)', 'hsl(142.1 76.2% 36.3%)', 'hsl(262.1 83.3% 57.8%)', 'hsl(0 72.2% 50.6%)'];
const PIE_COLORS = ['hsl(221.2 83.2% 53.3%)', 'hsl(24.6 95% 53.1%)'];

export function MaintenanceAnalytics() {
  const [dateFrom, setDateFrom] = useState(format(subMonths(new Date(), 12), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [vehicleId, setVehicleId] = useState('');
  const [typeFilter, setTypeFilter] = useState<MaintenanceTypeDB | 'ALL'>('ALL');
  const [areaFilter, setAreaFilter] = useState<ServiceAreaDB | 'ALL'>('ALL');

  const { data: orders = [] } = useQuery({
    queryKey: ['maintenance-analytics', dateFrom, dateTo, vehicleId, typeFilter, areaFilter],
    queryFn: () => listOrders({ dateFrom, dateTo, vehicleId, type: typeFilter, area: areaFilter }),
  });

  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles-list'], queryFn: fetchVehicles });

  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; sortKey: string; total: number; preventive: number; corrective: number }> = {};
    orders.forEach(m => {
      const d = new Date(m.opened_at);
      const key = format(d, 'yyyy-MM');
      const label = format(d, 'MMM/yy', { locale: ptBR });
      if (!months[key]) months[key] = { month: label, sortKey: key, total: 0, preventive: 0, corrective: 0 };
      const cost = m.total_cost || 0;
      months[key].total += cost;
      if (m.type === 'preventive') months[key].preventive += cost;
      else months[key].corrective += cost;
    });
    return Object.values(months).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [orders]);

  const typeDistribution = useMemo(() => {
    const prev = orders.filter(m => m.type === 'preventive');
    const corr = orders.filter(m => m.type === 'corrective');
    return [
      { name: 'Preventiva', value: prev.length, cost: prev.reduce((s, m) => s + (m.total_cost || 0), 0) },
      { name: 'Corretiva', value: corr.length, cost: corr.reduce((s, m) => s + (m.total_cost || 0), 0) },
    ];
  }, [orders]);

  const areaDistribution = useMemo(() => {
    const areas: Record<string, { name: string; value: number; cost: number }> = {};
    orders.forEach(m => {
      const name = areaLabels[m.service_area] || m.service_area;
      if (!areas[m.service_area]) areas[m.service_area] = { name, value: 0, cost: 0 };
      areas[m.service_area].value += 1;
      areas[m.service_area].cost += m.total_cost || 0;
    });
    return Object.values(areas).sort((a, b) => b.cost - a.cost);
  }, [orders]);

  const topVehicles = useMemo(() => {
    const vc: Record<string, { id: string; plate: string | null; model: string; cost: number; count: number }> = {};
    orders.forEach(m => {
      if (!vc[m.vehicle_id]) vc[m.vehicle_id] = { id: m.vehicle_id, plate: m.vehicles?.plate || null, model: `${m.vehicles?.brand || ''} ${m.vehicles?.model || ''}`, cost: 0, count: 0 };
      vc[m.vehicle_id].cost += m.total_cost || 0;
      vc[m.vehicle_id].count += 1;
    });
    return Object.values(vc).sort((a, b) => b.cost - a.cost).slice(0, 10);
  }, [orders]);
  const maxVehicleCost = topVehicles[0]?.cost || 1;

  const kpis = useMemo(() => {
    const totalSpent = orders.reduce((s, m) => s + (m.total_cost || 0), 0);
    const monthCount = monthlyData.length || 1;
    const avgMonthly = totalSpent / monthCount;
    const prevCount = orders.filter(m => m.type === 'preventive').length;
    const preventiveRate = orders.length > 0 ? (prevCount / orders.length) * 100 : 0;
    const vehicleCount = new Set(orders.map(m => m.vehicle_id)).size;
    const avgCostPerCar = vehicleCount > 0 ? totalSpent / vehicleCount : 0;
    const topV = topVehicles[0];
    return { totalSpent, avgMonthly, preventiveRate, avgCostPerCar, topVehicle: topV };
  }, [orders, monthlyData, topVehicles]);

  const clearFilters = () => { setDateFrom(format(subMonths(new Date(), 12), 'yyyy-MM-dd')); setDateTo(format(new Date(), 'yyyy-MM-dd')); setVehicleId(''); setTypeFilter('ALL'); setAreaFilter('ALL'); };
  const hasActiveFilters = vehicleId || typeFilter !== 'ALL' || areaFilter !== 'ALL';

  const totalTypeCount = typeDistribution.reduce((s, d) => s + d.value, 0);
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      const pct = totalTypeCount > 0 ? ((data.value / totalTypeCount) * 100).toFixed(0) : '0';
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: data.name === 'Preventiva' ? PIE_COLORS[0] : PIE_COLORS[1] }} />
            <span className="font-medium text-popover-foreground text-sm">{data.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">{formatCurrencyBRL(data.cost)} ({pct}%)</p>
          <p className="text-xs text-muted-foreground">{data.value} registros</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-muted-foreground" /><CardTitle className="text-base">Filtros</CardTitle></div>
            {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters}><X className="h-4 w-4 mr-1" />Limpar</Button>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-40" />
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-40" />
            </div>
            <Select value={vehicleId || 'ALL'} onValueChange={v => setVehicleId(v === 'ALL' ? '' : v)}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Veículo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos Veículos</SelectItem>
                {vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.plate || (v as any).vehicleCode || v.id.slice(0,8)} - {v.model}</SelectItem>)}
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
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">Total no período</p></div><p className="text-2xl font-bold mt-1">{formatCurrencyBRL(kpis.totalSpent)}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blue-600" /><p className="text-sm text-muted-foreground">Média mensal</p></div><p className="text-2xl font-bold mt-1">{formatCurrencyBRL(kpis.avgMonthly)}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Preventiva vs Corretiva</p><div className="flex items-center gap-2 mt-1"><span className="text-2xl font-bold text-blue-600">{kpis.preventiveRate.toFixed(0)}%</span><span className="text-muted-foreground">/</span><span className="text-2xl font-bold text-orange-600">{(100 - kpis.preventiveRate).toFixed(0)}%</span></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2"><Car className="h-5 w-5 text-muted-foreground" /><p className="text-sm text-muted-foreground">Custo médio/carro</p><Tooltip><TooltipTrigger asChild><HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent className="max-w-xs"><p>Custo total ÷ veículos com manutenção no período.</p></TooltipContent></Tooltip></div><p className="text-2xl font-bold mt-1">{formatCurrencyBRL(kpis.avgCostPerCar)}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center gap-2"><Car className="h-5 w-5 text-amber-600" /><p className="text-sm text-muted-foreground">Veículo mais caro</p></div>{kpis.topVehicle ? (<div className="mt-1"><p className="font-bold">{kpis.topVehicle.plate || kpis.topVehicle.id.slice(0,8)}</p><p className="text-sm text-muted-foreground">{formatCurrencyBRL(kpis.topVehicle.cost)}</p></div>) : <p className="text-muted-foreground mt-1">—</p>}</CardContent></Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly */}
        <Card className="flex flex-col">
          <CardHeader><CardTitle>Gasto por Mês</CardTitle><CardDescription>Evolução dos gastos com manutenção</CardDescription></CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <BarChart data={monthlyData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis tickFormatter={v => `R$ ${(v / 1000).toFixed(0)}k`} className="text-xs" width={60} />
                <RechartsTooltip content={({ active, payload, label }) => {
                  if (!active || !payload) return null;
                  const prevVal = Number(payload.find(p => p.dataKey === 'preventive')?.value || 0);
                  const corrVal = Number(payload.find(p => p.dataKey === 'corrective')?.value || 0);
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-medium text-popover-foreground text-sm mb-2">{label}</p>
                      <div className="flex items-center gap-2 mb-1"><div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'hsl(221.2 83.2% 53.3%)' }} /><span className="text-sm text-muted-foreground">Preventiva:</span><span className="text-sm font-medium">{formatCurrencyBRL(prevVal)}</span></div>
                      <div className="flex items-center gap-2 mb-1"><div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'hsl(24.6 95% 53.1%)' }} /><span className="text-sm text-muted-foreground">Corretiva:</span><span className="text-sm font-medium">{formatCurrencyBRL(corrVal)}</span></div>
                      <div className="border-t border-border pt-1 mt-1"><div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Total:</span><span className="text-sm font-bold">{formatCurrencyBRL(prevVal + corrVal)}</span></div></div>
                    </div>
                  );
                }} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="preventive" stackId="a" fill="hsl(221.2 83.2% 53.3%)" name="preventive" />
                <Bar dataKey="corrective" stackId="a" fill="hsl(24.6 95% 53.1%)" name="corrective" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Type Distribution */}
        <Card className="flex flex-col">
          <CardHeader><CardTitle>Distribuição por Tipo</CardTitle><CardDescription>Preventiva vs Corretiva</CardDescription></CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <PieChart>
                <Pie data={typeDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {typeDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <RechartsTooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Area Distribution */}
        <Card className="flex flex-col">
          <CardHeader><CardTitle>Distribuição por Área</CardTitle><CardDescription>Gastos por área de serviço</CardDescription></CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <BarChart data={areaDistribution} layout="vertical" margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tickFormatter={v => `R$ ${(v / 1000).toFixed(0)}k`} className="text-xs" />
                <YAxis type="category" dataKey="name" className="text-xs" width={90} />
                <ChartTooltip formatter={(v: number) => formatCurrencyBRL(v)} />
                <Bar dataKey="cost" fill="hsl(var(--primary))" name="Custo Total" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t">
              {areaDistribution.map((area, i) => (
                <div key={area.name} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <div className="min-w-0"><p className="text-xs text-muted-foreground truncate">{area.name}</p><p className="text-sm font-medium">{formatCurrencyBRL(area.cost)}</p></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top 10 */}
        <Card className="flex flex-col">
          <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500" />Top 10 Veículos — Maior Custo</CardTitle><CardDescription>Concentração de custos de manutenção</CardDescription></CardHeader>
          <CardContent className="flex-1 min-h-0">
            <div className="space-y-2">
              {topVehicles.map((v, i) => (
                <div key={v.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-5 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium truncate">{v.plate || v.id.slice(0,8)}</span>
                        <span className="text-xs text-muted-foreground truncate hidden sm:inline">{v.model}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className="text-xs text-muted-foreground">{v.count} {v.count === 1 ? 'manutenção' : 'manutenções'}</span>
                        <span className="text-sm font-bold">{formatCurrencyBRL(v.cost)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full bg-primary/70 transition-all" style={{ width: `${(v.cost / maxVehicleCost) * 100}%` }} /></div>
                  </div>
                </div>
              ))}
              {topVehicles.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma manutenção no período.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
