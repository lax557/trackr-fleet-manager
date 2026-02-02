import { 
  Vehicle, 
  Driver, 
  Rental, 
  VehicleStatusHistory, 
  AcquisitionPipeline, 
  VehicleFinanceBasic,
  VehicleWithDetails,
  VehicleStats,
  Fine,
  DriverWithDetails,
  FileRecord,
  VehicleDocType,
  DriverDocType
} from '@/types';

// Drivers - Extended with new fields
export const mockDrivers: Driver[] = [
  { id: 'd1', fullName: 'Carlos Eduardo Silva', phone: '(11) 98765-4321', status: 'active', cpf: '123.456.789-00', cnh: '12345678901', birthDate: new Date('1985-03-15'), fatherName: 'José Silva', motherName: 'Maria Silva' },
  { id: 'd2', fullName: 'Maria Fernanda Santos', phone: '(11) 97654-3210', status: 'active', cpf: '234.567.890-11', cnh: '23456789012', birthDate: new Date('1990-07-22'), fatherName: 'Pedro Santos', motherName: 'Ana Santos' },
  { id: 'd3', fullName: 'João Pedro Oliveira', phone: '(11) 96543-2109', status: 'active', cpf: '345.678.901-22', cnh: '34567890123', birthDate: new Date('1988-11-08'), fatherName: 'Paulo Oliveira', motherName: 'Lucia Oliveira' },
  { id: 'd4', fullName: 'Ana Beatriz Costa', phone: '(11) 95432-1098', status: 'active', cpf: '456.789.012-33', cnh: '45678901234', birthDate: new Date('1992-05-30'), fatherName: 'Roberto Costa', motherName: 'Clara Costa' },
  { id: 'd5', fullName: 'Lucas Henrique Lima', phone: '(11) 94321-0987', status: 'active', cpf: '567.890.123-44', cnh: '56789012345', birthDate: new Date('1995-09-12'), fatherName: 'Fernando Lima', motherName: 'Sandra Lima' },
  { id: 'd6', fullName: 'Juliana Almeida Rocha', phone: '(11) 93210-9876', status: 'inactive', cpf: '678.901.234-55', cnh: '67890123456', birthDate: new Date('1987-01-25'), fatherName: 'Marcos Rocha', motherName: 'Teresa Rocha' },
  { id: 'd7', fullName: 'Rafael Souza Martins', phone: '(11) 92109-8765', status: 'active', cpf: null, cnh: null, birthDate: null, fatherName: null, motherName: null },
  { id: 'd8', fullName: 'Fernanda Dias Pereira', phone: '(11) 91098-7654', status: 'active', cpf: null, cnh: null, birthDate: null, fatherName: null, motherName: null },
  { id: 'd9', fullName: 'Bruno Carvalho Nunes', phone: '(11) 90987-6543', status: 'active', cpf: null, cnh: null, birthDate: null, fatherName: null, motherName: null },
  { id: 'd10', fullName: 'Camila Ribeiro Gomes', phone: '(11) 89876-5432', status: 'active', cpf: null, cnh: null, birthDate: null, fatherName: null, motherName: null },
];

