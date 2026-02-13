import { Card, CardContent } from '@/components/ui/card';
import { 
  DollarSign, 
  Gauge, 
  TrendingUp, 
  AlertOctagon,
  Receipt,
  HelpCircle
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCurrencyBRL } from '@/lib/utils';

interface FleetManagementCardsProps {
  avgPrice: number;
  avgOdometer: number;
  occupancyRate: number;
  unproductiveRate: number;
  avgTicket: number;
}

export function FleetManagementCards({
  avgPrice,
  avgOdometer,
  occupancyRate,
  unproductiveRate,
  avgTicket,
}: FleetManagementCardsProps) {
  const cards = [
    {
      label: 'Preço Médio',
      value: formatCurrencyBRL(avgPrice),
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
      value: formatCurrencyBRL(avgTicket),
      icon: Receipt,
      colorClass: 'text-purple-600',
      tooltip: 'Faturamento mensal médio por veículo',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {cards.map(({ label, value, icon: Icon, colorClass, tooltip }) => (
        <Card key={label} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Icon className={`h-4 w-4 ${colorClass}`} />
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
            <p className="text-xs text-muted-foreground font-medium mt-1">{label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
