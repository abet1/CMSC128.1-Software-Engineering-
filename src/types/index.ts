// ── Enums ────────────────────────────────────────────────────────────────────

export type PeriodType      = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type RentalStatus    = 'ACTIVE' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
export type ExpenseStatus   = 'PENDING' | 'PARTIALLY_PAID' | 'PAID';
export type AllocationMethod = 'EQUAL' | 'PERCENT' | 'AMOUNT';
export type ProductStatus   = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';

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

export interface ContactGroup {
  id: string;
  group_name: string;
  members?: Person[];
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
  title: string;
  product_id: string;
  product?: Product;
  renter_person_id?: string;
  renter_group_id?: string;
  renter_person?: Person;
  renter_group?: ContactGroup;
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

export interface GroupExpenseAllocation {
  id: string;
  expense_id: string;
  person_id: string;
  person?: Person;
  allocated_amount: number;
  allocated_percent?: number;
  amount_paid: number;
  is_fully_paid: boolean;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  renter_person_id?: string;
  renter_group_id?: string;
  renter_person?: Person;
  renter_group?: ContactGroup;
  is_group_expense: boolean;
  payment_allocation_type?: AllocationMethod;
  status: ExpenseStatus;
  allocations?: GroupExpenseAllocation[];
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  payment_date: string;
  amount: number;
  payee_person_id: string;
  payee_person?: Person;
  period_number?: number;
  proof_url?: string;
  notes?: string;
  rental_id?: string;
  rental?: Rental;
  expense_id?: string;
  expense?: Expense;
  group_expense_allocation_id?: string;
  created_at: string;
}

// ── Utility Helpers ───────────────────────────────────────────────────────────

export function personFullName(p: Person): string {
  return [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(' ');
}

export function personInitials(p: Person): string {
  return `${p.first_name[0]}${p.last_name[0]}`.toUpperCase();
}

export function groupInitials(g: ContactGroup): string {
  const name = g.group_name;
  return `${name[0]}${name[name.length - 1]}`.toUpperCase();
}

export function rentalProgress(r: Rental): number {
  if (r.num_periods === 0) return 0;
  return ((r.num_periods - r.periods_remaining) / r.num_periods) * 100;
}

export function expenseProgress(e: Expense): number {
  if (e.amount === 0) return 0;
  const paid = e.allocations
    ? e.allocations.reduce((sum, a) => sum + a.amount_paid, 0)
    : e.amount - (e.amount * (e.status === 'PAID' ? 0 : e.status === 'PENDING' ? 1 : 0.5));
  return Math.min((paid / e.amount) * 100, 100);
}

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);

export const formatCurrencyCompact = (amount: number): string =>
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
