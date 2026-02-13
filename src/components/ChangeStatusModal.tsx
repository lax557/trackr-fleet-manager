import { useState } from 'react';
import { VehicleStatus, VehicleWithDetails, Driver } from '@/types';
import { statusLabels } from '@/data/mockData';
import { mockDrivers } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StatusBadge } from './StatusBadge';
import { AlertCircle, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface ChangeStatusModalProps {
  vehicle: VehicleWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (vehicleId: string, newStatus: VehicleStatus, note: string, driverId?: string) => void;
}

const allStatuses: VehicleStatus[] = [
  'DISPONIVEL',
  'ALUGADO',
  'MANUTENCAO',
  'SINISTRO',
  'PARA_VENDA',
  'EM_LIBERACAO',
];

export function ChangeStatusModal({ vehicle, open, onOpenChange, onConfirm }: ChangeStatusModalProps) {
  const [newStatus, setNewStatus] = useState<VehicleStatus | ''>('');
  const [note, setNote] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<string>('');

  const activeDrivers = mockDrivers.filter(d => d.status === 'active');
  const requiresDriver = newStatus === 'ALUGADO';
  const isEmLiberacao = newStatus === 'EM_LIBERACAO';

  const handleConfirm = () => {
    if (!vehicle || !newStatus) return;
    
    if (requiresDriver && !selectedDriver) {
      toast.error('Selecione um motorista para criar a locação.');
      return;
    }

    if (isEmLiberacao && vehicle.plate) {
      toast.warning('Veículos em liberação geralmente não possuem placa. Verifique se o status está correto.');
    }

    onConfirm(vehicle.id, newStatus, note, selectedDriver || undefined);
    setNewStatus('');
    setNote('');
    setSelectedDriver('');
    onOpenChange(false);
    toast.success(`Status alterado para ${statusLabels[newStatus]}`);
  };

  const handleClose = () => {
    setNewStatus('');
    setNote('');
    setSelectedDriver('');
    onOpenChange(false);
  };

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Alterar Status
            <span className="text-primary">{vehicle.id}</span>
          </DialogTitle>
          <DialogDescription>
            {vehicle.make} {vehicle.model} {vehicle.version}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Status atual:</span>
            <StatusBadge status={vehicle.currentStatus} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-status">Novo status</Label>
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as VehicleStatus)}>
              <SelectTrigger id="new-status">
                <SelectValue placeholder="Selecione o novo status" />
              </SelectTrigger>
              <SelectContent>
                {allStatuses.map((status) => (
                  <SelectItem key={status} value={status} disabled={status === vehicle.currentStatus}>
                    {statusLabels[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {requiresDriver && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="driver" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Selecionar motorista
              </Label>
              <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                <SelectTrigger id="driver">
                  <SelectValue placeholder="Escolha o locatário" />
                </SelectTrigger>
                <SelectContent>
                  {activeDrivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Uma nova locação será criada para este motorista.
              </p>
            </div>
          )}

          {isEmLiberacao && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 animate-fade-in">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Atenção</p>
                <p className="text-xs mt-1">
                  Veículos em liberação devem ter configuração de aquisição (modo de compra, etapa, etc).
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">Observação</Label>
            <Textarea
              id="note"
              placeholder="Adicione uma nota sobre esta alteração..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!newStatus}>
            Confirmar alteração
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
