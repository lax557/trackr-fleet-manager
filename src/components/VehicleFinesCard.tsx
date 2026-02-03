import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFinesForVehicle } from '@/data/finesData';
import { fineStatusLabels, fineStatusColors } from '@/types/fines';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowRight, Plus, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VehicleFinesCardProps {
  vehicleId: string;
}

export function VehicleFinesCard({ vehicleId }: VehicleFinesCardProps) {
  const navigate = useNavigate();
  
  const fines = useMemo(() => {
    return getFinesForVehicle(vehicleId);
  }, [vehicleId]);

  const openFines = fines.filter(f => ['OPEN', 'DUE_SOON', 'OVERDUE'].includes(f.status));
  const urgentFines = openFines.slice(0, 3);
  const totalOpenAmount = openFines.reduce((sum, f) => sum + f.originalAmount, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Multas</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(`/fines?vehicleId=${vehicleId}`)}
          >
            Ver todas
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <CardDescription>Infrações vinculadas a este veículo</CardDescription>
      </CardHeader>
      <CardContent>
        {openFines.length > 0 ? (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">
                    {openFines.length} multa(s) em aberto
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Total: R$ {totalOpenAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Urgent fines list */}
            <div className="space-y-2">
              {urgentFines.map(fine => (
                <div 
                  key={fine.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => navigate(`/fines/${fine.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {fine.infractionDescription}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Vence: {format(fine.dueDate, 'dd/MM', { locale: ptBR })}</span>
                      <span>•</span>
                      <span className="font-medium">
                        R$ {fine.originalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Badge className={fineStatusColors[fine.status]} variant="secondary">
                    {fineStatusLabels[fine.status]}
                  </Badge>
                </div>
              ))}
            </div>

            {openFines.length > 3 && (
              <p className="text-xs text-center text-muted-foreground">
                + {openFines.length - 3} multa(s) adicionais
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhuma multa em aberto</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/fines/new?vehicleId=${vehicleId}`)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova Multa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
