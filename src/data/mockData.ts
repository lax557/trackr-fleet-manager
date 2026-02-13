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
  DriverDocType,
  ContractTemplate,
  Contract,
  RentalWithDetails,
  Maintenance,
  MaintenanceItem,
  MaintenanceWithVehicle,
  MaintenanceStatus,
  MaintenanceType,
  ServiceArea,
  Supplier,
  FleetManagementStats,
  VehicleStatus,
} from '@/types';

// ────────────────────────────────
// Drivers - 50 drivers for 45 rentals + extras
// ────────────────────────────────
function generateDrivers(): Driver[] {
  const firstNames = ['Carlos', 'Maria', 'João', 'Ana', 'Lucas', 'Juliana', 'Rafael', 'Fernanda', 'Bruno', 'Camila', 'Diego', 'Patricia', 'Thiago', 'Larissa', 'Gabriel', 'Beatriz', 'Rodrigo', 'Amanda', 'Felipe', 'Vanessa', 'Marcos', 'Isabela', 'André', 'Daniela', 'Gustavo', 'Renata', 'Leandro', 'Natália', 'Vinícius', 'Priscila', 'Eduardo', 'Tatiana', 'Henrique', 'Mariana', 'Ricardo', 'Aline', 'Pedro', 'Jéssica', 'Matheus', 'Carla', 'Sérgio', 'Elaine', 'Alexandre', 'Simone', 'Leonardo', 'Bianca', 'Renan', 'Cristina', 'Caio', 'Letícia'];
  const lastNames = ['Silva', 'Santos', 'Oliveira', 'Costa', 'Lima', 'Rocha', 'Martins', 'Pereira', 'Nunes', 'Gomes', 'Almeida', 'Souza', 'Ribeiro', 'Ferreira', 'Dias', 'Carvalho', 'Mendes', 'Araújo', 'Barbosa', 'Correia'];
  
  return firstNames.map((name, i) => ({
    id: `d${i + 1}`,
    fullName: `${name} ${lastNames[i % lastNames.length]}`,
    phone: `(11) 9${String(8000 + i * 111).slice(0, 4)}-${String(1000 + i * 73).slice(0, 4)}`,
    status: 'active' as const,
    cpf: i < 30 ? `${String(100 + i).slice(0, 3)}.${String(400 + i).slice(0, 3)}.${String(700 + i).slice(0, 3)}-${String(10 + i % 90).slice(0, 2)}` : null,
    cnh: i < 30 ? String(10000000000 + i * 1111111) : null,
    birthDate: i < 30 ? new Date(1980 + (i % 15), i % 12, 1 + (i % 28)) : null,
    fatherName: null,
    motherName: null,
  }));
}

export const mockDrivers: Driver[] = generateDrivers();

// ────────────────────────────────
// Vehicles - re-exported from vehiclesData
// ────────────────────────────────
import { vehiclesData } from './vehiclesData';
export const mockVehicles: Vehicle[] = vehiclesData;

// ────────────────────────────────
// Status distribution: 45 ALUGADO, 12 DISPONIVEL, 8 MANUTENCAO, 6 EM_LIBERACAO, 5 SINISTRO, 4 PARA_VENDA
// ────────────────────────────────
const statusDistribution: { status: VehicleStatus; count: number }[] = [
  { status: 'ALUGADO', count: 45 },
  { status: 'DISPONIVEL', count: 12 },
  { status: 'MANUTENCAO', count: 8 },
  { status: 'SINISTRO', count: 5 },
  { status: 'PARA_VENDA', count: 4 },
  { status: 'EM_LIBERACAO', count: 6 },
];

function buildStatusHistory(): VehicleStatusHistory[] {
  const history: VehicleStatusHistory[] = [];
  let vehicleIndex = 0;
  
  for (const { status, count } of statusDistribution) {
    for (let j = 0; j < count; j++) {
      const vehicle = mockVehicles[vehicleIndex];
      if (!vehicle) break;
      const statusSince = new Date(2024, 0, 1 + (vehicleIndex % 28));
      history.push({
        id: `sh${vehicleIndex + 1}`,
        vehicleId: vehicle.id,
        status,
        statusSince,
        note: `Status: ${status}`,
        changedBy: 'admin',
        changedAt: statusSince,
      });
      vehicleIndex++;
    }
  }
  
  return history;
}

export const mockStatusHistory: VehicleStatusHistory[] = buildStatusHistory();

