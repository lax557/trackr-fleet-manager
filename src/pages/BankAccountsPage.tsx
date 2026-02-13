import { bankAccounts } from '@/data/financialData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrencyBRL } from '@/lib/utils';
import { Building2, Wallet } from 'lucide-react';

export default function BankAccountsPage() {
  const totalBalance = bankAccounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contas Bancárias</h1>
        <p className="text-sm text-muted-foreground">Saldo total: {formatCurrencyBRL(totalBalance)}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bankAccounts.map(acc => (
          <Card key={acc.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">{acc.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{formatCurrencyBRL(acc.balance)}</p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>{acc.bank} • Ag {acc.agency} • CC {acc.accountNumber}</p>
                <p className="capitalize">{acc.type.toLowerCase()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
