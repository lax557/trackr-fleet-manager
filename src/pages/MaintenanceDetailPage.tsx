import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { 
  getMaintenancesWithDetails,
  maintenanceStatusLabels,
  maintenanceTypeLabels,
  serviceAreaLabels
} from '@/data/mockData';
import { MaintenanceStatus, MaintenanceType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ArrowLeft, 
  Edit, 
  Copy,
  Wrench,
  Car,
  DollarSign,
  ShieldCheck,
  Calendar,
  Gauge,
  Building2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function MaintenanceStatusBadge({ status }: { status: MaintenanceStatus }) {
  const variants: Record<MaintenanceStatus, { variant: 'default' | 'secondary' | 'outline'; className: string }> = {
    OPEN: { variant: 'outline', className: 'border-amber-500 text-amber-600 dark:text-amber-400' },
    IN_PROGRESS: { variant: 'secondary', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    DONE: { variant: 'default', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  };
  const { variant, className } = variants[status];
  return <Badge variant={variant} className={className}>{maintenanceStatusLabels[status]}</Badge>;
}

function MaintenanceTypeBadge({ type }: { type: MaintenanceType }) {
  const isPreventive = type === 'PREVENTIVE';
  return (
    <Badge 
      variant="outline" 
      className={isPreventive 
        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
        : 'border-orange-500 text-orange-600 dark:text-orange-400'
      }
    >
      {maintenanceTypeLabels[type]}
    </Badge>
  );
}

export function MaintenanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const maintenance = useMemo(() => {
    return getMaintenancesWithDetails().find(m => m.id === id);
  }, [id]);

  if (!maintenance) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Manutenção não encontrada.</p>
        <Button variant="outline" onClick={() => navigate('/maintenance')}>
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/maintenance')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <Wrench className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">
                Manutenção #{maintenance.id.slice(0, 8)}
              </h1>
              <MaintenanceStatusBadge status={maintenance.status} />
            </div>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="font-mono font-medium text-foreground">
                {maintenance.vehicle.plate || maintenance.vehicleId}
              </span>
              <span>•</span>
              <MaintenanceTypeBadge type={maintenance.maintenanceType} />
              <span>•</span>
              <span>{serviceAreaLabels[maintenance.serviceArea]}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/maintenance/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Duplicar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle & Service Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                <CardTitle>Informações do Serviço</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Car className="h-3 w-3" />
                    Veículo
                  </p>
                  <p className="font-medium">
                    {maintenance.vehicle.make} {maintenance.vehicle.model}
                  </p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {maintenance.vehicle.plate || maintenance.vehicleId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Data/Hora
                  </p>
                  <p className="font-medium">
                    {format(maintenance.occurredAt, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(maintenance.occurredAt, "HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Gauge className="h-3 w-3" />
                    Odômetro
                  </p>
                  <p className="font-medium font-mono">
                    {maintenance.odometerKm 
                      ? `${maintenance.odometerKm.toLocaleString()} km` 
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Fornecedor
                  </p>
                  <p className="font-medium">
                    {maintenance.supplierName || '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <CardTitle>Itens/Peças</CardTitle>
              </div>
              <CardDescription>{maintenance.items.length} item(s) registrado(s)</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Custo Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Garantia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenance.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Nenhum item registrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    maintenance.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.itemName}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right font-mono">
                          R$ {item.unitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          R$ {item.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          {item.hasWarranty ? (
                            <div className="flex items-center gap-1">
                              <ShieldCheck className="h-4 w-4 text-green-600" />
                              <span className="text-sm">
                                {item.warrantyUntil 
                                  ? format(item.warrantyUntil, 'dd/MM/yy', { locale: ptBR })
                                  : 'Sim'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Notes */}
          {maintenance.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{maintenance.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cost Summary */}
          <Card className="border-primary/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resumo de Custos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Peças</span>
                <span className="font-mono">
                  R$ {maintenance.partsCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mão de Obra</span>
                <span className="font-mono">
                  R$ {maintenance.laborCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-lg font-mono text-primary">
                    R$ {maintenance.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warranty */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Garantia Geral</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {maintenance.hasWarranty ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="font-medium">Garantia ativa</span>
                  </div>
                  {maintenance.warrantyUntil && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Válida até</span>
                      <span className="font-medium">
                        {format(maintenance.warrantyUntil, 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  {maintenance.warrantyNotes && (
                    <p className="text-muted-foreground mt-2">{maintenance.warrantyNotes}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sem garantia geral</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate(`/vehicles/${maintenance.vehicleId}`)}
              >
                <Car className="h-4 w-4 mr-2" />
                Ver Veículo
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate(`/maintenance?vehicle=${maintenance.vehicleId}`)}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Histórico do Veículo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default MaintenanceDetailPage;
