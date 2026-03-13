import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchVehicleOwners, createVehicleOwner, VehicleOwner } from '@/services/vehicleOwners.service';
import { usePermissions } from '@/hooks/usePermissions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, ChevronsUpDown, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OwnerComboboxProps {
  value: string | null;
  onValueChange: (ownerId: string | null) => void;
  error?: boolean;
}

export function OwnerCombobox({ value, onValueChange, error }: OwnerComboboxProps) {
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  const { data: owners = [] } = useQuery({
    queryKey: ['vehicle-owners'],
    queryFn: fetchVehicleOwners,
  });

  const selected = owners.find(o => o.id === value);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn('w-full justify-between font-normal', error && 'border-destructive', !selected && 'text-muted-foreground')}
          >
            {selected ? `${selected.name}${selected.document ? ` — ${selected.document}` : ''}` : 'Selecione o proprietário'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar por nome ou documento..." />
            <CommandList>
              <CommandEmpty>Nenhum proprietário encontrado.</CommandEmpty>
              <CommandGroup>
                {owners.map(owner => (
                  <CommandItem
                    key={owner.id}
                    value={`${owner.name} ${owner.document || ''}`}
                    onSelect={() => {
                      onValueChange(owner.id === value ? null : owner.id);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn('mr-2 h-4 w-4', value === owner.id ? 'opacity-100' : 'opacity-0')} />
                    <div className="flex flex-col">
                      <span className="font-medium">{owner.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {owner.type}{owner.document ? ` — ${owner.document}` : ''}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            {can('vehicle:create') && (
              <div className="border-t p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={() => { setOpen(false); setModalOpen(true); }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar novo proprietário
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      <NewOwnerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreated={(owner) => {
          queryClient.invalidateQueries({ queryKey: ['vehicle-owners'] });
          onValueChange(owner.id);
        }}
      />
    </>
  );
}

function NewOwnerModal({ open, onOpenChange, onCreated }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (owner: VehicleOwner) => void;
}) {
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');

  const mutation = useMutation({
    mutationFn: createVehicleOwner,
    onSuccess: (owner) => {
      toast.success('Proprietário cadastrado!');
      onCreated(owner);
      onOpenChange(false);
      setType(''); setName(''); setDocument('');
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const handleSubmit = () => {
    if (!type || !name.trim()) {
      toast.error('Preencha tipo e nome.');
      return;
    }
    mutation.mutate({ type, name: name.trim(), document: document.trim() || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Novo Proprietário</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Tipo *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
                <SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nome *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo ou razão social" />
          </div>
          <div>
            <Label>CPF/CNPJ</Label>
            <Input value={document} onChange={e => setDocument(e.target.value)} placeholder="Documento" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
