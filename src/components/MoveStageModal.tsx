import { useState } from 'react';
import { AcquisitionStage, PurchaseMode, VehicleWithDetails } from '@/types';
import { stageLabels, purchaseModeLabels } from '@/data/mockData';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StageBadge } from './StatusBadge';
import { Calendar, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface MoveStageModalProps {
  vehicle: VehicleWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (vehicleId: string, stage: AcquisitionStage, purchaseMode: PurchaseMode, expectedDate: string, notes: string) => void;
}

const stages: AcquisitionStage[] = [
  'EM_LIBERACAO',
  'APROVADO',
  'FATURADO',
  'RECEBIDO',
  'INSTALACAO_EQUIPAMENTOS',
  'PRONTO_PARA_ALUGAR',
];

const purchaseModes: PurchaseMode[] = [
  'CONSORCIO',
  'FINANCIAMENTO',
  'A_VISTA',
  'A_VISTA_MAIS_CREDITO',
];

export function MoveStageModal({ vehicle, open, onOpenChange, onConfirm }: MoveStageModalProps) {
  const [stage, setStage] = useState<AcquisitionStage | ''>('');
  const [purchaseMode, setPurchaseMode] = useState<PurchaseMode | ''>('');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [group, setGroup] = useState('');
  const [quota, setQuota] = useState('');

  const handleConfirm = () => {
    if (!vehicle || !stage || !purchaseMode) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    // In a real app, group and quota would be saved too
    console.log('Saving acquisition with group/quota:', { group, quota });
    onConfirm(vehicle.id, stage, purchaseMode, expectedDate, notes);
    handleClose();
    toast.success(`Etapa atualizada para ${stageLabels[stage]}`);
  };

  const handleClose = () => {
    setStage('');
    setPurchaseMode('');
    setExpectedDate('');
    setNotes('');
    setGroup('');
    setQuota('');
    onOpenChange(false);
  };

  const currentStageIndex = vehicle?.acquisition ? stages.indexOf(vehicle.acquisition.stage) : -1;

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Mover Etapa de Aquisição
            <span className="font-mono text-primary">{vehicle.id}</span>
          </DialogTitle>
          <DialogDescription>
            {vehicle.make} {vehicle.model} {vehicle.version}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {vehicle.acquisition && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Etapa atual:</span>
              <StageBadge stage={vehicle.acquisition.stage} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="stage">Nova etapa *</Label>
            <Select value={stage} onValueChange={(v) => setStage(v as AcquisitionStage)}>
              <SelectTrigger id="stage">
                <SelectValue placeholder="Selecione a etapa" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((s, index) => (
                  <SelectItem 
                    key={s} 
                    value={s}
                    disabled={index < currentStageIndex}
                  >
                    <div className="flex items-center gap-2">
                      {index > currentStageIndex && <ArrowRight className="h-3 w-3 text-primary" />}
                      {stageLabels[s]}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchase-mode">Modo de compra *</Label>
            <Select 
              value={purchaseMode || vehicle.acquisition?.purchaseMode || ''} 
              onValueChange={(v) => setPurchaseMode(v as PurchaseMode)}
            >
              <SelectTrigger id="purchase-mode">
                <SelectValue placeholder="Selecione o modo" />
              </SelectTrigger>
              <SelectContent>
                {purchaseModes.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {purchaseModeLabels[mode]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Group and Quota fields for Consórcio */}
          {(purchaseMode === 'CONSORCIO' || vehicle.acquisition?.purchaseMode === 'CONSORCIO') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="group">Grupo</Label>
                <Input
                  id="group"
                  placeholder="Ex: Grupo 1234"
                  value={group || vehicle.acquisition?.group || ''}
                  onChange={(e) => setGroup(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quota">Cota</Label>
                <Input
                  id="quota"
                  placeholder="Ex: Cota 567"
                  value={quota || vehicle.acquisition?.quota || ''}
                  onChange={(e) => setQuota(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="expected-date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Previsão de entrega
            </Label>
            <Input
              id="expected-date"
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Adicione notas sobre esta etapa..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!stage || !purchaseMode}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
