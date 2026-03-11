import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SystemRole, roleLabels } from '@/types/roles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const roles: SystemRole[] = ['operator', 'manager', 'executive', 'admin'];

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateUserModal({ open, onOpenChange, onSuccess }: CreateUserModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<SystemRole>('operator');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setRole('operator');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Senha deve ter pelo menos 8 caracteres');
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: { email, password, full_name: fullName, role },
    });
    setIsLoading(false);

    if (error || data?.error) {
      toast.error(data?.error || error?.message || 'Erro ao criar usuário');
      return;
    }

    toast.success('Usuário criado com sucesso!');
    resetForm();
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
          <DialogDescription>Crie um novo usuário para a empresa</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cu-name">Nome completo</Label>
            <Input id="cu-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cu-email">E-mail</Label>
            <Input id="cu-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cu-password">Senha</Label>
            <Input id="cu-password" type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </div>
          <div className="space-y-2">
            <Label>Cargo</Label>
            <Select value={role} onValueChange={(v) => setRole(v as SystemRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