// ────────────────────────────────
// Rentals - 45 active + 5 ended
// ────────────────────────────────
function buildRentals(): Rental[] {
  const rentals: Rental[] = [];
  const alugadoVehicles = mockStatusHistory
    .filter(sh => sh.status === 'ALUGADO')
    .map(sh => sh.vehicleId);
  
  for (let i = 0; i < alugadoVehicles.length; i++) {
    const isWeekly = i % 3 !== 0;
    // Spread start dates: some recent, some old enough to expire within 30 days (startDate + 12 months ≈ now)
    let startDate: Date;
    if (i < 10) {
      // These started ~12 months ago so they expire within 30 days (for "expiring contracts")
      const now = new Date();
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() - 20 + i * 3);
    } else {
      startDate = new Date(2024, Math.floor(i / 8), 1 + (i % 28));
    }
    
    rentals.push({
      id: `r${i + 1}`,
      driverId: `d${i + 1}`,
      vehicleId: alugadoVehicles[i],
      startDate,
      endDate: null,
      status: 'ACTIVE',
      priceAmount: isWeekly ? 550 + (i % 8) * 50 : 2200 + (i % 6) * 200,
      priceFrequency: isWeekly ? 'WEEKLY' : 'MONTHLY',
      dueDay: isWeekly ? null : 10,
      billingWeekday: isWeekly ? (['MON', 'TUE', 'WED', 'THU', 'FRI'] as const)[i % 5] : null,
      depositAmount: isWeekly ? 1200 + (i % 5) * 100 : 2500,
      notes: null,
    });
  }
  
  // 5 ended rentals
  for (let i = 0; i < 5; i++) {
    rentals.push({
      id: `r${alugadoVehicles.length + i + 1}`,
      driverId: `d${46 + i}`,
      vehicleId: mockVehicles[45 + i].id, // DISPONIVEL vehicles
      startDate: new Date(2023, 6, 1),
      endDate: new Date(2024, 0, 15),
      status: 'ENDED',
      priceAmount: 600,
      priceFrequency: 'WEEKLY',
      dueDay: null,
      billingWeekday: 'MON',
      depositAmount: 1200,
      notes: 'Locação encerrada',
    });
  }
  
  return rentals;
}

export const mockRentals: Rental[] = buildRentals();

// ────────────────────────────────
// Acquisition Pipeline - for EM_LIBERACAO vehicles (last 6)
// ────────────────────────────────
function buildAcquisitions(): AcquisitionPipeline[] {
  const backlogVehicles = mockStatusHistory
    .filter(sh => sh.status === 'EM_LIBERACAO')
    .map(sh => sh.vehicleId);
  
  const stages: AcquisitionPipeline['stage'][] = ['EM_LIBERACAO', 'APROVADO', 'FATURADO', 'RECEBIDO', 'INSTALACAO_EQUIPAMENTOS', 'PRONTO_PARA_ALUGAR'];
  const modes: AcquisitionPipeline['purchaseMode'][] = ['FINANCIAMENTO', 'CONSORCIO', 'A_VISTA', 'FINANCIAMENTO', 'CONSORCIO', 'A_VISTA_MAIS_CREDITO'];
  
  return backlogVehicles.map((vId, i) => ({
    id: `acq${i + 1}`,
    vehicleId: vId,
    stage: stages[i % stages.length],
    purchaseMode: modes[i % modes.length],
    supplierOrGroup: i % 2 === 0 ? 'Santander' : 'Rodobens',
    group: i % 3 === 1 ? `Grupo ${1000 + i}` : null,
    quota: i % 3 === 1 ? `Cota ${500 + i}` : null,
    expectedDate: new Date(2024, 2, 1 + i * 5),
    notes: null,
  }));
}

export const mockAcquisitions: AcquisitionPipeline[] = buildAcquisitions();

