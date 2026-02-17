import { useState, useMemo } from 'react';
import { bills, billStatusLabels, categoryLabels, type BillStatus } from '@/data/financialData';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyBRL } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, Upload, Download, ChevronLeft, ChevronRight, ArrowUpDown, CheckCircle2, MoreHorizontal, Pencil, XCircle, History } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const ITEMS_PER_PAGE = 15;

const statusColor: Record<string, string> = {
  PENDENTE: 'bg-amber-100 text-amber-800 border-amber-200',
  PAGO: 'bg-green-100 text-green-800 border-green-200',
  VENCIDO: 'bg-red-100 text-red-800 border-red-200',
  CANCELADO: 'bg-muted text-muted-foreground border-border',
};

type SortField = 'dueDate' | 'amount' | 'contactName';
type SortDir = 'asc' | 'desc';

export default function BillsPage({ type }: { type: 'PAGAR' | 'RECEBER' }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showNew, setShowNew] = useState(false);

  const isPagar = type === 'PAGAR';

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let data = bills.filter(b => {
      const matchType = b.type === type;
      const matchSearch = b.description.toLowerCase().includes(search.toLowerCase()) || b.contactName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchCat = categoryFilter === 'all' || b.category === categoryFilter;
      return matchType && matchSearch && matchStatus && matchCat;
    });
    data.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'dueDate') cmp = a.dueDate.getTime() - b.dueDate.getTime();
      else if (sortField === 'amount') cmp = a.amount - b.amount;
      else if (sortField === 'contactName') cmp = a.contactName.localeCompare(b.contactName);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [type, search, statusFilter, categoryFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Summary stats
  const pendingTotal = filtered.filter(b => b.status === 'PENDENTE').reduce((s, b) => s + b.amount, 0);
  const overdueTotal = filtered.filter(b => b.status === 'VENCIDO').reduce((s, b) => s + b.amount, 0);
  const paidTotal = filtered.filter(b => b.status === 'PAGO').reduce((s, b) => s + b.amount, 0);

  const SortHeader = ({ field, children, className }: { field: SortField; children: React.ReactNode; className?: string }) => (
    <TableHead className={`cursor-pointer select-none ${className || ''}`} onClick={() => toggleSort(field)}>
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`h-3 w-3 ${sortField === field ? 'text-primary' : 'text-muted-foreground/50'}`} />
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          Contas a {isPagar ? 'Pagar' : 'Receber'}
        </h1>
        <div className="flex gap-2">
          {isPagar && (
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-1.5" /> Importar
            </Button>
          )}
          <Button size="sm" onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Nova Conta a {isPagar ? 'Pagar' : 'Receber'}
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-lg font-bold text-amber-600">{formatCurrencyBRL(pendingTotal)}</p>
            <p className="text-[11px] text-muted-foreground">Pendente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-lg font-bold text-red-600">{formatCurrencyBRL(overdueTotal)}</p>
            <p className="text-[11px] text-muted-foreground">Vencido</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-lg font-bold text-green-600">{formatCurrencyBRL(paidTotal)}</p>
            <p className="text-[11px] text-muted-foreground">Pago</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="PENDENTE">Pendente</SelectItem>
            <SelectItem value="PAGO">Pago</SelectItem>
            <SelectItem value="VENCIDO">Vencido</SelectItem>
            <SelectItem value="CANCELADO">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {Object.entries(categoryLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" /> Exportar
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHeader field="contactName">{isPagar ? 'Fornecedor' : 'Cliente'}</SortHeader>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <SortHeader field="dueDate">Vencimento</SortHeader>
                <TableHead>Status</TableHead>
                <SortHeader field="amount" className="text-right">Valor</SortHeader>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length > 0 ? paged.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="text-sm font-medium">{b.contactName}</TableCell>
                  <TableCell className="text-sm max-w-[250px] truncate">{b.description}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{categoryLabels[b.category]}</Badge></TableCell>
                  <TableCell className="text-sm">{b.dueDate.toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell><Badge className={`text-[10px] ${statusColor[b.status] || ''}`}>{billStatusLabels[b.status]}</Badge></TableCell>
                  <TableCell className="text-right text-sm font-medium">{formatCurrencyBRL(b.amount)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {b.status !== 'PAGO' && (
                          <DropdownMenuItem><CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Marcar como pago</DropdownMenuItem>
                        )}
                        <DropdownMenuItem><Pencil className="h-3.5 w-3.5 mr-2" /> Editar</DropdownMenuItem>
                        <DropdownMenuItem><History className="h-3.5 w-3.5 mr-2" /> Histórico</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600"><XCircle className="h-3.5 w-3.5 mr-2" /> Cancelar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum registro encontrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {filtered.length} registro(s) • Página {page} de {totalPages}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* New Bill Modal */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Conta a {isPagar ? 'Pagar' : 'Receber'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isPagar ? 'Fornecedor' : 'Cliente'}</Label>
              <Input placeholder="Nome do contato" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input placeholder="Descrição" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input type="number" placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <Label>Vencimento</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Competência</Label>
                <Input type="month" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Parcelas</Label>
                <Input type="number" placeholder="1" min={1} defaultValue={1} />
              </div>
              <div className="space-y-2">
                <Label>Repetir</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Não repetir" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não repetir</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
            <Button onClick={() => setShowNew(false)}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
