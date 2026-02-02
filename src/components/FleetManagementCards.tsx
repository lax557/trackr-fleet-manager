import { Card, CardContent } from '@/components/ui/card';
import { 
  DollarSign, 
  Gauge, 
  Calendar, 
  TrendingUp, 
  AlertOctagon,
  Receipt
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface FleetManagementCardsProps {
  avgPrice: number;
  avgOdometer: number;
  avgYear: number;
  occupancyRate: number;
  unproductiveRate: number;
  avgTicket: number;
}

export function FleetManagementCards({
  avgPrice,
  avgOdometer,
  avgYear,
  occupancyRate,
  unproductiveRate,
  avgTicket,
}: FleetManagementCardsProps) {
  const cards = [
    {
      label: 'Preço Médio',
      value: avgPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }),
      icon: DollarSign,
      colorClass: 'text-green-600',
      tooltip: 'Valor médio de compra dos veículos',
    },
    {
      label: 'Odômetro Médio',
      value: `${avgOdometer.toLocaleString('pt-BR')} km`,
      icon: Gauge,
      colorClass: 'text-blue-600',
      tooltip: 'Quilometragem média da frota',
    },
    {
      label: 'Ano Médio',
      value: avgYear.toString(),
      icon: Calendar,
      colorClass: 'text-primary',
      tooltip: 'Ano médio dos modelos da frota operacional',
    },
    {
      label: 'Taxa de Ocupação',
      value: `${occupancyRate.toFixed(0)}%`,
      icon: TrendingUp,
      colorClass: occupancyRate >= 80 ? 'text-green-600' : occupancyRate >= 60 ? 'text-amber-600' : 'text-red-600',
      tooltip: 'Veículos alugados / frota operacional',
    },
    {
      label: 'Frota Improdutiva',
      value: `${unproductiveRate.toFixed(0)}%`,
      icon: AlertOctagon,
      colorClass: unproductiveRate <= 10 ? 'text-green-600' : unproductiveRate <= 20 ? 'text-amber-600' : 'text-red-600',
      tooltip: '(Sinistro + Manutenção) / frota operacional',
    },
    {
      label: 'Ticket Médio',
      value: avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }),
      icon: Receipt,
      colorClass: 'text-purple-600',
      tooltip: 'Faturamento mensal médio por veículo',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
      {cards.map(({ label, value, icon: Icon, colorClass, tooltip }) => (
        <Tooltip key={label}>
          <TooltipTrigger asChild>
            <Card className="cursor-help hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-4 w-4 ${colorClass}`} />
                </div>
                <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
                <p className="text-xs text-muted-foreground font-medium mt-1">{label}</p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
