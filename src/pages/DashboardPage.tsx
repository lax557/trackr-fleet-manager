import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getFleetCounts,
  getAttentionLists,
  getFinesSummary,
  getBacklogVehicles,
  getExecutiveMetrics,
} from '@/services/dashboard.service';
import { FleetStatusChart } from '@/components/FleetStatusChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Clock, AlertCircle, Car, CheckCircle2, UserCheck,
  Wrench, TrendingUp, DollarSign, Receipt,
  FileWarning, CalendarClock, AlertOctagon, Gauge, ShieldAlert, Tag
} from 'lucide-react';
import { formatCurrencyBRL } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePermissions } from '@/hooks/usePermissions';
import { Skeleton } from '@/components/ui/skeleton';

type DashboardMode = 'operational' | 'executive';

const statusDisplayMap: Record<string, string> = {
  maintenance: 'MANUTENCAO',
  incident: 'SINISTRO',
};

export function DashboardPage() {
  const [mode, setMode] = useState<DashboardMode>('operational');
  const navigate = useNavigate();
  const { can } = usePermissions();

  // ── Queries ──
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboard-fleet-counts'],
    queryFn: getFleetCounts,
  });

  const { data: attention, isLoading: loadingAttention } = useQuery({
    queryKey: ['dashboard-attention'],
    queryFn: getAttentionLists,
  });

  const { data: finesSummary } = useQuery({
    queryKey: ['dashboard-fines-summary'],
    queryFn: getFinesSummary,
  });

  const { data: backlogVehicles = [] } = useQuery({
    queryKey: ['dashboard-backlog'],
    queryFn: getBacklogVehicles,
  });

  const { data: execMetrics } = useQuery({
    queryKey: ['dashboard-executive'],
    queryFn: getExecutiveMetrics,
    enabled: mode === 'executive',
  });

  const safeStats = stats || { total: 0, disponivel: 0, alugado: 0, manutencao: 0, sinistro: 0, paraVenda: 0, emLiberacao: 0 };
  const safeFines = finesSummary || { open: 0, dueSoon: 0, overdue: 0, paid: 0, totalOpenAmount: 0 };
  const vehiclesAttention = attention?.vehiclesAttention || [];
  const expiringContracts = attention?.expiringContracts || [];

  const TOP_ATTENTION = 6;
  const TOP_CONTRACTS = 5;
  const TOP_BACKLOG = 6;

  // ── Fleet KPIs (both modes) ──
  const fleetKpis = [
    { label: 'Total', value: safeStats.total, icon: Car, colorClass: 'text-primary' },
    { label: 'Alugados', value: safeStats.alugado, icon: UserCheck, colorClass: 'text-blue-600' },
    { label: 'Disponíveis', value: safeStats.disponivel, icon: CheckCircle2, colorClass: 'text-green-600' },
    { label: 'Manutenção', value: safeStats.manutencao, icon: Wrench, colorClass: 'text-amber-600' },
    { label: 'Sinistro', value: safeStats.sinistro, icon: ShieldAlert, colorClass: 'text-red-600' },
    { label: 'Para Venda', value: safeStats.paraVenda, icon: Tag, colorClass: 'text-purple-600' },
    { label: 'Backlog', value: safeStats.emLiberacao, icon: Clock, colorClass: 'text-muted-foreground' },
  ];

  // ── Financial KPIs (executive) ──
  const financialKpis = execMetrics ? [
    { label: 'Receita Estimada', value: formatCurrencyBRL(execMetrics.estimatedMonthlyRevenue), icon: DollarSign, colorClass: 'text-green-600', tooltip: 'Receita mensal estimada com base nos contratos ativos' },
    { label: 'Receita Realizada', value: execMetrics.realizedRevenue !== null ? formatCurrencyBRL(execMetrics.realizedRevenue) : '—', icon: Receipt, colorClass: 'text-blue-600', tooltip: execMetrics.realizedRevenue !== null ? 'Receita efetivamente recebida no mês' : 'Conectar provedor de pagamento para exibir' },
    { label: 'Custo Manutenção', value: formatCurrencyBRL(execMetrics.maintenanceCostMonth), icon: Wrench, colorClass: 'text-amber-600', tooltip: 'Custo total de manutenções no mês' },
    { label: 'Margem Operacional', value: execMetrics.estimatedMonthlyRevenue > 0 ? `${execMetrics.operationalMargin.toFixed(1)}%` : '—', icon: Gauge, colorClass: execMetrics.operationalMargin >= 60 ? 'text-green-600' : execMetrics.operationalMargin >= 40 ? 'text-amber-600' : 'text-red-600', tooltip: '(Receita - Manutenção) / Receita' },
  ] : [];

  const strategicKpis = execMetrics ? [
    { label: 'Taxa de Ocupação', value: `${execMetrics.occupancyRate.toFixed(0)}%`, icon: TrendingUp, colorClass: execMetrics.occupancyRate >= 80 ? 'text-green-600' : execMetrics.occupancyRate >= 60 ? 'text-amber-600' : 'text-red-600', tooltip: 'Percentual da frota operacional atualmente alugada' },
    { label: 'Frota Improdutiva', value: `${execMetrics.unproductiveRate.toFixed(0)}%`, icon: AlertOctagon, colorClass: execMetrics.unproductiveRate <= 10 ? 'text-green-600' : execMetrics.unproductiveRate <= 20 ? 'text-amber-600' : 'text-red-600', tooltip: 'Veículos em manutenção ou sinistro sem gerar receita' },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            {mode === 'operational' ? 'Visão operacional da frota' : 'Visão executiva e financeira'}
          </p>
        </div>
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(v) => { if (v) setMode(v as DashboardMode); }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="operational" className="text-xs px-4">
            Operacional
          </ToggleGroupItem>
          {can('view_financial') && (
            <ToggleGroupItem value="executive" className="text-xs px-4">
              Executivo
            </ToggleGroupItem>
          )}
        </ToggleGroup>
      </div>

      {/* ══════ BLOCO 1 — KPIs da Frota (ambos os modos) ══════ */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
        {fleetKpis.map(({ label, value, icon: Icon, colorClass }) => (
          <Card key={label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <Icon className={`h-4 w-4 ${colorClass}`} />
                {loadingStats ? (
                  <Skeleton className="h-6 w-8" />
                ) : (
                  <span className={`text-xl font-bold ${colorClass}`}>{value}</span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground font-medium truncate">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ══════ MODO OPERACIONAL ══════ */}
      {mode === 'operational' && (
        <>
          {/* BLOCO 2 — Gráfico + Ações operacionais */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 flex">
              <div className="w-full">
                <FleetStatusChart stats={safeStats} stretch />
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Requer Atenção */}
              <Card className="overflow-hidden flex flex-col" style={{ height: '280px' }}>
                <CardHeader className="pb-2 pt-3 px-4 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <CardTitle className="text-sm">Requer Atenção</CardTitle>
                      <span className="text-xs text-muted-foreground">({vehiclesAttention.length})</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/vehicles')}>
                      Ver todos <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3 flex-1 min-h-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="space-y-1.5 pr-2">
                      {vehiclesAttention.slice(0, TOP_ATTENTION).map(vehicle => (
                        <div
                          key={vehicle.id}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium text-primary text-sm">{vehicle.vehicle_code || vehicle.id.slice(0, 8)}</span>
                            <span className="text-xs text-muted-foreground truncate">{vehicle.brand} {vehicle.model}</span>
                          </div>
                          <StatusBadge status={statusDisplayMap[vehicle.status] || vehicle.status.toUpperCase()} size="sm" />
                        </div>
                      ))}
                      {vehiclesAttention.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-6">Nenhum veículo requer atenção agora.</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Contratos vencendo */}
              <Card className="overflow-hidden flex flex-col" style={{ height: '200px' }}>
                <CardHeader className="pb-2 pt-3 px-4 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm">Contratos Vencendo</CardTitle>
                      <span className="text-xs text-muted-foreground">({expiringContracts.length})</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/rentals')}>
                      Ver todos <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3 flex-1 min-h-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="space-y-1.5 pr-2">
                      {expiringContracts.length > 0 ? expiringContracts.slice(0, TOP_CONTRACTS).map(c => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => navigate(`/rentals/${c.id}`)}
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate">{c.drivers?.full_name || '—'}</span>
                            <span className="text-xs text-muted-foreground truncate">
                              {c.vehicles?.vehicle_code || ''} • {c.vehicles?.brand} {c.vehicles?.model}
                            </span>
                          </div>
                          <span className={`text-xs font-medium whitespace-nowrap ml-2 ${c.daysRemaining <= 7 ? 'text-red-600' : c.daysRemaining <= 15 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                            {c.daysRemaining}d
                          </span>
                        </div>
                      )) : (
                        <p className="text-xs text-muted-foreground text-center py-6">Nenhum contrato vencendo nos próximos 30 dias.</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Multas pendentes */}
              <Card className="overflow-hidden flex flex-col shrink-0">
                <CardHeader className="pb-2 pt-3 px-4 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileWarning className="h-4 w-4 text-red-500" />
                      <CardTitle className="text-sm">Multas Pendentes</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/fines')}>
                      Ver todas <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-xl font-bold text-foreground leading-tight">{safeFines.open + safeFines.dueSoon + safeFines.overdue}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">Em aberto</p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-xl font-bold text-red-600 leading-tight">{safeFines.overdue}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">Vencidas</p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-base font-bold text-amber-600 leading-tight truncate max-w-full">{formatCurrencyBRL(safeFines.totalOpenAmount)}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">Valor total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* BLOCO 3 — Backlog de Aquisição */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Backlog de Aquisição</CardTitle>
                  <span className="text-xs text-muted-foreground">({backlogVehicles.length} veículos)</span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/vehicles')}>
                  Ver todos <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-3">
              {backlogVehicles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {backlogVehicles.slice(0, TOP_BACKLOG).map(vehicle => (
                    <div
                      key={vehicle.id}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-primary text-sm">{vehicle.vehicle_code || vehicle.id.slice(0, 8)}</span>
                        <span className="text-xs text-muted-foreground truncate">{vehicle.brand} {vehicle.model}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum veículo em backlog.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* ══════ MODO EXECUTIVO ══════ */}
      {mode === 'executive' && (
        <>
          {/* BLOCO 2 — KPIs financeiros */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {financialKpis.map(({ label, value, icon: Icon, colorClass, tooltip }) => (
              <Card key={label} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-4 w-4 ${colorClass}`} />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent><p>{tooltip}</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* BLOCO 3 — KPIs estratégicos */}
          <div className="grid grid-cols-2 gap-3">
            {strategicKpis.map(({ label, value, icon: Icon, colorClass, tooltip }) => (
              <Card key={label} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-4 w-4 ${colorClass}`} />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent><p>{tooltip}</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* BLOCO 4 — Gráfico + Backlog resumido */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <FleetStatusChart stats={safeStats} />
            </div>
            <div className="lg:col-span-4">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">Backlog Resumido</CardTitle>
                    <span className="text-xs text-muted-foreground">({backlogVehicles.length})</span>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3 flex-1 min-h-0">
                  <ScrollArea className="h-[240px]">
                    <div className="space-y-1.5 pr-2">
                      {backlogVehicles.length > 0 ? backlogVehicles.map(vehicle => (
                        <div
                          key={vehicle.id}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium text-primary text-sm">{vehicle.vehicle_code || vehicle.id.slice(0, 8)}</span>
                            <span className="text-xs text-muted-foreground truncate">{vehicle.brand} {vehicle.model}</span>
                          </div>
                        </div>
                      )) : (
                        <p className="text-xs text-muted-foreground text-center py-2">Nenhum veículo em aquisição.</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
