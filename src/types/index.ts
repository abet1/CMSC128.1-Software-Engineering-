// ── Loan tracker enums ────────────────────────────────────────────────────────

export type TransactionType      = 'LEND' | 'BORROW' | 'GROUP_EXPENSE' | 'STRAIGHT_EXPENSE' | 'INSTALLMENT_EXPENSE';
export type PaymentFrequency     = 'WEEKLY' | 'MONTHLY' | 'ANNUALLY';
export type InstallmentStatus    = 'PENDING' | 'PAID' | 'SKIPPED';
export type TransactionDirection = 'IN' | 'OUT';
export type PaymentStatus        = 'PAID' | 'PARTIALLY_PAID' | 'UNPAID';

// ── Core entities ─────────────────────────────────────────────────────────────

export interface Person {
  id: string;
  // Loan-tracker fields (primary)
  name?: string;
  createdAt?: Date | string;
  // Rental-tracker / backend fields (kept for compatibility)
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  nickname?: string;
  phone?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Group {
  id: string;
  name: string;
  members: { id: string; name: string; phone?: string }[];
  createdAt?: Date | string;
}

export interface Transaction {
  id: string;
  entryName?: string;
  referenceId?: string;
  amount?: number;
  amountBorrowed?: number;
  amountRemaining?: number;
  borrowerContactId?: string;
  borrowerGroupId?: string | null;
  lenderContactId?: string | null;
  transactionType?: TransactionType;
  status?: string;
  dateBorrowed?: string;
  paymentFrequency?: PaymentFrequency;
  numberOfTerms?: number;
  notes?: string;
  loanChannel?: string;
  proofUrl?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface Payment {
  id: string;
  // Loan-tracker fields
  transactionId?: string;
  paymentAmount?: number;
  paymentDate?: string | Date;
  payeeId?: string;
  installmentId?: string;
  proofUrl?: string;
  notes?: string;
  // Rental-tracker / backend fields (kept for compatibility)
  payment_date?: string;
  amount?: number;
  payee_person_id?: string;
  payee_person?: Person;
  period_number?: number;
  rental_id?: string;
  expense_id?: string;
  created_at?: string;
}

export interface PaymentAllocation {
  id: string;
  transactionId: string;
  personId: string;
  allocated_amount: number;
  allocated_percent?: number;
  amount_paid: number;
  is_fully_paid?: boolean;
  person?: Person;
}

export interface Installment {
  id: string;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  status: InstallmentStatus;
  paidDate?: string;
}

export interface InstallmentPlan {
  transactionId: string;
  installments: Installment[];
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  status: 'PAID' | 'PARTIALLY_PAID' | 'PENDING';
  created_at: string;
  is_group_expense: boolean;
  renter_person_id?: string;
  renter_person?: Person;
  renter_group?: { id: string; group_name: string };
  allocations?: GroupExpenseAllocation[];
  payment_allocation_type?: string;
  amount_paid?: number;
}

export interface GroupExpenseAllocation {
  id: string;
  expense_id?: string;
  person_id?: string;
  person?: Person;
  allocated_amount: number;
  allocated_percent?: number;
  amount_paid: number;
  is_fully_paid?: boolean;
}

// ── Loan-tracker helpers ──────────────────────────────────────────────────────

export function isLendTransaction(t: Transaction): boolean {
  return t.transactionType === 'LEND' || t.transactionType === 'STRAIGHT_EXPENSE';
}

export function isBorrowTransaction(t: Transaction): boolean {
  return t.transactionType === 'BORROW' || t.transactionType === 'INSTALLMENT_EXPENSE';
}

export function generateReferenceId(borrowerName: string, lenderName: string, uuid: string): string {
  const initials = (name: string): string => {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return `${name[0]}${name[name.length - 1]}`.toUpperCase();
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  };
  return `${initials(borrowerName)}${initials(lenderName)}-${uuid.slice(-5)}`;
}

export function calculateNextPaymentDate(current: string, frequency: PaymentFrequency): string {
  const d = new Date(current);
  if (frequency === 'WEEKLY')   d.setDate(d.getDate() + 7);
  else if (frequency === 'MONTHLY')  d.setMonth(d.getMonth() + 1);
  else if (frequency === 'ANNUALLY') d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

export const calculateInstallmentStatus = (installment: Installment): InstallmentStatus | 'OVERDUE' | 'UNPAID' => {
  if (installment.amountPaid >= installment.amountDue) return 'PAID';
  if (installment.status === 'SKIPPED') return 'SKIPPED';
  const dueDate = new Date(installment.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dueDate < today) return 'OVERDUE';
  return 'UNPAID';
};

// ── Shared utility helpers ────────────────────────────────────────────────────

export function personFullName(p: Person): string {
  if (p.name) return p.name;
  return [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(' ');
}

export function personInitials(p: Person): string {
  if (p.name) {
    const words = p.name.trim().split(/\s+/);
    return words.length >= 2
      ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
      : p.name.slice(0, 2).toUpperCase();
  }
  return `${(p.first_name ?? '?')[0]}${(p.last_name ?? '?')[0]}`.toUpperCase();
}

export function groupInitials(g: Group): string {
  const words = g.name.trim().split(/\s+/);
  return words.length === 1
    ? `${g.name[0]}${g.name[g.name.length - 1]}`.toUpperCase()
    : `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);

export const formatCurrencyCompact = (amount: number): string =>
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function expenseProgress(expense: Expense): number {
  if (expense.amount === 0) return 0;
  const paid = expense.amount_paid ?? 0;
  return Math.min(paid / expense.amount, 1);
}