// Vehicles
export const mockVehicles: Vehicle[] = [
  { id: 'TRK-001', plate: 'ABC1D23', make: 'Chevrolet', model: 'Onix', version: '1.0 LT', year: 2023, category: 'A', vin: '9BGKS48B0NG123456', createdAt: new Date('2023-01-15'), updatedAt: new Date('2024-01-10') },
  { id: 'TRK-002', plate: 'DEF4E56', make: 'Fiat', model: 'Mobi', version: '1.0 Like', year: 2023, category: 'A', vin: '9BD195167P0123456', createdAt: new Date('2023-02-20'), updatedAt: new Date('2024-01-10') },
  { id: 'TRK-003', plate: 'GHI7F89', make: 'Hyundai', model: 'HB20', version: '1.0 Sense', year: 2024, category: 'B', vin: '9BHBG41DBPP123456', createdAt: new Date('2023-03-10'), updatedAt: new Date('2024-01-10') },
  { id: 'TRK-004', plate: 'JKL0G12', make: 'Volkswagen', model: 'Polo', version: '1.0 TSI', year: 2024, category: 'B', vin: '9BWAA05U1PP123456', createdAt: new Date('2023-04-05'), updatedAt: new Date('2024-01-10') },
  { id: 'TRK-005', plate: 'MNO3H45', make: 'Toyota', model: 'Corolla', version: '2.0 XEi', year: 2024, category: 'C', vin: '9BR53ZEC1P0123456', createdAt: new Date('2023-05-12'), updatedAt: new Date('2024-01-10') },
  { id: 'TRK-006', plate: 'PQR6I78', make: 'Chevrolet', model: 'Spin', version: '1.8 LTZ', year: 2023, category: 'B', vin: '9BGJE752XPG123456', createdAt: new Date('2023-06-18'), updatedAt: new Date('2024-01-10') },
  { id: 'TRK-007', plate: 'STU9J01', make: 'Fiat', model: 'Argo', version: '1.3 Drive', year: 2024, category: 'A', vin: '9BD358227P5123456', createdAt: new Date('2023-07-22'), updatedAt: new Date('2024-01-10') },
  { id: 'TRK-008', plate: null, make: 'Chevrolet', model: 'Onix Plus', version: '1.0 Premier', year: 2025, category: 'B', vin: null, createdAt: new Date('2024-01-05'), updatedAt: new Date('2024-01-10') },
  { id: 'TRK-009', plate: null, make: 'Hyundai', model: 'Creta', version: '1.6 Action', year: 2025, category: 'C', vin: null, createdAt: new Date('2024-01-08'), updatedAt: new Date('2024-01-10') },
  { id: 'TRK-010', plate: null, make: 'Toyota', model: 'Yaris', version: '1.5 XL', year: 2025, category: 'B', vin: null, createdAt: new Date('2024-01-10'), updatedAt: new Date('2024-01-10') },
];

// Rentals
export const mockRentals: Rental[] = [
  { id: 'r1', driverId: 'd1', vehicleId: 'TRK-001', startDate: new Date('2024-01-01'), endDate: null, status: 'ACTIVE' },
  { id: 'r2', driverId: 'd2', vehicleId: 'TRK-003', startDate: new Date('2024-01-05'), endDate: null, status: 'ACTIVE' },
  { id: 'r3', driverId: 'd3', vehicleId: 'TRK-004', startDate: new Date('2024-01-10'), endDate: null, status: 'ACTIVE' },
  { id: 'r4', driverId: 'd4', vehicleId: 'TRK-005', startDate: new Date('2024-01-12'), endDate: null, status: 'ACTIVE' },
  { id: 'r5', driverId: 'd5', vehicleId: 'TRK-007', startDate: new Date('2024-01-15'), endDate: null, status: 'ACTIVE' },
];

// Vehicle Status History (current status is the most recent)
export const mockStatusHistory: VehicleStatusHistory[] = [
  { id: 'sh1', vehicleId: 'TRK-001', status: 'ALUGADO', statusSince: new Date('2024-01-01'), note: 'Locado para Carlos Eduardo', changedBy: 'admin', changedAt: new Date('2024-01-01') },
  { id: 'sh2', vehicleId: 'TRK-002', status: 'DISPONIVEL', statusSince: new Date('2024-01-10'), note: 'Disponível para locação', changedBy: 'admin', changedAt: new Date('2024-01-10') },
  { id: 'sh3', vehicleId: 'TRK-003', status: 'ALUGADO', statusSince: new Date('2024-01-05'), note: 'Locado para Maria Fernanda', changedBy: 'admin', changedAt: new Date('2024-01-05') },
  { id: 'sh4', vehicleId: 'TRK-004', status: 'ALUGADO', statusSince: new Date('2024-01-10'), note: 'Locado para João Pedro', changedBy: 'admin', changedAt: new Date('2024-01-10') },
  { id: 'sh5', vehicleId: 'TRK-005', status: 'ALUGADO', statusSince: new Date('2024-01-12'), note: 'Locado para Ana Beatriz', changedBy: 'admin', changedAt: new Date('2024-01-12') },
  { id: 'sh6', vehicleId: 'TRK-006', status: 'MANUTENCAO', statusSince: new Date('2024-01-18'), note: 'Revisão programada 30.000km', changedBy: 'maintenance', changedAt: new Date('2024-01-18') },
  { id: 'sh7', vehicleId: 'TRK-007', status: 'ALUGADO', statusSince: new Date('2024-01-15'), note: 'Locado para Lucas Henrique', changedBy: 'admin', changedAt: new Date('2024-01-15') },
  { id: 'sh8', vehicleId: 'TRK-008', status: 'EM_LIBERACAO', statusSince: new Date('2024-01-05'), note: 'Aguardando faturamento', changedBy: 'admin', changedAt: new Date('2024-01-05') },
  { id: 'sh9', vehicleId: 'TRK-009', status: 'EM_LIBERACAO', statusSince: new Date('2024-01-08'), note: 'Consórcio contemplado', changedBy: 'admin', changedAt: new Date('2024-01-08') },
  { id: 'sh10', vehicleId: 'TRK-010', status: 'EM_LIBERACAO', statusSince: new Date('2024-01-10'), note: 'Aguardando aprovação financiamento', changedBy: 'admin', changedAt: new Date('2024-01-10') },
];

