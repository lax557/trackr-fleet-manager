import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRentalById, changeRentalStatus, fetchRentalEvents } from '@/services/rentals.service';
import { fetchContractTemplates, createRentalContract, renderTemplate } from '@/services/contracts.service';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft, Play, StopCircle, XCircle, Send, Loader2, User, Car,
  DollarSign, Calendar, Clock, FileText, CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { formatCurrencyBRL, formatDateOnly } from '@/lib/utils';
import { useState } from 'react';

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

const eventLabels: Record<string, string> = {
  created: 'Locação criada',
  status_changed: 'Status alterado',
  delivered: 'Veículo entregue',
  returned: 'Veículo devolvido',
  note: 'Observação',
  contract_generated: 'Contrato gerado',
};

export function RentalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { can } = usePermissions();

  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [previewHtml, setPreviewHtml] = useState('');

  const { data: rental, isLoading } = useQuery({
    queryKey: ['rental', id],
    queryFn: () => fetchRentalById(id!),
    enabled: !!id,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['rental-events', id],
    queryFn: () => fetchRentalEvents(id!),
    enabled: !!id,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['contract-templates'],
    queryFn: fetchContractTemplates,
    enabled: contractModalOpen,
  });

  const statusMutation = useMutation({
    mutationFn: ({ status }: { status: 'awaiting_signature' | 'active' | 'ended' | 'cancelled' }) =>
      changeRentalStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rental', id] });
      queryClient.invalidateQueries({ queryKey: ['rental-events', id] });
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Status atualizado com sucesso!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const contractMutation = useMutation({
    mutationFn: () => createRentalContract(id!, selectedTemplateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rental', id] });
      queryClient.invalidateQueries({ queryKey: ['rental-events', id] });
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      setContractModalOpen(false);
      toast.success('Contrato gerado e locação enviada para assinatura!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSendForSignature = () => {
    setContractModalOpen(true);
    setSelectedTemplateId('');
    setPreviewHtml('');
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (rental) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setPreviewHtml(renderTemplate(template.body, rental));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Locação não encontrada.</p>
        <Button variant="outline" onClick={() => navigate('/rentals')}>
          <ArrowLeft className="h-4 w-4 mr-2" />Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/rentals')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">Locação</h1>
              <Badge variant="outline" className={statusStyles[rental.status]}>
                {statusLabels[rental.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              {rental.driver_name} • {rental.vehicle_plate || rental.vehicle_code || '—'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {rental.status === 'draft' && (
            <Button onClick={handleSendForSignature}>
              <Send className="h-4 w-4 mr-2" />Enviar para Assinatura
            </Button>
          )}
          {(rental.status === 'draft' || rental.status === 'awaiting_signature') && (
            <Button variant="default" onClick={() => statusMutation.mutate({ status: 'active' })}
              disabled={statusMutation.isPending}>
              <Play className="h-4 w-4 mr-2" />Ativar
            </Button>
          )}
          {rental.status === 'active' && (
            <Button variant="outline" onClick={() => statusMutation.mutate({ status: 'ended' })}
              disabled={statusMutation.isPending}>
              <StopCircle className="h-4 w-4 mr-2" />Encerrar
            </Button>
          )}
          {rental.status !== 'active' && rental.status !== 'ended' && rental.status !== 'cancelled' && (
            <Button variant="destructive" size="sm"
              onClick={() => statusMutation.mutate({ status: 'cancelled' })}
              disabled={statusMutation.isPending}>
              <XCircle className="h-4 w-4 mr-2" />Cancelar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Driver & Vehicle */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Motorista</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{rental.driver_name}</p>
                {rental.driver_phone && <p className="text-sm text-muted-foreground">{rental.driver_phone}</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Veículo</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{rental.vehicle_plate || '—'}</p>
                <p className="text-sm text-muted-foreground">
                  {rental.vehicle_code} • {rental.vehicle_brand} {rental.vehicle_model}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Valores</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Semanal</p>
                  <p className="text-lg font-bold">{formatCurrencyBRL(rental.weekly_rate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Caução</p>
                  <p className="text-lg font-bold">{formatCurrencyBRL(rental.deposit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Datas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Início</p>
                  <p className="font-medium">{formatDateOnly(rental.start_date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Término</p>
                  <p className="font-medium">{rental.end_date ? format(new Date(rental.end_date), 'dd/MM/yyyy', { locale: ptBR }) : '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Entrega Prevista</p>
                  <p className="font-medium">{rental.delivery_scheduled_at ? format(new Date(rental.delivery_scheduled_at), 'dd/MM/yyyy', { locale: ptBR }) : '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Entregue em</p>
                  <p className="font-medium">{rental.delivered_at ? format(new Date(rental.delivered_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Retorno Previsto</p>
                  <p className="font-medium">{rental.return_scheduled_at ? format(new Date(rental.return_scheduled_at), 'dd/MM/yyyy', { locale: ptBR }) : '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Devolvido em</p>
                  <p className="font-medium">{rental.returned_at ? format(new Date(rental.returned_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {rental.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rental.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Histórico</CardTitle>
              </div>
              <CardDescription>Eventos da locação</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
              ) : (
                <div className="space-y-4">
                  {events.map((evt: any, idx: number) => (
                    <div key={evt.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`h-3 w-3 rounded-full ${idx === events.length - 1 ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                        {idx < events.length - 1 && <div className="w-px flex-1 bg-border" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium">{eventLabels[evt.type] || evt.type}</p>
                        {evt.payload && typeof evt.payload === 'object' && evt.payload.from && (
                          <p className="text-xs text-muted-foreground">
                            {statusLabels[evt.payload.from] || evt.payload.from} → {statusLabels[evt.payload.to] || evt.payload.to}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(evt.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contract Template Modal */}
      <Dialog open={contractModalOpen} onOpenChange={setContractModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Gerar Contrato</DialogTitle>
            <DialogDescription>Selecione um modelo de contrato para gerar o documento.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {templates.filter(t => t.is_active).length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum modelo de contrato ativo encontrado.</p>
                <Button variant="outline" onClick={() => { setContractModalOpen(false); navigate('/rentals/templates/new'); }}>
                  Criar Modelo de Contrato
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Modelo de Contrato *</label>
                  <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um modelo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.filter(t => t.is_active).map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {t.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {previewHtml && (
                  <div className="border rounded-lg p-6 bg-white text-black max-h-[400px] overflow-auto">
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setContractModalOpen(false)}>Cancelar</Button>
            <Button onClick={() => contractMutation.mutate()}
              disabled={!selectedTemplateId || contractMutation.isPending}>
              {contractMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Gerar e Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RentalDetailPage;
