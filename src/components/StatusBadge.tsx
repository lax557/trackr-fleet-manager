import { VehicleStatus, AcquisitionStage, PaymentStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { statusLabels, stageLabels, paymentStatusLabels } from '@/data/mockData';

interface StatusBadgeProps {
  status: VehicleStatus;
  size?: 'sm' | 'md';
}

const statusStyles: Record<VehicleStatus, string> = {
  DISPONIVEL: 'status-badge-disponivel',
  ALUGADO: 'status-badge-alugado',
  MANUTENCAO: 'status-badge-manutencao',
  SINISTRO: 'status-badge-sinistro',
  PARA_VENDA: 'status-badge-para-venda',
  EM_LIBERACAO: 'status-badge-em-liberacao',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={`${statusStyles[status]} ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'} font-medium`}
    >
      {statusLabels[status]}
    </Badge>
  );
}

interface StageBadgeProps {
  stage: AcquisitionStage;
}

const stageStyles: Record<AcquisitionStage, string> = {
  EM_LIBERACAO: 'bg-gray-100 text-gray-700 border-gray-200',
  APROVADO: 'bg-blue-100 text-blue-700 border-blue-200',
  FATURADO: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  RECEBIDO: 'bg-teal-100 text-teal-700 border-teal-200',
  INSTALACAO_EQUIPAMENTOS: 'bg-purple-100 text-purple-700 border-purple-200',
  PRONTO_PARA_ALUGAR: 'bg-green-100 text-green-700 border-green-200',
};

export function StageBadge({ stage }: StageBadgeProps) {
  return (
    <Badge variant="outline" className={`${stageStyles[stage]} text-xs font-medium`}>
      {stageLabels[stage]}
    </Badge>
  );
}

interface PaymentBadgeProps {
  status: PaymentStatus;
}

const paymentStyles: Record<PaymentStatus, string> = {
  QUITADO: 'bg-green-100 text-green-700 border-green-200',
  EM_PAGAMENTO: 'bg-amber-100 text-amber-700 border-amber-200',
  NAO_INICIADO: 'bg-gray-100 text-gray-600 border-gray-200',
};

export function PaymentBadge({ status }: PaymentBadgeProps) {
  return (
    <Badge variant="outline" className={`${paymentStyles[status]} text-xs font-medium`}>
      {paymentStatusLabels[status]}
    </Badge>
  );
}
