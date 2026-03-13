import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrderById, setOrderStatus, deleteOrder, statusLabels, typeLabels, areaLabels, MaintenanceOrderStatus, MaintenanceTypeDB } from '@/services/maintenance.service';
import { fetchExecutedItems } from '@/services/maintenanceCatalog.service';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Edit, Wrench, Car, DollarSign, Calendar, Gauge, Building2, Package, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyBRL } from '@/lib/utils';
import { toast } from 'sonner';

function StatusBadge({ status }: { status: MaintenanceOrderStatus }) {
  const map: Record<string, { variant: 'default' | 'secondary' | 'outline'; className: string }> = {
    open: { variant: 'outline', className: 'border-amber-500 text-amber-600 dark:text-amber-400' },
    in_progress: { variant: 'secondary', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    done: { variant: 'default', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    cancelled: { variant: 'outline', className: 'border-muted-foreground text-muted-foreground' },
  };
  const { variant, className } = map[status] || map.open;
  return <Badge variant={variant} className={className}>{statusLabels[status]}</Badge>;
}

function TypeBadge({ type }: { type: MaintenanceTypeDB }) {
  const isPrev = type === 'preventive';
  return <Badge variant="outline" className={isPrev ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-orange-500 text-orange-600 dark:text-orange-400'}>{typeLabels[type]}</Badge>;
}

export function MaintenanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['maintenance-order', id],
    queryFn: () => getOrderById(id!),
    enabled: !!id,
  });

  const { data: executedItems = [] } = useQuery({
    queryKey: ['executed-items', id],
    queryFn: () => fetchExecutedItems(id!),
    enabled: !!id,
  });

  const statusMut = useMutation({
    mutationFn: ({ status }: { status: MaintenanceOrderStatus }) => setOrderStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-order', id] });
      toast.success('Status atualizado!');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteOrder(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-orders'] });
      queryClient.invalidateQueries({ queryKey: ['preventive-alerts'] });
      toast.success('Manutenção excluída');
      navigate('/maintenance');
    },
    onError: (e: any) => toast.error(`Erro: ${e.message}`),
  });

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">Carregando...</div>;
  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Manutenção não encontrada.</p>
        <Button variant="outline" onClick={() => navigate('/maintenance')}><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
      </div>
    );
  }

  const items = order.maintenance_items || [];
  const nextStatus: Record<string, MaintenanceOrderStatus | null> = {
    open: 'in_progress',
    in_progress: 'done',
    done: null,
    cancelled: null,
  };
  const nextStatusLabel: Record<string, string> = {
    open: 'Iniciar Execução',
    in_progress: 'Finalizar',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/maintenance')}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <div className="flex items-center gap-3">
              <Wrench className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Manutenção #{order.id.slice(0, 8)}</h1>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{order.vehicles?.plate || order.vehicles?.vehicle_code || '—'}</span>
              <span>•</span>
              <TypeBadge type={order.type} />
              <span>•</span>
              <span>{areaLabels[order.service_area]}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {can('maintenance:create') && nextStatus[order.status] && (
            <Button onClick={() => statusMut.mutate({ status: nextStatus[order.status]! })} disabled={statusMut.isPending}>
              {nextStatusLabel[order.status]}
            </Button>
          )}
          {can('maintenance:create') && (
            <Button variant="outline" onClick={() => navigate(`/maintenance/${id}/edit`)}><Edit className="h-4 w-4 mr-2" />Editar</Button>
          )}
          {can('maintenance:delete') && (
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}><Trash2 className="h-4 w-4 mr-2" />Excluir</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3"><div className="flex items-center gap-2"><Car className="h-5 w-5 text-primary" /><CardTitle>Informações do Serviço</CardTitle></div></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><Car className="h-3 w-3" />Veículo</p>
                  <p className="font-medium">{order.vehicles?.brand} {order.vehicles?.model}</p>
                  <p className="text-sm text-muted-foreground">{order.vehicles?.plate || order.vehicles?.vehicle_code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />Data/Hora</p>
                  <p className="font-medium">{format(new Date(order.opened_at), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(order.opened_at), 'HH:mm', { locale: ptBR })}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><Gauge className="h-3 w-3" />Odômetro</p>
                  <p className="font-medium">{order.odometer_at_open ? `${order.odometer_at_open.toLocaleString()} km` : '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" />Fornecedor</p>
                  <p className="font-medium">{order.supplier_name || '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary" /><CardTitle>Itens/Peças</CardTitle></div>
              <CardDescription>{items.length} item(s) registrado(s)</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Custo Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhum item registrado</TableCell></TableRow>
                  ) : items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right">{item.qty}</TableCell>
                      <TableCell className="text-right">{formatCurrencyBRL(item.unit_cost)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrencyBRL(item.total_cost)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Executed Catalog Items */}
          {executedItems.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2"><Package className="h-5 w-5 text-primary" /><CardTitle>Itens Trocados</CardTitle></div>
                <CardDescription>{executedItems.length} item(s) do catálogo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {executedItems.map(ei => (
                    <Badge key={ei.id} variant="secondary">
                      {ei.maintenance_catalog_items?.name || '—'}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {order.notes && (
            <Card>
              <CardHeader className="pb-3"><CardTitle>Observações</CardTitle></CardHeader>
              <CardContent><p className="text-sm whitespace-pre-wrap">{order.notes}</p></CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-primary/50">
            <CardHeader className="pb-3"><CardTitle className="text-base">Resumo de Custos</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Peças</span><span>{formatCurrencyBRL(order.parts_cost || 0)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Mão de Obra</span><span>{formatCurrencyBRL(order.labor_cost || 0)}</span></div>
              <div className="border-t pt-3"><div className="flex justify-between font-medium"><span>Total</span><span className="text-lg text-primary">{formatCurrencyBRL(order.total_cost || 0)}</span></div></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Ações Rápidas</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/vehicles/${order.vehicle_id}`)}><Car className="h-4 w-4 mr-2" />Ver Veículo</Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/maintenance?vehicle=${order.vehicle_id}`)}><Wrench className="h-4 w-4 mr-2" />Histórico do Veículo</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default MaintenanceDetailPage;
