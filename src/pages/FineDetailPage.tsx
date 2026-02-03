import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFinesWithDetails, mockFinesRecords } from '@/data/finesData';
import { mockDrivers } from '@/data/mockData';
import { 
  fineStatusLabels, 
  fineStatusColors,
  fineSeverityLabels 
} from '@/types/fines';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Car, 
  User, 
  Calendar, 
  MapPin, 
  DollarSign,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Upload,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const severityColors: Record<string, string> = {
  LEVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  MEDIA: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  GRAVE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  GRAVISSIMA: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function FineDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const fine = useMemo(() => {
    return getFinesWithDetails().find(f => f.id === id);
  }, [id]);

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [indicationDialogOpen, setIndicationDialogOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [paymentAmount, setPaymentAmount] = useState(fine?.discountedAmount?.toFixed(2) || fine?.originalAmount.toFixed(2) || '');
  const [selectedDriver, setSelectedDriver] = useState(fine?.driverId || '');
  const [manualDriverName, setManualDriverName] = useState('');
  const [useManualName, setUseManualName] = useState(false);

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

  const handleMarkAsPaid = () => {
    toast.success('Multa marcada como paga!');
    setPaymentDialogOpen(false);
  };

  const handleIndicateDriver = () => {
    const driverName = useManualName 
      ? manualDriverName 
      : mockDrivers.find(d => d.id === selectedDriver)?.fullName;
    
    toast.success(`Condutor indicado: ${driverName}`);
    setIndicationDialogOpen(false);
  };

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
                Multa - {fine.infractionCode}
              </h1>
              <Badge className={fineStatusColors[fine.status]} variant="secondary">
                {fineStatusLabels[fine.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {fine.infractionDescription}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {fine.status !== 'PAID' && fine.status !== 'CANCELED' && (
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
                  <DialogDescription>
                    Informe os dados do pagamento desta multa.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Data do Pagamento</Label>
                    <Input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Pago (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleMarkAsPaid}>
                    Confirmar Pagamento
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {!fine.indicatedDriver && (
            <Dialog open={indicationDialogOpen} onOpenChange={setIndicationDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  Indicar Condutor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Indicar Condutor</DialogTitle>
                  <DialogDescription>
                    Selecione o condutor responsável pela infração.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <Label>Inserir nome manualmente</Label>
                    <Switch
                      checked={useManualName}
                      onCheckedChange={setUseManualName}
                    />
                  </div>

                  {useManualName ? (
                    <div className="space-y-2">
                      <Label>Nome do Condutor</Label>
                      <Input
                        value={manualDriverName}
                        onChange={(e) => setManualDriverName(e.target.value)}
                        placeholder="Nome completo do condutor"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Selecionar Motorista</Label>
                      <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um motorista" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockDrivers.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIndicationDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleIndicateDriver}
                    disabled={useManualName ? !manualDriverName : !selectedDriver}
                  >
                    Confirmar Indicação
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
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
              <div>
                <p className="text-sm text-muted-foreground">Código</p>
                <p className="font-mono font-medium">{fine.infractionCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gravidade</p>
                <Badge className={severityColors[fine.severity]} variant="secondary">
                  {fineSeverityLabels[fine.severity]}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pontos</p>
                <p className="font-bold text-lg">{fine.points}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Órgão Autuador</p>
                <p className="font-medium">{fine.authority}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Descrição</p>
              <p>{fine.infractionDescription}</p>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Data/Hora</p>
                <p>{format(fine.occurredAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
              </div>
            </div>

            {fine.location && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Local</p>
                  <p>{fine.location}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehicle & Driver */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              <CardTitle>Veículo e Condutor</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => navigate(`/vehicles/${fine.vehicleId}`)}
            >
              <p className="text-sm text-muted-foreground">Veículo</p>
              <p className="font-mono font-bold text-lg">{fine.vehiclePlate}</p>
              <p className="text-sm text-muted-foreground">{fine.vehicleId} - {fine.vehicleMakeModel}</p>
            </div>

            {fine.indicatedDriver ? (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Condutor Indicado</p>
                </div>
                <p className="font-medium">{fine.indicatedDriverName}</p>
                {fine.indicatedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Indicado em {format(fine.indicatedAt, 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                )}
              </div>
            ) : fine.driverName ? (
              <div 
                className="p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                onClick={() => fine.driverId && navigate(`/drivers/${fine.driverId}`)}
              >
                <p className="text-sm text-muted-foreground">Motorista Atual</p>
                <p className="font-medium">{fine.driverName}</p>
                <p className="text-xs text-amber-600 mt-1">⚠️ Ainda não indicado</p>
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
                <p className="text-sm text-muted-foreground">Valor Original</p>
                <p className={`font-bold text-lg ${fine.discountAvailable ? 'line-through text-muted-foreground' : ''}`}>
                  R$ {fine.originalAmount.toFixed(2)}
                </p>
              </div>
              {fine.discountAvailable && (
                <div>
                  <p className="text-sm text-muted-foreground">Com Desconto ({fine.discountPercent}%)</p>
                  <p className="font-bold text-lg text-green-600">
                    R$ {fine.discountedAmount?.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Vencimento</p>
                <p className="font-medium">{format(fine.dueDate, 'dd/MM/yyyy', { locale: ptBR })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={fineStatusColors[fine.status]} variant="secondary">
                  {fineStatusLabels[fine.status]}
                </Badge>
              </div>
            </div>

            {fine.paymentDate && (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">Pagamento Realizado</p>
                <p className="font-bold text-lg">R$ {fine.paymentAmount?.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  em {format(fine.paymentDate, 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Documentos</CardTitle>
              </div>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {fine.documentFileId ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">Auto de Infração</p>
                  <p className="text-xs text-muted-foreground">PDF</p>
                </div>
                <Button variant="ghost" size="sm">Ver</Button>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">
                Nenhum documento anexado.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {fine.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{fine.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default FineDetailPage;