// Acquisition Pipeline (for backlog vehicles)
export const mockAcquisitions: AcquisitionPipeline[] = [
  { id: 'acq1', vehicleId: 'TRK-008', stage: 'FATURADO', purchaseMode: 'FINANCIAMENTO', supplierOrGroup: 'Santander', expectedDate: new Date('2024-02-15'), notes: 'Aguardando emplacamento' },
  { id: 'acq2', vehicleId: 'TRK-009', stage: 'APROVADO', purchaseMode: 'CONSORCIO', supplierOrGroup: 'Rodobens', expectedDate: new Date('2024-03-01'), notes: 'Carta contemplada mês anterior' },
  { id: 'acq3', vehicleId: 'TRK-010', stage: 'EM_LIBERACAO', purchaseMode: 'FINANCIAMENTO', supplierOrGroup: 'BV Financeira', expectedDate: new Date('2024-02-28'), notes: 'Em análise de crédito' },
];

// Finance Basic - Updated with new fields
export const mockFinance: VehicleFinanceBasic[] = [
  { id: 'fin1', vehicleId: 'TRK-001', purchaseDate: new Date('2023-01-15'), purchasePrice: 75000, fipeValue: 72000, downPayment: 15000, installmentValue: 1800, installmentsTotal: 48, installmentsPaid: 12, purchaseMode: 'FINANCIAMENTO', paymentStatus: 'EM_PAGAMENTO' },
  { id: 'fin2', vehicleId: 'TRK-002', purchaseDate: new Date('2023-02-20'), purchasePrice: 58000, fipeValue: 55000, downPayment: 58000, installmentValue: null, installmentsTotal: null, installmentsPaid: null, purchaseMode: 'A_VISTA', paymentStatus: 'QUITADO' },
  { id: 'fin3', vehicleId: 'TRK-003', purchaseDate: new Date('2023-03-10'), purchasePrice: 82000, fipeValue: 80000, downPayment: 20000, installmentValue: 2100, installmentsTotal: 36, installmentsPaid: 10, purchaseMode: 'FINANCIAMENTO', paymentStatus: 'EM_PAGAMENTO' },
  { id: 'fin4', vehicleId: 'TRK-004', purchaseDate: new Date('2023-04-05'), purchasePrice: 95000, fipeValue: 92000, downPayment: 25000, installmentValue: 2400, installmentsTotal: 36, installmentsPaid: 9, purchaseMode: 'CONSORCIO', paymentStatus: 'EM_PAGAMENTO' },
  { id: 'fin5', vehicleId: 'TRK-005', purchaseDate: new Date('2023-05-12'), purchasePrice: 145000, fipeValue: 140000, downPayment: 50000, installmentValue: 3200, installmentsTotal: 36, installmentsPaid: 8, purchaseMode: 'A_VISTA_MAIS_CREDITO', paymentStatus: 'EM_PAGAMENTO' },
];

