import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRentals, changeRentalStatus, RentalWithDetails } from '@/services/rentals.service';
import { fetchContractTemplates, createRentalContract, renderTemplate } from '@/services/contracts.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, MoreHorizontal, Eye, Play, StopCircle, XCircle, Send, Loader2, CheckCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrencyBRL, formatDateOnly } from '@/lib/utils';

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

  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<RentalWithDetails | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');

  const { data: rentals = [], isLoading } = useQuery({
    queryKey: ['rentals'],
    queryFn: fetchRentals,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['contract-templates'],
    queryFn: fetchContractTemplates,
    enabled: contractModalOpen,
  });

  const contractMutation = useMutation({
    mutationFn: () => createRentalContract(selectedRental!.id, selectedTemplateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      setContractModalOpen(false);
      toast.success('Contrato gerado e enviado para assinatura!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleOpenSignatureModal = (rental: RentalWithDetails) => {
    setSelectedRental(rental);
    setSelectedTemplateId('');
    setPreviewHtml('');
    setContractModalOpen(true);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (selectedRental) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setPreviewHtml(renderTemplate(template.body, selectedRental));
      }
    }
  };

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
                    {formatDateOnly(rental.start_date)}
                  </TableCell>
                  <TableCell>
                    {formatDateOnly(rental.end_date)}
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
                          <DropdownMenuItem onClick={() => handleOpenSignatureModal(rental)}>
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

      {/* Send-to-signature modal */}
      <Dialog open={contractModalOpen} onOpenChange={setContractModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Gerar Contrato</DialogTitle>
            <DialogDescription>
              Selecione um modelo para gerar o contrato de {selectedRental?.driver_name}.
            </DialogDescription>
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
                    <SelectTrigger><SelectValue placeholder="Selecione um modelo..." /></SelectTrigger>
                    <SelectContent>
                      {templates.filter(t => t.is_active).map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />{t.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {previewHtml && (
                  <div className="border rounded-lg p-6 bg-white text-black max-h-[400px] overflow-auto">
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: previewHtml }} />
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

export default RentalsPage;
