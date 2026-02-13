import { useMemo } from 'react';
import { getVehicleStats, getVehiclesWithDetails, mockDrivers, mockRentals, getFleetManagementStats } from '@/data/mockData';
import { VehicleStatsCards } from '@/components/VehicleStatsCards';
import { FleetManagementCards } from '@/components/FleetManagementCards';
import { FleetStatusChart } from '@/components/FleetStatusChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, StageBadge } from '@/components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function DashboardPage() {
  const navigate = useNavigate();
  const stats = useMemo(() => getVehicleStats(), []);
  const vehicles = useMemo(() => getVehiclesWithDetails(), []);
  const fleetStats = useMemo(() => getFleetManagementStats(), []);
  
  const vehiclesInMaintenance = vehicles.filter(v => v.currentStatus === 'MANUTENCAO');
  const backlogVehicles = vehicles.filter(v => v.currentStatus === 'EM_LIBERACAO');
  const availableVehicles = vehicles.filter(v => v.currentStatus === 'DISPONIVEL');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Visão geral da sua frota
        </p>
      </div>

      {/* Stats Cards - First Row */}
      <VehicleStatsCards 
        stats={stats} 
        onFilterClick={() => navigate('/vehicles')}
      />

      {/* Fleet Management Stats - Second Row (removed avgYear) */}
      <FleetManagementCards
        avgPrice={fleetStats.avgPrice}
        avgOdometer={fleetStats.avgOdometer}
        occupancyRate={fleetStats.occupancyRate}
        unproductiveRate={fleetStats.unproductiveRate}
        avgTicket={fleetStats.avgTicket}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Status Chart */}
        <FleetStatusChart stats={stats} />

        {/* Vehicles requiring attention */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <CardTitle>Requer Atenção</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/vehicles')}>
                Ver todos
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <CardDescription>Veículos em manutenção ou disponíveis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vehiclesInMaintenance.slice(0, 3).map(vehicle => (
                <div 
                  key={vehicle.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="font-medium text-primary">{vehicle.id}</div>
                    <div className="text-sm text-muted-foreground">
                      {vehicle.make} {vehicle.model}
                    </div>
                  </div>
                  <StatusBadge status={vehicle.currentStatus} size="sm" />
                </div>
              ))}
              {availableVehicles.slice(0, 2).map(vehicle => (
                <div 
                  key={vehicle.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="font-medium text-primary">{vehicle.id}</div>
                    <div className="text-sm text-muted-foreground">
                      {vehicle.make} {vehicle.model}
                    </div>
                  </div>
                  <StatusBadge status={vehicle.currentStatus} size="sm" />
                </div>
              ))}
              {vehiclesInMaintenance.length === 0 && availableVehicles.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum veículo requer atenção no momento.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Backlog / Acquisition pipeline */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle>Backlog de Aquisição</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/vehicles')}>
                Ver todos
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <CardDescription>Veículos em processo de aquisição</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {backlogVehicles.map(vehicle => (
                <div 
                  key={vehicle.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-primary">{vehicle.id}</span>
                      <span className="text-sm text-muted-foreground">
                        {vehicle.make} {vehicle.model}
                      </span>
                    </div>
                    {vehicle.acquisition?.expectedDate && (
                      <span className="text-xs text-muted-foreground">
                        Prev: {format(vehicle.acquisition.expectedDate, 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    )}
                  </div>
                  {vehicle.acquisition && (
                    <StageBadge stage={vehicle.acquisition.stage} />
                  )}
                </div>
              ))}
              {backlogVehicles.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum veículo em aquisição.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick instructions */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">💡 Dicas para Configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium">Adicionar novos status</p>
              <p className="text-muted-foreground">
                Edite o tipo <code className="bg-muted px-1 rounded">VehicleStatus</code> em <code className="bg-muted px-1 rounded">src/types/index.ts</code>
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Adicionar categorias</p>
              <p className="text-muted-foreground">
                Edite o tipo <code className="bg-muted px-1 rounded">VehicleCategory</code> e <code className="bg-muted px-1 rounded">categoryLabels</code>
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Adicionar etapas de aquisição</p>
              <p className="text-muted-foreground">
                Edite o tipo <code className="bg-muted px-1 rounded">AcquisitionStage</code> e <code className="bg-muted px-1 rounded">stageLabels</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardPage;
