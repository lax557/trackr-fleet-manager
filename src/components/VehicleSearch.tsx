import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { VehicleWithDetails } from '@/types';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface VehicleSearchProps {
  vehicles: VehicleWithDetails[];
  onSearch: (query: string) => void;
  onSelectVehicle?: (vehicleId: string) => void;
}

export function VehicleSearch({ vehicles, onSearch, onSelectVehicle }: VehicleSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredVehicles = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return vehicles.filter(v => 
      v.id.toLowerCase().includes(lowerQuery) ||
      v.plate?.toLowerCase().includes(lowerQuery) ||
      `${v.make} ${v.model}`.toLowerCase().includes(lowerQuery)
    ).slice(0, 8);
  }, [vehicles, query]);

  const handleSelect = (vehicleId: string) => {
    setOpen(false);
    onSelectVehicle?.(vehicleId);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <Popover open={open && filteredVehicles.length > 0} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID, placa ou modelo..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setOpen(true)}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>Nenhum veículo encontrado.</CommandEmpty>
            <CommandGroup heading="Veículos">
              {filteredVehicles.map((vehicle) => (
                <CommandItem
                  key={vehicle.id}
                  value={vehicle.id}
                  onSelect={() => handleSelect(vehicle.id)}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-primary">{vehicle.id}</span>
                      {vehicle.plate && (
                        <span className="text-sm text-muted-foreground">• {vehicle.plate}</span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {vehicle.make} {vehicle.model} {vehicle.version}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
