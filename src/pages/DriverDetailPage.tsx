import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { DriverDocType } from '@/types';
import { 
  getDriversWithDetails, 
  mockVehicles, 
  mockFines,
  getFilesForScope,
  driverDocTypeLabels,
  mockRentals
} from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DocumentsCard } from '@/components/DocumentsCard';
import { ArrowLeft, User, Phone, Car, AlertTriangle, Wallet, Calendar, CreditCard, Users, Plus } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { getCurrentStatus } from '@/data/mockData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const driverDocTypes: DriverDocType[] = [
  'CONTRATO',
  'CNH',
  'CPF_DOC',
  'COMPROVANTE_RESIDENCIA',
  'PERFIL_APP'
];

export function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const driversWithDetails = getDriversWithDetails();
  const driver = driversWithDetails.find(d => d.id === id);

  const documents = useMemo(() => {
    return id ? getFilesForScope('DRIVER', id) : [];
  }, [id]);

  const handleDocumentUpload = (docType: string, file: File) => {
    console.log('Upload document:', { docType, file, driverId: id });
    // In a real app, this would upload to storage and save metadata
  };

  const handleDocumentDelete = (fileId: string) => {
    console.log('Delete document:', { fileId });
    // In a real app, this would delete from storage
  };

  if (!driver) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-muted-foreground">Motorista não encontrado.</p>
        <Button variant="outline" onClick={() => navigate('/drivers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Motoristas
        </Button>
      </div>
    );
  }

  const currentVehicle = driver.currentVehicle;
  const vehicleStatus = currentVehicle ? getCurrentStatus(currentVehicle.id) : null;
  const openFinesCount = mockFines.filter(f => f.driverId === driver.id && f.status === 'ABERTA').length;

  // Use computed status based on business rules
  const displayStatus = driver.computedStatus;
  
  // Check if driver has an active rental
  const hasActiveRental = mockRentals.some(
    r => r.driverId === driver.id && r.status === 'ACTIVE'
  );
  
  const handleStartRental = () => {
    navigate(`/rentals/new?driverId=${driver.id}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/drivers')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{driver.fullName}</h1>
              <Badge 
                variant="outline" 
                className={displayStatus === 'active' 
                  ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                  : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700'}
              >
                {displayStatus === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Central do Motorista</p>
          </div>
        </div>
        
        {/* CTA: Iniciar locação */}
        {!hasActiveRental ? (
          <Button onClick={handleStartRental} className="gap-2">
            <Plus className="h-4 w-4" />
            Iniciar locação
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button disabled variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Iniciar locação
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Motorista já possui locação ativa. Para trocar de veículo, use a locação atual.</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seção 1: Dados do Motorista - Extended */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Dados do Motorista
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome Completo</p>
                <p className="font-medium">{driver.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{driver.phone}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge 
                  variant="outline" 
                  className={displayStatus === 'active' 
                    ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                    : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700'}
                >
                  {displayStatus === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CPF</p>
                <p className="font-mono font-medium">{driver.cpf || '—'}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">CNH</p>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <p className="font-mono font-medium">{driver.cnh || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {driver.birthDate 
                      ? format(driver.birthDate, 'dd/MM/yyyy', { locale: ptBR })
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Filiação
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Pai: </span>
                    <span className="font-medium">{driver.fatherName || '—'}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Mãe: </span>
                    <span className="font-medium">{driver.motherName || '—'}</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 2: Veículo Atual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Veículo Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentVehicle ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Placa</p>
                    <p className="font-mono font-medium text-lg">
                      {currentVehicle.plate || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">VehicleID</p>
                    <p className="font-mono font-medium text-lg text-primary">
                      {currentVehicle.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Modelo</p>
                    <p className="font-medium">
                      {currentVehicle.make} {currentVehicle.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status do Veículo</p>
                    {vehicleStatus && <StatusBadge status={vehicleStatus.status} size="sm" />}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/vehicles/${currentVehicle.id}`)}
                >
                  Ver Detalhes do Veículo
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum veículo vinculado</p>
                <p className="text-xs mt-1 text-orange-600">
                  Para ativar o motorista, vincule um veículo (crie uma locação).
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção 3: Multas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Multas
            </CardTitle>
            <CardDescription>Multas vinculadas a este motorista</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Multas em aberto</p>
                <p className="text-2xl font-bold">{openFinesCount}</p>
              </div>
              {openFinesCount > 0 ? (
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                  Pendente
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                  Regular
                </Badge>
              )}
            </div>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground text-center">
              Detalhamento de multas será implementado em versão futura.
            </p>
          </CardContent>
        </Card>

        {/* Seção 4: Documentos (antigo Contrato) */}
        <DocumentsCard
          title="Documentos"
          description="Documentos do motorista"
          scope="DRIVER"
          scopeId={driver.id}
          documents={documents}
          docTypes={driverDocTypes}
          docTypeLabels={driverDocTypeLabels}
          onUpload={handleDocumentUpload}
          onDelete={handleDocumentDelete}
        />

        {/* Seção 5: Financeiro */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Financeiro
            </CardTitle>
            <CardDescription>Boletos e pagamentos do motorista</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mb-2 opacity-30" />
              <p className="text-sm">Módulo financeiro em desenvolvimento</p>
              <p className="text-xs mt-1">Em breve você poderá gerenciar boletos e pagamentos aqui.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DriverDetailPage;
