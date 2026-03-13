import { VehicleWithDetails } from '@/types';
import { StatusBadge, StageBadge } from '@/components/StatusBadge';
import { CategoryBadge } from '@/components/CategoryBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, RefreshCcw, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function OpenFinesBadge({ count, hasDriver }: { count: number; hasDriver: boolean }) {
  if (!hasDriver) return <span className="text-muted-foreground">—</span>;
  if (count === 0) return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">Nenhuma</Badge>;
  if (count === 1) return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">1 aberta</Badge>;
  return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">{count}+ abertas</Badge>;
}

const ownerTypeLabels: Record<string, string> = {
  TARGA: 'Targa',
  PF: 'PF',
  PJ: 'PJ',
};

interface VehiclesTableProps {
  vehicles: VehicleWithDetails[];
  onViewDetails: (vehicleId: string) => void;
  onChangeStatus: (vehicleId: string) => void;
  onMoveStage: (vehicleId: string) => void;
}

export function VehiclesTable({ vehicles, onViewDetails, onChangeStatus, onMoveStage }: VehiclesTableProps) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Código</TableHead>
            <TableHead className="font-semibold">Placa</TableHead>
            <TableHead className="font-semibold">Modelo</TableHead>
            <TableHead className="font-semibold">Cat.</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Proprietário</TableHead>
            <TableHead className="font-semibold">Locatário</TableHead>
            <TableHead className="font-semibold">Multas Abertas</TableHead>
            <TableHead className="font-semibold">Desde</TableHead>
            <TableHead className="font-semibold">Etapa</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                Nenhum veículo encontrado.
              </TableCell>
            </TableRow>
          ) : (
            vehicles.map((vehicle, index) => (
              <TableRow 
                key={vehicle.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => onViewDetails(vehicle.id)}
              >
                <TableCell className="font-medium text-primary">
                  {(vehicle as any).vehicleCode || vehicle.id.slice(0, 8)}
                </TableCell>
                <TableCell>
                  {vehicle.plate || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{vehicle.make} {vehicle.model}</span>
                    <span className="text-xs text-muted-foreground">{vehicle.version}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <CategoryBadge category={vehicle.category} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={vehicle.currentStatus} size="sm" />
                </TableCell>
                <TableCell>
                  {(vehicle as any).ownerName ? (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{(vehicle as any).ownerName}</span>
                      <span className="text-xs text-muted-foreground">{ownerTypeLabels[(vehicle as any).ownerType] || ''}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {vehicle.currentDriver ? (
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{vehicle.currentDriver.fullName}</span>
                      <span className="text-xs text-muted-foreground">{vehicle.currentDriver.phone}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <OpenFinesBadge count={vehicle.openFinesCount} hasDriver={!!vehicle.currentDriver} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {(vehicle as any).deliveredAt
                    ? format((vehicle as any).deliveredAt, 'dd/MM/yyyy', { locale: ptBR })
                    : <span className="text-muted-foreground">Em liberação</span>
                  }
                </TableCell>
                <TableCell>
                  {vehicle.currentStatus === 'EM_LIBERACAO' && (vehicle as any).acquisitionStage ? (
                    <StageBadge stage={(vehicle as any).acquisitionStage} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDetails(vehicle.id); }}>
                        <Eye className="h-4 w-4 mr-2" />
                        Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onChangeStatus(vehicle.id); }}>
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Alterar status
                      </DropdownMenuItem>
                      {vehicle.currentStatus === 'EM_LIBERACAO' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMoveStage(vehicle.id); }}>
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Mover etapa
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
