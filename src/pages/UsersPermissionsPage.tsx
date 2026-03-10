import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { SystemRole, roleLabels, roleDescriptions } from '@/types/roles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Shield, Users, Info } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const roles: SystemRole[] = ['operator', 'manager', 'executive', 'admin'];

interface ProfileRow {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  phone: string | null;
  created_at: string;
}

export default function UsersPermissionsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { can } = usePermissions();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['company-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, role, phone, created_at')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as ProfileRow[];
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ profileId, newRole }: { profileId: string; newRole: SystemRole }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profiles'] });
      toast.success('Cargo atualizado com sucesso!');
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  if (!can('settings:manage_users')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Acesso restrito a administradores.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuários e Permissões</h1>
          <p className="text-muted-foreground text-sm">Gerencie os usuários e seus cargos</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <CardDescription>
              Cargos definem as permissões de cada usuário no sistema. Para adicionar um novo usuário, peça que ele crie uma conta com email e senha — depois ajuste o cargo aqui.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Usuários</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="w-[200px]">Alterar cargo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((p) => {
                  const isCurrentUser = p.user_id === user?.id;
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{p.full_name}</p>
                          {isCurrentUser && (
                            <span className="text-xs text-muted-foreground">(você)</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{roleLabels[p.role as SystemRole] || p.role}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(p.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={p.role}
                          onValueChange={(v) => {
                            if (isCurrentUser && p.role === 'admin' && v !== 'admin') {
                              toast.error('Você não pode remover seu próprio cargo de admin.');
                              return;
                            }
                            updateRole.mutate({ profileId: p.id, newRole: v as SystemRole });
                          }}
                          disabled={isCurrentUser && p.role === 'admin'}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((r) => (
                              <SelectItem key={r} value={r}>
                                {roleLabels[r]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Descrição dos cargos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {roles.map((r) => (
            <div key={r} className="flex gap-3">
              <span className="font-medium text-sm min-w-[100px]">{roleLabels[r]}:</span>
              <span className="text-sm text-muted-foreground">{roleDescriptions[r]}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
