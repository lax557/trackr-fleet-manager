import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRentals, changeRentalStatus, RentalWithDetails } from '@/services/rentals.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Eye, Play, StopCircle, XCircle, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { formatCurrencyBRL } from '@/lib/utils';

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  awaiting_signature: 'Aguardando Assinatura',
  active: 'Ativa',
  ended: 'Encerrada',
  cancelled: 'Cancelada',
};

const statusStyles: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  awaiting_signature: 'bg-amber-100 text-amber-700 border-amber-200',
  active: 'bg-green-100 text-green-700 border-green-200',
  ended: 'bg-blue-100 text-blue-700 border-blue-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export function RentalsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: rentals = [], isLoading } = useQuery({
    queryKey: ['rentals'],
    queryFn: fetchRentals,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'awaiting_signature' | 'active' | 'ended' | 'cancelled' }) =>
      changeRentalStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Status atualizado com sucesso!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const stats = useMemo(() => ({
    total: rentals.length,
    active: rentals.filter(r => r.status === 'active').length,
    draft: rentals.filter(r => r.status === 'draft' || r.status === 'awaiting_signature').length,
    ended: rentals.filter(r => r.status === 'ended').length,
  }), [rentals]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Locações</h1>
          <p className="text-muted-foreground text-sm">Gerencie locações e contratos de motoristas</p>
        </div>
        <Button onClick={() => navigate('/rentals/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Locação
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: 'Total', value: stats.total, color: '' },
          { label: 'Ativas', value: stats.active, color: 'text-green-600' },
          { label: 'Pendentes', value: stats.draft, color: 'text-amber-600' },
          { label: 'Encerradas', value: stats.ended, color: 'text-blue-600' },
        ].map(s => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Motorista</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Término</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma locação encontrada
                  </TableCell>
                </TableRow>
              ) : rentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell className="font-medium">{rental.driver_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{rental.vehicle_plate || '—'}</span>
                      <span className="text-xs text-muted-foreground">{rental.vehicle_code || ''}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[rental.status]}>
                      {statusLabels[rental.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(rental.start_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {rental.end_date ? format(new Date(rental.end_date), 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                  </TableCell>
                  <TableCell>
                    {rental.weekly_rate ? (
                      <div className="flex flex-col">
                        <span className="font-medium">{formatCurrencyBRL(rental.weekly_rate)}</span>
                        <span className="text-xs text-muted-foreground">/semana</span>
                      </div>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/rentals/${rental.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        {rental.status === 'draft' && (
                          <DropdownMenuItem onClick={() => navigate(`/rentals/${rental.id}`)}>
                            <Send className="h-4 w-4 mr-2" />
                            Enviar para Assinatura
                          </DropdownMenuItem>
                        )}
                        {(rental.status === 'draft' || rental.status === 'awaiting_signature') && (
                          <DropdownMenuItem onClick={() => statusMutation.mutate({ id: rental.id, status: 'active' })}>
                            <Play className="h-4 w-4 mr-2" />
                            Ativar
                          </DropdownMenuItem>
                        )}
                        {rental.status === 'active' && (
                          <DropdownMenuItem onClick={() => statusMutation.mutate({ id: rental.id, status: 'ended' })}>
                            <StopCircle className="h-4 w-4 mr-2" />
                            Encerrar
                          </DropdownMenuItem>
                        )}
                        {rental.status !== 'active' && rental.status !== 'ended' && rental.status !== 'cancelled' && (
                          <DropdownMenuItem
                            onClick={() => statusMutation.mutate({ id: rental.id, status: 'cancelled' })}
                            className="text-destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancelar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default RentalsPage;
