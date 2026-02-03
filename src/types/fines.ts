// Fine Types - Separated for clarity

export type FineSource = 'MANUAL' | 'INTEGRATION';

export type FineSeverity = 'LEVE' | 'MEDIA' | 'GRAVE' | 'GRAVISSIMA';

export type FineStatusType = 'OPEN' | 'DUE_SOON' | 'OVERDUE' | 'PAID' | 'CONTESTED' | 'CANCELED';

export interface FineRecord {
  id: string;
  vehicleId: string;
  vehiclePlate: string | null;
  driverId: string | null;
  occurredAt: Date;
  source: FineSource;
  authority: string;
  location: string | null;
  infractionCode: string;
  infractionDescription: string;
  severity: FineSeverity;
  points: number;
  originalAmount: number;
  discountAvailable: boolean;
  discountPercent: number | null;
  discountedAmount: number | null;
  dueDate: Date;
  status: FineStatusType;
  paymentDate: Date | null;
  paymentAmount: number | null;
  indicatedDriver: boolean;
  indicatedAt: Date | null;
  indicatedDriverName: string | null;
  notes: string | null;
  documentFileId: string | null;
}

export interface FineWithDetails extends FineRecord {
  driverName: string | null;
  vehicleMakeModel: string;
}

export const fineSeverityLabels: Record<FineSeverity, string> = {
  LEVE: 'Leve',
  MEDIA: 'Média',
  GRAVE: 'Grave',
  GRAVISSIMA: 'Gravíssima',
};

export const fineSeverityPoints: Record<FineSeverity, number> = {
  LEVE: 3,
  MEDIA: 4,
  GRAVE: 5,
  GRAVISSIMA: 7,
};

export const fineStatusLabels: Record<FineStatusType, string> = {
  OPEN: 'Em Aberto',
  DUE_SOON: 'Vence em Breve',
  OVERDUE: 'Vencida',
  PAID: 'Paga',
  CONTESTED: 'Contestada',
  CANCELED: 'Cancelada',
};

export const fineStatusColors: Record<FineStatusType, string> = {
  OPEN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  DUE_SOON: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CONTESTED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  CANCELED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

// Common infraction codes and descriptions
export const commonInfractions = [
  { code: '74550', description: 'Excesso de velocidade até 20%', severity: 'MEDIA' as FineSeverity, points: 4, amount: 130.16 },
  { code: '74630', description: 'Excesso de velocidade de 20% a 50%', severity: 'GRAVE' as FineSeverity, points: 5, amount: 195.23 },
  { code: '74710', description: 'Excesso de velocidade acima de 50%', severity: 'GRAVISSIMA' as FineSeverity, points: 7, amount: 880.41 },
  { code: '60412', description: 'Estacionar em local proibido', severity: 'MEDIA' as FineSeverity, points: 4, amount: 130.16 },
  { code: '60503', description: 'Parar sobre a faixa de pedestres', severity: 'MEDIA' as FineSeverity, points: 4, amount: 130.16 },
  { code: '60682', description: 'Estacionar na calçada', severity: 'GRAVE' as FineSeverity, points: 5, amount: 195.23 },
  { code: '60501', description: 'Estacionar em fila dupla', severity: 'GRAVE' as FineSeverity, points: 5, amount: 195.23 },
  { code: '57380', description: 'Avanço de sinal vermelho', severity: 'GRAVISSIMA' as FineSeverity, points: 7, amount: 293.47 },
  { code: '54521', description: 'Transitar na faixa exclusiva de ônibus', severity: 'GRAVE' as FineSeverity, points: 5, amount: 195.23 },
  { code: '52310', description: 'Utilizar celular ao dirigir', severity: 'GRAVISSIMA' as FineSeverity, points: 7, amount: 293.47 },
  { code: '51691', description: 'Não usar cinto de segurança', severity: 'GRAVE' as FineSeverity, points: 5, amount: 195.23 },
  { code: '54600', description: 'Transitar pelo acostamento', severity: 'GRAVE' as FineSeverity, points: 5, amount: 195.23 },
  { code: '55250', description: 'Ultrapassagem proibida', severity: 'GRAVISSIMA' as FineSeverity, points: 7, amount: 293.47 },
  { code: '55411', description: 'Dirigir sem CNH', severity: 'GRAVISSIMA' as FineSeverity, points: 7, amount: 880.41 },
  { code: '73662', description: 'Licenciamento vencido', severity: 'GRAVISSIMA' as FineSeverity, points: 7, amount: 293.47 },
];