// ────────────────────────────────
// Finance
// ────────────────────────────────
function buildFinance(): VehicleFinanceBasic[] {
  return mockVehicles.slice(0, 60).map((v, i) => ({
    id: `fin${i + 1}`,
    vehicleId: v.id,
    purchaseDate: new Date(2023, Math.floor(i / 8), 1 + (i % 28)),
    purchasePrice: 55000 + (i % 20) * 5000,
    fipeValue: 52000 + (i % 20) * 4800,
    downPayment: i % 4 === 0 ? 55000 + (i % 20) * 5000 : 15000 + (i % 10) * 2000,
    installmentValue: i % 4 === 0 ? null : 1500 + (i % 10) * 200,
    installmentsTotal: i % 4 === 0 ? null : 36 + (i % 3) * 12,
    installmentsPaid: i % 4 === 0 ? null : 6 + (i % 12),
    purchaseMode: (['FINANCIAMENTO', 'CONSORCIO', 'A_VISTA', 'A_VISTA_MAIS_CREDITO'] as const)[i % 4],
    paymentStatus: i % 4 === 0 ? 'QUITADO' as const : 'EM_PAGAMENTO' as const,
  }));
}

export const mockFinance: VehicleFinanceBasic[] = buildFinance();

// ────────────────────────────────
// Fines (old fine type from types/index.ts)
// ────────────────────────────────
export const mockFines: Fine[] = Array.from({ length: 22 }, (_, i) => ({
  id: `f${i + 1}`,
  driverId: `d${(i % 20) + 1}`,
  vehicleId: mockVehicles[i % 45].id,
  rentalId: `r${(i % 45) + 1}`,
  infraction: ['Excesso de velocidade', 'Estacionamento irregular', 'Avanço de sinal', 'Celular ao volante', 'Faixa exclusiva'][i % 5],
  date: new Date(2024, 0, 1 + i),
  value: [130.16, 195.23, 293.47, 880.41][i % 4],
  status: i < 15 ? 'ABERTA' as const : i < 18 ? 'PAGA' as const : i < 20 ? 'CONTESTADA' as const : 'CANCELADA' as const,
}));

// ────────────────────────────────
// Files (documents) - Sample data
// ────────────────────────────────
export const mockFiles: FileRecord[] = [
  { id: 'file1', scope: 'VEHICLE', scopeId: 'TRK-001', docType: 'CRLV', fileName: 'CRLV_2024.pdf', fileUrl: '/docs/crlv_trk001.pdf', mimeType: 'application/pdf', uploadedAt: new Date('2024-01-15'), uploadedBy: 'admin' },
  { id: 'file2', scope: 'VEHICLE', scopeId: 'TRK-001', docType: 'CONTRATO_COMPRA', fileName: 'Contrato_Compra.pdf', fileUrl: '/docs/contrato_trk001.pdf', mimeType: 'application/pdf', uploadedAt: new Date('2023-01-15'), uploadedBy: 'admin' },
  { id: 'file3', scope: 'DRIVER', scopeId: 'd1', docType: 'CONTRATO', fileName: 'Contrato_Locacao_Carlos.pdf', fileUrl: '/docs/contrato_d1.pdf', mimeType: 'application/pdf', uploadedAt: new Date('2024-01-01'), uploadedBy: 'admin' },
  { id: 'file4', scope: 'DRIVER', scopeId: 'd1', docType: 'CNH', fileName: 'CNH_Carlos.jpg', fileUrl: '/docs/cnh_d1.jpg', mimeType: 'image/jpeg', uploadedAt: new Date('2024-01-01'), uploadedBy: 'admin' },
  { id: 'file5', scope: 'DRIVER', scopeId: 'd2', docType: 'CONTRATO', fileName: 'Contrato_Locacao_Maria.pdf', fileUrl: '/docs/contrato_d2.pdf', mimeType: 'application/pdf', uploadedAt: new Date('2024-01-05'), uploadedBy: 'admin' },
];

