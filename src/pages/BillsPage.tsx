import { useState, useMemo } from 'react';
import { bills, billStatusLabels, categoryLabels } from '@/data/financialData';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyBRL } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function BillsPage({ type }: { type: 'PAGAR' | 'RECEBER' }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return bills.filter(b => {
      const matchType = b.type === type;
      const matchSearch = b.description.toLowerCase().includes(search.toLowerCase()) || b.contactName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchType && matchSearch && matchStatus;
    }).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [type, search, statusFilter]);

  const statusColor: Record<string, string> = {
    PENDENTE: 'bg-amber-100 text-amber-800 border-amber-200',
    PAGO: 'bg-green-100 text-green-800 border-green-200',
    VENCIDO: 'bg-red-100 text-red-800 border-red-200',
    CANCELADO: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">
        Contas a {type === 'PAGAR' ? 'Pagar' : 'Receber'}
      </h1>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="PENDENTE">Pendente</SelectItem>
            <SelectItem value="PAGO">Pago</SelectItem>
            <SelectItem value="VENCIDO">Vencido</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vencimento</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="text-sm">{b.dueDate.toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-sm max-w-[250px] truncate">{b.description}</TableCell>
                  <TableCell className="text-sm">{b.contactName}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{categoryLabels[b.category]}</Badge></TableCell>
                  <TableCell><Badge className={`text-[10px] ${statusColor[b.status] || ''}`}>{billStatusLabels[b.status]}</Badge></TableCell>
                  <TableCell className="text-right text-sm font-medium">{formatCurrencyBRL(b.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
