import { useQuery } from '@tanstack/react-query';
import { fetchPreventiveAlerts, AlertStatus } from '@/services/preventiveAlerts.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
  vehicleId: string;
}

const cfg: Record<AlertStatus, { label: string; icon: any; className: string }> = {
  overdue: { label: 'Vencido', icon: AlertCircle, className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300' },
  near: { label: 'Próximo', icon: AlertTriangle, className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300' },
  ok: { label: 'OK', icon: CheckCircle, className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300' },
};

export function VehiclePreventiveCard({ vehicleId }: Props) {
  const { data: allAlerts = [] } = useQuery({
    queryKey: ['preventive-alerts'],
    queryFn: fetchPreventiveAlerts,
    staleTime: 60_000,
  });

  const alerts = allAlerts.filter(a => a.vehicleId === vehicleId && a.status !== 'ok');

  if (alerts.length === 0) return null;

  return (
    <Card className="border-amber-200 dark:border-amber-800">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-base">Próximas Manutenções</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.map((a, i) => {
          const c = cfg[a.status];
          const Icon = c.icon;
          return (
            <div key={`${a.catalogItemId}-${i}`} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`${c.className} text-xs`}>
                  <Icon className="h-3 w-3 mr-1" />{c.label}
                </Badge>
                <span className="text-sm font-medium">{a.catalogItemName}</span>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                {a.kmRemaining != null && (
                  <span className={a.kmRemaining <= 0 ? 'text-red-600 font-medium' : 'text-amber-600'}>
                    {a.kmRemaining.toLocaleString()} km
                  </span>
                )}
                {a.kmRemaining != null && a.daysRemaining != null && ' · '}
                {a.daysRemaining != null && (
                  <span className={a.daysRemaining <= 0 ? 'text-red-600 font-medium' : 'text-amber-600'}>
                    {a.daysRemaining} dias
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
