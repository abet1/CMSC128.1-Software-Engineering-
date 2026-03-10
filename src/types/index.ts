// ── Enums ────────────────────────────────────────────────────────────────────

export type PeriodType    = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type RentalStatus  = 'ACTIVE' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
export type ProductStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';

// ── Core Entities ─────────────────────────────────────────────────────────────

export interface Person {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  nickname?: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductAddon {
  id: string;
  product_id: string;
  name: string;
  daily_rate: number;
  weekly_rate?: number;
  monthly_rate?: number;
}

export interface Product {
  id: string;
  product_name: string;
  brand?: string;
  model?: string;
  description?: string;
  category?: string;
  daily_rate: number;
  weekly_rate?: number;
  monthly_rate?: number;
  status: ProductStatus;
  image_url?: string;
  addons?: ProductAddon[];
  created_at: string;
  updated_at: string;
}

export interface Rental {
  id: string;
  reference_id: string;
  product_id: string;
  product?: Product;
  renter_person_id: string;
  renter_person?: Person;
  num_periods: number;
  payment_per_period: number;
  periods_remaining: number;
  amount_paid: number;
  amount_remaining: number;
  period_type: PeriodType;
  status: RentalStatus;
  rental_channel?: string;
  proof_of_rental_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;

  // backend-style
  payment_date?: string;
  amount?: number;
  payee_person_id: string;
  payee_person?: Person;
  period_number?: number;
  proof_url?: string;
  notes?: string;
  rental_id?: string;
  rental?: Rental;
  expense_id?: string;
  expense?: Expense;
  created_at?: string;

  // frontend helpers / camelCase
  transactionId?: string;
  paymentAmount?: number;
  paymentDate?: string | Date;
  installmentId?: string;
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

export interface Group {
  id: string;
  name: string;
  members: { id: string; name: string; phone?: string }[];
}

export type TransactionType = 'LEND' | 'BORROW' | 'GROUP_EXPENSE' | 'STRAIGHT_EXPENSE' | 'INSTALLMENT_EXPENSE';
export type PaymentFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type InstallmentStatus = 'PENDING' | 'PAID' | 'SKIPPED';
export type TransactionDirection = 'IN' | 'OUT';

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
  [key: string]: any;
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

export function expenseProgress(expense: Expense): number {
  if (!expense) return 0;
  if (expense.status === 'PAID') return 100;
  if (expense.status === 'PENDING') return 0;
  if (expense.amount === 0) return 0;
  if (expense.amount_paid != null) {
    return Math.min((expense.amount_paid / expense.amount) * 100, 100);
  }
  if (expense.allocations) {
    const paid = expense.allocations.reduce((sum, a) => sum + (a.amount_paid || 0), 0);
    return Math.min((paid / expense.amount) * 100, 100);
  }
  return 0;
}

export function isLendTransaction(t: Transaction): boolean {
  return t.transactionType === 'LEND' || t.transactionType === 'STRAIGHT_EXPENSE';
}

export function isBorrowTransaction(t: Transaction): boolean {
  return t.transactionType === 'BORROW' || t.transactionType === 'INSTALLMENT_EXPENSE';
}

export function calculateNextPaymentDate(current: string, frequency: PaymentFrequency): string {
  const d = new Date(current);
  if (frequency === 'DAILY') d.setDate(d.getDate() + 1);
  else if (frequency === 'WEEKLY') d.setDate(d.getDate() + 7);
  else if (frequency === 'MONTHLY') d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
}

// ── Utility Helpers ───────────────────────────────────────────────────────────

export function personFullName(p: Person): string {
  return [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(' ');
}

export function personInitials(p: Person): string {
  return `${p.first_name[0]}${p.last_name[0]}`.toUpperCase();
}

export function rentalProgress(r: Rental): number {
  if (r.num_periods === 0) return 0;
  return ((r.num_periods - r.periods_remaining) / r.num_periods) * 100;
}

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);

export const formatCurrencyCompact = (amount: number): string =>
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const calculateInstallmentStatus = (installment: any, startDate?: any) => {
  if (installment.amountPaid >= installment.amountDue) return 'PAID';
  if (installment.status === 'SKIPPED') return 'SKIPPED';
  
  const dueDate = new Date(installment.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  
  if (dueDate < today) return 'OVERDUE';
  return 'UNPAID';
};