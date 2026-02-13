import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StageBadge } from '@/components/StatusBadge';
import { AcquisitionStage, VehicleWithDetails } from '@/types';
import { stageLabels, purchaseModeLabels } from '@/data/mockData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight, Calendar, CreditCard } from 'lucide-react';

interface AcquisitionKanbanProps {
  vehicles: VehicleWithDetails[];
  onMoveStage: (vehicleId: string) => void;
  onViewDetails: (vehicleId: string) => void;
}

const stages: AcquisitionStage[] = [
  'EM_LIBERACAO',
  'APROVADO',
  'FATURADO',
  'LIBERADO_LOJA',
  'INSTALACAO_EQUIPAMENTOS',
  'EMPLACADO',
  'RECEBIDO',
  'PRONTO_PARA_ALUGAR',
];

export function AcquisitionKanban({ vehicles, onMoveStage, onViewDetails }: AcquisitionKanbanProps) {
  const groupedByStage = useMemo(() => {
    const groups: Record<AcquisitionStage, VehicleWithDetails[]> = {
      EM_LIBERACAO: [],
      APROVADO: [],
      FATURADO: [],
      LIBERADO_LOJA: [],
      INSTALACAO_EQUIPAMENTOS: [],
      EMPLACADO: [],
      RECEBIDO: [],
      PRONTO_PARA_ALUGAR: [],
    };

    vehicles.forEach(vehicle => {
      if (vehicle.acquisition) {
        groups[vehicle.acquisition.stage].push(vehicle);
      }
    });

    return groups;
  }, [vehicles]);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {stages.map(stage => (
          <div key={stage} className="w-64 flex-shrink-0">
            <Card className="h-full">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {stageLabels[stage]}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {groupedByStage[stage].length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-2 pb-2 space-y-2 min-h-[200px]">
                {groupedByStage[stage].map(vehicle => (
                  <Card 
                    key={vehicle.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary"
                    onClick={() => onViewDetails(vehicle.id)}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-primary text-sm">
                          {vehicle.id}
                        </span>
                        <StageBadge stage={stage} />
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {vehicle.make} {vehicle.model}
                      </div>

                      {vehicle.acquisition && (
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CreditCard className="h-3 w-3" />
                            <span>{purchaseModeLabels[vehicle.acquisition.purchaseMode]}</span>
                          </div>
                          
                          {vehicle.acquisition.group && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <span>Grupo: {vehicle.acquisition.group}</span>
                              {vehicle.acquisition.quota && <span>• {vehicle.acquisition.quota}</span>}
                            </div>
                          )}
                          
                          {vehicle.acquisition.expectedDate && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {format(vehicle.acquisition.expectedDate, 'dd/MM/yyyy', { locale: ptBR })}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveStage(vehicle.id);
                        }}
                      >
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Mover Etapa
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                {groupedByStage[stage].length === 0 && (
                  <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
                    Nenhum veículo
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
