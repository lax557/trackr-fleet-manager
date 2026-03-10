import { VehicleStats } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Car, 
  CheckCircle2, 
  UserCheck, 
  Wrench, 
  AlertTriangle, 
  Tag, 
  Clock 
} from 'lucide-react';

interface VehicleStatsCardsProps {
  stats: VehicleStats;
  onFilterClick?: (status: string | null) => void;
  activeFilter?: string | null;
}

const statCards = [
  { key: 'total', label: 'Total', icon: Car, colorClass: 'text-primary' },
  { key: 'alugado', label: 'Alugados', icon: UserCheck, colorClass: 'text-blue-600' },
  { key: 'disponivel', label: 'Disponíveis', icon: CheckCircle2, colorClass: 'text-green-600' },
  { key: 'manutencao', label: 'Manutenção', icon: Wrench, colorClass: 'text-amber-600' },
  { key: 'sinistro', label: 'Sinistro', icon: AlertTriangle, colorClass: 'text-red-600' },
  { key: 'paraVenda', label: 'Para Venda', icon: Tag, colorClass: 'text-purple-600' },
  { key: 'emLiberacao', label: 'Backlog', icon: Clock, colorClass: 'text-muted-foreground' },
];

export function VehicleStatsCards({ stats, onFilterClick, activeFilter }: VehicleStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {statCards.map(({ key, label, icon: Icon, colorClass }) => {
        const value = stats[key as keyof VehicleStats];
        const filterValue = key === 'total' ? null : key.toUpperCase().replace('PARA_VENDA', 'PARA_VENDA').replace('EM_LIBERACAO', 'EM_LIBERACAO');
        const statusMap: Record<string, string> = {
          disponivel: 'DISPONIVEL',
          alugado: 'ALUGADO',
          manutencao: 'MANUTENCAO',
          sinistro: 'SINISTRO',
          paraVenda: 'PARA_VENDA',
          emLiberacao: 'EM_LIBERACAO',
        };
        const mappedFilter = key === 'total' ? null : statusMap[key];
        const isActive = activeFilter === mappedFilter;

        return (
          <Card 
            key={key}
            onClick={() => onFilterClick?.(mappedFilter)}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 ${
              isActive ? 'border-primary shadow-md ring-1 ring-primary/20' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Icon className={`h-5 w-5 ${colorClass}`} />
                <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground font-medium">{label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
