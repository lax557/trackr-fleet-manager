import { useParams, useNavigate } from 'react-router-dom';
import { getDriversWithDetails, mockVehicles, mockFines } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Phone, Car, AlertTriangle, FileText, Wallet } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { getCurrentStatus } from '@/data/mockData';

export function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const driversWithDetails = getDriversWithDetails();
  const driver = driversWithDetails.find(d => d.id === id);

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
                className={driver.status === 'active' 
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : 'bg-gray-100 text-gray-600 border-gray-200'}
              >
                {driver.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Central do Motorista</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seção 1: Dados do Motorista */}
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
                  className={driver.status === 'active' 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-gray-100 text-gray-600 border-gray-200'}
                >
                  {driver.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
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
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                  Pendente
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
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

        {/* Seção 4: Contrato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Contrato
            </CardTitle>
            <CardDescription>Informações contratuais do motorista</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mb-2 opacity-30" />
              <p className="text-sm">Módulo de contratos em desenvolvimento</p>
              <p className="text-xs mt-1">Em breve você poderá gerenciar contratos aqui.</p>
            </div>
          </CardContent>
        </Card>

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
