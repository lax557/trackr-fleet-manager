import { VehicleFinanceBasic } from '@/types';
import { purchaseModeLabels } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentBadge } from '@/components/StatusBadge';
import { DollarSign, Edit, TrendingUp, TrendingDown, Calculator, CreditCard } from 'lucide-react';
import { formatCurrencyBRL } from '@/lib/utils';

interface FinanceCardProps {
  finance: VehicleFinanceBasic;
  onEdit?: () => void;
}

export function FinanceCard({ finance, onEdit }: FinanceCardProps) {
  const installmentsPaid = finance.installmentsPaid ?? 0;
  const installmentsTotal = finance.installmentsTotal ?? 0;
  const installmentValue = finance.installmentValue ?? 0;
  const downPayment = finance.downPayment ?? 0;

  const totalPaid = downPayment + (installmentsPaid * installmentValue);
  const remainingAmount = (installmentsTotal - installmentsPaid) * installmentValue;
  const progressPercent = installmentsTotal > 0 
    ? Math.round((installmentsPaid / installmentsTotal) * 100) 
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle>Financeiro</CardTitle>
          </div>
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-sm text-muted-foreground">Total Pago</p>
            </div>
            <p className="text-xl font-bold text-green-600">{formatCurrencyBRL(totalPaid)}</p>
          </div>
          <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/10">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              <p className="text-sm text-muted-foreground">Falta Pagar</p>
            </div>
            <p className="text-xl font-bold text-orange-600">{formatCurrencyBRL(remainingAmount)}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Parcelas</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-bold">{installmentsPaid}/{installmentsTotal}</p>
              <Badge variant="outline" className="text-xs">{progressPercent}%</Badge>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Modo de Compra</p>
            </div>
            <p className="text-base font-semibold">
              {finance.purchaseMode ? purchaseModeLabels[finance.purchaseMode] : '—'}
            </p>
          </div>
        </div>

        {installmentsTotal > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progresso das Parcelas</span>
              <span>{installmentsPaid} de {installmentsTotal} pagas</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Valor de Compra</p>
            <p className="font-medium">{formatCurrencyBRL(finance.purchasePrice)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Valor FIPE</p>
            <p className="font-medium">{formatCurrencyBRL(finance.fipeValue)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Entrada</p>
            <p className="font-medium">{formatCurrencyBRL(finance.downPayment)}</p>
          </div>
          {finance.installmentValue && (
            <div>
              <p className="text-sm text-muted-foreground">Valor da Parcela</p>
              <p className="font-medium">{formatCurrencyBRL(finance.installmentValue)}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <PaymentBadge status={finance.paymentStatus} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
