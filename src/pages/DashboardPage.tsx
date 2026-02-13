import { useMemo, useState } from 'react';
import { getVehicleStats, getVehiclesWithDetails, getFleetManagementStats, getDashboardFinancialStats, getExpiringContracts } from '@/data/mockData';
import { getFineStats } from '@/data/finesData';
import { FleetStatusChart } from '@/components/FleetStatusChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, StageBadge } from '@/components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Clock, AlertCircle, Car, CheckCircle2, UserCheck, 
  Wrench, AlertTriangle, TrendingUp, DollarSign, Receipt, 
  FileWarning, CalendarClock, AlertOctagon, Gauge, ShieldAlert, Tag
} from 'lucide-react';
import { formatCurrencyBRL } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ScrollArea } from '@/components/ui/scroll-area';

type DashboardMode = 'operational' | 'executive';

export function DashboardPage() {
  const [mode, setMode] = useState<DashboardMode>('operational');
  const navigate = useNavigate();
  const stats = useMemo(() => getVehicleStats(), []);
  const vehicles = useMemo(() => getVehiclesWithDetails(), []);
  const fleetStats = useMemo(() => getFleetManagementStats(), []);
  const financialStats = useMemo(() => getDashboardFinancialStats(), []);
  const fineStats = useMemo(() => getFineStats(), []);
  const expiringContracts = useMemo(() => getExpiringContracts(30), []);
  
  // Sort: SINISTRO first, then MANUTENCAO
  const vehiclesNeedAttention = useMemo(() => {
    const filtered = vehicles.filter(v => 
      v.currentStatus === 'MANUTENCAO' || v.currentStatus === 'SINISTRO'
    );
    return filtered.sort((a, b) => {
      const priority: Record<string, number> = { 'SINISTRO': 0, 'MANUTENCAO': 1 };
      return (priority[a.currentStatus] ?? 2) - (priority[b.currentStatus] ?? 2);
    });
  }, [vehicles]);

  const backlogVehicles = useMemo(() => 
    vehicles.filter(v => v.currentStatus === 'EM_LIBERACAO'), [vehicles]
  );

  // Sorted expiring contracts (soonest first)
  const sortedExpiringContracts = useMemo(() => 
    [...expiringContracts].sort((a, b) => a.daysRemaining - b.daysRemaining), [expiringContracts]
  );

  // TOP N limits
  const TOP_ATTENTION = 6;
  const TOP_CONTRACTS = 5;
  const TOP_BACKLOG = 6;

  // ── Shared fleet KPIs (both modes) ──
  const fleetKpis = [
    { label: 'Total', value: stats.total, icon: Car, colorClass: 'text-primary' },
    { label: 'Alugados', value: stats.alugado, icon: UserCheck, colorClass: 'text-blue-600' },
    { label: 'Disponíveis', value: stats.disponivel, icon: CheckCircle2, colorClass: 'text-green-600' },
    { label: 'Manutenção', value: stats.manutencao, icon: Wrench, colorClass: 'text-amber-600' },
    { label: 'Sinistro', value: stats.sinistro, icon: ShieldAlert, colorClass: 'text-red-600' },
    { label: 'Para Venda', value: stats.paraVenda, icon: Tag, colorClass: 'text-purple-600' },
    { label: 'Backlog', value: stats.emLiberacao, icon: Clock, colorClass: 'text-muted-foreground' },
  ];

  // ── Financial KPIs (executive only) ──
  const financialKpis = [
    { label: 'Receita Estimada', value: formatCurrencyBRL(financialStats.estimatedMonthlyRevenue), icon: DollarSign, colorClass: 'text-green-600', tooltip: 'Receita mensal estimada com base nos contratos ativos' },
    { label: 'Receita Realizada', value: formatCurrencyBRL(financialStats.realizedRevenue), icon: Receipt, colorClass: 'text-blue-600', tooltip: 'Receita efetivamente recebida no mês' },
    { label: 'Custo Manutenção', value: formatCurrencyBRL(financialStats.maintenanceCostMonth), icon: Wrench, colorClass: 'text-amber-600', tooltip: 'Custo total de manutenções no mês' },
    { label: 'Margem Operacional', value: `${financialStats.operationalMargin.toFixed(1)}%`, icon: Gauge, colorClass: financialStats.operationalMargin >= 60 ? 'text-green-600' : financialStats.operationalMargin >= 40 ? 'text-amber-600' : 'text-red-600', tooltip: '(Receita - Manutenção) / Receita' },
  ];

  // ── Strategic KPIs (executive only) ──
  const strategicKpis = [
    { label: 'Taxa de Ocupação', value: `${fleetStats.occupancyRate.toFixed(0)}%`, icon: TrendingUp, colorClass: fleetStats.occupancyRate >= 80 ? 'text-green-600' : fleetStats.occupancyRate >= 60 ? 'text-amber-600' : 'text-red-600', tooltip: 'Percentual da frota operacional atualmente alugada' },
    { label: 'Frota Improdutiva', value: `${fleetStats.unproductiveRate.toFixed(0)}%`, icon: AlertOctagon, colorClass: fleetStats.unproductiveRate <= 10 ? 'text-green-600' : fleetStats.unproductiveRate <= 20 ? 'text-amber-600' : 'text-red-600', tooltip: 'Veículos em manutenção ou sinistro sem gerar receita' },
  ];

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
          <ToggleGroupItem value="executive" className="text-xs px-4">
            Executivo
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* ══════ BLOCO 1 — KPIs da Frota (ambos os modos) ══════ */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
        {fleetKpis.map(({ label, value, icon: Icon, colorClass }) => (
          <Card key={label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <Icon className={`h-4 w-4 ${colorClass}`} />
                <span className={`text-xl font-bold ${colorClass}`}>{value}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground font-medium truncate">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ══════ MODO OPERACIONAL ══════ */}
      {mode === 'operational' && (
        <>
          {/* BLOCO 2 — Gráfico + Ações operacionais (alturas alinhadas) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Distribuição da Frota — 8 colunas, stretch para alinhar com coluna direita */}
            <div className="lg:col-span-8 flex">
              <div className="w-full">
                <FleetStatusChart stats={stats} stretch />
              </div>
            </div>

            {/* Ações operacionais — 4 colunas, stack com alturas fixas */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Requer Atenção — card maior */}
              <Card className="overflow-hidden flex flex-col" style={{ height: '280px' }}>
                <CardHeader className="pb-2 pt-3 px-4 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <CardTitle className="text-sm">Requer Atenção</CardTitle>
                      <span className="text-xs text-muted-foreground">({vehiclesNeedAttention.length})</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/vehicles')}>
                      Ver todos <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3 flex-1 min-h-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="space-y-1.5 pr-2">
                      {vehiclesNeedAttention.slice(0, TOP_ATTENTION).map(vehicle => (
                        <div 
                          key={vehicle.id}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium text-primary text-sm">{vehicle.id}</span>
                            <span className="text-xs text-muted-foreground truncate">{vehicle.make} {vehicle.model}</span>
                          </div>
                          <StatusBadge status={vehicle.currentStatus} size="sm" />
                        </div>
                      ))}
                      {vehiclesNeedAttention.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-6">Nenhum veículo requer atenção agora.</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Contratos vencendo — card médio */}
              <Card className="overflow-hidden flex flex-col" style={{ height: '200px' }}>
                <CardHeader className="pb-2 pt-3 px-4 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-primary" />
                       <CardTitle className="text-sm">Contratos Vencendo</CardTitle>
                      <span className="text-xs text-muted-foreground">({sortedExpiringContracts.length})</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/rentals')}>
                      Ver todos <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3 flex-1 min-h-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="space-y-1.5 pr-2">
                      {sortedExpiringContracts.length > 0 ? sortedExpiringContracts.slice(0, TOP_CONTRACTS).map(c => (
                        <div 
                          key={c.rentalId}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => navigate('/rentals')}
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate">{c.driverName}</span>
                            <span className="text-xs text-muted-foreground truncate">{c.vehicleId} • {c.vehicleModel}</span>
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

              {/* Multas pendentes — card compacto com grid interno alinhado */}
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
                      <p className="text-xl font-bold text-foreground leading-tight">{fineStats.open + fineStats.dueSoon + fineStats.overdue}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">Em aberto</p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-xl font-bold text-red-600 leading-tight">{fineStats.overdue}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">Vencidas</p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-base font-bold text-amber-600 leading-tight truncate max-w-full">{formatCurrencyBRL(fineStats.totalOpenAmount)}</p>
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
                        <span className="font-medium text-primary text-sm">{vehicle.id}</span>
                        <span className="text-xs text-muted-foreground truncate">{vehicle.make} {vehicle.model}</span>
                      </div>
                      {vehicle.acquisition && <StageBadge stage={vehicle.acquisition.stage} />}
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
              <FleetStatusChart stats={stats} />
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
                            <span className="font-medium text-primary text-sm">{vehicle.id}</span>
                            <span className="text-xs text-muted-foreground truncate">{vehicle.make} {vehicle.model}</span>
                          </div>
                          {vehicle.acquisition && <StageBadge stage={vehicle.acquisition.stage} />}
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
