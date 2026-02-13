import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockContractTemplates } from '@/data/mockData';
import { ContractTemplate } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ContractEditor } from '@/components/ContractEditor';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

type ContractType = 'SEMANAL' | 'MENSAL' | 'PERSONALIZADO';

export function ContractTemplateEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id && id !== 'new';

  const [templates] = useState<ContractTemplate[]>(() => {
    const saved = localStorage.getItem('trackr_contract_templates');
    return saved ? JSON.parse(saved, (key, value) => {
      if (key === 'createdAt') return new Date(value);
      return value;
    }) : [...mockContractTemplates];
  });

  const existingTemplate = useMemo(() => {
    if (!isEditing) return null;
    return templates.find(t => t.id === id) || null;
  }, [id, isEditing, templates]);

  const [name, setName] = useState(existingTemplate?.name || '');
  const [version, setVersion] = useState(existingTemplate?.version || 'v1.0');
  const [contractType, setContractType] = useState<ContractType>('SEMANAL');
  const [defaultDuration, setDefaultDuration] = useState('12');
  const [allowEditBeforeSend, setAllowEditBeforeSend] = useState(true);
  const [isActive, setIsActive] = useState(existingTemplate?.status === 'ACTIVE' || !isEditing);
  const [content, setContent] = useState(existingTemplate?.templateBody || '<h1>CONTRATO DE LOCAÇÃO DE VEÍCULO</h1><p>Insira o conteúdo do contrato aqui...</p>');
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Informe o nome do modelo.');
      return;
    }

    const savedTemplates: ContractTemplate[] = (() => {
      const saved = localStorage.getItem('trackr_contract_templates');
      return saved ? JSON.parse(saved, (key, value) => {
        if (key === 'createdAt') return new Date(value);
        return value;
      }) : [...mockContractTemplates];
    })();

    const templateData: ContractTemplate = {
      id: isEditing ? id! : `tpl_${Date.now()}`,
      name: name.trim(),
      version,
      status: isActive ? 'ACTIVE' : 'ARCHIVED',
      templateBody: content,
      createdAt: isEditing ? (existingTemplate?.createdAt || new Date()) : new Date(),
    };

    let updated: ContractTemplate[];
    if (isEditing) {
      updated = savedTemplates.map(t => t.id === id ? templateData : t);
    } else {
      updated = [...savedTemplates, templateData];
    }

    localStorage.setItem('trackr_contract_templates', JSON.stringify(updated));
    toast.success(isEditing ? 'Modelo atualizado!' : 'Modelo criado com sucesso!');
    navigate('/rentals/templates');
  };

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
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
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
              <Select value={contractType} onValueChange={(v) => setContractType(v as ContractType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEMANAL">Semanal</SelectItem>
                  <SelectItem value="MENSAL">Mensal</SelectItem>
                  <SelectItem value="PERSONALIZADO">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duração Padrão (meses)</Label>
              <Input id="duration" type="number" value={defaultDuration} onChange={(e) => setDefaultDuration(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="editBeforeSend">Permitir edição antes de enviar</Label>
              <Switch id="editBeforeSend" checked={allowEditBeforeSend} onCheckedChange={setAllowEditBeforeSend} />
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
            <DialogTitle>Preview — {name || 'Sem nome'} ({version})</DialogTitle>
          </DialogHeader>
          <div className="bg-white text-black p-8 rounded-lg shadow-inner border min-h-[500px]">
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            <div className="mt-8 pt-4 border-t text-xs text-gray-400 flex justify-between">
              <span>Trackr — Gestão de Frota</span>
              <span>{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ContractTemplateEditorPage;
