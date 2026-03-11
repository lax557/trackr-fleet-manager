import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContractTemplate } from '@/services/contracts.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [version, setVersion] = useState('v1.0');
  const [contractType, setContractType] = useState('weekly');
  const [defaultDuration, setDefaultDuration] = useState('1');
  const [allowEditBeforeSend, setAllowEditBeforeSend] = useState(true);
  const [content, setContent] = useState('');
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
      return data;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingTemplate && !loaded) {
      setName(existingTemplate.name);
      setIsActive(existingTemplate.is_active);
      setContent(existingTemplate.body);
      setVersion((existingTemplate as any).version || 'v1.0');
      setContractType((existingTemplate as any).contract_type || 'weekly');
      setDefaultDuration(((existingTemplate as any).default_duration_months || 1).toString());
      setAllowEditBeforeSend((existingTemplate as any).allow_edit_before_send ?? true);
      setLoaded(true);
    }
  }, [existingTemplate, loaded]);

  // For new templates, set default content
  useEffect(() => {
    if (!isEditing && !content) {
      setContent('<h1>CONTRATO DE LOCAÇÃO DE VEÍCULO</h1><p>Insira o conteúdo do contrato aqui...</p>');
    }
  }, [isEditing, content]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error('Informe o nome do modelo.');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('user_id', user.id).single();
      if (!profile) throw new Error('Profile not found');

      const payload = {
        name: name.trim(),
        body: content,
        is_active: isActive,
        version,
        contract_type: contractType,
        default_duration_months: parseInt(defaultDuration) || 1,
        allow_edit_before_send: allowEditBeforeSend,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('contract_templates')
          .update(payload as any)
          .eq('id', id!);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contract_templates')
          .insert({
            company_id: profile.company_id,
            ...payload,
          } as any);
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
            <div className="space-y-2">
              <Label htmlFor="version">Versão</Label>
              <Input id="version" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="v1.0" />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Contrato</Label>
              <Select value={contractType} onValueChange={setContractType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duração Padrão (meses)</Label>
              <Input id="duration" type="number" min="1" value={defaultDuration} onChange={(e) => setDefaultDuration(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="editToggle">Permitir edição antes de enviar</Label>
              <Switch id="editToggle" checked={allowEditBeforeSend} onCheckedChange={setAllowEditBeforeSend} />
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
            <div className="prose prose-sm max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ContractTemplateEditorPage;
