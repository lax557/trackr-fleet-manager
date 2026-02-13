import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const reports = [
  { title: 'DRE - Demonstrativo de Resultados', description: 'Receitas, despesas e resultado por período', icon: FileText },
  { title: 'Fluxo de Caixa Detalhado', description: 'Entradas e saídas com projeção futura', icon: BarChart3 },
  { title: 'Análise de Rentabilidade', description: 'Margem por veículo, por motorista e consolidada', icon: PieChart },
  { title: 'Relatório de Inadimplência', description: 'Contas vencidas e previsão de recebimento', icon: TrendingUp },
];

export default function FinancialReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Relatórios Financeiros</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map(r => (
          <Card key={r.title} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <r.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
                  <Button variant="ghost" size="sm" className="h-7 text-xs mt-2 -ml-2">Em breve</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
