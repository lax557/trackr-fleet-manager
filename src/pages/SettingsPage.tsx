import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, User, Palette, Save, LogOut, Users } from 'lucide-react';
import { toast } from 'sonner';
import { roleLabels } from '@/types/roles';

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { can } = usePermissions();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(theme);
  const [saving, setSaving] = useState(false);

  // Sync from profile when it loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone((profile as any).phone || '');
    }
  }, [profile]);

  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone.replace(/\D/g, '') || null,
          theme: selectedTheme,
        })
        .eq('user_id', user.id);
      if (error) throw error;
      setTheme(selectedTheme);
      toast.success('Perfil salvo com sucesso!');
    } catch (err: any) {
      toast.error(`Erro ao salvar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const initials = (fullName || user?.email || '')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground text-sm">Perfil e preferências</p>
        </div>
      </div>

      {/* Admin link */}
      {can('settings:manage_users') && (
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/settings/users')}>
          <CardContent className="flex items-center gap-4 py-4">
            <Users className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium">Usuários e Permissões</p>
              <p className="text-sm text-muted-foreground">Gerencie cargos e acessos da equipe</p>
            </div>
            <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
          </CardContent>
        </Card>
      )}

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Perfil</CardTitle>
          </div>
          <CardDescription>Suas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border-2 border-border">
              {initials}
            </div>
            <div>
              <p className="font-medium text-lg">{fullName || user?.email}</p>
              <p className="text-sm text-muted-foreground">
                {roleLabels[profile?.role as keyof typeof roleLabels] || profile?.role}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formatPhone(phone)}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail (somente leitura)</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Cargo</Label>
              <Input
                id="role"
                value={roleLabels[profile?.role as keyof typeof roleLabels] || profile?.role || ''}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Aparência</CardTitle>
          </div>
          <CardDescription>Personalize a interface do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label>Tema</Label>
            <RadioGroup
              value={selectedTheme}
              onValueChange={(value) => setSelectedTheme(value as 'light' | 'dark' | 'system')}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="light" id="theme-light" className="peer sr-only" />
                <Label
                  htmlFor="theme-light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <div className="mb-2 h-8 w-8 rounded-full bg-white border shadow-sm" />
                  <span className="text-sm font-medium">Claro</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="dark" id="theme-dark" className="peer sr-only" />
                <Label
                  htmlFor="theme-dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <div className="mb-2 h-8 w-8 rounded-full bg-slate-800 border shadow-sm" />
                  <span className="text-sm font-medium">Escuro</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem value="system" id="theme-system" className="peer sr-only" />
                <Label
                  htmlFor="theme-system"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <div className="mb-2 h-8 w-8 rounded-full bg-gradient-to-br from-white to-slate-800 border shadow-sm" />
                  <span className="text-sm font-medium">Sistema</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
}

export default SettingsPage;
