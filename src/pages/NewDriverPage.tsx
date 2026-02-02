import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, User, FileText, Shield, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DocumentUpload {
  file: File | null;
  preview: string | null;
}

export function NewDriverPage() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    cpf: '',
    cnh: '',
    birthDate: '',
    fatherName: '',
    motherName: '',
    profileAnalysis: '',
  });

  // Document uploads
  const [documents, setDocuments] = useState<{
    cnh: DocumentUpload;
    residenceProof: DocumentUpload;
    appProfile: DocumentUpload;
  }>({
    cnh: { file: null, preview: null },
    residenceProof: { file: null, preview: null },
    appProfile: { file: null, preview: null },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (docType: 'cnh' | 'residenceProof' | 'appProfile', file: File | null) => {
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [docType]: {
          file,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        },
      }));
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.phone || !formData.cpf || !formData.cnh) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    if (!documents.cnh.file || !documents.residenceProof.file || !documents.appProfile.file) {
      toast({
        title: 'Documentos obrigatórios',
        description: 'Faça upload de todos os documentos necessários.',
        variant: 'destructive',
      });
      return;
    }

    // In a real app, this would save to database
    console.log('Creating driver:', { formData, documents });
    
    toast({
      title: 'Motorista cadastrado!',
      description: 'O motorista foi cadastrado como INATIVO. Vincule a um veículo para ativá-lo.',
    });
    
    navigate('/drivers');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/drivers')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Novo Motorista</h1>
          <p className="text-muted-foreground text-sm">
            Cadastre um novo motorista na plataforma
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-800 dark:text-amber-400">Regra de Ativação</p>
          <p className="text-sm text-amber-700 dark:text-amber-500">
            O motorista será cadastrado como <strong>INATIVO</strong>. Para ativá-lo, vincule um veículo criando uma locação.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Data */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Dados Pessoais</CardTitle>
            </div>
            <CardDescription>Informações básicas do motorista</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Nome completo do motorista"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="cnh">Número da CNH *</Label>
              <Input
                id="cnh"
                value={formData.cnh}
                onChange={(e) => handleInputChange('cnh', e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="00000000000"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="fatherName">Nome do Pai</Label>
              <Input
                id="fatherName"
                value={formData.fatherName}
                onChange={(e) => handleInputChange('fatherName', e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            
            <div>
              <Label htmlFor="motherName">Nome da Mãe</Label>
              <Input
                id="motherName"
                value={formData.motherName}
                onChange={(e) => handleInputChange('motherName', e.target.value)}
                placeholder="Nome completo"
              />
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Documentos Obrigatórios</CardTitle>
            </div>
            <CardDescription>Faça upload dos documentos necessários</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CNH Upload */}
            <div className="space-y-2">
              <Label>CNH (com EAR) *</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('cnh', e.target.files?.[0] || null)}
                  className="hidden"
                  id="cnh-upload"
                />
                <label htmlFor="cnh-upload" className="cursor-pointer">
                  {documents.cnh.file ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-green-600">✓ Arquivo selecionado</div>
                      <p className="text-xs text-muted-foreground truncate">{documents.cnh.file.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Clique para upload</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Residence Proof Upload */}
            <div className="space-y-2">
              <Label>Comprovante de Residência *</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('residenceProof', e.target.files?.[0] || null)}
                  className="hidden"
                  id="residence-upload"
                />
                <label htmlFor="residence-upload" className="cursor-pointer">
                  {documents.residenceProof.file ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-green-600">✓ Arquivo selecionado</div>
                      <p className="text-xs text-muted-foreground truncate">{documents.residenceProof.file.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Clique para upload</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* App Profile Upload */}
            <div className="space-y-2">
              <Label>Perfil Uber/99 *</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('appProfile', e.target.files?.[0] || null)}
                  className="hidden"
                  id="profile-upload"
                />
                <label htmlFor="profile-upload" className="cursor-pointer">
                  {documents.appProfile.file ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-green-600">✓ Arquivo selecionado</div>
                      <p className="text-xs text-muted-foreground truncate">{documents.appProfile.file.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Clique para upload</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Análise de Perfil</CardTitle>
            </div>
            <CardDescription>
              Análise manual do histórico do motorista (criminal, judicial, etc.)
              <br />
              <span className="text-xs text-muted-foreground italic">
                * Preparado para futura integração com Brick.so
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.profileAnalysis}
              onChange={(e) => handleInputChange('profileAnalysis', e.target.value)}
              placeholder="Insira aqui observações sobre análise criminal, judicial, histórico geral do motorista..."
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/drivers')}>
            Cancelar
          </Button>
          <Button type="submit">
            Cadastrar Motorista
          </Button>
        </div>
      </form>
    </div>
  );
}

export default NewDriverPage;
