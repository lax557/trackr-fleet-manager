import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { transactions, categoryLabels, type TransactionType } from '@/data/financialData';
import { formatCurrencyBRL } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || t.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [search, typeFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Transações</h1>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar transação..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="RECEITA">Receitas</SelectItem>
            <SelectItem value="DESPESA">Despesas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(0, 50).map(t => (
                <TableRow key={t.id}>
                  <TableCell className="text-sm">{t.date.toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {t.type === 'RECEITA' ? <ArrowDownCircle className="h-3.5 w-3.5 text-green-600" /> : <ArrowUpCircle className="h-3.5 w-3.5 text-red-600" />}
                      <span className="text-xs">{t.type === 'RECEITA' ? 'Receita' : 'Despesa'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm max-w-[300px] truncate">{t.description}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{categoryLabels[t.category]}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.paymentMethod}</TableCell>
                  <TableCell className={`text-right text-sm font-medium ${t.type === 'RECEITA' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'RECEITA' ? '+' : '-'}{formatCurrencyBRL(t.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
