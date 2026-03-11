import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchContractTemplates, ContractTemplate } from '@/services/contracts.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ContractEditor } from '@/components/ContractEditor';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

export function ContractTemplateEditorPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const isEditing = !!id && id !== 'new';

  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [content, setContent] = useState('<h1>CONTRATO DE LOCAÇÃO DE VEÍCULO</h1><p>Insira o conteúdo do contrato aqui...</p>');
  const [showPreview, setShowPreview] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load existing template
  const { data: existingTemplate, isLoading } = useQuery({
    queryKey: ['contract-template', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as ContractTemplate;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingTemplate && !loaded) {
      setName(existingTemplate.name);
      setIsActive(existingTemplate.is_active);
      setContent(existingTemplate.body);
      setLoaded(true);
    }
  }, [existingTemplate, loaded]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error('Informe o nome do modelo.');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('user_id', user.id).single();
      if (!profile) throw new Error('Profile not found');

      if (isEditing) {
        const { error } = await supabase
          .from('contract_templates')
          .update({ name: name.trim(), body: content, is_active: isActive })
          .eq('id', id!);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contract_templates')
          .insert({
            company_id: profile.company_id,
            name: name.trim(),
            body: content,
            is_active: isActive,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
      queryClient.invalidateQueries({ queryKey: ['contract-template', id] });
      toast.success(isEditing ? 'Modelo atualizado!' : 'Modelo criado com sucesso!');
      navigate('/rentals/templates');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isEditing && isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/rentals/templates')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Editar Modelo' : 'Novo Modelo de Contrato'}
          </h1>
          <p className="text-muted-foreground text-sm">
            Configure e edite o conteúdo do modelo
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Modelo *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Contrato padrão motorista app" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="activeToggle">Ativo</Label>
              <Switch id="activeToggle" checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <ContractEditor content={content} onChange={setContent} />
        </div>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Preview — {name || 'Sem nome'}</DialogTitle>
          </DialogHeader>
          <div className="bg-white text-black p-8 rounded-lg shadow-inner border min-h-[500px]">
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ContractTemplateEditorPage;
