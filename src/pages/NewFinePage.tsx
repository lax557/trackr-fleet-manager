import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createFine } from '@/services/fines.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

export default function NewFinePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [occurredAt, setOccurredAt] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [severity, setSeverity] = useState('');
  const [points, setPoints] = useState('');
  const [infractionCode, setInfractionCode] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles-for-fines'],
    queryFn: async () => {
      const { data } = await supabase
        .from('vehicles')
        .select('id, plate, brand, model, vehicle_code')
        .is('deleted_at', null)
        .order('plate');
      return data || [];
    },
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers-for-fines'],
    queryFn: async () => {
      const { data } = await supabase
        .from('drivers')
        .select('id, full_name')
        .is('deleted_at', null)
        .order('full_name');
      return data || [];
    },
  });

  const mutation = useMutation({
    mutationFn: createFine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fines'] });
      toast.success('Multa registrada com sucesso!');
      navigate('/fines');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao registrar multa');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !description || !amount || !occurredAt || !dueDate) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    mutation.mutate({
      vehicle_id: vehicleId,
      driver_id: driverId || null,
      occurred_at: occurredAt,
      due_date: dueDate,
      severity: severity || null,
      points: points ? parseInt(points) : null,
      infraction_code: infractionCode || null,
      infraction: description,
      amount: parseFloat(amount),
      notes: notes || null,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/fines')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Multa</h1>
          <p className="text-muted-foreground text-sm">Registrar infração de trânsito</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Dados da Infração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Veículo *</Label>
                <Select value={vehicleId} onValueChange={setVehicleId}>
                  <SelectTrigger><SelectValue placeholder="Selecione o veículo" /></SelectTrigger>
                  <SelectContent>
                    {vehicles.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.plate || v.vehicle_code} - {v.brand} {v.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Motorista (opcional)</Label>
                <Select value={driverId} onValueChange={setDriverId}>
                  <SelectTrigger><SelectValue placeholder="Auto-detectar pela locação" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum (auto-detectar)</SelectItem>
                    {drivers.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data da Infração *</Label>
                <Input type="date" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Vencimento *</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Descrição da Infração *</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Excesso de velocidade até 20%" />
              </div>

              <div className="space-y-2">
                <Label>Valor (R$) *</Label>
                <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
              </div>

              <div className="space-y-2">
                <Label>Gravidade</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leve">Leve</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="grave">Grave</SelectItem>
                    <SelectItem value="gravissima">Gravíssima</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pontos</Label>
                <Input type="number" value={points} onChange={(e) => setPoints(e.target.value)} placeholder="Ex: 4" />
              </div>

              <div className="space-y-2">
                <Label>Código da Infração</Label>
                <Input value={infractionCode} onChange={(e) => setInfractionCode(e.target.value)} placeholder="Ex: 74550" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas adicionais..." rows={3} />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/fines')}>Cancelar</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Salvando...' : 'Registrar Multa'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