// ────────────────────────────────
// Contract Templates - Versioned
// ────────────────────────────────
export const mockContractTemplates: ContractTemplate[] = [
  {
    id: 'tpl1',
    name: 'Locação Motorista App',
    version: 'v1.0',
    status: 'ACTIVE',
    templateBody: `<h1>CONTRATO DE LOCAÇÃO DE VEÍCULO</h1>
<p><strong>LOCADOR:</strong> Trackr Gestão de Frotas LTDA</p>
<p><strong>LOCATÁRIO:</strong> {{driver_name}}</p>
<p><strong>CPF:</strong> {{driver_cpf}}</p>
<p><strong>CNH:</strong> {{driver_cnh}}</p>
<h2>CLÁUSULA 1 - DO OBJETO</h2>
<p>O presente contrato tem como objeto a locação do veículo <strong>{{vehicle_id}}</strong>, placa <strong>{{vehicle_plate}}</strong>.</p>
<h2>CLÁUSULA 2 - DO VALOR E PAGAMENTO</h2>
<p>Valor: <strong>R$ {{price_amount}}</strong> por <strong>{{price_frequency}}</strong>.</p>
<p>Vencimento: dia <strong>{{due_day}}</strong>.</p>
<p>Caução: <strong>R$ {{deposit_amount}}</strong></p>
<h2>CLÁUSULA 3 - DO PRAZO</h2>
<p>Início em <strong>{{start_date}}</strong> por prazo indeterminado.</p>
<p style="margin-top: 40px;">São Paulo, {{start_date}}</p>
<p>_____________________________</p>
<p>Assinatura do Locatário</p>`,
    createdAt: new Date('2023-06-01'),
  },
  {
    id: 'tpl2',
    name: 'Locação Motorista App',
    version: 'v1.1',
    status: 'ACTIVE',
    templateBody: `<h1>CONTRATO DE LOCAÇÃO DE VEÍCULO - V1.1</h1>
<p><strong>LOCADOR:</strong> Trackr Gestão de Frotas LTDA</p>
<p><strong>LOCATÁRIO:</strong> {{driver_name}} (CPF: {{driver_cpf}})</p>
<h2>CLÁUSULA 1</h2>
<p>Veículo: <strong>{{vehicle_id}}</strong> - Placa: <strong>{{vehicle_plate}}</strong></p>
<h2>CLÁUSULA 2</h2>
<p>Valor: R$ {{price_amount}} ({{price_frequency}})</p>
<p>Caução: R$ {{deposit_amount}}</p>
<h2>CLÁUSULA 3</h2>
<p>Início: {{start_date}}</p>
<p style="margin-top: 40px;">_____________________________</p>
<p>{{driver_name}}</p>`,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'tpl3',
    name: 'Locação Veículo Elétrico',
    version: 'v1.0',
    status: 'ACTIVE',
    templateBody: `<h1>CONTRATO DE LOCAÇÃO - VEÍCULO ELÉTRICO</h1>
<p><strong>LOCATÁRIO:</strong> {{driver_name}} (CPF: {{driver_cpf}})</p>
<p><strong>VEÍCULO:</strong> {{vehicle_id}} - Placa: {{vehicle_plate}}</p>
<p>Valor: R$ {{price_amount}} ({{price_frequency}})</p>
<p>Caução: R$ {{deposit_amount}}</p>
<p>Início: {{start_date}}</p>
<p style="margin-top: 40px;">Assinatura: _____________________________</p>`,
    createdAt: new Date('2024-01-15'),
  },
];

// Contracts (instances)
export const mockContracts: Contract[] = mockRentals
  .filter(r => r.status === 'ACTIVE')
  .slice(0, 40)
  .map((r, i) => ({
    id: `ct${i + 1}`,
    rentalId: r.id,
    templateId: i % 3 === 2 ? 'tpl3' : i % 2 === 0 ? 'tpl1' : 'tpl2',
    renderedContent: `<h1>Contrato ${r.id}</h1>`,
    pdfUrl: i < 35 ? `/contracts/ct${i + 1}.pdf` : null,
    signatureStatus: i < 35 ? 'SIGNED' as const : 'SENT' as const,
    signedAt: i < 35 ? r.startDate : null,
    createdAt: r.startDate,
  }));

// ────────────────────────────────
// Helper functions
// ────────────────────────────────

export const getCurrentStatus = (vehicleId: string): VehicleStatusHistory | undefined => {
  return mockStatusHistory
    .filter(sh => sh.vehicleId === vehicleId)
    .sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime())[0];
};

export const getCurrentDriver = (vehicleId: string): Driver | null => {
  const activeRental = mockRentals.find(r => r.vehicleId === vehicleId && r.status === 'ACTIVE');
  if (!activeRental) return null;
  return mockDrivers.find(d => d.id === activeRental.driverId) || null;
};

export const getOpenFinesCountForDriver = (driverId: string): number => {
  return mockFines.filter(f => f.driverId === driverId && f.status === 'ABERTA').length;
};

export const hasActiveRental = (driverId: string): boolean => {
  return mockRentals.some(r => r.driverId === driverId && r.status === 'ACTIVE');
};

export const getFilesForScope = (scope: 'VEHICLE' | 'DRIVER', scopeId: string): FileRecord[] => {
  return mockFiles.filter(f => f.scope === scope && f.scopeId === scopeId);
};

