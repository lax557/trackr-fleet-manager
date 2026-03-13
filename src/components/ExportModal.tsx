import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const entities = [
  { value: 'vehicles', label: 'Veículos' },
  { value: 'maintenance', label: 'Manutenções' },
  { value: 'contracts', label: 'Contratos / Locações' },
  { value: 'fines', label: 'Multas' },
];

const formats = [
  { value: 'csv', label: 'CSV', icon: FileText },
  { value: 'xlsx', label: 'Excel (XLSX)', icon: FileSpreadsheet },
];

const statusOptions: Record<string, { value: string; label: string }[]> = {
  maintenance: [
    { value: 'ALL', label: 'Todos' },
    { value: 'open', label: 'Aberta' },
    { value: 'in_progress', label: 'Em Execução' },
    { value: 'done', label: 'Finalizada' },
    { value: 'cancelled', label: 'Cancelada' },
  ],
  contracts: [
    { value: 'ALL', label: 'Todos' },
    { value: 'active', label: 'Ativo' },
    { value: 'awaiting_signature', label: 'Aguardando Assinatura' },
    { value: 'ended', label: 'Encerrado' },
    { value: 'cancelled', label: 'Cancelado' },
  ],
  fines: [
    { value: 'ALL', label: 'Todos' },
    { value: 'open', label: 'Aberta' },
    { value: 'paid', label: 'Paga' },
    { value: 'overdue', label: 'Vencida' },
    { value: 'disputed', label: 'Contestada' },
    { value: 'cancelled', label: 'Cancelada' },
  ],
};

export function ExportModal({ open, onOpenChange }: ExportModalProps) {
  const [entity, setEntity] = useState('vehicles');
  const [format, setFormat] = useState('xlsx');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('ALL');

  const hasDateFilter = ['maintenance', 'contracts', 'fines'].includes(entity);
  const hasStatusFilter = entity in statusOptions;

  const exportMut = useMutation({
    mutationFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('Não autenticado');

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/export-data`;

      const payload: Record<string, string> = { entity, format };
      if (hasDateFilter && dateFrom) payload.dateFrom = dateFrom;
      if (hasDateFilter && dateTo) payload.dateTo = dateTo;
      if (hasStatusFilter && status !== 'ALL') payload.status = status;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || `Erro ${res.status}`);
      }

      const blob = await res.blob();
      const ext = format === 'csv' ? 'csv' : 'xlsx';
      const entityLabel = entities.find(e => e.value === entity)?.label || entity;
      const filename = `${entityLabel}_${new Date().toISOString().slice(0, 10)}.${ext}`;

      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    },
    onSuccess: () => {
      toast.success('Exportação concluída!');
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message || 'Erro na exportação'),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Exportar Dados
          </DialogTitle>
          <DialogDescription>
            Selecione a entidade, formato e filtros para gerar o arquivo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Entidade *</Label>
            <Select value={entity} onValueChange={(v) => { setEntity(v); setStatus('ALL'); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {entities.map(e => (
                  <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Formato *</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {formats.map(f => (
                  <SelectItem key={f.value} value={f.value}>
                    <span className="flex items-center gap-2">
                      <f.icon className="h-4 w-4" />
                      {f.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasStatusFilter && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions[entity].map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {hasDateFilter && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data inicial</Label>
                <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Data final</Label>
                <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => exportMut.mutate()} disabled={exportMut.isPending}>
            {exportMut.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Exportando...</>
            ) : (
              <><Download className="h-4 w-4 mr-2" />Exportar</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