// Fines (multas)
export const mockFines: Fine[] = [
  { id: 'f1', driverId: 'd1', vehicleId: 'TRK-001', rentalId: 'r1', infraction: 'Excesso de velocidade', date: new Date('2024-01-20'), value: 293.47, status: 'ABERTA' },
  { id: 'f2', driverId: 'd1', vehicleId: 'TRK-001', rentalId: 'r1', infraction: 'Estacionamento irregular', date: new Date('2024-01-22'), value: 195.23, status: 'ABERTA' },
  { id: 'f3', driverId: 'd2', vehicleId: 'TRK-003', rentalId: 'r2', infraction: 'Avanço de sinal vermelho', date: new Date('2024-01-18'), value: 293.47, status: 'ABERTA' },
  { id: 'f4', driverId: 'd3', vehicleId: 'TRK-004', rentalId: 'r3', infraction: 'Excesso de velocidade', date: new Date('2024-01-10'), value: 130.16, status: 'PAGA' },
  { id: 'f5', driverId: 'd4', vehicleId: 'TRK-005', rentalId: 'r4', infraction: 'Estacionamento em local proibido', date: new Date('2024-01-25'), value: 195.23, status: 'CONTESTADA' },
];

// Files (documents) - Sample data
export const mockFiles: FileRecord[] = [
  { id: 'file1', scope: 'VEHICLE', scopeId: 'TRK-001', docType: 'CRLV', fileName: 'CRLV_2024.pdf', fileUrl: '/docs/crlv_trk001.pdf', mimeType: 'application/pdf', uploadedAt: new Date('2024-01-15'), uploadedBy: 'admin' },
  { id: 'file2', scope: 'VEHICLE', scopeId: 'TRK-001', docType: 'CONTRATO_COMPRA', fileName: 'Contrato_Compra.pdf', fileUrl: '/docs/contrato_trk001.pdf', mimeType: 'application/pdf', uploadedAt: new Date('2023-01-15'), uploadedBy: 'admin' },
  { id: 'file3', scope: 'DRIVER', scopeId: 'd1', docType: 'CONTRATO', fileName: 'Contrato_Locacao_Carlos.pdf', fileUrl: '/docs/contrato_d1.pdf', mimeType: 'application/pdf', uploadedAt: new Date('2024-01-01'), uploadedBy: 'admin' },
  { id: 'file4', scope: 'DRIVER', scopeId: 'd1', docType: 'CNH', fileName: 'CNH_Carlos.jpg', fileUrl: '/docs/cnh_d1.jpg', mimeType: 'image/jpeg', uploadedAt: new Date('2024-01-01'), uploadedBy: 'admin' },
  { id: 'file5', scope: 'DRIVER', scopeId: 'd2', docType: 'CONTRATO', fileName: 'Contrato_Locacao_Maria.pdf', fileUrl: '/docs/contrato_d2.pdf', mimeType: 'application/pdf', uploadedAt: new Date('2024-01-05'), uploadedBy: 'admin' },
];

// Helper to get current status for a vehicle
export const getCurrentStatus = (vehicleId: string): VehicleStatusHistory | undefined => {
  return mockStatusHistory
    .filter(sh => sh.vehicleId === vehicleId)
    .sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime())[0];
};

// Helper to get current driver for a vehicle
export const getCurrentDriver = (vehicleId: string): Driver | null => {
  const activeRental = mockRentals.find(r => r.vehicleId === vehicleId && r.status === 'ACTIVE');
  if (!activeRental) return null;
  return mockDrivers.find(d => d.id === activeRental.driverId) || null;
};

// Helper to get open fines count for a driver
export const getOpenFinesCountForDriver = (driverId: string): number => {
  return mockFines.filter(f => f.driverId === driverId && f.status === 'ABERTA').length;
};

// Helper to check if driver has active rental
export const hasActiveRental = (driverId: string): boolean => {
  return mockRentals.some(r => r.driverId === driverId && r.status === 'ACTIVE');
};

// Helper to get files for a scope
export const getFilesForScope = (scope: 'VEHICLE' | 'DRIVER', scopeId: string): FileRecord[] => {
  return mockFiles.filter(f => f.scope === scope && f.scopeId === scopeId);
};

