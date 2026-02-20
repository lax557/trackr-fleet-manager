import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleStats } from '@/types';

interface FleetStatusChartProps {
  stats: VehicleStats;
  stretch?: boolean;
}

// Status colors matching the design system
const statusColors: Record<string, string> = {
  disponivel: 'hsl(142, 71%, 45%)',
  alugado: 'hsl(217, 91%, 60%)',
  manutencao: 'hsl(38, 92%, 50%)',
  sinistro: 'hsl(0, 72%, 51%)',
  paraVenda: 'hsl(280, 60%, 50%)',
  emLiberacao: 'hsl(260, 10%, 55%)',
};

const statusLabels: Record<string, string> = {
  disponivel: 'Disponíveis',
  alugado: 'Alugados',
  manutencao: 'Manutenção',
  sinistro: 'Sinistro',
  paraVenda: 'Para Venda',
  emLiberacao: 'Backlog',
};

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  key: string;
}

export function FleetStatusChart({ stats, stretch }: FleetStatusChartProps) {
  const chartData = useMemo<ChartDataItem[]>(() => {
    const data: ChartDataItem[] = [
      { name: statusLabels.disponivel, value: stats.disponivel, color: statusColors.disponivel, key: 'disponivel' },
      { name: statusLabels.alugado, value: stats.alugado, color: statusColors.alugado, key: 'alugado' },
      { name: statusLabels.manutencao, value: stats.manutencao, color: statusColors.manutencao, key: 'manutencao' },
      { name: statusLabels.sinistro, value: stats.sinistro, color: statusColors.sinistro, key: 'sinistro' },
      { name: statusLabels.paraVenda, value: stats.paraVenda, color: statusColors.paraVenda, key: 'paraVenda' },
      { name: statusLabels.emLiberacao, value: stats.emLiberacao, color: statusColors.emLiberacao, key: 'emLiberacao' },
    ];
    return data.filter(item => item.value > 0);
  }, [stats]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: ChartDataItem }[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / stats.total) * 100).toFixed(1);
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-popover-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} veículo{data.value !== 1 ? 's' : ''} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy }: { cx: number; cy: number }) => {
    return (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="fill-foreground">
        <tspan x={cx} dy="-0.5em" className="text-2xl font-bold">{stats.total}</tspan>
        <tspan x={cx} dy="1.5em" className="text-xs fill-muted-foreground">Total</tspan>
      </text>
    );
  };

  return (
    <Card className={stretch ? 'h-full flex flex-col' : ''}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Distribuição da Frota</CardTitle>
      </CardHeader>
      <CardContent className={stretch ? 'flex-1 min-h-0' : ''}>
        <div className={stretch ? 'h-full min-h-[280px]' : 'h-[280px]'}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
