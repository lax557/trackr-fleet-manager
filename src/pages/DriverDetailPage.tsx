import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { DriverDocType, DriverNote } from '@/types';
import { 
  getDriversWithDetails, 
  mockVehicles, 
  getFilesForScope,
  driverDocTypeLabels,
  mockRentals
} from '@/data/mockData';
// fines now loaded from DB in dedicated component
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DocumentsCard } from '@/components/DocumentsCard';
import { ArrowLeft, User, Phone, Car, AlertTriangle, Wallet, Calendar, CreditCard, Users, Plus, ArrowRight, Trash2, StickyNote, MapPin, MoreVertical, Pencil } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { getCurrentStatus } from '@/data/mockData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { fineStatusColors as fineStatusColorsImport, fineStatusLabels as fineStatusLabelsImport } from '@/services/fines.service';
import { toast } from 'sonner';

const driverDocTypes: DriverDocType[] = [
  'CONTRATO',
  'CNH',
  'CPF_DOC',
  'COMPROVANTE_RESIDENCIA',
  'PERFIL_APP'
];

const formatCEP = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
};

export function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock: in a real app this would come from auth context
  const currentUserRole: 'admin' | 'operations' | 'finance' | 'maintenance' | 'readonly' = 'admin';
  const isAdmin = currentUserRole === 'admin';

  const driversWithDetails = getDriversWithDetails();
  const driver = driversWithDetails.find(d => d.id === id);

  const [notes, setNotes] = useState<DriverNote[]>(driver?.notes || []);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  // Address state
  const [address, setAddress] = useState(driver?.address || {
    street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: ''
  });

  const documents = useMemo(() => {
    return id ? getFilesForScope('DRIVER', id) : [];
  }, [id]);

  const handleDocumentUpload = (docType: string, file: File) => {
    console.log('Upload document:', { docType, file, driverId: id });
  };

  const handleDocumentDelete = (fileId: string) => {
    console.log('Delete document:', { fileId });
  };

  if (!driver) {
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

  const currentVehicle = driver.currentVehicle;
  const vehicleStatus = currentVehicle ? getCurrentStatus(currentVehicle.id) : null;
  
  const driverFines: { id: string; infraction: string | null; due_date: string | null; amount: number; status: string; derivedStatus: string }[] = [];
  const openFines = driverFines;
  const openFinesCount = openFines.length;

  const displayStatus = driver.computedStatus;
  
  const hasActiveRental = mockRentals.some(
    r => r.driverId === driver.id && r.status === 'ACTIVE'
  );
  
  const handleStartRental = () => {
    navigate(`/rentals/new?driverId=${driver.id}`);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: DriverNote = {
      id: `note-${Date.now()}`,
      driverId: driver.id,
      content: newNote.trim(),
      author: 'admin',
      createdAt: new Date(),
    };
    setNotes(prev => [note, ...prev]);
    setNewNote('');
    toast.success('Nota adicionada.');
  };

  const handleDeleteDriver = () => {
    console.log('Archiving driver:', driver.id);
    toast.success('Motorista arquivado com sucesso.');
    navigate('/drivers');
  };

  const handleSaveAddress = () => {
    console.log('Saving address:', address);
    toast.success('Endereço salvo.');
  };

  const handleEditNote = (note: DriverNote) => {
    setEditingNoteId(note.id);
    setEditingNoteContent(note.content);
  };

  const handleSaveEditNote = () => {
    if (!editingNoteId || !editingNoteContent.trim()) return;
    setNotes(prev => prev.map(n => 
      n.id === editingNoteId 
        ? { ...n, content: editingNoteContent.trim() } 
        : n
    ));
    console.log('AuditLog: Note edited', { noteId: editingNoteId, by: currentUserRole });
    setEditingNoteId(null);
    setEditingNoteContent('');
    toast.success('Nota editada.');
  };

  const handleDeleteNote = () => {
    if (!deletingNoteId) return;
    setNotes(prev => prev.filter(n => n.id !== deletingNoteId));
    console.log('AuditLog: Note deleted', { noteId: deletingNoteId, by: currentUserRole });
    setDeletingNoteId(null);
    toast.success('Nota excluída.');
  };

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
              <h1 className="text-2xl font-bold text-foreground">{driver.fullName}</h1>
              <Badge 
                variant="outline" 
                className={displayStatus === 'active' 
                  ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                  : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700'}
              >
                {displayStatus === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Central do Motorista</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {/* Delete button - only for inactive drivers */}
          {displayStatus === 'inactive' && (
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
                    Dados históricos (locações, multas) serão preservados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteDriver}>
                    Confirmar Exclusão
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {!hasActiveRental ? (
            <Button onClick={handleStartRental} className="gap-2">
              <Plus className="h-4 w-4" />
              Iniciar locação
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button disabled variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Iniciar locação
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Motorista já possui locação ativa. Para trocar de veículo, use a locação atual.</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seção 1: Dados do Motorista */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Dados do Motorista
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome Completo</p>
                <p className="font-medium">{driver.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{driver.phone}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge 
                  variant="outline" 
                  className={displayStatus === 'active' 
                    ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                    : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700'}
                >
                  {displayStatus === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CPF</p>
                <p className="font-medium">{driver.cpf || '—'}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">CNH</p>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{driver.cnh || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {driver.birthDate 
                      ? format(driver.birthDate, 'dd/MM/yyyy', { locale: ptBR })
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Filiação
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Pai: </span>
                    <span className="font-medium">{driver.fatherName || '—'}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Mãe: </span>
                    <span className="font-medium">{driver.motherName || '—'}</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 2: Veículo Atual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Veículo Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentVehicle ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Placa</p>
                    <p className="font-medium text-lg">
                      {currentVehicle.plate || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">VehicleID</p>
                    <p className="font-medium text-lg text-primary">
                      {currentVehicle.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Modelo</p>
                    <p className="font-medium">
                      {currentVehicle.make} {currentVehicle.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status do Veículo</p>
                    {vehicleStatus && <StatusBadge status={vehicleStatus.status} size="sm" />}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/vehicles/${currentVehicle.id}`)}
                >
                  Ver Detalhes do Veículo
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum veículo vinculado</p>
                <p className="text-xs mt-1 text-orange-600">
                  Para ativar o motorista, vincule um veículo (crie uma locação).
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção 3: Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <Label htmlFor="street">Rua</Label>
                <Input id="street" value={address.street} onChange={e => setAddress(p => ({ ...p, street: e.target.value }))} placeholder="Rua / Avenida" />
              </div>
              <div>
                <Label htmlFor="number">Número</Label>
                <Input id="number" value={address.number} onChange={e => setAddress(p => ({ ...p, number: e.target.value }))} placeholder="123" />
              </div>
              <div>
                <Label htmlFor="complement">Complemento</Label>
                <Input id="complement" value={address.complement} onChange={e => setAddress(p => ({ ...p, complement: e.target.value }))} placeholder="Apto 101" />
              </div>
              <div>
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input id="neighborhood" value={address.neighborhood} onChange={e => setAddress(p => ({ ...p, neighborhood: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input id="state" value={address.state} onChange={e => setAddress(p => ({ ...p, state: e.target.value }))} placeholder="SP" maxLength={2} />
              </div>
              <div>
                <Label htmlFor="zipCode">CEP</Label>
                <Input id="zipCode" value={address.zipCode} onChange={e => setAddress(p => ({ ...p, zipCode: formatCEP(e.target.value) }))} placeholder="00000-000" />
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSaveAddress}>
              Salvar Endereço
            </Button>
          </CardContent>
        </Card>

        {/* Seção 4: Notas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-primary" />
              Notas
            </CardTitle>
            <CardDescription>Anotações sobre o motorista</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Escreva uma nota..."
                className="min-h-[80px]"
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
              Adicionar Nota
            </Button>
            
            {notes.length > 0 && (
              <div className="space-y-3 mt-4">
                {notes.map(note => (
                  <div key={note.id} className="p-3 rounded-lg bg-muted/50 border">
                    {editingNoteId === note.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingNoteContent}
                          onChange={(e) => setEditingNoteContent(e.target.value)}
                          className="min-h-[60px]"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEditNote}>Salvar</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingNoteId(null)}>Cancelar</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <p className="text-sm whitespace-pre-wrap flex-1">{note.content}</p>
                          {isAdmin && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditNote(note)}>
                                  <Pencil className="h-3.5 w-3.5 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setDeletingNoteId(note.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {note.author} • {format(note.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {notes.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">Nenhuma nota registrada.</p>
            )}

            {/* Delete note confirmation */}
            <AlertDialog open={!!deletingNoteId} onOpenChange={(open) => !open && setDeletingNoteId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir nota?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteNote}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Seção 5: Multas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Multas
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/fines?driverId=${driver.id}`)}
              >
                Ver todas
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <CardDescription>Multas vinculadas a este motorista</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Multas em aberto</p>
                <p className="text-2xl font-bold">{openFinesCount}</p>
              </div>
              {openFinesCount > 0 ? (
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                  Pendente
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                  Regular
                </Badge>
              )}
            </div>
            
            {openFines.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  {openFines.slice(0, 3).map(fine => (
                    <div 
                      key={fine.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => navigate(`/fines/${fine.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {fine.infractionDescription}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Vence: {format(fine.dueDate, 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                      <Badge className={fineStatusColors[fine.status]} variant="secondary">
                        {fineStatusLabels[fine.status]}
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Seção 6: Documentos */}
        <DocumentsCard
          title="Documentos"
          description="Documentos do motorista"
          scope="DRIVER"
          scopeId={driver.id}
          documents={documents}
          docTypes={driverDocTypes}
          docTypeLabels={driverDocTypeLabels}
          onUpload={handleDocumentUpload}
          onDelete={handleDocumentDelete}
        />

        {/* Seção 7: Financeiro */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Financeiro
            </CardTitle>
            <CardDescription>Boletos e pagamentos do motorista</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mb-2 opacity-30" />
              <p className="text-sm">Módulo financeiro em desenvolvimento</p>
              <p className="text-xs mt-1">Em breve você poderá gerenciar boletos e pagamentos aqui.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DriverDetailPage;
