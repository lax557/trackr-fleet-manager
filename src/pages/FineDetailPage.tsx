import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFineById,
  markFineAsPaid,
  markFineAsDisputed,
  cancelFine,
  deriveFineStatus,
  fineStatusLabels,
  fineStatusColors,
  severityLabels,
  severityColors,
} from '@/services/fines.service';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Car,
  User,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { formatCurrencyBRL } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export function FineDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { can } = usePermissions();

  const { data: fine, isLoading } = useQuery({
    queryKey: ['fine', id],
    queryFn: () => getFineById(id!),
    enabled: !!id,
  });

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [paymentRef, setPaymentRef] = useState('');
  const [disputeNotes, setDisputeNotes] = useState('');
  const [cancelNotes, setCancelNotes] = useState('');

  const payMutation = useMutation({
    mutationFn: () => markFineAsPaid(id!, new Date(paymentDate).toISOString(), paymentRef),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fine', id] });
      queryClient.invalidateQueries({ queryKey: ['fines'] });
      toast.success('Multa marcada como paga!');
      setPaymentDialogOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const disputeMutation = useMutation({
    mutationFn: () => markFineAsDisputed(id!, disputeNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fine', id] });
      queryClient.invalidateQueries({ queryKey: ['fines'] });
      toast.success('Multa marcada como contestada!');
      setDisputeDialogOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelFine(id!, cancelNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fine', id] });
      queryClient.invalidateQueries({ queryKey: ['fines'] });
      toast.success('Multa cancelada!');
      setCancelDialogOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!fine) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-muted-foreground">Multa não encontrada.</p>
        <Button variant="outline" onClick={() => navigate('/fines')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Multas
        </Button>
      </div>
    );
  }

  const status = deriveFineStatus(fine);
  const canEdit = can('fine:edit');
  const isActionable = canEdit && status !== 'paid' && status !== 'cancelled';

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/fines')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                Multa {fine.infraction_code ? `- ${fine.infraction_code}` : ''}
              </h1>
              <Badge className={fineStatusColors[status]} variant="secondary">
                {fineStatusLabels[status]}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">{fine.infraction}</p>
          </div>
        </div>

        {isActionable && (
          <div className="flex gap-2">
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marcar como Paga
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Pagamento</DialogTitle>
                  <DialogDescription>Informe os dados do pagamento.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Data do Pagamento</Label>
                    <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Referência / Comprovante</Label>
                    <Input value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} placeholder="ID do pagamento, nº boleto..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={() => payMutation.mutate()} disabled={payMutation.isPending}>Confirmar Pagamento</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Contestar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Contestar Multa</DialogTitle>
                  <DialogDescription>Registre o motivo da contestação.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Motivo</Label>
                    <Textarea value={disputeNotes} onChange={(e) => setDisputeNotes(e.target.value)} placeholder="Descreva o motivo da contestação..." rows={3} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDisputeDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={() => disputeMutation.mutate()} disabled={disputeMutation.isPending}>Confirmar Contestação</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-destructive">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancelar Multa</DialogTitle>
                  <DialogDescription>Esta ação não pode ser desfeita.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Motivo</Label>
                    <Textarea value={cancelNotes} onChange={(e) => setCancelNotes(e.target.value)} placeholder="Motivo do cancelamento..." rows={3} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Voltar</Button>
                  <Button variant="destructive" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>Confirmar Cancelamento</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Infraction Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <CardTitle>Detalhes da Infração</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {fine.infraction_code && (
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-medium">{fine.infraction_code}</p>
                </div>
              )}
              {fine.severity && (
                <div>
                  <p className="text-sm text-muted-foreground">Gravidade</p>
                  <Badge className={severityColors[fine.severity] || ''} variant="secondary">
                    {severityLabels[fine.severity] || fine.severity}
                  </Badge>
                </div>
              )}
              {fine.points != null && (
                <div>
                  <p className="text-sm text-muted-foreground">Pontos</p>
                  <p className="font-bold text-lg">{fine.points}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Descrição</p>
              <p>{fine.infraction || '—'}</p>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Data da Infração</p>
                <p>{format(new Date(fine.occurred_at), 'dd/MM/yyyy', { locale: ptBR })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle & Driver */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              <CardTitle>Veículo e Motorista</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => navigate(`/vehicles/${fine.vehicle_id}`)}
            >
              <p className="text-sm text-muted-foreground">Veículo</p>
              <p className="font-bold text-lg">{fine.vehicles?.plate || '—'}</p>
              <p className="text-sm text-muted-foreground">{fine.vehicles?.vehicle_code} - {fine.vehicles?.brand} {fine.vehicles?.model}</p>
            </div>

            {fine.drivers ? (
              <div
                className="p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                onClick={() => fine.driver_id && navigate(`/drivers/${fine.driver_id}`)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Motorista</p>
                </div>
                <p className="font-medium">{fine.drivers.full_name}</p>
                {fine.rental_id && <p className="text-xs text-muted-foreground">Vinculado via locação</p>}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Motorista</p>
                <p className="text-muted-foreground italic">Não identificado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <CardTitle>Valores e Pagamento</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="font-bold text-lg">{formatCurrencyBRL(fine.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vencimento</p>
                <p className="font-medium">{fine.due_date ? format(new Date(fine.due_date), 'dd/MM/yyyy', { locale: ptBR }) : '—'}</p>
              </div>
            </div>

            {fine.paid_at && (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">Pagamento Realizado</p>
                <p className="text-xs text-muted-foreground">
                  em {format(new Date(fine.paid_at), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
                {fine.payment_reference && (
                  <p className="text-xs text-muted-foreground mt-1">Ref: {fine.payment_reference}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{fine.notes || 'Nenhuma observação.'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FineDetailPage;
