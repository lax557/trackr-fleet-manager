import { VehicleStatus, VehicleCategory } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { statusLabels, categoryLabels } from '@/data/mockData';
import { Filter, X } from 'lucide-react';

interface VehicleFiltersProps {
  statusFilter: VehicleStatus | null;
  categoryFilter: VehicleCategory | null;
  noPlateFilter: boolean;
  backlogFilter: boolean;
  onStatusChange: (status: VehicleStatus | null) => void;
  onCategoryChange: (category: VehicleCategory | null) => void;
  onNoPlateChange: (value: boolean) => void;
  onBacklogChange: (value: boolean) => void;
  onClearAll: () => void;
}

export function VehicleFilters({
  statusFilter,
  categoryFilter,
  noPlateFilter,
  backlogFilter,
  onStatusChange,
  onCategoryChange,
  onNoPlateChange,
  onBacklogChange,
  onClearAll,
}: VehicleFiltersProps) {
  const hasFilters = statusFilter || categoryFilter || noPlateFilter || backlogFilter;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Filtros:</span>
      </div>

      <Select
        value={statusFilter || 'all'}
        onValueChange={(v) => onStatusChange(v === 'all' ? null : v as VehicleStatus)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {Object.entries(statusLabels).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={categoryFilter || 'all'}
        onValueChange={(v) => onCategoryChange(v === 'all' ? null : v as VehicleCategory)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant={noPlateFilter ? "secondary" : "outline"}
        size="sm"
        onClick={() => onNoPlateChange(!noPlateFilter)}
        className={noPlateFilter ? "border-primary text-primary" : ""}
      >
        Sem placa
      </Button>

      <Button
        variant={backlogFilter ? "secondary" : "outline"}
        size="sm"
        onClick={() => onBacklogChange(!backlogFilter)}
        className={backlogFilter ? "border-primary text-primary" : ""}
      >
        Backlog
      </Button>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  );
}
