import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getFinancialDashboardStats, transactions, bills, categoryLabels, type TransactionCategory } from '@/data/financialData';
import { formatCurrencyBRL } from '@/lib/utils';
import { DollarSign, TrendingUp, TrendingDown, Wallet, ArrowDownCircle, ArrowUpCircle, Flame, Timer, Percent, CalendarClock, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar, Line, ComposedChart } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { addDays, differenceInDays, format, startOfWeek, endOfWeek, addWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['hsl(267,80%,54%)', 'hsl(217,91%,60%)', 'hsl(38,92%,50%)', 'hsl(0,72%,51%)', 'hsl(142,71%,45%)', 'hsl(280,60%,50%)', 'hsl(200,70%,50%)', 'hsl(30,80%,55%)'];

export default function FinancialDashboardPage() {
  const navigate = useNavigate();
  const stats = useMemo(() => getFinancialDashboardStats(), []);

  const expenseData = useMemo(() => {
    const entries = Object.entries(stats.expenseByCategory).map(([cat, val]) => ({
      name: categoryLabels[cat as TransactionCategory] || cat,
      value: Math.round(val),
    })).sort((a, b) => b.value - a.value);
    const total = entries.reduce((s, e) => s + e.value, 0);
    return entries.map(e => ({ ...e, percent: total > 0 ? ((e.value / total) * 100).toFixed(1) : '0' }));
  }, [stats]);

  const recentTxns = transactions.slice(0, 8);

  // "O que está por vir" data
  const forecastData = useMemo(() => {
    const now = new Date();
    const pendingPayables = bills.filter(b => b.type === 'PAGAR' && (b.status === 'PENDENTE' || b.status === 'VENCIDO'));
    const pendingReceivables = bills.filter(b => b.type === 'RECEBER' && (b.status === 'PENDENTE' || b.status === 'VENCIDO'));
    
    const totalReceivable = pendingReceivables.reduce((s, b) => s + b.amount, 0);
    const totalPayable = pendingPayables.reduce((s, b) => s + b.amount, 0);
    const projectedBalance = totalReceivable - totalPayable;

    // Weekly forecast for next 4 weeks
    const weeklyData: { week: string; entradas: number; saidas: number; saldo: number }[] = [];
    let runningBalance = stats.totalBalance;
    
    for (let w = 0; w < 4; w++) {
      const weekStart = startOfWeek(addWeeks(now, w), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(addWeeks(now, w), { weekStartsOn: 1 });
      
      const weekReceivables = pendingReceivables
        .filter(b => b.dueDate >= weekStart && b.dueDate <= weekEnd)
        .reduce((s, b) => s + b.amount, 0);
      
      const weekPayables = pendingPayables
        .filter(b => b.dueDate >= weekStart && b.dueDate <= weekEnd)
        .reduce((s, b) => s + b.amount, 0);
      
      runningBalance += weekReceivables - weekPayables;
      
      weeklyData.push({
        week: `Sem ${w + 1}`,
        entradas: Math.round(weekReceivables),
        saidas: Math.round(-weekPayables),
        saldo: Math.round(runningBalance),
      });
    }

    // Critical payables (upcoming or overdue)
    const criticalPayables = pendingPayables
      .map(b => ({
        ...b,
        daysUntil: differenceInDays(b.dueDate, now),
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);

    // Upcoming receivables
    const upcomingReceivables = pendingReceivables
      .map(b => ({
        ...b,
        daysUntil: differenceInDays(b.dueDate, now),
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);

    return { totalReceivable, totalPayable, projectedBalance, weeklyData, criticalPayables, upcomingReceivables };
  }, [stats, bills]);

  const kpis = [
    { label: 'Saldo Total', value: formatCurrencyBRL(stats.totalBalance), icon: Wallet, color: 'text-primary' },
    { label: 'Receitas (mês)', value: formatCurrencyBRL(stats.revenue), icon: TrendingUp, color: 'text-green-600' },
    { label: 'Despesas (mês)', value: formatCurrencyBRL(stats.expenses), icon: TrendingDown, color: 'text-red-600' },
    { label: 'Lucro Líquido', value: formatCurrencyBRL(stats.profit), icon: DollarSign, color: stats.profit >= 0 ? 'text-green-600' : 'text-red-600' },
    { label: 'A Receber', value: formatCurrencyBRL(stats.pendingReceivables), icon: ArrowDownCircle, color: 'text-blue-600' },
    { label: 'A Pagar', value: formatCurrencyBRL(stats.pendingPayables), icon: ArrowUpCircle, color: 'text-amber-600' },
  ];

  const analysisKpis = [
    { label: 'Margem Real', value: `${stats.margin.toFixed(1)}%`, icon: Percent, color: stats.margin >= 30 ? 'text-green-600' : 'text-amber-600', tooltip: 'Lucro / Receita' },
    { label: 'Queima Diária', value: formatCurrencyBRL(stats.burnRate), icon: Flame, color: 'text-red-500', tooltip: 'Despesas médias por dia' },
    { label: 'Runway', value: `${Math.round(stats.runway)} dias`, icon: Timer, color: stats.runway >= 90 ? 'text-green-600' : 'text-amber-600', tooltip: 'Saldo / Queima diária' },
  ];

  const CustomCashFlowTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-popover-foreground text-sm mb-1">{label}</p>
          {payload.map((p: any) => (
            <p key={p.dataKey} className="text-sm" style={{ color: p.stroke || p.fill }}>
              {p.name}: {formatCurrencyBRL(Math.abs(p.value))}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-popover-foreground text-sm">{data.name}</p>
          <p className="text-sm text-muted-foreground">{formatCurrencyBRL(data.value)} ({data.payload.percent}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
        <p className="text-sm text-muted-foreground">Visão geral das finanças da frota</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className={`text-lg font-bold mt-1 ${color} truncate`}>{value}</p>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cash flow + Expense breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Fluxo de Caixa (6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.cashFlow}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} className="text-xs" tick={{ fontSize: 12 }} />
                  <RechartsTooltip content={<CustomCashFlowTooltip />} />
                  <Area type="monotone" dataKey="receitas" stroke="hsl(142,71%,45%)" fill="hsl(142,71%,45%)" fillOpacity={0.15} name="Receitas" strokeWidth={2} />
                  <Area type="monotone" dataKey="despesas" stroke="hsl(0,72%,51%)" fill="hsl(0,72%,51%)" fillOpacity={0.15} name="Despesas" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Composição de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={2} label={false}>
                    {expenseData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend with percentages */}
            <div className="space-y-1.5 mt-2">
              {expenseData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground truncate">{item.name}</span>
                  </div>
                  <span className="text-foreground font-medium shrink-0 ml-2">{item.percent}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profitability analysis */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {analysisKpis.map(({ label, value, icon: Icon, color, tooltip }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-4 w-4 ${color}`} />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent><p>{tooltip}</p></TooltipContent>
                </Tooltip>
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ══════ NEW: "O que está por vir" ══════ */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          O que está por vir
        </h2>

        {/* Forecast KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total a Receber</p>
              <p className="text-xl font-bold text-green-600 mt-1">{formatCurrencyBRL(forecastData.totalReceivable)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total a Pagar</p>
              <p className="text-xl font-bold text-red-600 mt-1">{formatCurrencyBRL(forecastData.totalPayable)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Saldo Previsto</p>
              <p className={`text-xl font-bold mt-1 ${forecastData.projectedBalance >= 0 ? 'text-primary' : 'text-red-600'}`}>
                {formatCurrencyBRL(forecastData.projectedBalance)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly forecast chart */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Fluxo Semanal Previsto</CardTitle>
            <CardDescription>Entradas, saídas e saldo acumulado (próximas 4 semanas)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={forecastData.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" className="text-xs" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} className="text-xs" tick={{ fontSize: 12 }} />
                  <RechartsTooltip content={<CustomCashFlowTooltip />} />
                  <Bar dataKey="entradas" fill="hsl(142,71%,45%)" name="Entradas" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="saidas" fill="hsl(0,72%,51%)" name="Saídas" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="saldo" stroke="hsl(217,91%,60%)" strokeWidth={2} dot={{ fill: "hsl(217,91%,60%)" }} name="Saldo Acumulado" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Critical bills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="overflow-hidden flex flex-col" style={{ maxHeight: '320px' }}>
            <CardHeader className="pb-2 shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Contas a Pagar Críticas
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/financial/bills')}>
                  Ver todas <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-1.5 pr-2">
                  {forecastData.criticalPayables.map(bill => (
                    <div key={bill.id} className="flex items-center justify-between p-2.5 rounded-md bg-muted/50">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{bill.description}</p>
                        <p className="text-xs text-muted-foreground">{bill.contactName}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className={`text-xs font-medium ${bill.daysUntil < 0 ? 'text-red-600' : bill.daysUntil <= 3 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                          {bill.daysUntil < 0 ? `${Math.abs(bill.daysUntil)}d atraso` : `${bill.daysUntil}d`}
                        </span>
                        <span className="text-sm font-bold">{formatCurrencyBRL(bill.amount)}</span>
                      </div>
                    </div>
                  ))}
                  {forecastData.criticalPayables.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-6">Nenhuma conta a pagar pendente.</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="overflow-hidden flex flex-col" style={{ maxHeight: '320px' }}>
            <CardHeader className="pb-2 shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ArrowDownCircle className="h-4 w-4 text-green-500" />
                  Contas a Receber Próximas
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/financial/bills')}>
                  Ver todas <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-1.5 pr-2">
                  {forecastData.upcomingReceivables.map(bill => (
                    <div key={bill.id} className="flex items-center justify-between p-2.5 rounded-md bg-muted/50">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{bill.description}</p>
                        <p className="text-xs text-muted-foreground">{bill.contactName}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className={`text-xs font-medium ${bill.daysUntil < 0 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                          {bill.daysUntil < 0 ? `${Math.abs(bill.daysUntil)}d atraso` : `${bill.daysUntil}d`}
                        </span>
                        <span className="text-sm font-bold text-green-600">{formatCurrencyBRL(bill.amount)}</span>
                      </div>
                    </div>
                  ))}
                  {forecastData.upcomingReceivables.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-6">Nenhuma conta a receber pendente.</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Transações Recentes</CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/financial/transactions')}>
              Ver todas <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {recentTxns.map(txn => (
              <div key={txn.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${txn.type === 'RECEITA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {txn.type === 'RECEITA' ? <ArrowDownCircle className="h-4 w-4" /> : <ArrowUpCircle className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{txn.description}</p>
                    <p className="text-xs text-muted-foreground">{txn.date.toLocaleDateString('pt-BR')} • {categoryLabels[txn.category]}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold whitespace-nowrap ml-2 ${txn.type === 'RECEITA' ? 'text-green-600' : 'text-red-600'}`}>
                  {txn.type === 'RECEITA' ? '+' : '-'}{formatCurrencyBRL(txn.amount)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
