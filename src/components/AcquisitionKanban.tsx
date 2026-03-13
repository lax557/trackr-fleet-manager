import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StageBadge } from '@/components/StatusBadge';
import { AcquisitionStage, VehicleWithDetails } from '@/types';
import { stageLabels } from '@/data/mockData';
import { ArrowRight } from 'lucide-react';

interface AcquisitionKanbanProps {
  vehicles: (VehicleWithDetails & { acquisitionStage?: AcquisitionStage | null })[];
  onMoveStage: (vehicleId: string) => void;
  onViewDetails: (vehicleId: string) => void;
}

const stages: AcquisitionStage[] = [
  'EM_LIBERACAO',
  'APROVADO',
  'FATURADO',
  'RECEBIDO',
  'INSTALACAO_EQUIPAMENTOS',
  'PRONTO_PARA_ALUGAR',
];

export function AcquisitionKanban({ vehicles, onMoveStage, onViewDetails }: AcquisitionKanbanProps) {
  const groupedByStage = useMemo(() => {
    const groups: Record<AcquisitionStage, typeof vehicles> = {
      EM_LIBERACAO: [],
      APROVADO: [],
      FATURADO: [],
      RECEBIDO: [],
      INSTALACAO_EQUIPAMENTOS: [],
      PRONTO_PARA_ALUGAR: [],
    };

    vehicles.forEach(vehicle => {
      const stage = (vehicle as any).acquisitionStage || vehicle.acquisition?.stage || 'EM_LIBERACAO';
      if (groups[stage as AcquisitionStage]) {
        groups[stage as AcquisitionStage].push(vehicle);
      } else {
        groups['EM_LIBERACAO'].push(vehicle);
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
                        <span className="font-bold text-primary text-sm">
                          {(vehicle as any).vehicleCode || vehicle.id.slice(0, 8)}
                        </span>
                        <StageBadge stage={stage} />
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {vehicle.make} {vehicle.model}
                      </div>

                      {vehicle.plate && (
                        <div className="text-xs text-muted-foreground">
                          Placa: {vehicle.plate}
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
