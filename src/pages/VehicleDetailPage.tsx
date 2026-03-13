import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchVehicleById, markVehicleDelivered } from '@/services/vehicles.service';
import { StatusBadge, StageBadge } from '@/components/StatusBadge';
import { VehicleMaintenanceCard } from '@/components/VehicleMaintenanceCard';
import { VehicleFinesCard } from '@/components/VehicleFinesCard';
import { EditVehicleModal } from '@/components/EditVehicleModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  ArrowLeft, 
  RefreshCcw, 
  UserPlus, 
  Car, 
  Gauge,
  Clock,
  CheckCircle,
  Pencil,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const ownerTypeLabels: Record<string, string> = {
  TARGA: 'Targa (Próprio)',
  PF: 'Pessoa Física',
  PJ: 'Pessoa Jurídica',
};

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const [editOpen, setEditOpen] = useState(false);

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => fetchVehicleById(id!),
    enabled: !!id,
  });

  const deliverMutation = useMutation({
    mutationFn: () => markVehicleDelivered(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Veículo marcado como entregue!');
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Carregando veículo...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Veículo não encontrado.</p>
        <Button variant="outline" onClick={() => navigate('/vehicles')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/vehicles')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-primary">
                {vehicle.vehicleCode || vehicle.id.slice(0, 8)}
              </h1>
              {vehicle.plate && (
                <Badge variant="outline" className="text-base px-3 py-1">
                  {vehicle.plate}
                </Badge>
              )}
              <StatusBadge status={vehicle.currentStatus} />
              {vehicle.acquisitionStage && vehicle.currentStatus === 'EM_LIBERACAO' && (
                <StageBadge stage={vehicle.acquisitionStage} />
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {vehicle.make} {vehicle.model} {vehicle.version} • {
                vehicle.yearMfg && vehicle.yearModel 
                  ? `${vehicle.yearMfg}/${vehicle.yearModel}` 
                  : 'Ano não informado'
              }
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {can('vehicle:edit') && (
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
          <Button variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Alterar status
          </Button>
          {vehicle.currentStatus === 'DISPONIVEL' && (
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Nova locação
            </Button>
          )}
          {vehicle.currentStatus === 'EM_LIBERACAO' && !vehicle.deliveredAt && (
            <Button onClick={() => deliverMutation.mutate()} disabled={deliverMutation.isPending}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar como Entregue
            </Button>
          )}
          {vehicle.currentStatus === 'ALUGADO' && (
            <Button variant="destructive">
              Encerrar locação
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                <CardTitle>Cadastro do Veículo</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-medium">{vehicle.vehicleCode || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Marca</p>
                  <p className="font-medium">{vehicle.make}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Modelo</p>
                  <p className="font-medium">{vehicle.model}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Versão</p>
                  <p className="font-medium">{vehicle.version || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ano (Fab/Mod)</p>
                  <p className="font-medium">
                    {vehicle.yearMfg && vehicle.yearModel 
                      ? `${vehicle.yearMfg} / ${vehicle.yearModel}` 
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Categoria</p>
                  <span className="inline-flex items-center justify-center h-6 px-2 rounded-full bg-primary/10 text-primary text-sm font-bold">
                    {vehicle.category}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cor</p>
                  <p className="text-sm">{vehicle.color || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">RENAVAM</p>
                  <p className="text-sm">{vehicle.renavam || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Chassi (VIN)</p>
                  <p className="text-sm">{vehicle.vin || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cadastrado em</p>
                  <p className="font-medium">
                    {format(vehicle.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entregue em</p>
                  <p className="font-medium">
                    {vehicle.deliveredAt
                      ? format(vehicle.deliveredAt, "dd/MM/yyyy", { locale: ptBR })
                      : 'Pendente'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner Card */}
          {(vehicle.ownerType || vehicle.ownerName) && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Proprietário do Veículo</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium">{vehicle.ownerType ? ownerTypeLabels[vehicle.ownerType] || vehicle.ownerType : '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{vehicle.ownerName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Documento</p>
                    <p className="font-medium">{vehicle.ownerDocument || '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status timeline */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle>Histórico de Status</CardTitle>
              </div>
              <CardDescription>Timeline de alterações de status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={vehicle.currentStatus} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      desde {format(vehicle.statusSince, "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {vehicle.currentDriver && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Locatário Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {vehicle.currentDriver.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{vehicle.currentDriver.fullName}</p>
                    <p className="text-sm text-muted-foreground">{vehicle.currentDriver.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <VehicleMaintenanceCard vehicleId={vehicle.id} />
          <VehicleFinesCard vehicleId={vehicle.id} />

          <Card className="opacity-60">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base text-muted-foreground">Odômetro</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Em breve: histórico de KM via API...</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditVehicleModal vehicle={vehicle} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}

export default VehicleDetailPage;
