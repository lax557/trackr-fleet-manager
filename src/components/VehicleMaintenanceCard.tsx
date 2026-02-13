import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMaintenancesForVehicle, maintenanceTypeLabels } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, Plus, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyBRL } from '@/lib/utils';

interface VehicleMaintenanceCardProps {
  vehicleId: string;
}

export function VehicleMaintenanceCard({ vehicleId }: VehicleMaintenanceCardProps) {
  const navigate = useNavigate();

  const maintenances = useMemo(() => getMaintenancesForVehicle(vehicleId).slice(0, 3), [vehicleId]);
  const totalSpent = useMemo(() => getMaintenancesForVehicle(vehicleId).reduce((sum, m) => sum + m.totalCost, 0), [vehicleId]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Manutenções</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/maintenance/new?vehicleId=${vehicleId}`)}>
            <Plus className="h-4 w-4 mr-1" />
            Nova
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {maintenances.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma manutenção registrada</p>
        ) : (
          <>
            <div className="flex justify-between text-sm pb-2 border-b">
              <span className="text-muted-foreground">Total gasto</span>
              <span className="font-mono font-medium">{formatCurrencyBRL(totalSpent)}</span>
            </div>
            <div className="space-y-2">
              {maintenances.map((m) => (
                <div 
                  key={m.id} 
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer"
                  onClick={() => navigate(`/maintenance/${m.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-muted-foreground">{format(m.occurredAt, 'dd/MM/yy', { locale: ptBR })}</div>
                    <Badge variant="outline" className={m.maintenanceType === 'PREVENTIVE' ? 'border-blue-500 text-blue-600 text-xs' : 'border-orange-500 text-orange-600 text-xs'}>
                      {maintenanceTypeLabels[m.maintenanceType]}
                    </Badge>
                  </div>
                  <span className="font-mono text-sm font-medium">{formatCurrencyBRL(m.totalCost)}</span>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-2" onClick={() => navigate(`/maintenance?vehicle=${vehicleId}`)}>
              Ver todas
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