export const getVehiclesWithDetails = (): VehicleWithDetails[] => {
  return mockVehicles.map(vehicle => {
    const statusHistory = getCurrentStatus(vehicle.id);
    const currentDriver = getCurrentDriver(vehicle.id);
    const acquisition = mockAcquisitions.find(a => a.vehicleId === vehicle.id) || null;
    const finance = mockFinance.find(f => f.vehicleId === vehicle.id) || null;
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

export const getDriversWithDetails = (): DriverWithDetails[] => {
  return mockDrivers.map(driver => {
    const activeRental = mockRentals.find(r => r.driverId === driver.id && r.status === 'ACTIVE') || null;
    const currentVehicle = activeRental 
      ? mockVehicles.find(v => v.id === activeRental.vehicleId) || null 
      : null;
    const openFinesCount = getOpenFinesCountForDriver(driver.id);
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
  RECEBIDO: 'Recebido',
  INSTALACAO_EQUIPAMENTOS: 'Instalação Equip.',
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
  D: 'Categoria D',
  EV: 'Elétricos',
};

export const categoryDescriptions: Record<string, string> = {
  A: 'Uber X',
  B: 'Comfort',
  C: 'Comfort +',
  D: 'Black',
  EV: 'Elétricos',
};

// Fleet management stats
export const getFleetManagementStats = (): FleetManagementStats => {
  const vehicles = getVehiclesWithDetails();
  const stats = getVehicleStats();
  
  const operationalCount = stats.total - stats.emLiberacao - stats.paraVenda;
  
  const financeData = mockFinance.filter(f => f.purchasePrice);
  const avgPrice = financeData.length > 0 
    ? financeData.reduce((sum, f) => sum + (f.purchasePrice || 0), 0) / financeData.length 
    : 0;
  
  const avgOdometer = 45000;
  
  const operationalVehicles = vehicles.filter(v => 
    v.currentStatus !== 'EM_LIBERACAO' && v.currentStatus !== 'PARA_VENDA'
  );
  const yearsSum = operationalVehicles.reduce((sum, v) => sum + (v.yearModel || 2024), 0);
  const avgYear = operationalVehicles.length > 0 ? Math.round(yearsSum / operationalVehicles.length) : 2024;
  
  const occupancyRate = operationalCount > 0 ? (stats.alugado / operationalCount) * 100 : 0;
  const unproductiveRate = operationalCount > 0 
    ? ((stats.sinistro + stats.manutencao) / operationalCount) * 100 
    : 0;
  
  const avgTicket = 2850;
  
  return { avgPrice, avgOdometer, avgYear, occupancyRate, unproductiveRate, avgTicket };
};

// Dashboard financial stats
export const getDashboardFinancialStats = () => {
  const activeRentals = mockRentals.filter(r => r.status === 'ACTIVE');
  
  const estimatedMonthlyRevenue = activeRentals.reduce((sum, r) => {
    if (r.priceFrequency === 'WEEKLY') return sum + r.priceAmount * 4.33;
    return sum + r.priceAmount;
  }, 0);
  
  const realizedRevenue = estimatedMonthlyRevenue * 0.92;
  const maintenanceCostMonth = 18750; // Higher with 80 vehicles
  
  const operationalMargin = realizedRevenue > 0
    ? ((realizedRevenue - maintenanceCostMonth) / realizedRevenue) * 100
    : 0;
  
  return { estimatedMonthlyRevenue, realizedRevenue, maintenanceCostMonth, operationalMargin };
};

// Get contracts expiring within N days
export const getExpiringContracts = (days: number = 30) => {
  const now = new Date();
  const activeRentals = mockRentals.filter(r => r.status === 'ACTIVE');
  
  return activeRentals
    .map(r => {
      const driver = mockDrivers.find(d => d.id === r.driverId);
      const vehicle = mockVehicles.find(v => v.id === r.vehicleId);
      const contractEnd = new Date(r.startDate);
      contractEnd.setMonth(contractEnd.getMonth() + 12);
      const daysRemaining = Math.ceil((contractEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        rentalId: r.id,
        driverName: driver?.fullName || 'N/A',
        vehicleId: vehicle?.id || 'N/A',
        vehicleModel: vehicle ? `${vehicle.make} ${vehicle.model}` : '',
        contractEnd,
        daysRemaining,
      };
    })
    .filter(c => c.daysRemaining <= days && c.daysRemaining >= 0)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
};

// Rentals with details
export const getRentalsWithDetails = (): RentalWithDetails[] => {
  return mockRentals.map(rental => {
    const driver = mockDrivers.find(d => d.id === rental.driverId)!;
    const vehicle = mockVehicles.find(v => v.id === rental.vehicleId)!;
    const contract = mockContracts.find(c => c.rentalId === rental.id) || null;
    const template = contract ? mockContractTemplates.find(t => t.id === contract.templateId) || null : null;
    return { ...rental, driver, vehicle, contract, template };
  });
};

export const getAvailableVehicles = () => getVehiclesWithDetails().filter(v => v.currentStatus === 'DISPONIVEL');
export const getAvailableDrivers = () => getDriversWithDetails().filter(d => !d.activeRental);
export const getActiveContractTemplates = () => mockContractTemplates.filter(t => t.status === 'ACTIVE');

// Labels
export const rentalStatusLabels: Record<string, string> = {
  DRAFT: 'Rascunho',
  AWAITING_SIGNATURE: 'Aguardando Assinatura',
  ACTIVE: 'Ativa',
  ENDED: 'Encerrada',
  CANCELED: 'Cancelada',
};

export const priceFrequencyLabels: Record<string, string> = {
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensal',
};

export const billingWeekdayLabels: Record<string, string> = {
  SUN: 'Domingo',
  MON: 'Segunda-feira',
  TUE: 'Terça-feira',
  WED: 'Quarta-feira',
  THU: 'Quinta-feira',
  FRI: 'Sexta-feira',
  SAT: 'Sábado',
};

export const signatureStatusLabels: Record<string, string> = {
  DRAFT: 'Rascunho',
  SENT: 'Enviado',
  SIGNED: 'Assinado',
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

export const maintenanceStatusLabels: Record<MaintenanceStatus, string> = {
  OPEN: 'Aberta',
  IN_PROGRESS: 'Em Execução',
  DONE: 'Finalizada',
};

export const maintenanceTypeLabels: Record<MaintenanceType, string> = {
  PREVENTIVE: 'Preventiva',
  CORRECTIVE: 'Corretiva',
};

export const serviceAreaLabels: Record<ServiceArea, string> = {
  MECHANICAL: 'Mecânica',
  ELECTRICAL: 'Elétrica',
  BODYSHOP: 'Funilaria',
  TIRES: 'Pneus',
  INSPECTION: 'Revisão',
  OTHER: 'Outros',
};

export const mockSuppliers: Supplier[] = [
  { id: 'sup1', name: 'Auto Center São Paulo', phone: '(11) 3456-7890', notes: 'Mecânica geral e revisões' },
  { id: 'sup2', name: 'Pneus Express', phone: '(11) 2345-6789', notes: 'Pneus e alinhamento' },
  { id: 'sup3', name: 'Elétrica Automotiva Zona Sul', phone: '(11) 4567-8901', notes: 'Serviços elétricos' },
  { id: 'sup4', name: 'Funilaria & Pintura Premium', phone: '(11) 5678-9012', notes: 'Funilaria e pintura' },
];

// Maintenance Items
export const mockMaintenanceItems: MaintenanceItem[] = [
  { id: 'mi1', maintenanceId: 'mnt1', itemName: 'Óleo do motor 5W30', quantity: 4, unitCost: 45, totalCost: 180, hasWarranty: false, warrantyUntil: null, warrantyNotes: null },
  { id: 'mi2', maintenanceId: 'mnt1', itemName: 'Filtro de óleo', quantity: 1, unitCost: 35, totalCost: 35, hasWarranty: true, warrantyUntil: new Date('2025-01-15'), warrantyNotes: '6 meses' },
  { id: 'mi3', maintenanceId: 'mnt1', itemName: 'Filtro de ar', quantity: 1, unitCost: 55, totalCost: 55, hasWarranty: false, warrantyUntil: null, warrantyNotes: null },
  { id: 'mi4', maintenanceId: 'mnt2', itemName: 'Pastilha de freio dianteira', quantity: 1, unitCost: 180, totalCost: 180, hasWarranty: true, warrantyUntil: new Date('2025-06-10'), warrantyNotes: '12 meses' },
  { id: 'mi5', maintenanceId: 'mnt2', itemName: 'Disco de freio dianteiro', quantity: 2, unitCost: 220, totalCost: 440, hasWarranty: true, warrantyUntil: new Date('2025-06-10'), warrantyNotes: '12 meses' },
];

// Maintenances - Generate 12 months of maintenance history
function generateMaintenances(): Maintenance[] {
  const maintenances: Maintenance[] = [];
  const serviceAreas: ServiceArea[] = ['MECHANICAL', 'ELECTRICAL', 'BODYSHOP', 'TIRES', 'INSPECTION', 'OTHER'];
  const types: MaintenanceType[] = ['PREVENTIVE', 'CORRECTIVE'];
  const suppliers = ['Auto Center São Paulo', 'Pneus Express', 'Elétrica Automotiva Zona Sul', 'Funilaria & Pintura Premium'];
  
  // Generate ~60 maintenance records across 12 months
  for (let i = 0; i < 60; i++) {
    const monthsAgo = i % 12;
    const occurredAt = new Date();
    occurredAt.setMonth(occurredAt.getMonth() - monthsAgo);
    occurredAt.setDate(1 + (i % 28));
    
    const vehicleIdx = i % 70; // operational vehicles only
    const vehicle = mockVehicles[vehicleIdx];
    if (!vehicle) continue;
    
    const serviceArea = serviceAreas[i % serviceAreas.length];
    const laborCost = 100 + (i % 8) * 75;
    const partsCost = 150 + (i % 12) * 120;
    const totalCost = laborCost + partsCost;
    const isDone = i > 3;
    
    maintenances.push({
      id: `mnt${i + 1}`,
      vehicleId: vehicle.id,
      vehiclePlate: vehicle.plate,
      occurredAt,
      completedAt: isDone ? new Date(occurredAt.getTime() + 86400000 * (1 + i % 3)) : null,
      status: isDone ? 'DONE' : i % 2 === 0 ? 'OPEN' : 'IN_PROGRESS',
      maintenanceType: types[i % 2],
      serviceArea,
      supplierName: suppliers[i % suppliers.length],
      odometerKm: 15000 + i * 1500,
      notes: `Manutenção ${i + 1}`,
      laborCost,
      partsCost,
      totalCost,
      hasWarranty: i % 3 === 0,
      warrantyUntil: i % 3 === 0 ? new Date(occurredAt.getTime() + 86400000 * 180) : null,
      warrantyNotes: i % 3 === 0 ? '6 meses' : null,
      items: [],
    });
  }
  
  return maintenances;
}

export const mockMaintenances: Maintenance[] = generateMaintenances();

// Initialize items
mockMaintenances.forEach(m => {
  m.items = mockMaintenanceItems.filter(item => item.maintenanceId === m.id);
});

// Import seed data and merge
import { seedMaintenances } from './maintenanceSeed';
const allMaintenances: Maintenance[] = [...mockMaintenances, ...seedMaintenances];

export const getMaintenancesWithDetails = (): MaintenanceWithVehicle[] => {
  return allMaintenances.map(m => {
    const vehicle = mockVehicles.find(v => v.id === m.vehicleId)!;
    return { ...m, vehicle };
  }).filter(m => m.vehicle); // filter out orphaned records
};

export const getMaintenancesForVehicle = (vehicleId: string): MaintenanceWithVehicle[] => {
  return getMaintenancesWithDetails()
    .filter(m => m.vehicleId === vehicleId)
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
};

// Helper for fleet average calculations
export const getOperationalFleetForDate = (date: Date): number => {
  const operationalStatuses = ['DISPONIVEL', 'ALUGADO', 'MANUTENCAO', 'SINISTRO'];
  
  return mockVehicles.filter(vehicle => {
    const relevantHistory = mockStatusHistory
      .filter(sh => sh.vehicleId === vehicle.id && sh.statusSince <= date)
      .sort((a, b) => b.statusSince.getTime() - a.statusSince.getTime());
    
    if (relevantHistory.length === 0) {
      return vehicle.createdAt <= date;
    }
    
    return operationalStatuses.includes(relevantHistory[0].status);
  }).length;
};

export const getAverageFleetForPeriod = (startDate: Date, endDate: Date): number => {
  const daysCounts: number[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    daysCounts.push(getOperationalFleetForDate(new Date(currentDate)));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return daysCounts.length > 0 
    ? daysCounts.reduce((a, b) => a + b, 0) / daysCounts.length 
    : 0;
};
