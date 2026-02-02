import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { VehicleStatus, VehicleCategory, VehicleWithDetails, AcquisitionStage, PurchaseMode } from '@/types';
import { getVehiclesWithDetails, getVehicleStats } from '@/data/mockData';
import { VehicleStatsCards } from '@/components/VehicleStatsCards';
import { VehicleSearch } from '@/components/VehicleSearch';
import { VehicleFilters } from '@/components/VehicleFilters';
import { VehiclesTable } from '@/components/VehiclesTable';
import { ChangeStatusModal } from '@/components/ChangeStatusModal';
import { MoveStageModal } from '@/components/MoveStageModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function VehiclesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<VehicleCategory | null>(null);
  const [noPlateFilter, setNoPlateFilter] = useState(false);
  const [backlogFilter, setBacklogFilter] = useState(false);

  // Modals
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithDetails | null>(null);

  const allVehicles = useMemo(() => getVehiclesWithDetails(), []);
  const stats = useMemo(() => getVehicleStats(), []);

  const filteredVehicles = useMemo(() => {
    return allVehicles.filter(v => {
      // Search
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        const matches = 
          v.id.toLowerCase().includes(lowerQuery) ||
          v.plate?.toLowerCase().includes(lowerQuery) ||
          `${v.make} ${v.model}`.toLowerCase().includes(lowerQuery);
        if (!matches) return false;
      }

      // Status filter
      if (statusFilter && v.currentStatus !== statusFilter) return false;

      // Category filter
      if (categoryFilter && v.category !== categoryFilter) return false;

      // No plate filter
      if (noPlateFilter && v.plate !== null) return false;

      // Backlog filter
      if (backlogFilter && v.currentStatus !== 'EM_LIBERACAO') return false;

      return true;
    });
  }, [allVehicles, searchQuery, statusFilter, categoryFilter, noPlateFilter, backlogFilter]);

  const handleStatusCardClick = (status: string | null) => {
    if (status === null) {
      setStatusFilter(null);
    } else {
      setStatusFilter(status as VehicleStatus);
    }
  };

  const handleViewDetails = (vehicleId: string) => {
    navigate(`/vehicles/${vehicleId}`);
  };

  const handleChangeStatus = (vehicleId: string) => {
    const vehicle = allVehicles.find(v => v.id === vehicleId);
    setSelectedVehicle(vehicle || null);
    setStatusModalOpen(true);
  };

  const handleMoveStage = (vehicleId: string) => {
    const vehicle = allVehicles.find(v => v.id === vehicleId);
    setSelectedVehicle(vehicle || null);
    setStageModalOpen(true);
  };

  const handleConfirmStatusChange = (vehicleId: string, newStatus: VehicleStatus, note: string, driverId?: string) => {
    // In a real app, this would update the database
    console.log('Status change:', { vehicleId, newStatus, note, driverId });
  };

  const handleConfirmStageMove = (vehicleId: string, stage: AcquisitionStage, purchaseMode: PurchaseMode, expectedDate: string, notes: string) => {
    // In a real app, this would update the database
    console.log('Stage move:', { vehicleId, stage, purchaseMode, expectedDate, notes });
  };

  const clearAllFilters = () => {
    setStatusFilter(null);
    setCategoryFilter(null);
    setNoPlateFilter(false);
    setBacklogFilter(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Veículos</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie sua frota de veículos
          </p>
        </div>
        <Button className="self-start sm:self-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Veículo
        </Button>
      </div>

      {/* Stats Cards */}
      <VehicleStatsCards 
        stats={stats} 
        onFilterClick={handleStatusCardClick}
        activeFilter={statusFilter}
      />

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <VehicleSearch 
          vehicles={allVehicles}
          onSearch={setSearchQuery}
          onSelectVehicle={handleViewDetails}
        />
        <VehicleFilters
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          noPlateFilter={noPlateFilter}
          backlogFilter={backlogFilter}
          onStatusChange={setStatusFilter}
          onCategoryChange={setCategoryFilter}
          onNoPlateChange={setNoPlateFilter}
          onBacklogChange={setBacklogFilter}
          onClearAll={clearAllFilters}
        />
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Exibindo {filteredVehicles.length} de {allVehicles.length} veículos
      </div>

      {/* Table */}
      <VehiclesTable
        vehicles={filteredVehicles}
        onViewDetails={handleViewDetails}
        onChangeStatus={handleChangeStatus}
        onMoveStage={handleMoveStage}
      />

      {/* Modals */}
      <ChangeStatusModal
        vehicle={selectedVehicle}
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        onConfirm={handleConfirmStatusChange}
      />

      <MoveStageModal
        vehicle={selectedVehicle}
        open={stageModalOpen}
        onOpenChange={setStageModalOpen}
        onConfirm={handleConfirmStageMove}
      />
    </div>
  );
}

export default VehiclesPage;
