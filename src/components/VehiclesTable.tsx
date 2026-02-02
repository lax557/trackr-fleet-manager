import { VehicleWithDetails } from '@/types';
import { StatusBadge, StageBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, RefreshCcw, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VehiclesTableProps {
  vehicles: VehicleWithDetails[];
  onViewDetails: (vehicleId: string) => void;
  onChangeStatus: (vehicleId: string) => void;
  onMoveStage: (vehicleId: string) => void;
}

export function VehiclesTable({ 
  vehicles, 
  onViewDetails, 
  onChangeStatus, 
  onMoveStage 
}: VehiclesTableProps) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">ID</TableHead>
            <TableHead className="font-semibold">Placa</TableHead>
            <TableHead className="font-semibold">Modelo</TableHead>
            <TableHead className="font-semibold">Cat.</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Locatário</TableHead>
            <TableHead className="font-semibold">Desde</TableHead>
            <TableHead className="font-semibold">Etapa</TableHead>
            <TableHead className="font-semibold">Prev. Entrega</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
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
                <TableCell className="font-mono font-medium text-primary">
                  {vehicle.id}
                </TableCell>
                <TableCell className="font-mono">
                  {vehicle.plate || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{vehicle.make} {vehicle.model}</span>
                    <span className="text-xs text-muted-foreground">{vehicle.version}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {vehicle.category}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={vehicle.currentStatus} size="sm" />
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
                <TableCell className="text-sm text-muted-foreground">
                  {format(vehicle.statusSince, 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  {vehicle.acquisition ? (
                    <StageBadge stage={vehicle.acquisition.stage} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {vehicle.acquisition?.expectedDate ? (
                    format(vehicle.acquisition.expectedDate, 'dd/MM/yyyy', { locale: ptBR })
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
