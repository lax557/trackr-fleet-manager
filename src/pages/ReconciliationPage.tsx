import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

export default function ReconciliationPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Conciliação Bancária</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <RefreshCw className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Em breve</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            A conciliação bancária permitirá importar extratos e conciliar automaticamente com as transações do sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
