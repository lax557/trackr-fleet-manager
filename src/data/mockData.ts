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
  Supplier
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
// Vehicles - re-exported from vehiclesData
import { vehiclesData } from './vehiclesData';
export const mockVehicles: Vehicle[] = vehiclesData;

// Rentals - Updated with new fields
export const mockRentals: Rental[] = [
  { id: 'r1', driverId: 'd1', vehicleId: 'TRK-001', startDate: new Date('2024-01-01'), endDate: null, status: 'ACTIVE', priceAmount: 600, priceFrequency: 'WEEKLY', dueDay: null, billingWeekday: 'MON', depositAmount: 1200, notes: null },
  { id: 'r2', driverId: 'd2', vehicleId: 'TRK-003', startDate: new Date('2024-01-05'), endDate: null, status: 'ACTIVE', priceAmount: 700, priceFrequency: 'WEEKLY', dueDay: null, billingWeekday: 'MON', depositAmount: 1400, notes: null },
  { id: 'r3', driverId: 'd3', vehicleId: 'TRK-004', startDate: new Date('2024-01-10'), endDate: null, status: 'ACTIVE', priceAmount: 750, priceFrequency: 'WEEKLY', dueDay: null, billingWeekday: 'TUE', depositAmount: 1500, notes: null },
  { id: 'r4', driverId: 'd4', vehicleId: 'TRK-005', startDate: new Date('2024-01-12'), endDate: null, status: 'ACTIVE', priceAmount: 2800, priceFrequency: 'MONTHLY', dueDay: 10, billingWeekday: null, depositAmount: 2800, notes: 'Contrato mensal' },
  { id: 'r5', driverId: 'd5', vehicleId: 'TRK-007', startDate: new Date('2024-01-15'), endDate: null, status: 'ACTIVE', priceAmount: 650, priceFrequency: 'WEEKLY', dueDay: null, billingWeekday: 'FRI', depositAmount: 1300, notes: null },
  { id: 'r6', driverId: 'd6', vehicleId: 'TRK-002', startDate: new Date('2023-06-01'), endDate: new Date('2023-12-15'), status: 'ENDED', priceAmount: 550, priceFrequency: 'WEEKLY', dueDay: null, billingWeekday: 'MON', depositAmount: 1100, notes: 'Locação encerrada' },
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

// Acquisition Pipeline (for backlog vehicles) - with group and quota
export const mockAcquisitions: AcquisitionPipeline[] = [
  { id: 'acq1', vehicleId: 'TRK-008', stage: 'FATURADO', purchaseMode: 'FINANCIAMENTO', supplierOrGroup: 'Santander', group: null, quota: null, expectedDate: new Date('2024-02-15'), notes: 'Aguardando emplacamento' },
  { id: 'acq2', vehicleId: 'TRK-009', stage: 'APROVADO', purchaseMode: 'CONSORCIO', supplierOrGroup: 'Rodobens', group: 'Grupo 1234', quota: 'Cota 567', expectedDate: new Date('2024-03-01'), notes: 'Carta contemplada mês anterior' },
  { id: 'acq3', vehicleId: 'TRK-010', stage: 'EM_LIBERACAO', purchaseMode: 'FINANCIAMENTO', supplierOrGroup: 'BV Financeira', group: null, quota: null, expectedDate: new Date('2024-02-28'), notes: 'Em análise de crédito' },
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

// Contract Templates - Versioned
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
<p>O presente contrato tem como objeto a locação do veículo identificado como <strong>{{vehicle_id}}</strong>, placa <strong>{{vehicle_plate}}</strong>, para uso exclusivo em aplicativos de transporte.</p>

<h2>CLÁUSULA 2 - DO VALOR E PAGAMENTO</h2>
<p>O valor da locação é de <strong>R$ {{price_amount}}</strong> por <strong>{{price_frequency}}</strong>.</p>
<p>O vencimento será no dia <strong>{{due_day}}</strong> de cada período.</p>
<p>Caução: <strong>R$ {{deposit_amount}}</strong></p>

<h2>CLÁUSULA 3 - DO PRAZO</h2>
<p>A locação tem início em <strong>{{start_date}}</strong> por prazo indeterminado.</p>

<h2>CLÁUSULA 4 - DAS OBRIGAÇÕES</h2>
<p>O LOCATÁRIO se compromete a manter o veículo em bom estado de conservação e limpeza.</p>

<p style="margin-top: 40px;">Local e Data: São Paulo, {{start_date}}</p>
<p>_____________________________</p>
<p>Assinatura do Locatário</p>`,
    createdAt: new Date('2023-06-01'),
  },
  {
    id: 'tpl2',
    name: 'Locação Motorista App',
    version: 'v1.1',
    status: 'ACTIVE',
    templateBody: `<h1>CONTRATO DE LOCAÇÃO DE VEÍCULO - VERSÃO ATUALIZADA</h1>
<p><strong>LOCADOR:</strong> Trackr Gestão de Frotas LTDA</p>
<p><strong>LOCATÁRIO:</strong> {{driver_name}}</p>
<p><strong>CPF:</strong> {{driver_cpf}}</p>
<p><strong>CNH:</strong> {{driver_cnh}}</p>

<h2>CLÁUSULA 1 - DO OBJETO</h2>
<p>O presente contrato tem como objeto a locação do veículo <strong>{{vehicle_id}}</strong>, placa <strong>{{vehicle_plate}}</strong>.</p>

<h2>CLÁUSULA 2 - DO VALOR</h2>
<p>Valor: <strong>R$ {{price_amount}}</strong> ({{price_frequency}})</p>
<p>Vencimento: dia <strong>{{due_day}}</strong></p>
<p>Caução: <strong>R$ {{deposit_amount}}</strong></p>

<h2>CLÁUSULA 3 - VIGÊNCIA</h2>
<p>Início: <strong>{{start_date}}</strong> - Prazo indeterminado</p>

<h2>CLÁUSULA 4 - MULTAS E INFRAÇÕES</h2>
<p>O LOCATÁRIO é responsável por todas as multas de trânsito durante o período de locação.</p>

<h2>CLÁUSULA 5 - RESCISÃO</h2>
<p>Qualquer parte pode rescindir com aviso prévio de 7 dias.</p>

<p style="margin-top: 40px;">São Paulo, {{start_date}}</p>
<p>_____________________________</p>
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

<h2>CONDIÇÕES ESPECIAIS</h2>
<p>Por se tratar de veículo elétrico, aplicam-se condições especiais de uso.</p>
<p>Valor: R$ {{price_amount}} ({{price_frequency}})</p>
<p>Caução: R$ {{deposit_amount}}</p>
<p>Início: {{start_date}}</p>

<p style="margin-top: 40px;">Assinatura: _____________________________</p>`,
    createdAt: new Date('2024-01-15'),
  },
];

// Contracts (instances) - Generated from templates
export const mockContracts: Contract[] = [
  { id: 'ct1', rentalId: 'r1', templateId: 'tpl1', renderedContent: '<h1>Contrato Carlos</h1>', pdfUrl: '/contracts/ct1.pdf', signatureStatus: 'SIGNED', signedAt: new Date('2024-01-01'), createdAt: new Date('2024-01-01') },
  { id: 'ct2', rentalId: 'r2', templateId: 'tpl2', renderedContent: '<h1>Contrato Maria</h1>', pdfUrl: '/contracts/ct2.pdf', signatureStatus: 'SIGNED', signedAt: new Date('2024-01-05'), createdAt: new Date('2024-01-05') },
  { id: 'ct3', rentalId: 'r3', templateId: 'tpl2', renderedContent: '<h1>Contrato João</h1>', pdfUrl: '/contracts/ct3.pdf', signatureStatus: 'SIGNED', signedAt: new Date('2024-01-10'), createdAt: new Date('2024-01-10') },
  { id: 'ct4', rentalId: 'r4', templateId: 'tpl1', renderedContent: '<h1>Contrato Ana</h1>', pdfUrl: '/contracts/ct4.pdf', signatureStatus: 'SIGNED', signedAt: new Date('2024-01-12'), createdAt: new Date('2024-01-12') },
  { id: 'ct5', rentalId: 'r5', templateId: 'tpl2', renderedContent: '<h1>Contrato Lucas</h1>', pdfUrl: null, signatureStatus: 'SENT', signedAt: null, createdAt: new Date('2024-01-15') },
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
  LIBERADO_LOJA: 'Liberado da Loja',
  INSTALACAO_EQUIPAMENTOS: 'Instalação Equip.',
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

// Fleet management stats helper
export const getFleetManagementStats = () => {
  const vehicles = getVehiclesWithDetails();
  const stats = getVehicleStats();
  
  // Operational fleet = total - backlog - paraVenda
  const operationalCount = stats.total - stats.emLiberacao - stats.paraVenda;
  
  // Average price from finance data
  const financeData = mockFinance.filter(f => f.purchasePrice);
  const avgPrice = financeData.length > 0 
    ? financeData.reduce((sum, f) => sum + (f.purchasePrice || 0), 0) / financeData.length 
    : 0;
  
  // Average odometer (mock data - would come from API)
  const avgOdometer = 45000; // Placeholder
  
  // Average year from operational vehicles
  const operationalVehicles = vehicles.filter(v => 
    v.currentStatus !== 'EM_LIBERACAO' && v.currentStatus !== 'PARA_VENDA'
  );
  const yearsSum = operationalVehicles.reduce((sum, v) => sum + (v.yearModel || 2024), 0);
  const avgYear = operationalVehicles.length > 0 ? Math.round(yearsSum / operationalVehicles.length) : 2024;
  
  // Occupancy rate = alugados / operacional
  const occupancyRate = operationalCount > 0 ? (stats.alugado / operationalCount) * 100 : 0;
  
  // Unproductive rate = (sinistro + manutenção) / operacional
  const unproductiveRate = operationalCount > 0 
    ? ((stats.sinistro + stats.manutencao) / operationalCount) * 100 
    : 0;
  
  // Average ticket (mock - would come from billing)
  const avgTicket = 2850; // Placeholder monthly revenue per vehicle
  
  return {
    avgPrice,
    avgOdometer,
    avgYear,
    occupancyRate,
    unproductiveRate,
    avgTicket,
  };
};

// Rentals with details helper
export const getRentalsWithDetails = (): RentalWithDetails[] => {
  return mockRentals.map(rental => {
    const driver = mockDrivers.find(d => d.id === rental.driverId)!;
    const vehicle = mockVehicles.find(v => v.id === rental.vehicleId)!;
    const contract = mockContracts.find(c => c.rentalId === rental.id) || null;
    const template = contract ? mockContractTemplates.find(t => t.id === contract.templateId) || null : null;

    return {
      ...rental,
      driver,
      vehicle,
      contract,
      template,
    };
  });
};

// Get available vehicles (status DISPONIVEL)
export const getAvailableVehicles = () => {
  return getVehiclesWithDetails().filter(v => v.currentStatus === 'DISPONIVEL');
};

// Get available drivers (no active rental)
export const getAvailableDrivers = () => {
  return getDriversWithDetails().filter(d => !d.activeRental);
};

// Get active contract templates
export const getActiveContractTemplates = () => {
  return mockContractTemplates.filter(t => t.status === 'ACTIVE');
};

// Rental status labels
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

// Maintenance status labels
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

// Suppliers (optional for MVP)
export const mockSuppliers: Supplier[] = [
  { id: 'sup1', name: 'Auto Center São Paulo', phone: '(11) 3456-7890', notes: 'Mecânica geral e revisões' },
  { id: 'sup2', name: 'Pneus Express', phone: '(11) 2345-6789', notes: 'Pneus e alinhamento' },
  { id: 'sup3', name: 'Elétrica Automotiva Zona Sul', phone: '(11) 4567-8901', notes: 'Serviços elétricos' },
  { id: 'sup4', name: 'Funilaria & Pintura Premium', phone: '(11) 5678-9012', notes: 'Funilaria e pintura' },
];

// Maintenance Items (sample)
export const mockMaintenanceItems: MaintenanceItem[] = [
  { id: 'mi1', maintenanceId: 'mnt1', itemName: 'Óleo do motor 5W30', quantity: 4, unitCost: 45, totalCost: 180, hasWarranty: false, warrantyUntil: null, warrantyNotes: null },
  { id: 'mi2', maintenanceId: 'mnt1', itemName: 'Filtro de óleo', quantity: 1, unitCost: 35, totalCost: 35, hasWarranty: true, warrantyUntil: new Date('2025-01-15'), warrantyNotes: '6 meses' },
  { id: 'mi3', maintenanceId: 'mnt1', itemName: 'Filtro de ar', quantity: 1, unitCost: 55, totalCost: 55, hasWarranty: false, warrantyUntil: null, warrantyNotes: null },
  { id: 'mi4', maintenanceId: 'mnt2', itemName: 'Pastilha de freio dianteira', quantity: 1, unitCost: 180, totalCost: 180, hasWarranty: true, warrantyUntil: new Date('2025-06-10'), warrantyNotes: '12 meses ou 20.000 km' },
  { id: 'mi5', maintenanceId: 'mnt2', itemName: 'Disco de freio dianteiro', quantity: 2, unitCost: 220, totalCost: 440, hasWarranty: true, warrantyUntil: new Date('2025-06-10'), warrantyNotes: '12 meses ou 20.000 km' },
  { id: 'mi6', maintenanceId: 'mnt3', itemName: 'Pneu 185/65 R15', quantity: 4, unitCost: 350, totalCost: 1400, hasWarranty: true, warrantyUntil: new Date('2026-01-20'), warrantyNotes: '5 anos de fabricação' },
  { id: 'mi7', maintenanceId: 'mnt4', itemName: 'Bateria 60Ah', quantity: 1, unitCost: 450, totalCost: 450, hasWarranty: true, warrantyUntil: new Date('2025-12-01'), warrantyNotes: '18 meses' },
  { id: 'mi8', maintenanceId: 'mnt5', itemName: 'Para-lama dianteiro esquerdo', quantity: 1, unitCost: 320, totalCost: 320, hasWarranty: false, warrantyUntil: null, warrantyNotes: null },
  { id: 'mi9', maintenanceId: 'mnt5', itemName: 'Pintura metalizada', quantity: 1, unitCost: 850, totalCost: 850, hasWarranty: true, warrantyUntil: new Date('2025-02-15'), warrantyNotes: '3 meses' },
];

// Maintenances
export const mockMaintenances: Maintenance[] = [
  {
    id: 'mnt1',
    vehicleId: 'TRK-001',
    vehiclePlate: 'ABC1D23',
    occurredAt: new Date('2024-01-15T09:00:00'),
    completedAt: new Date('2024-01-15T11:30:00'),
    status: 'DONE',
    maintenanceType: 'PREVENTIVE',
    serviceArea: 'INSPECTION',
    supplierName: 'Auto Center São Paulo',
    odometerKm: 35000,
    notes: 'Troca de óleo e filtros - revisão 30.000 km',
    laborCost: 150,
    partsCost: 270,
    totalCost: 420,
    hasWarranty: true,
    warrantyUntil: new Date('2025-01-15'),
    warrantyNotes: '6 meses ou 10.000 km',
    items: [],
  },
  {
    id: 'mnt2',
    vehicleId: 'TRK-003',
    vehiclePlate: 'GHI7F89',
    occurredAt: new Date('2024-01-10T14:00:00'),
    completedAt: new Date('2024-01-10T17:00:00'),
    status: 'DONE',
    maintenanceType: 'CORRECTIVE',
    serviceArea: 'MECHANICAL',
    supplierName: 'Auto Center São Paulo',
    odometerKm: 42000,
    notes: 'Troca de pastilhas e discos de freio - desgaste',
    laborCost: 200,
    partsCost: 620,
    totalCost: 820,
    hasWarranty: true,
    warrantyUntil: new Date('2025-06-10'),
    warrantyNotes: '12 meses ou 20.000 km',
    items: [],
  },
  {
    id: 'mnt3',
    vehicleId: 'TRK-002',
    vehiclePlate: 'DEF4E56',
    occurredAt: new Date('2024-01-20T10:00:00'),
    completedAt: new Date('2024-01-20T12:00:00'),
    status: 'DONE',
    maintenanceType: 'CORRECTIVE',
    serviceArea: 'TIRES',
    supplierName: 'Pneus Express',
    odometerKm: 55000,
    notes: 'Troca dos 4 pneus + alinhamento e balanceamento',
    laborCost: 120,
    partsCost: 1400,
    totalCost: 1520,
    hasWarranty: true,
    warrantyUntil: new Date('2026-01-20'),
    warrantyNotes: '5 anos de fabricação',
    items: [],
  },
  {
    id: 'mnt4',
    vehicleId: 'TRK-004',
    vehiclePlate: 'JKL0G12',
    occurredAt: new Date('2024-01-01T08:00:00'),
    completedAt: new Date('2024-01-01T09:30:00'),
    status: 'DONE',
    maintenanceType: 'CORRECTIVE',
    serviceArea: 'ELECTRICAL',
    supplierName: 'Elétrica Automotiva Zona Sul',
    odometerKm: 28000,
    notes: 'Bateria descarregada - substituição',
    laborCost: 50,
    partsCost: 450,
    totalCost: 500,
    hasWarranty: true,
    warrantyUntil: new Date('2025-12-01'),
    warrantyNotes: '18 meses',
    items: [],
  },
  {
    id: 'mnt5',
    vehicleId: 'TRK-005',
    vehiclePlate: 'MNO3H45',
    occurredAt: new Date('2023-12-15T09:00:00'),
    completedAt: new Date('2023-12-18T18:00:00'),
    status: 'DONE',
    maintenanceType: 'CORRECTIVE',
    serviceArea: 'BODYSHOP',
    supplierName: 'Funilaria & Pintura Premium',
    odometerKm: 48000,
    notes: 'Reparo de amassado no para-lama dianteiro esquerdo - colisão leve',
    laborCost: 600,
    partsCost: 1170,
    totalCost: 1770,
    hasWarranty: true,
    warrantyUntil: new Date('2025-02-15'),
    warrantyNotes: '3 meses de garantia na pintura',
    items: [],
  },
  {
    id: 'mnt6',
    vehicleId: 'TRK-006',
    vehiclePlate: 'PQR6I78',
    occurredAt: new Date('2024-01-18T08:00:00'),
    completedAt: null,
    status: 'OPEN',
    maintenanceType: 'PREVENTIVE',
    serviceArea: 'INSPECTION',
    supplierName: 'Auto Center São Paulo',
    odometerKm: 30000,
    notes: 'Revisão programada 30.000 km - aguardando peças',
    laborCost: 0,
    partsCost: 0,
    totalCost: 0,
    hasWarranty: false,
    warrantyUntil: null,
    warrantyNotes: null,
    items: [],
  },
  {
    id: 'mnt7',
    vehicleId: 'TRK-001',
    vehiclePlate: 'ABC1D23',
    occurredAt: new Date('2023-10-20T10:00:00'),
    completedAt: new Date('2023-10-20T12:00:00'),
    status: 'DONE',
    maintenanceType: 'PREVENTIVE',
    serviceArea: 'INSPECTION',
    supplierName: 'Auto Center São Paulo',
    odometerKm: 25000,
    notes: 'Troca de óleo e filtros - revisão 25.000 km',
    laborCost: 150,
    partsCost: 250,
    totalCost: 400,
    hasWarranty: false,
    warrantyUntil: null,
    warrantyNotes: null,
    items: [],
  },
  {
    id: 'mnt8',
    vehicleId: 'TRK-001',
    vehiclePlate: 'ABC1D23',
    occurredAt: new Date('2023-07-10T09:00:00'),
    completedAt: new Date('2023-07-10T11:00:00'),
    status: 'DONE',
    maintenanceType: 'PREVENTIVE',
    serviceArea: 'INSPECTION',
    supplierName: 'Auto Center São Paulo',
    odometerKm: 15000,
    notes: 'Troca de óleo - revisão 15.000 km',
    laborCost: 100,
    partsCost: 200,
    totalCost: 300,
    hasWarranty: false,
    warrantyUntil: null,
    warrantyNotes: null,
    items: [],
  },
];

// Initialize items for maintenances
mockMaintenances.forEach(m => {
  m.items = mockMaintenanceItems.filter(item => item.maintenanceId === m.id);
});

// Import seed data and merge
import { seedMaintenances } from './maintenanceSeed';

// Combine original mock maintenances with seed data
const allMaintenances: Maintenance[] = [...mockMaintenances, ...seedMaintenances];

// Get maintenances with vehicle details
export const getMaintenancesWithDetails = (): MaintenanceWithVehicle[] => {
  return allMaintenances.map(m => {
    const vehicle = mockVehicles.find(v => v.id === m.vehicleId)!;
    return {
      ...m,
      vehicle,
    };
  });
};

// Get maintenances for a specific vehicle
export const getMaintenancesForVehicle = (vehicleId: string): MaintenanceWithVehicle[] => {
  return getMaintenancesWithDetails()
    .filter(m => m.vehicleId === vehicleId)
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
};

// Helper for fleet average calculations
export const getOperationalFleetForDate = (date: Date): number => {
  // Check status history for each vehicle on the given date
  const operationalStatuses = ['DISPONIVEL', 'ALUGADO', 'MANUTENCAO', 'SINISTRO'];
  
  return mockVehicles.filter(vehicle => {
    // Get the status that was active on that date
    const relevantHistory = mockStatusHistory
      .filter(sh => sh.vehicleId === vehicle.id && sh.statusSince <= date)
      .sort((a, b) => b.statusSince.getTime() - a.statusSince.getTime());
    
    if (relevantHistory.length === 0) {
      // If no history, check if vehicle was created before the date
      if (vehicle.createdAt <= date) {
        // Assume operational by default if no history
        return true;
      }
      return false;
    }
    
    return operationalStatuses.includes(relevantHistory[0].status);
  }).length;
};

// Calculate average fleet size for a date range
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
