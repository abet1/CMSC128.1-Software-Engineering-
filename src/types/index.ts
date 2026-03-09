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
  payment_date: string;
  amount: number;
  payee_person_id: string;
  payee_person?: Person;
  period_number?: number;
  proof_url?: string;
  notes?: string;
  rental_id?: string;
  rental?: Rental;
  created_at: string;
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
