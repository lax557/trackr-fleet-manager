import { formatCurrencyBRL } from '@/lib/utils';

// ── Types ──
export type TransactionType = 'RECEITA' | 'DESPESA';
export type TransactionCategory = 
  | 'LOCACAO' | 'MULTA_REPASSE' | 'DEPOSITO_CAUCAO' | 'OUTROS_RECEITA'
  | 'MANUTENCAO' | 'COMBUSTIVEL' | 'SEGURO' | 'IPVA' | 'LICENCIAMENTO' 
  | 'PARCELA_VEICULO' | 'ALUGUEL_GARAGEM' | 'SALARIOS' | 'OUTROS_DESPESA';

export type PaymentMethod = 'PIX' | 'BOLETO' | 'CARTAO' | 'TRANSFERENCIA' | 'DINHEIRO';
export type BillStatus = 'PENDENTE' | 'PAGO' | 'VENCIDO' | 'CANCELADO';

export interface Transaction {
  id: string;
  date: Date;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  vehicleId?: string;
  driverId?: string;
  notes?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  bank: string;
  agency: string;
  accountNumber: string;
  balance: number;
  type: 'CORRENTE' | 'POUPANCA';
}

export interface Bill {
  id: string;
  type: 'PAGAR' | 'RECEBER';
  description: string;
  amount: number;
  dueDate: Date;
  status: BillStatus;
  category: TransactionCategory;
  contactName: string;
  vehicleId?: string;
}

export interface Partner {
  id: string;
  name: string;
  type: 'FORNECEDOR' | 'CLIENTE';
  document: string;
  phone: string;
  email: string;
  totalTransactions: number;
}

export interface ChartAccount {
  id: string;
  code: string;
  name: string;
  type: 'RECEITA' | 'DESPESA' | 'ATIVO' | 'PASSIVO';
  parent?: string;
}

// ── Seed Data ──

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);
const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000);

export const bankAccounts: BankAccount[] = [
  { id: 'BA-001', name: 'Conta Principal', bank: 'Itaú', agency: '1234', accountNumber: '56789-0', balance: 187450.00, type: 'CORRENTE' },
  { id: 'BA-002', name: 'Reserva', bank: 'Nubank', agency: '0001', accountNumber: '98765-1', balance: 45200.00, type: 'CORRENTE' },
  { id: 'BA-003', name: 'Poupança Veículos', bank: 'Caixa', agency: '0456', accountNumber: '11223-4', balance: 32800.00, type: 'POUPANCA' },
];

const categories: TransactionCategory[] = ['LOCACAO', 'MANUTENCAO', 'COMBUSTIVEL', 'SEGURO', 'IPVA', 'PARCELA_VEICULO', 'ALUGUEL_GARAGEM', 'SALARIOS', 'MULTA_REPASSE', 'DEPOSITO_CAUCAO', 'LICENCIAMENTO'];
const methods: PaymentMethod[] = ['PIX', 'BOLETO', 'CARTAO', 'TRANSFERENCIA', 'DINHEIRO'];