// Get vehicles with all details
export const getVehiclesWithDetails = (): VehicleWithDetails[] => {
  return mockVehicles.map(vehicle => {
    const statusHistory = getCurrentStatus(vehicle.id);
    const currentDriver = getCurrentDriver(vehicle.id);
    const acquisition = mockAcquisitions.find(a => a.vehicleId === vehicle.id) || null;
    const finance = mockFinance.find(f => f.vehicleId === vehicle.id) || null;
    
    // Count open fines for the driver renting this vehicle
    const openFinesCount = currentDriver ? getOpenFinesCountForDriver(currentDriver.id) : 0;

    return {
      ...vehicle,
      currentStatus: statusHistory?.status || 'DISPONIVEL',
      statusSince: statusHistory?.statusSince || vehicle.createdAt,
      currentDriver,
      acquisition,
      finance,
      openFinesCount,
    };
  });
};

// Get drivers with all details - with business rule applied
export const getDriversWithDetails = (): DriverWithDetails[] => {
  return mockDrivers.map(driver => {
    const activeRental = mockRentals.find(r => r.driverId === driver.id && r.status === 'ACTIVE') || null;
    const currentVehicle = activeRental 
      ? mockVehicles.find(v => v.id === activeRental.vehicleId) || null 
      : null;
    const openFinesCount = getOpenFinesCountForDriver(driver.id);

    // REGRA DE NEGÓCIO: Motorista só pode ser ATIVO se tiver locação ativa
    const computedStatus: 'active' | 'inactive' = activeRental ? 'active' : 'inactive';

    return {
      ...driver,
      activeRental,
      currentVehicle,
      openFinesCount,
      computedStatus,
    };
  });
};

// Get stats
export const getVehicleStats = (): VehicleStats => {
  const vehicles = getVehiclesWithDetails();
  return {
    total: vehicles.length,
    disponivel: vehicles.filter(v => v.currentStatus === 'DISPONIVEL').length,
    alugado: vehicles.filter(v => v.currentStatus === 'ALUGADO').length,
    manutencao: vehicles.filter(v => v.currentStatus === 'MANUTENCAO').length,
    sinistro: vehicles.filter(v => v.currentStatus === 'SINISTRO').length,
    paraVenda: vehicles.filter(v => v.currentStatus === 'PARA_VENDA').length,
    emLiberacao: vehicles.filter(v => v.currentStatus === 'EM_LIBERACAO').length,
  };
};

// Status labels
export const statusLabels: Record<string, string> = {
  DISPONIVEL: 'Disponível',
  ALUGADO: 'Alugado',
  MANUTENCAO: 'Manutenção',
  SINISTRO: 'Sinistro',
  PARA_VENDA: 'Para Venda',
  EM_LIBERACAO: 'Em Liberação',
};

export const stageLabels: Record<string, string> = {
  EM_LIBERACAO: 'Em Liberação',
  APROVADO: 'Aprovado',
  FATURADO: 'Faturado',
  EMPLACADO: 'Emplacado',
  RECEBIDO: 'Recebido',
  PRONTO_PARA_ALUGAR: 'Pronto p/ Alugar',
};

export const purchaseModeLabels: Record<string, string> = {
  CONSORCIO: 'Consórcio',
  FINANCIAMENTO: 'Financiamento',
  A_VISTA: 'À Vista',
  A_VISTA_MAIS_CREDITO: 'À Vista + Crédito',
};

export const paymentStatusLabels: Record<string, string> = {
  QUITADO: 'Quitado',
  EM_PAGAMENTO: 'Em Pagamento',
  NAO_INICIADO: 'Não Iniciado',
};

export const categoryLabels: Record<string, string> = {
  A: 'Categoria A',
  B: 'Categoria B',
  C: 'Categoria C',
};

export const vehicleDocTypeLabels: Record<VehicleDocType, string> = {
  CRLV: 'CRLV',
  CONTRATO_COMPRA: 'Contrato de Compra',
  ATPV: 'ATPV / ATPV-e',
  VISTORIA: 'Vistoria',
  BOLETO_TRANSFERENCIA: 'Boleto de Transferência',
  NOVO_CRLV: 'Novo CRLV',
  OUTROS: 'Outros',
};

export const driverDocTypeLabels: Record<DriverDocType, string> = {
  CONTRATO: 'Contrato',
  CNH: 'CNH',
  CPF_DOC: 'CPF (documento)',
  COMPROVANTE_RESIDENCIA: 'Comprovante de Residência',
  PERFIL_APP: 'Perfil Uber/99',
};
