// Enums
export type VehicleCategory = 'A' | 'B' | 'C';

export type VehicleStatus = 
  | 'DISPONIVEL' 
  | 'ALUGADO' 
  | 'MANUTENCAO' 
  | 'SINISTRO' 
  | 'PARA_VENDA' 
  | 'EM_LIBERACAO';

export type DriverStatus = 'active' | 'inactive';

export type RentalStatus = 'ACTIVE' | 'ENDED';

export type AcquisitionStage = 
  | 'EM_LIBERACAO' 
  | 'APROVADO' 
  | 'FATURADO' 
  | 'EMPLACADO' 
  | 'RECEBIDO' 
  | 'PRONTO_PARA_ALUGAR';

export type PurchaseMode = 
  | 'CONSORCIO' 
  | 'FINANCIAMENTO' 
  | 'A_VISTA' 
  | 'A_VISTA_MAIS_CREDITO';

export type PaymentStatus = 'QUITADO' | 'EM_PAGAMENTO' | 'NAO_INICIADO';

export type FineStatus = 'ABERTA' | 'PAGA' | 'CONTESTADA' | 'CANCELADA';

export type UserRole = 'admin' | 'operations' | 'finance' | 'maintenance' | 'readonly';

export type FileScope = 'VEHICLE' | 'DRIVER';

export type VehicleDocType = 
  | 'CRLV'
  | 'CONTRATO_COMPRA'
  | 'ATPV'
  | 'VISTORIA'
  | 'BOLETO_TRANSFERENCIA'
  | 'NOVO_CRLV'
  | 'OUTROS';

export type DriverDocType = 
  | 'CONTRATO'
  | 'CNH'
  | 'CPF_DOC'
  | 'COMPROVANTE_RESIDENCIA'
  | 'PERFIL_APP';

// Entities
export interface Vehicle {
  id: string;
  plate: string | null;
  make: string;
  model: string;
  version: string;
  year: number | null;
  category: VehicleCategory;
  vin: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Driver {
  id: string;
  fullName: string;
  phone: string;
  status: DriverStatus;
  // Extended fields
  cpf?: string | null;
  cnh?: string | null;
  birthDate?: Date | null;
  fatherName?: string | null;
  motherName?: string | null;
}

export interface Rental {
  id: string;
  driverId: string;
  vehicleId: string;
  startDate: Date;
  endDate: Date | null;
  status: RentalStatus;
}

export interface RentalSwapHistory {
  id: string;
  rentalId: string;
  fromVehicleId: string;
  toVehicleId: string;
  swapStart: Date;
  swapEnd: Date | null;
  reason: string;
}

export interface VehicleStatusHistory {
  id: string;
  vehicleId: string;
  status: VehicleStatus;
  statusSince: Date;
  note: string;
  changedBy: string;
  changedAt: Date;
}

export interface AcquisitionPipeline {
  id: string;
  vehicleId: string;
  stage: AcquisitionStage;
  purchaseMode: PurchaseMode;
  supplierOrGroup: string | null;
  expectedDate: Date | null;
  notes: string | null;
}

export interface VehicleFinanceBasic {
  id: string;
  vehicleId: string;
  purchaseDate: Date | null;
  purchasePrice: number | null;
  fipeValue: number | null;
  downPayment: number | null;
  installmentValue: number | null;
  installmentsTotal: number | null;
  installmentsPaid: number | null;
  purchaseMode: PurchaseMode | null;
  paymentStatus: PaymentStatus;
}

export interface Fine {
  id: string;
  driverId: string;
  vehicleId: string;
  rentalId: string;
  infraction: string;
  date: Date;
  value: number;
  status: FineStatus;
}

export interface FileRecord {
  id: string;
  scope: FileScope;
  scopeId: string;
  docType: VehicleDocType | DriverDocType;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface AuditLog {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string;
  changedAt: Date;
}

// Extended types for UI
export interface VehicleWithDetails extends Vehicle {
  currentStatus: VehicleStatus;
  statusSince: Date;
  currentDriver: Driver | null;
  acquisition: AcquisitionPipeline | null;
  finance: VehicleFinanceBasic | null;
  openFinesCount: number;
}

export interface DriverWithDetails extends Driver {
  activeRental: Rental | null;
  currentVehicle: Vehicle | null;
  openFinesCount: number;
  // Computed status based on business rule
  computedStatus: DriverStatus;
}

// Stats
export interface VehicleStats {
  total: number;
  disponivel: number;
  alugado: number;
  manutencao: number;
  sinistro: number;
  paraVenda: number;
  emLiberacao: number;
}
