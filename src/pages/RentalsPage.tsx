import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRentalsWithDetails, rentalStatusLabels, priceFrequencyLabels, signatureStatusLabels } from '@/data/mockData';
import { RentalWithDetails, RentalStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Eye, Play, StopCircle, XCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const rentalStatusStyles: Record<RentalStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
  AWAITING_SIGNATURE: 'bg-amber-100 text-amber-700 border-amber-200',
  ACTIVE: 'bg-green-100 text-green-700 border-green-200',
  ENDED: 'bg-blue-100 text-blue-700 border-blue-200',
  CANCELED: 'bg-red-100 text-red-700 border-red-200',
};

const signatureStyles: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SENT: 'bg-amber-100 text-amber-700',
  SIGNED: 'bg-green-100 text-green-700',
};

export function RentalsPage() {
  const navigate = useNavigate();
  const rentals = useMemo(() => getRentalsWithDetails(), []);
  
  const stats = useMemo(() => ({
    total: rentals.length,
    active: rentals.filter(r => r.status === 'ACTIVE').length,
    draft: rentals.filter(r => r.status === 'DRAFT' || r.status === 'AWAITING_SIGNATURE').length,
    ended: rentals.filter(r => r.status === 'ENDED').length,
  }), [rentals]);

  const handleActivate = (rental: RentalWithDetails) => {
    // Validações
    if (rental.status !== 'DRAFT' && rental.status !== 'AWAITING_SIGNATURE') {
      toast.error('Apenas locações em rascunho ou aguardando assinatura podem ser ativadas.');
      return;
    }
    
    if (!rental.contract) {
      toast.error('A locação precisa ter um contrato gerado antes de ser ativada.');
      return;
    }

    if (rental.contract.signatureStatus !== 'SIGNED') {
      toast.warning('Atenção: O contrato ainda não foi assinado. Deseja ativar mesmo assim?');
      // Em uma aplicação real, mostraria um modal de confirmação
    }

    // Simula ativação
    toast.success(`Locação ativada! ${rental.driver.fullName} agora está ATIVO com o veículo ${rental.vehicle.plate || rental.vehicle.id}.`);
  };

  const handleEnd = (rental: RentalWithDetails) => {
    if (rental.status !== 'ACTIVE') {
      toast.error('Apenas locações ativas podem ser encerradas.');
      return;
    }
    toast.success(`Locação encerrada. Veículo ${rental.vehicle.plate || rental.vehicle.id} agora está DISPONÍVEL.`);
  };

  const handleCancel = (rental: RentalWithDetails) => {
    if (rental.status === 'ACTIVE') {
      toast.error('Locações ativas devem ser encerradas, não canceladas.');
      return;
    }
    toast.success('Locação cancelada.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Locações</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie locações e contratos de motoristas
          </p>
        </div>
        <Button onClick={() => navigate('/rentals/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Locação
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Encerradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.ended}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Motorista</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell className="font-medium">{rental.driver.fullName}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{rental.vehicle.plate || '—'}</span>
                      <span className="text-xs text-muted-foreground">{rental.vehicle.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={rentalStatusStyles[rental.status]}>
                      {rentalStatusLabels[rental.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(rental.startDate, 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        R$ {rental.priceAmount.toLocaleString('pt-BR')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {priceFrequencyLabels[rental.priceFrequency]}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {rental.contract ? (
                      <Badge variant="outline" className={signatureStyles[rental.contract.signatureStatus]}>
                        <FileText className="h-3 w-3 mr-1" />
                        {signatureStatusLabels[rental.contract.signatureStatus]}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/rentals/${rental.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        {(rental.status === 'DRAFT' || rental.status === 'AWAITING_SIGNATURE') && (
                          <DropdownMenuItem onClick={() => handleActivate(rental)}>
                            <Play className="h-4 w-4 mr-2" />
                            Ativar
                          </DropdownMenuItem>
                        )}
                        {rental.status === 'ACTIVE' && (
                          <DropdownMenuItem onClick={() => handleEnd(rental)}>
                            <StopCircle className="h-4 w-4 mr-2" />
                            Encerrar
                          </DropdownMenuItem>
                        )}
                        {rental.status !== 'ACTIVE' && rental.status !== 'ENDED' && (
                          <DropdownMenuItem 
                            onClick={() => handleCancel(rental)}
                            className="text-destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancelar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default RentalsPage;
