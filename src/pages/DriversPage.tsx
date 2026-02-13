import { useNavigate } from 'react-router-dom';
import { getDriversWithDetails } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Phone, User } from 'lucide-react';

export function DriversPage() {
  const navigate = useNavigate();
  const driversWithDetails = getDriversWithDetails();

  // Use computed status based on business rule (active only if has rental)
  const activeCount = driversWithDetails.filter(d => d.computedStatus === 'active').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Motoristas</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie seus locatários
          </p>
        </div>
        <Button className="self-start sm:self-auto" onClick={() => navigate('/drivers/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Motorista
        </Button>
      </div>

      {/* Stats - Removed "Com locação" card as it's duplicate of "Ativos" */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{driversWithDetails.length}</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Motoristas</CardTitle>
          <CardDescription>Todos os motoristas cadastrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>VehicleID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {driversWithDetails.map((driver) => (
                <TableRow 
                  key={driver.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/drivers/${driver.id}`)}
                >
                  <TableCell className="font-medium">{driver.fullName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {driver.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={driver.computedStatus === 'active' 
                        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                        : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700'}
                    >
                      {driver.computedStatus === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {driver.currentVehicle?.plate || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-primary">
                    {driver.currentVehicle?.id || <span className="text-muted-foreground">—</span>}
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

export default DriversPage;
