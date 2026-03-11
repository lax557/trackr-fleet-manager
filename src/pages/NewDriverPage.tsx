import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDriver } from '@/services/drivers.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Upload, User, FileText, Shield, AlertCircle, MapPin, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DocumentUpload {
  file: File | null;
  preview: string | null;
}

type WizardStep = 1 | 2 | 3 | 4;

const stepLabels: Record<WizardStep, string> = {
  1: 'Dados Pessoais',
  2: 'Documentos',
  3: 'Endereço',
  4: 'Revisão',
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

const formatCEP = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
};

export function NewDriverPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    cpf: '',
    cnh: '',
    birthDate: '',
    fatherName: '',
    motherName: '',
    profileAnalysis: '',
  });

  const [address, setAddress] = useState({
    street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: '',
  });

  const [documents, setDocuments] = useState<{
    cnh: DocumentUpload; residenceProof: DocumentUpload; appProfile: DocumentUpload;
  }>({
    cnh: { file: null, preview: null },
    residenceProof: { file: null, preview: null },
    appProfile: { file: null, preview: null },
  });

  const mutation = useMutation({
    mutationFn: createDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast({ title: 'Motorista cadastrado!', description: 'O motorista foi cadastrado como INATIVO. Vincule a um veículo para ativá-lo.' });
      navigate('/drivers');
    },
    onError: (err: any) => {
      toast({ title: 'Erro ao cadastrar', description: err.message, variant: 'destructive' });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (docType: 'cnh' | 'residenceProof' | 'appProfile', file: File | null) => {
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [docType]: { file, preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null },
      }));
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1: return !!(formData.fullName && formData.phone && formData.cpf && formData.cnh);
      case 2: return !!(documents.cnh.file && documents.residenceProof.file && documents.appProfile.file);
      case 3: return !!(address.street && address.number && address.neighborhood && address.city && address.state && address.zipCode);
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => { if (currentStep < 4 && canProceed()) setCurrentStep((prev) => (prev + 1) as WizardStep); };
  const handleBack = () => { if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as WizardStep); };

  const progressValue = (currentStep / 4) * 100;

  const handleSubmit = () => {
    if (!canProceed()) return;
    const addressParts = [address.street, address.number, address.complement, address.neighborhood, `${address.city}/${address.state}`, address.zipCode].filter(Boolean);
    mutation.mutate({
      full_name: formData.fullName,
      phone: formData.phone,
      cpf: formData.cpf,
      cnh: formData.cnh,
      birth_date: formData.birthDate || undefined,
      email: undefined,
      address_full: addressParts.join(', ') || undefined,
    });
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
          <p className="text-muted-foreground text-sm">Passo {currentStep} de 4: {stepLabels[currentStep]}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <Progress value={progressValue} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          {(Object.entries(stepLabels) as [string, string][]).map(([step, label]) => {
            const stepNum = Number(step);
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            return (
              <div key={step} className={`flex items-center gap-1 ${isCompleted || isCurrent ? 'text-primary font-medium' : ''}`}>
                {isCompleted ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : isCurrent ? (
                  <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground">{step}</div>
                ) : (
                  <div className="h-4 w-4 rounded-full border flex items-center justify-center text-[10px]">{step}</div>
                )}
                <span className="hidden sm:inline">{label}</span>
              </div>
            );
          })}
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

      <Card className="min-h-[400px]">
        <CardContent className="p-6">
          {/* Step 1: Personal Data */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Dados Pessoais</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input id="fullName" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} placeholder="Nome completo do motorista" required />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))} placeholder="(11) 99999-9999" required />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input id="cpf" value={formData.cpf} onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))} placeholder="000.000.000-00" required />
                </div>
                <div>
                  <Label htmlFor="cnh">Número da CNH *</Label>
                  <Input id="cnh" value={formData.cnh} onChange={(e) => handleInputChange('cnh', e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="00000000000" required />
                </div>
                <div>
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input id="birthDate" type="date" value={formData.birthDate} onChange={(e) => handleInputChange('birthDate', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="fatherName">Nome do Pai</Label>
                  <Input id="fatherName" value={formData.fatherName} onChange={(e) => handleInputChange('fatherName', e.target.value)} placeholder="Nome completo" />
                </div>
                <div>
                  <Label htmlFor="motherName">Nome da Mãe</Label>
                  <Input id="motherName" value={formData.motherName} onChange={(e) => handleInputChange('motherName', e.target.value)} placeholder="Nome completo" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Documents */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Documentos Obrigatórios</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['cnh', 'residenceProof', 'appProfile'] as const).map((docType) => {
                  const labels = { cnh: 'CNH (com EAR) *', residenceProof: 'Comprovante de Residência *', appProfile: 'Perfil Uber/99 *' };
                  return (
                    <div key={docType} className="space-y-2">
                      <Label>{labels[docType]}</Label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(docType, e.target.files?.[0] || null)} className="hidden" id={`${docType}-upload`} />
                        <label htmlFor={`${docType}-upload`} className="cursor-pointer">
                          {documents[docType].file ? (
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-green-600">✓ Arquivo selecionado</div>
                              <p className="text-xs text-muted-foreground truncate">{documents[docType].file.name}</p>
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
                  );
                })}
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <Label>Análise de Perfil</Label>
                </div>
                <Textarea value={formData.profileAnalysis} onChange={(e) => handleInputChange('profileAnalysis', e.target.value)} placeholder="Insira aqui observações sobre análise criminal, judicial, histórico geral do motorista..." className="min-h-[100px]" />
              </div>
            </div>
          )}

          {/* Step 3: Address */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Endereço</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="street">Rua *</Label>
                  <Input id="street" value={address.street} onChange={e => setAddress(p => ({ ...p, street: e.target.value }))} placeholder="Rua / Avenida" />
                </div>
                <div>
                  <Label htmlFor="number">Número *</Label>
                  <Input id="number" value={address.number} onChange={e => setAddress(p => ({ ...p, number: e.target.value }))} placeholder="123" />
                </div>
                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input id="complement" value={address.complement} onChange={e => setAddress(p => ({ ...p, complement: e.target.value }))} placeholder="Apto 101" />
                </div>
                <div>
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input id="neighborhood" value={address.neighborhood} onChange={e => setAddress(p => ({ ...p, neighborhood: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="city">Cidade *</Label>
                  <Input id="city" value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="state">Estado *</Label>
                  <Input id="state" value={address.state} onChange={e => setAddress(p => ({ ...p, state: e.target.value }))} placeholder="SP" maxLength={2} />
                </div>
                <div>
                  <Label htmlFor="zipCode">CEP *</Label>
                  <Input id="zipCode" value={address.zipCode} onChange={e => setAddress(p => ({ ...p, zipCode: formatCEP(e.target.value) }))} placeholder="00000-000" />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Check className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Revisão</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Dados Pessoais</CardTitle></CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">Nome:</span> {formData.fullName}</p>
                    <p><span className="text-muted-foreground">Telefone:</span> {formData.phone}</p>
                    <p><span className="text-muted-foreground">CPF:</span> {formData.cpf}</p>
                    <p><span className="text-muted-foreground">CNH:</span> {formData.cnh}</p>
                    {formData.birthDate && <p><span className="text-muted-foreground">Nascimento:</span> {formData.birthDate}</p>}
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Documentos</CardTitle></CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p className="text-green-600">✓ CNH: {documents.cnh.file?.name}</p>
                    <p className="text-green-600">✓ Comprovante: {documents.residenceProof.file?.name}</p>
                    <p className="text-green-600">✓ Perfil App: {documents.appProfile.file?.name}</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 md:col-span-2">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Endereço</CardTitle></CardHeader>
                  <CardContent className="text-sm">
                    <p>{address.street}, {address.number}{address.complement ? ` - ${address.complement}` : ''}</p>
                    <p>{address.neighborhood} — {address.city}/{address.state}</p>
                    <p>CEP: {address.zipCode}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={currentStep === 1 ? () => navigate('/drivers') : handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? 'Cancelar' : 'Voltar'}
        </Button>

        {currentStep < 4 ? (
          <Button onClick={handleNext} disabled={!canProceed()}>
            Próximo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            <Check className="h-4 w-4 mr-2" />
            {mutation.isPending ? 'Cadastrando...' : 'Cadastrar Motorista'}
          </Button>
        )}
      </div>
    </div>
  );
}

export default NewDriverPage;
