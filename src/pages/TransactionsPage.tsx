import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { transactions, categoryLabels, bankAccounts, type Transaction, type TransactionType } from '@/data/financialData';
import { formatCurrencyBRL } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Plus, Download, SlidersHorizontal, ChevronLeft, ChevronRight, ArrowUpDown, Filter } from 'lucide-react';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type SortField = 'date' | 'amount' | 'description' | 'category';
type SortDir = 'asc' | 'desc';

const ITEMS_PER_PAGE = 20;

const allColumns = [
  { key: 'date', label: 'Data' },
  { key: 'type', label: 'Tipo' },
  { key: 'description', label: 'Descrição' },
  { key: 'category', label: 'Categoria' },
  { key: 'account', label: 'Conta' },
  { key: 'method', label: 'Método' },
  { key: 'amount', label: 'Valor' },
] as const;

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set(allColumns.map(c => c.key)));
  const [showTransfer, setShowTransfer] = useState(false);
  const [showNewTxn, setShowNewTxn] = useState(false);

  // Transfer form state
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const filtered = useMemo(() => {
    let data = transactions.filter(t => {
      const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || t.type === typeFilter;
      const matchCat = categoryFilter === 'all' || t.category === categoryFilter;
      return matchSearch && matchType && matchCat;
    });
    data.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = a.date.getTime() - b.date.getTime();
      else if (sortField === 'amount') cmp = a.amount - b.amount;
      else if (sortField === 'description') cmp = a.description.localeCompare(b.description);
      else if (sortField === 'category') cmp = a.category.localeCompare(b.category);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [search, typeFilter, categoryFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const activeFilters = [typeFilter !== 'all', categoryFilter !== 'all', search !== ''].filter(Boolean).length;

  const isCol = (key: string) => visibleCols.has(key);
  const toggleCol = (key: string) => {
    setVisibleCols(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(field)}>
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
        <h1 className="text-2xl font-bold text-foreground">Transações</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowTransfer(true)}>
            <ArrowLeftRight className="h-4 w-4 mr-1.5" /> Nova Transferência
          </Button>
          <Button size="sm" onClick={() => setShowNewTxn(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Nova Transação
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar transação..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="RECEITA">Receitas</SelectItem>
            <SelectItem value="DESPESA">Despesas</SelectItem>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Colunas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {allColumns.map(col => (
              <DropdownMenuCheckboxItem key={col.key} checked={isCol(col.key)} onCheckedChange={() => toggleCol(col.key)}>
                {col.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {activeFilters > 0 && (
          <Badge variant="secondary" className="text-xs gap-1">
            <Filter className="h-3 w-3" /> {activeFilters} filtro{activeFilters > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {isCol('date') && <SortHeader field="date">Data</SortHeader>}
                {isCol('type') && <TableHead>Tipo</TableHead>}
                {isCol('description') && <SortHeader field="description">Descrição</SortHeader>}
                {isCol('category') && <SortHeader field="category">Categoria</SortHeader>}
                {isCol('account') && <TableHead>Conta</TableHead>}
                {isCol('method') && <TableHead>Método</TableHead>}
                {isCol('amount') && <SortHeader field="amount">Valor</SortHeader>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length > 0 ? paged.map(t => (
                <TableRow key={t.id} className="cursor-pointer hover:bg-muted/50">
                  {isCol('date') && <TableCell className="text-sm">{t.date.toLocaleDateString('pt-BR')}</TableCell>}
                  {isCol('type') && (
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {t.type === 'RECEITA' ? <ArrowDownCircle className="h-3.5 w-3.5 text-green-600" /> : <ArrowUpCircle className="h-3.5 w-3.5 text-red-600" />}
                        <span className="text-xs">{t.type === 'RECEITA' ? 'Receita' : 'Despesa'}</span>
                      </div>
                    </TableCell>
                  )}
                  {isCol('description') && <TableCell className="text-sm max-w-[300px] truncate">{t.description}</TableCell>}
                  {isCol('category') && <TableCell><Badge variant="secondary" className="text-[10px]">{categoryLabels[t.category]}</Badge></TableCell>}
                  {isCol('account') && <TableCell className="text-xs text-muted-foreground">Conta Principal</TableCell>}
                  {isCol('method') && <TableCell className="text-xs text-muted-foreground">{t.paymentMethod}</TableCell>}
                  {isCol('amount') && (
                    <TableCell className={`text-right text-sm font-medium ${t.type === 'RECEITA' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'RECEITA' ? '+' : '-'}{formatCurrencyBRL(t.amount)}
                    </TableCell>
                  )}
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma transação encontrada.</TableCell>
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
            {filtered.length} transação(ões) • Página {page} de {totalPages}
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

      {/* Transfer Modal */}
      <Dialog open={showTransfer} onOpenChange={setShowTransfer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Transferência</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Conta Origem</Label>
              <Select value={transferFrom} onValueChange={setTransferFrom}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {bankAccounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name} — {formatCurrencyBRL(a.balance)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Conta Destino</Label>
              <Select value={transferTo} onValueChange={setTransferTo}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {bankAccounts.filter(a => a.id !== transferFrom).map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name} — {formatCurrencyBRL(a.balance)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input type="number" placeholder="0,00" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observação</Label>
              <Input placeholder="Observação (opcional)" value={transferNote} onChange={e => setTransferNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransfer(false)}>Cancelar</Button>
            <Button onClick={() => setShowTransfer(false)}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Transaction Modal */}
      <Dialog open={showNewTxn} onOpenChange={setShowNewTxn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECEITA">Receita</SelectItem>
                  <SelectItem value="DESPESA">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input placeholder="Descrição da transação" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input type="number" placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
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
                <Label>Método</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="BOLETO">Boleto</SelectItem>
                    <SelectItem value="CARTAO">Cartão</SelectItem>
                    <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
                    <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Conta</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {bankAccounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTxn(false)}>Cancelar</Button>
            <Button onClick={() => setShowNewTxn(false)}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
