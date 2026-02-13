import { chartOfAccounts } from '@/data/financialData';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const typeColors: Record<string, string> = {
  RECEITA: 'bg-green-100 text-green-800 border-green-200',
  DESPESA: 'bg-red-100 text-red-800 border-red-200',
  ATIVO: 'bg-blue-100 text-blue-800 border-blue-200',
  PASSIVO: 'bg-amber-100 text-amber-800 border-amber-200',
};

export default function ChartOfAccountsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Plano de Contas</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chartOfAccounts.map(ca => (
                <TableRow key={ca.id}>
                  <TableCell className={`text-sm font-medium ${ca.parent ? 'pl-8' : ''}`}>{ca.code}</TableCell>
                  <TableCell className={`text-sm ${ca.parent ? 'text-muted-foreground' : 'font-medium'}`}>{ca.name}</TableCell>
                  <TableCell><Badge className={`text-[10px] ${typeColors[ca.type] || ''}`}>{ca.type}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