function generateTransactions(): Transaction[] {
  const txns: Transaction[] = [];
  // Recurring rental revenue (45 vehicles * ~R$400/week ≈ R$1600/month each)
  for (let i = 0; i < 45; i++) {
    for (let m = 0; m < 3; m++) {
      txns.push({
        id: `TXN-R-${i}-${m}`,
        date: daysAgo(m * 30 + Math.floor(Math.random() * 7)),
        type: 'RECEITA',
        category: 'LOCACAO',
        description: `Locação semanal - Veículo VH-${String(i + 1).padStart(3, '0')}`,
        amount: 350 + Math.random() * 150,
        paymentMethod: methods[Math.floor(Math.random() * 3)],
        vehicleId: `VH-${String(i + 1).padStart(3, '0')}`,
      });
    }
  }
  // Maintenance expenses
  for (let i = 0; i < 30; i++) {
    txns.push({
      id: `TXN-M-${i}`,
      date: daysAgo(Math.floor(Math.random() * 90)),
      type: 'DESPESA',
      category: 'MANUTENCAO',
      description: `Manutenção ${['preventiva', 'corretiva', 'revisão'][i % 3]} - VH-${String((i % 40) + 1).padStart(3, '0')}`,
      amount: 200 + Math.random() * 1800,
      paymentMethod: methods[Math.floor(Math.random() * methods.length)],
      vehicleId: `VH-${String((i % 40) + 1).padStart(3, '0')}`,
    });
  }
  // Fixed expenses
  const fixedExpenses = [
    { cat: 'ALUGUEL_GARAGEM' as TransactionCategory, desc: 'Aluguel do pátio', amount: 4500 },
    { cat: 'SALARIOS' as TransactionCategory, desc: 'Folha de pagamento', amount: 12000 },
    { cat: 'SEGURO' as TransactionCategory, desc: 'Seguro frota', amount: 8500 },
  ];
  for (const exp of fixedExpenses) {
    for (let m = 0; m < 3; m++) {
      txns.push({
        id: `TXN-F-${exp.cat}-${m}`,
        date: daysAgo(m * 30 + 5),
        type: 'DESPESA',
        category: exp.cat,
        description: exp.desc,
        amount: exp.amount,
        paymentMethod: 'BOLETO',
      });
    }
  }
  // Vehicle installments
  for (let i = 0; i < 20; i++) {
    txns.push({
      id: `TXN-P-${i}`,
      date: daysAgo(Math.floor(Math.random() * 30)),
      type: 'DESPESA',
      category: 'PARCELA_VEICULO',
      description: `Parcela financiamento VH-${String(i + 1).padStart(3, '0')}`,
      amount: 1200 + Math.random() * 800,
      paymentMethod: 'BOLETO',
      vehicleId: `VH-${String(i + 1).padStart(3, '0')}`,
    });
  }
  return txns.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export const transactions = generateTransactions();

function generateBills(): Bill[] {
  const bills: Bill[] = [];
  // Payables
  for (let i = 0; i < 25; i++) {
    const isPast = Math.random() > 0.6;
    bills.push({
      id: `BILL-P-${i}`,
      type: 'PAGAR',
      description: `${['Manutenção', 'Seguro', 'IPVA', 'Parcela', 'Aluguel'][i % 5]} - ${i}`,
      amount: 500 + Math.random() * 3000,
      dueDate: isPast ? daysAgo(Math.floor(Math.random() * 30)) : daysFromNow(Math.floor(Math.random() * 60)),
      status: isPast ? (Math.random() > 0.5 ? 'PAGO' : 'VENCIDO') : 'PENDENTE',
      category: ['MANUTENCAO', 'SEGURO', 'IPVA', 'PARCELA_VEICULO', 'ALUGUEL_GARAGEM'][i % 5] as TransactionCategory,
      contactName: ['Auto Peças Silva', 'Porto Seguro', 'Detran', 'Banco Itaú', 'Imobiliária Central'][i % 5],
    });
  }
  // Receivables
  for (let i = 0; i < 20; i++) {
    const isPast = Math.random() > 0.7;
    bills.push({
      id: `BILL-R-${i}`,
      type: 'RECEBER',
      description: `Locação semanal - Motorista ${i + 1}`,
      amount: 350 + Math.random() * 150,
      dueDate: isPast ? daysAgo(Math.floor(Math.random() * 15)) : daysFromNow(Math.floor(Math.random() * 30)),
      status: isPast ? (Math.random() > 0.4 ? 'PAGO' : 'VENCIDO') : 'PENDENTE',
      category: 'LOCACAO',
      contactName: `Motorista ${String(i + 1).padStart(2, '0')}`,
    });
  }
  return bills;
}

export const bills = generateBills();

export const partners: Partner[] = [
  { id: 'P-001', name: 'Auto Peças Silva', type: 'FORNECEDOR', document: '12.345.678/0001-90', phone: '(11) 99999-1234', email: 'contato@autopecassilva.com', totalTransactions: 45200 },
  { id: 'P-002', name: 'Porto Seguro', type: 'FORNECEDOR', document: '61.198.164/0001-60', phone: '(11) 3366-3000', email: 'empresas@portoseguro.com.br', totalTransactions: 102000 },
  { id: 'P-003', name: 'Borracharia Express', type: 'FORNECEDOR', document: '23.456.789/0001-01', phone: '(11) 98888-5678', email: 'borracharia@express.com', totalTransactions: 18900 },
  { id: 'P-004', name: 'Mecânica Total', type: 'FORNECEDOR', document: '34.567.890/0001-12', phone: '(11) 97777-9012', email: 'mecanica@total.com', totalTransactions: 67800 },
  { id: 'P-005', name: 'Elétrica Rápida', type: 'FORNECEDOR', document: '45.678.901/0001-23', phone: '(11) 96666-3456', email: 'eletrica@rapida.com', totalTransactions: 12300 },
];

export const chartOfAccounts: ChartAccount[] = [
  { id: 'CA-01', code: '1', name: 'Receitas', type: 'RECEITA' },
  { id: 'CA-0101', code: '1.1', name: 'Receita de Locação', type: 'RECEITA', parent: 'CA-01' },
  { id: 'CA-0102', code: '1.2', name: 'Repasse de Multas', type: 'RECEITA', parent: 'CA-01' },
  { id: 'CA-0103', code: '1.3', name: 'Cauções', type: 'RECEITA', parent: 'CA-01' },
  { id: 'CA-02', code: '2', name: 'Despesas Operacionais', type: 'DESPESA' },
  { id: 'CA-0201', code: '2.1', name: 'Manutenção', type: 'DESPESA', parent: 'CA-02' },
  { id: 'CA-0202', code: '2.2', name: 'Combustível', type: 'DESPESA', parent: 'CA-02' },
  { id: 'CA-0203', code: '2.3', name: 'Seguros', type: 'DESPESA', parent: 'CA-02' },
  { id: 'CA-0204', code: '2.4', name: 'IPVA / Licenciamento', type: 'DESPESA', parent: 'CA-02' },
  { id: 'CA-03', code: '3', name: 'Despesas Financeiras', type: 'DESPESA' },
  { id: 'CA-0301', code: '3.1', name: 'Parcelas de Veículos', type: 'DESPESA', parent: 'CA-03' },
  { id: 'CA-04', code: '4', name: 'Despesas Administrativas', type: 'DESPESA' },
  { id: 'CA-0401', code: '4.1', name: 'Aluguel do Pátio', type: 'DESPESA', parent: 'CA-04' },
  { id: 'CA-0402', code: '4.2', name: 'Salários', type: 'DESPESA', parent: 'CA-04' },
];

// ── Aggregated Stats ──

export function getFinancialDashboardStats() {
  const totalBalance = bankAccounts.reduce((s, a) => s + a.balance, 0);
  
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  
  const monthTxns = transactions.filter(t => t.date.getMonth() === thisMonth && t.date.getFullYear() === thisYear);
  const revenue = monthTxns.filter(t => t.type === 'RECEITA').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTxns.filter(t => t.type === 'DESPESA').reduce((s, t) => s + t.amount, 0);
  const profit = revenue - expenses;
  
  const pendingPayables = bills.filter(b => b.type === 'PAGAR' && (b.status === 'PENDENTE' || b.status === 'VENCIDO')).reduce((s, b) => s + b.amount, 0);
  const pendingReceivables = bills.filter(b => b.type === 'RECEBER' && (b.status === 'PENDENTE' || b.status === 'VENCIDO')).reduce((s, b) => s + b.amount, 0);
  
  // Expense breakdown for donut chart
  const expenseByCategory: Record<string, number> = {};
  monthTxns.filter(t => t.type === 'DESPESA').forEach(t => {
    expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
  });
  
  // Cash flow last 6 months
  const cashFlow: { month: string; receitas: number; despesas: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const mTxns = transactions.filter(t => t.date.getMonth() === m && t.date.getFullYear() === y);
    cashFlow.push({
      month: d.toLocaleDateString('pt-BR', { month: 'short' }),
      receitas: mTxns.filter(t => t.type === 'RECEITA').reduce((s, t) => s + t.amount, 0),
      despesas: mTxns.filter(t => t.type === 'DESPESA').reduce((s, t) => s + t.amount, 0),
    });
  }

  const burnRate = expenses / 30;
  const runway = totalBalance / (burnRate || 1);
  const margin = revenue > 0 ? ((profit / revenue) * 100) : 0;

  return {
    totalBalance,
    revenue,
    expenses,
    profit,
    pendingPayables,
    pendingReceivables,
    expenseByCategory,
    cashFlow,
    burnRate,
    runway,
    margin,
  };
}

export const categoryLabels: Record<TransactionCategory, string> = {
  LOCACAO: 'Locação',
  MULTA_REPASSE: 'Repasse Multa',
  DEPOSITO_CAUCAO: 'Caução',
  OUTROS_RECEITA: 'Outros (Receita)',
  MANUTENCAO: 'Manutenção',
  COMBUSTIVEL: 'Combustível',
  SEGURO: 'Seguro',
  IPVA: 'IPVA',
  LICENCIAMENTO: 'Licenciamento',
  PARCELA_VEICULO: 'Parcela Veículo',
  ALUGUEL_GARAGEM: 'Aluguel Garagem',
  SALARIOS: 'Salários',
  OUTROS_DESPESA: 'Outros (Despesa)',
};

export const billStatusLabels: Record<BillStatus, string> = {
  PENDENTE: 'Pendente',
  PAGO: 'Pago',
  VENCIDO: 'Vencido',
  CANCELADO: 'Cancelado',
};
