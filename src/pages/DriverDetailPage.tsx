import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDriverById, updateDriver, archiveDriver } from '@/services/drivers.service';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, User, Phone, Car, Calendar, CreditCard, Plus, Trash2, Save, Pencil } from 'lucide-react';
import { formatDateOnly } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const [editing, setEditing] = useState(false);

  const { data: driver, isLoading, error } = useQuery({
    queryKey: ['driver', id],
    queryFn: () => fetchDriverById(id!),
    enabled: !!id,
  });

  // Edit form state
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    cpf: '',
    cnh: '',
    birth_date: '',
    email: '',
    driver_app: '',
  });

  const startEditing = () => {
    if (driver) {
      setForm({
        full_name: driver.full_name || '',
        phone: driver.phone || '',
        cpf: driver.cpf || '',
        cnh: driver.cnh || '',
        birth_date: driver.birth_date || '',
        email: driver.email || '',
        driver_app: driver.driver_app || '',
      });
      setEditing(true);
    }
  };

  const updateMut = useMutation({
    mutationFn: () => updateDriver(id!, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', id] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setEditing(false);
      toast.success('Motorista atualizado!');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const archiveMut = useMutation({
    mutationFn: () => archiveDriver(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Motorista arquivado.');
      navigate('/drivers');
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-muted-foreground">Motorista não encontrado.</p>
        <Button variant="outline" onClick={() => navigate('/drivers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Motoristas
        </Button>
      </div>
    );
  }

  const isActive = driver.computedStatus === 'active';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/drivers')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{driver.full_name}</h1>
              <Badge
                variant="outline"
                className={isActive
                  ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                  : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700'}
              >
                {isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Central do Motorista</p>
          </div>
        </div>

        <div className="flex gap-2">
          {!isActive && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir motorista?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O motorista será arquivado e não aparecerá mais na listagem principal.
                    Dados históricos serão preservados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => archiveMut.mutate()}>
                    Confirmar Exclusão
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {can('driver:edit') && !editing && (
            <Button variant="outline" size="sm" onClick={startEditing}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}

          {!isActive && (
            <Button onClick={() => navigate(`/rentals/new?driverId=${driver.id}`)} className="gap-2">
              <Plus className="h-4 w-4" />
              Iniciar locação
            </Button>
          )}

          {isActive && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button disabled variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Iniciar locação
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Motorista já possui locação ativa.</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Driver Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Dados do Motorista
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>CNH</Label>
                    <Input value={form.cnh} onChange={e => setForm(f => ({ ...f, cnh: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Nascimento</Label>
                    <Input type="date" value={form.birth_date} onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>App de Motorista</Label>
                    <Input value={form.driver_app} onChange={e => setForm(f => ({ ...f, driver_app: e.target.value }))} placeholder="Uber, 99, etc." />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => updateMut.mutate()} disabled={updateMut.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome Completo</p>
                    <p className="font-medium">{driver.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{driver.phone || '—'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CPF</p>
                    <p className="font-medium">{driver.cpf || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CNH</p>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{driver.cnh || '—'}</p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{formatDateOnly(driver.birth_date)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-medium">{driver.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">App de Motorista</p>
                    <p className="font-medium">{driver.driver_app || '—'}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Current Vehicle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Veículo Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {driver.currentVehicleId ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Placa</p>
                    <p className="font-medium text-lg">{driver.currentVehiclePlate || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Código</p>
                    <p className="font-medium text-lg text-primary">{driver.currentVehicleCode || '—'}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/vehicles/${driver.currentVehicleId}`)}
                >
                  Ver Detalhes do Veículo
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum veículo vinculado</p>
                <p className="text-xs mt-1 text-orange-600">
                  Para ativar o motorista, crie uma locação.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DriverDetailPage;
