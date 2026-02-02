import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { getVehiclesWithDetails, mockStatusHistory, mockDrivers, purchaseModeLabels, stageLabels, paymentStatusLabels } from '@/data/mockData';
import { StatusBadge, StageBadge, PaymentBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  RefreshCcw, 
  UserPlus, 
  ArrowRight, 
  Calendar, 
  Car, 
  FileText, 
  Wrench, 
  AlertTriangle, 
  Gauge,
  DollarSign,
  Package,
  Clock,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const vehicle = useMemo(() => {
    return getVehiclesWithDetails().find(v => v.id === id);
  }, [id]);

  const statusHistory = useMemo(() => {
    return mockStatusHistory
      .filter(sh => sh.vehicleId === id)
      .sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime());
  }, [id]);

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
              <h1 className="text-2xl font-bold font-mono text-primary">{vehicle.id}</h1>
              {vehicle.plate && (
                <Badge variant="outline" className="font-mono text-base px-3 py-1">
                  {vehicle.plate}
                </Badge>
              )}
              <StatusBadge status={vehicle.currentStatus} />
            </div>
            <p className="text-muted-foreground mt-1">
              {vehicle.make} {vehicle.model} {vehicle.version} • {vehicle.year || 'Ano não informado'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
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
          {vehicle.currentStatus === 'ALUGADO' && (
            <Button variant="destructive">
              Encerrar locação
            </Button>
          )}
          {vehicle.currentStatus === 'EM_LIBERACAO' && (
            <Button>
              <ArrowRight className="h-4 w-4 mr-2" />
              Mover etapa
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - left 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                <CardTitle>Cadastro do Veículo</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                  <p className="font-medium">{vehicle.version}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ano</p>
                  <p className="font-medium">{vehicle.year || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Categoria</p>
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-bold">
                    {vehicle.category}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Chassi (VIN)</p>
                  <p className="font-mono text-sm">{vehicle.vin || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cadastrado em</p>
                  <p className="font-medium">
                    {format(vehicle.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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
              <div className="space-y-4">
                {statusHistory.map((entry, index) => (
                  <div key={entry.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`h-3 w-3 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                      {index < statusHistory.length - 1 && (
                        <div className="w-px h-full bg-border" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={entry.status} size="sm" />
                        <span className="text-xs text-muted-foreground">
                          {format(entry.changedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      {entry.note && (
                        <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        por {entry.changedBy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Finance info (MVP) */}
          {vehicle.finance && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <CardTitle>Financeiro</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor de Compra</p>
                    <p className="font-medium">
                      {vehicle.finance.purchasePrice?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor FIPE</p>
                    <p className="font-medium">
                      {vehicle.finance.fipeValue?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Entrada</p>
                    <p className="font-medium">
                      {vehicle.finance.downPayment?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <PaymentBadge status={vehicle.finance.paymentStatus} />
                  </div>
                  {vehicle.finance.installmentValue && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Parcela</p>
                        <p className="font-medium">
                          {vehicle.finance.installmentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total de Parcelas</p>
                        <p className="font-medium">{vehicle.finance.installmentsTotal}x</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Acquisition info (if backlog) */}
          {vehicle.acquisition && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <CardTitle>Pipeline de Aquisição</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Etapa</p>
                    <StageBadge stage={vehicle.acquisition.stage} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Modo de Compra</p>
                    <p className="font-medium">{purchaseModeLabels[vehicle.acquisition.purchaseMode]}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fornecedor/Grupo</p>
                    <p className="font-medium">{vehicle.acquisition.supplierOrGroup || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Previsão de Entrega</p>
                    <p className="font-medium">
                      {vehicle.acquisition.expectedDate 
                        ? format(vehicle.acquisition.expectedDate, 'dd/MM/yyyy', { locale: ptBR })
                        : '—'}
                    </p>
                  </div>
                </div>
                {vehicle.acquisition.notes && (
                  <div className="mt-4 p-3 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Notas</p>
                    <p className="text-sm mt-1">{vehicle.acquisition.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - right column */}
        <div className="space-y-6">
          {/* Current driver */}
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

          {/* Future modules placeholders */}
          <Card className="opacity-60">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base text-muted-foreground">Documentação</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Em breve: CRLV, IPVA, licenciamento...</p>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base text-muted-foreground">Manutenções</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Em breve: histórico de serviços...</p>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base text-muted-foreground">Multas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Em breve: integração com infrações...</p>
            </CardContent>
          </Card>

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
    </div>
  );
}

export default VehicleDetailPage;
