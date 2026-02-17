import { useState, useMemo } from 'react';
import { bankAccounts } from '@/data/financialData';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrencyBRL } from '@/lib/utils';
import { Building2, Plus, Search, MoreHorizontal, Pencil, Trash2, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function BankAccountsPage() {
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);

  const totalBalance = bankAccounts.reduce((s, a) => s + a.balance, 0);

  const filtered = useMemo(() => {
    if (!search) return bankAccounts;
    const q = search.toLowerCase();
    return bankAccounts.filter(a => a.name.toLowerCase().includes(q) || a.bank.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contas Bancárias</h1>
          <p className="text-sm text-muted-foreground">Saldo total: {formatCurrencyBRL(totalBalance)}</p>
        </div>
        <Button size="sm" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> Nova Conta
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome ou banco..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Banco</TableHead>
                <TableHead>Agência</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Saldo Atual</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(acc => (
                <TableRow key={acc.id}>
                  <TableCell className="font-medium text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary shrink-0" />
                      {acc.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{acc.bank}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{acc.agency}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{acc.accountNumber}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">
                      {acc.type === 'CORRENTE' ? 'Corrente' : 'Poupança'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="text-[10px] bg-green-100 text-green-800 border-green-200">Ativa</Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm font-bold text-foreground">{formatCurrencyBRL(acc.balance)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Pencil className="h-3.5 w-3.5 mr-2" /> Editar</DropdownMenuItem>
                        <DropdownMenuItem><Power className="h-3.5 w-3.5 mr-2" /> Desativar</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600"><Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma conta encontrada.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Account Modal */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Conta Bancária</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Conta</Label>
              <Input placeholder="Ex: Conta Principal" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Banco</Label>
                <Input placeholder="Ex: Itaú" />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CORRENTE">Corrente</SelectItem>
                    <SelectItem value="POUPANCA">Poupança</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Agência</Label>
                <Input placeholder="0000" />
              </div>
              <div className="space-y-2">
                <Label>Número da Conta</Label>
                <Input placeholder="00000-0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Saldo Inicial</Label>
                <Input type="number" placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
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
