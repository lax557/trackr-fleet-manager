import { useMemo } from 'react';
import { getVehicleStats, getVehiclesWithDetails, getFleetManagementStats, getDashboardFinancialStats, getExpiringContracts } from '@/data/mockData';
import { getFineStats } from '@/data/finesData';
import { FleetStatusChart } from '@/components/FleetStatusChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, StageBadge } from '@/components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Clock, AlertCircle, Car, CheckCircle2, UserCheck, 
  Wrench, AlertTriangle, TrendingUp, DollarSign, Receipt, 
  FileWarning, CalendarClock, AlertOctagon, Gauge
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyBRL } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

export function DashboardPage() {
  const navigate = useNavigate();
  const stats = useMemo(() => getVehicleStats(), []);
  const vehicles = useMemo(() => getVehiclesWithDetails(), []);
  const fleetStats = useMemo(() => getFleetManagementStats(), []);
  const financialStats = useMemo(() => getDashboardFinancialStats(), []);
  const fineStats = useMemo(() => getFineStats(), []);
  const expiringContracts = useMemo(() => getExpiringContracts(30), []);
  
  const vehiclesInMaintenance = vehicles.filter(v => v.currentStatus === 'MANUTENCAO');
  const availableVehicles = vehicles.filter(v => v.currentStatus === 'DISPONIVEL');
  const backlogVehicles = vehicles.filter(v => v.currentStatus === 'EM_LIBERACAO');

  // BLOCO 1 — KPIs operacionais
  const kpiCards = [
    { label: 'Total', value: stats.total, icon: Car, colorClass: 'text-primary' },
    { label: 'Alugados', value: stats.alugado, icon: UserCheck, colorClass: 'text-blue-600' },
    { label: 'Disponíveis', value: stats.disponivel, icon: CheckCircle2, colorClass: 'text-green-600' },
    { label: 'Manutenção', value: stats.manutencao, icon: Wrench, colorClass: 'text-amber-600' },
    { label: 'Improdutiva', value: `${fleetStats.unproductiveRate.toFixed(0)}%`, icon: AlertOctagon, colorClass: fleetStats.unproductiveRate <= 10 ? 'text-green-600' : fleetStats.unproductiveRate <= 20 ? 'text-amber-600' : 'text-red-600' },
    { label: 'Ocupação', value: `${fleetStats.occupancyRate.toFixed(0)}%`, icon: TrendingUp, colorClass: fleetStats.occupancyRate >= 80 ? 'text-green-600' : fleetStats.occupancyRate >= 60 ? 'text-amber-600' : 'text-red-600' },
  ];

  // BLOCO 2 — Performance financeira
  const finCards = [
    { label: 'Receita Estimada', value: formatCurrencyBRL(financialStats.estimatedMonthlyRevenue), icon: DollarSign, colorClass: 'text-green-600', tooltip: 'Receita mensal estimada com base nos contratos ativos' },
    { label: 'Receita Realizada', value: formatCurrencyBRL(financialStats.realizedRevenue), icon: Receipt, colorClass: 'text-blue-600', tooltip: 'Receita efetivamente recebida no mês' },
    { label: 'Custo Manutenção', value: formatCurrencyBRL(financialStats.maintenanceCostMonth), icon: Wrench, colorClass: 'text-amber-600', tooltip: 'Custo total de manutenções no mês' },
    { label: 'Margem Operacional', value: `${financialStats.operationalMargin.toFixed(1)}%`, icon: Gauge, colorClass: financialStats.operationalMargin >= 60 ? 'text-green-600' : financialStats.operationalMargin >= 40 ? 'text-amber-600' : 'text-red-600', tooltip: '(Receita - Manutenção) / Receita' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Visão geral da sua frota</p>
      </div>

      {/* BLOCO 1 — KPIs operacionais */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {kpiCards.map(({ label, value, icon: Icon, colorClass }) => (
          <Card key={label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Icon className={`h-5 w-5 ${colorClass}`} />
                <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground font-medium">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* BLOCO 2 — Performance financeira */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {finCards.map(({ label, value, icon: Icon, colorClass, tooltip }) => (
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

      {/* BLOCO 3 + 4 — Gráfico (60%) + Ações operacionais (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Distribuição da Frota — 7 cols (~60%) */}
        <div className="lg:col-span-7">
          <FleetStatusChart stats={stats} />
        </div>

        {/* Ações operacionais — 5 cols (~40%) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Requer Atenção */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <CardTitle className="text-sm">Requer Atenção</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/vehicles')}>
                  Ver todos <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="space-y-2">
                {[...vehiclesInMaintenance.slice(0, 2), ...availableVehicles.slice(0, 1)].map(vehicle => (
                  <div 
                    key={vehicle.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-primary text-sm">{vehicle.id}</span>
                      <span className="text-xs text-muted-foreground">{vehicle.make} {vehicle.model}</span>
                    </div>
                    <StatusBadge status={vehicle.currentStatus} size="sm" />
                  </div>
                ))}
                {vehiclesInMaintenance.length === 0 && availableVehicles.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">Nenhum veículo requer atenção.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contratos próximos do vencimento */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Contratos Vencendo</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/rentals')}>
                  Ver todos <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="space-y-2">
                {expiringContracts.length > 0 ? expiringContracts.slice(0, 3).map(c => (
                  <div 
                    key={c.rentalId}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => navigate('/rentals')}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{c.driverName}</span>
                      <span className="text-xs text-muted-foreground">{c.vehicleId} • {c.vehicleModel}</span>
                    </div>
                    <span className={`text-xs font-medium ${c.daysRemaining <= 7 ? 'text-red-600' : c.daysRemaining <= 15 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                      {c.daysRemaining}d
                    </span>
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground text-center py-2">Nenhum contrato vencendo em 30 dias.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Multas pendentes */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
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
            <CardContent className="px-4 pb-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{fineStats.open + fineStats.dueSoon + fineStats.overdue}</p>
                  <p className="text-xs text-muted-foreground">Em aberto</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-red-600">{fineStats.overdue}</p>
                  <p className="text-xs text-muted-foreground">Vencidas</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-amber-600">{formatCurrencyBRL(fineStats.totalOpenAmount)}</p>
                  <p className="text-xs text-muted-foreground">Valor total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BLOCO 5 — Backlog de Aquisição (compacto) */}
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
              {backlogVehicles.map(vehicle => (
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
            <p className="text-xs text-muted-foreground text-center py-2">Nenhum veículo em aquisição.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardPage;
