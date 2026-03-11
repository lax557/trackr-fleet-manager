import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, RefreshCw } from 'lucide-react';

type PageState = 'validating' | 'ready' | 'error' | 'success';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageState, setPageState] = useState<PageState>('validating');
  const navigate = useNavigate();

  useEffect(() => {
    let settled = false;

    const settle = (state: PageState) => {
      if (!settled) {
        settled = true;
        setPageState(state);
      }
    };

    // Listen for PASSWORD_RECOVERY event from Supabase auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        settle('ready');
      }
    });

    // Check hash fragment for recovery tokens (some providers put tokens in hash)
    const hash = window.location.hash;
    const search = window.location.search;

    const hasRecoveryInHash = hash.includes('type=recovery') || hash.includes('access_token');
    const hasRecoveryInSearch = search.includes('type=recovery') || search.includes('token_hash');

    if (hasRecoveryInHash || hasRecoveryInSearch) {
      // Give Supabase client a moment to process the tokens
      setTimeout(() => settle('ready'), 500);
    }

    // Timeout: if no token found after 2s, show error
    const timeout = setTimeout(() => settle('error'), 2000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (error) {
      toast.error(error.message || 'Erro ao redefinir senha');
    } else {
      setPageState('success');
      toast.success('Senha redefinida com sucesso!');
      // Sign out so user logs in fresh with new password
      await supabase.auth.signOut();
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  const logoImg = (
    <img
      src="/targa-logo.png"
      alt="Targa"
      className="h-16 sm:h-20 w-auto object-contain mx-auto mb-4"
      onError={(e) => {
        const el = e.currentTarget;
        el.style.display = 'none';
        const fb = document.createElement('div');
        fb.className = 'h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl mx-auto mb-4';
        fb.textContent = 'T';
        el.parentElement?.appendChild(fb);
      }}
    />
  );

  if (pageState === 'validating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            {logoImg}
            <p className="text-muted-foreground">Verificando link de recuperação...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pageState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {logoImg}
            <CardTitle className="text-2xl">Link inválido ou expirado</CardTitle>
            <CardDescription>
              O link de recuperação é inválido ou já expirou. Solicite um novo link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full" variant="default">
              <Link to="/forgot-password">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reenviar link de recuperação
              </Link>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pageState === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center space-y-4">
            {logoImg}
            <p className="text-lg font-semibold text-foreground">Senha redefinida com sucesso!</p>
            <p className="text-sm text-muted-foreground">Redirecionando para o login...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {logoImg}
          <CardTitle className="text-2xl">Nova Senha</CardTitle>
          <CardDescription>Defina sua nova senha de acesso</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              Voltar ao login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
