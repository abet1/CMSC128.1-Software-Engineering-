import type {
  Person, Product, ProductAddon,
  Rental, Payment,
  Expense, GroupExpenseAllocation,
} from '../types';

// ── Persons ───────────────────────────────────────────────────────────────────

export const mockPersons: Person[] = [
  { id: 'p1', first_name: 'David', middle_name: 'Jonathan', last_name: 'Pasumbal', nickname: 'Dave', phone: '+63 917 111 2222', email: 'dave@email.com', created_at: '2025-10-01T00:00:00Z', updated_at: '2025-10-01T00:00:00Z' },
  { id: 'p2', first_name: 'Josh', last_name: 'Cimanes', nickname: 'Josh', phone: '+63 917 333 4444', email: 'josh@email.com', created_at: '2025-10-02T00:00:00Z', updated_at: '2025-10-02T00:00:00Z' },
  { id: 'p3', first_name: 'Albert', last_name: 'Caro', phone: '+63 917 555 6666', created_at: '2025-10-03T00:00:00Z', updated_at: '2025-10-03T00:00:00Z' },
  { id: 'p4', first_name: 'Maria', last_name: 'Santos', phone: '+63 917 777 8888', email: 'maria@email.com', created_at: '2025-10-04T00:00:00Z', updated_at: '2025-10-04T00:00:00Z' },
  { id: 'p5', first_name: 'Carlo', last_name: 'Reyes', phone: '+63 917 999 0000', created_at: '2025-10-05T00:00:00Z', updated_at: '2025-10-05T00:00:00Z' },
];

// ── Product Add-ons ───────────────────────────────────────────────────────────

export const mockAddons: ProductAddon[] = [
  { id: 'a1', product_id: 'pr1', name: 'Extra Battery', daily_rate: 0, weekly_rate: 0, monthly_rate: 0 },
  { id: 'a2', product_id: 'pr1', name: 'UV Filter', daily_rate: 50, weekly_rate: 200, monthly_rate: 600 },
  { id: 'a3', product_id: 'pr2', name: 'MagSafe Case', daily_rate: 0 },
  { id: 'a4', product_id: 'pr3', name: 'Extra Battery (NP-FZ100)', daily_rate: 0 },
  { id: 'a5', product_id: 'pr3', name: 'Sony 50mm f/1.8 Lens', daily_rate: 300, weekly_rate: 1200, monthly_rate: 3500 },
  { id: 'a6', product_id: 'pr3', name: 'Tamron 28-75mm Lens', daily_rate: 400, weekly_rate: 1500, monthly_rate: 4200 },
  { id: 'a7', product_id: 'pr4', name: 'ND Filter Set', daily_rate: 0 },
  { id: 'a8', product_id: 'pr4', name: 'Carry Bag', daily_rate: 0 },
  { id: 'a9', product_id: 'pr5', name: 'Waterproof Case', daily_rate: 0 },
];

// ── Products ──────────────────────────────────────────────────────────────────

export const mockProducts: Product[] = [
  {
    id: 'pr1', product_name: 'Canon G7X MK2', brand: 'Canon', model: 'G7X Mark II',
    description: 'Compact point-and-shoot with flip screen', category: 'Camera',
    daily_rate: 500, weekly_rate: 2500, monthly_rate: 8000, status: 'RENTED',
    addons: mockAddons.filter(a => a.product_id === 'pr1'),
    created_at: '2025-10-01T00:00:00Z', updated_at: '2025-10-01T00:00:00Z',
  },
  {
    id: 'pr2', product_name: 'iPhone 17 Pro Max', brand: 'Apple', model: 'iPhone 17 Pro Max',
    description: 'Latest iPhone with cinematic mode', category: 'Phone',
    daily_rate: 800, weekly_rate: 4000, monthly_rate: 12000, status: 'AVAILABLE',
    addons: mockAddons.filter(a => a.product_id === 'pr2'),
    created_at: '2025-10-02T00:00:00Z', updated_at: '2025-10-02T00:00:00Z',
  },
  {
    id: 'pr3', product_name: 'Sony A7 IV', brand: 'Sony', model: 'Alpha 7 IV',
    description: 'Full-frame mirrorless, 33MP', category: 'Camera',
    daily_rate: 1500, weekly_rate: 7500, monthly_rate: 22000, status: 'RENTED',
    addons: mockAddons.filter(a => a.product_id === 'pr3'),
    created_at: '2025-10-03T00:00:00Z', updated_at: '2025-10-03T00:00:00Z',
  },
  {
    id: 'pr4', product_name: 'DJI Mini 4 Pro', brand: 'DJI', model: 'Mini 4 Pro',
    description: '4K drone with obstacle sensing', category: 'Drone',
    daily_rate: 1200, weekly_rate: 6000, monthly_rate: 18000, status: 'AVAILABLE',
    addons: mockAddons.filter(a => a.product_id === 'pr4'),
    created_at: '2025-10-04T00:00:00Z', updated_at: '2025-10-04T00:00:00Z',
  },
  {
    id: 'pr5', product_name: 'GoPro Hero 12', brand: 'GoPro', model: 'Hero 12 Black',
    description: '5.3K action camera, waterproof', category: 'Action Cam',
    daily_rate: 400, weekly_rate: 2000, monthly_rate: 6000, status: 'AVAILABLE',
    addons: mockAddons.filter(a => a.product_id === 'pr5'),
    created_at: '2025-10-05T00:00:00Z', updated_at: '2025-10-05T00:00:00Z',
  },
];

// ── Rentals ───────────────────────────────────────────────────────────────────

export const mockRentals: Rental[] = [
  // ACTIVE
  {
    id: 'r1', reference_id: 'DP-807f0',
    product_id: 'pr1', product: mockProducts[0],
    renter_person_id: 'p1', renter_person: mockPersons[0],
    num_periods: 3, payment_per_period: 1500, periods_remaining: 2,
    amount_paid: 1500, amount_remaining: 3000, period_type: 'DAILY',
    status: 'ACTIVE', rental_channel: 'Facebook',
    created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z',
  },
  {
    id: 'r2', reference_id: 'JS-2b9c1',
    product_id: 'pr3', product: mockProducts[2],
    renter_person_id: 'p2', renter_person: mockPersons[1],
    num_periods: 4, payment_per_period: 6000, periods_remaining: 3,
    amount_paid: 6000, amount_remaining: 18000, period_type: 'DAILY',
    status: 'ACTIVE', rental_channel: 'Instagram',
    created_at: '2026-02-25T00:00:00Z', updated_at: '2026-02-25T00:00:00Z',
  },
  // OVERDUE
  {
    id: 'r3', reference_id: 'AC-f3d72',
    product_id: 'pr5', product: mockProducts[4],
    renter_person_id: 'p3', renter_person: mockPersons[2],
    num_periods: 5, payment_per_period: 2000, periods_remaining: 3,
    amount_paid: 4000, amount_remaining: 6000, period_type: 'WEEKLY',
    status: 'OVERDUE', rental_channel: 'Walk-in',
    created_at: '2025-12-01T00:00:00Z', updated_at: '2025-12-01T00:00:00Z',
  },
  // COMPLETED
  {
    id: 'r4', reference_id: 'MS-a1b2c',
    product_id: 'pr2', product: mockProducts[1],
    renter_person_id: 'p4', renter_person: mockPersons[3],
    num_periods: 2, payment_per_period: 1600, periods_remaining: 0,
    amount_paid: 3200, amount_remaining: 0, period_type: 'DAILY',
    status: 'COMPLETED',
    created_at: '2025-11-10T00:00:00Z', updated_at: '2025-11-12T00:00:00Z',
  },
  {
    id: 'r5', reference_id: 'CR-e4f5g',
    product_id: 'pr4', product: mockProducts[3],
    renter_person_id: 'p5', renter_person: mockPersons[4],
    num_periods: 3, payment_per_period: 3600, periods_remaining: 0,
    amount_paid: 10800, amount_remaining: 0, period_type: 'DAILY',
    status: 'COMPLETED',
    created_at: '2025-11-20T00:00:00Z', updated_at: '2025-11-23T00:00:00Z',
  },
  {
    id: 'r6', reference_id: 'DP-7c8d9',
    product_id: 'pr1', product: mockProducts[0],
    renter_person_id: 'p1', renter_person: mockPersons[0],
    num_periods: 1, payment_per_period: 500, periods_remaining: 0,
    amount_paid: 500, amount_remaining: 0, period_type: 'DAILY',
    status: 'COMPLETED',
    created_at: '2025-12-15T00:00:00Z', updated_at: '2025-12-15T00:00:00Z',
  },
  {
    id: 'r7', reference_id: 'JS-0e1f2',
    product_id: 'pr3', product: mockProducts[2],
    renter_person_id: 'p2', renter_person: mockPersons[1],
    num_periods: 2, payment_per_period: 3000, periods_remaining: 0,
    amount_paid: 6000, amount_remaining: 0, period_type: 'DAILY',
    status: 'COMPLETED',
    created_at: '2026-01-05T00:00:00Z', updated_at: '2026-01-06T00:00:00Z',
  },
  {
    id: 'r8', reference_id: 'MS-3a4b5',
    product_id: 'pr4', product: mockProducts[3],
    renter_person_id: 'p4', renter_person: mockPersons[3],
    num_periods: 1, payment_per_period: 1200, periods_remaining: 0,
    amount_paid: 1200, amount_remaining: 0, period_type: 'DAILY',
    status: 'COMPLETED',
    created_at: '2026-01-20T00:00:00Z', updated_at: '2026-01-20T00:00:00Z',
  },
];

// ── Expenses (mock data for UI development)
export const mockExpenses: Expense[] = [
  {
    id: 'exp1',
    description: 'Office supplies',
    amount: 1200,
    status: 'PAID',
    created_at: '2026-02-15T00:00:00Z',
    is_group_expense: false,
    renter_person_id: 'p1',
    renter_person: mockPersons[0],
    amount_paid: 1200,
  },
  {
    id: 'exp2',
    description: 'Team lunch',
    amount: 4500,
    status: 'PARTIALLY_PAID',
    created_at: '2026-02-20T00:00:00Z',
    is_group_expense: true,
    renter_group: { id: 'g1', group_name: 'Team A' },
    allocations: [
      { id: 'a1', expense_id: 'exp2', person_id: 'p1', person: mockPersons[0], allocated_amount: 1500, amount_paid: 500, is_fully_paid: false, allocated_percent: 33.33 },
      { id: 'a2', expense_id: 'exp2', person_id: 'p2', person: mockPersons[1], allocated_amount: 1500, amount_paid: 1500, is_fully_paid: true, allocated_percent: 33.33 },
      { id: 'a3', expense_id: 'exp2', person_id: 'p3', person: mockPersons[2], allocated_amount: 1500, amount_paid: 0, is_fully_paid: false, allocated_percent: 33.33 },
    ],
    payment_allocation_type: 'EQUAL',
  },
];


// ── Payments ──────────────────────────────────────────────────────────────────

export const mockPayments: Payment[] = [
  // Nov 2025
  // example expense payments
  { id: 'exp_pay1', payment_date: '2026-02-16', amount: 1200, payee_person_id: 'p1', payee_person: mockPersons[0], expense_id: 'exp1', expense: mockExpenses[0], created_at: '2026-02-16T10:00:00Z' },
  { id: 'exp_pay2', payment_date: '2026-02-21', amount: 500, payee_person_id: 'p1', payee_person: mockPersons[0], expense_id: 'exp2', expense: mockExpenses[1], created_at: '2026-02-21T10:00:00Z' },
  { id: 'pay1', payment_date: '2025-11-10', amount: 1600, payee_person_id: 'p4', payee_person: mockPersons[3], period_number: 1, rental_id: 'r4', rental: mockRentals[3], created_at: '2025-11-10T10:00:00Z' },
  { id: 'pay2', payment_date: '2025-11-12', amount: 1600, payee_person_id: 'p4', payee_person: mockPersons[3], period_number: 2, rental_id: 'r4', rental: mockRentals[3], created_at: '2025-11-12T10:00:00Z' },
  { id: 'pay3', payment_date: '2025-11-20', amount: 3600, payee_person_id: 'p5', payee_person: mockPersons[4], period_number: 1, rental_id: 'r5', rental: mockRentals[4], created_at: '2025-11-20T10:00:00Z' },
  { id: 'pay4', payment_date: '2025-11-21', amount: 3600, payee_person_id: 'p5', payee_person: mockPersons[4], period_number: 2, rental_id: 'r5', rental: mockRentals[4], created_at: '2025-11-21T10:00:00Z' },
  { id: 'pay5', payment_date: '2025-11-23', amount: 3600, payee_person_id: 'p5', payee_person: mockPersons[4], period_number: 3, rental_id: 'r5', rental: mockRentals[4], created_at: '2025-11-23T10:00:00Z' },
  // Dec 2025
  { id: 'pay6', payment_date: '2025-12-01', amount: 2000, payee_person_id: 'p3', payee_person: mockPersons[2], period_number: 1, rental_id: 'r3', rental: mockRentals[2], created_at: '2025-12-01T10:00:00Z' },
  { id: 'pay7', payment_date: '2025-12-08', amount: 2000, payee_person_id: 'p3', payee_person: mockPersons[2], period_number: 2, rental_id: 'r3', rental: mockRentals[2], created_at: '2025-12-08T10:00:00Z' },
  { id: 'pay8', payment_date: '2025-12-15', amount: 500, payee_person_id: 'p1', payee_person: mockPersons[0], period_number: 1, rental_id: 'r6', rental: mockRentals[5], created_at: '2025-12-15T10:00:00Z' },
  // Jan 2026
  { id: 'pay9',  payment_date: '2026-01-05', amount: 3000, payee_person_id: 'p2', payee_person: mockPersons[1], period_number: 1, rental_id: 'r7', rental: mockRentals[6], created_at: '2026-01-05T10:00:00Z' },
  { id: 'pay10', payment_date: '2026-01-06', amount: 3000, payee_person_id: 'p2', payee_person: mockPersons[1], period_number: 2, rental_id: 'r7', rental: mockRentals[6], created_at: '2026-01-06T10:00:00Z' },
  { id: 'pay11', payment_date: '2026-01-20', amount: 1200, payee_person_id: 'p4', payee_person: mockPersons[3], period_number: 1, rental_id: 'r8', rental: mockRentals[7], created_at: '2026-01-20T10:00:00Z' },
  // Mar 2026
  { id: 'pay12', payment_date: '2026-03-01', amount: 1500, payee_person_id: 'p1', payee_person: mockPersons[0], period_number: 1, rental_id: 'r1', rental: mockRentals[0], created_at: '2026-03-01T10:00:00Z' },
  { id: 'pay13', payment_date: '2026-03-02', amount: 6000, payee_person_id: 'p2', payee_person: mockPersons[1], period_number: 1, rental_id: 'r2', rental: mockRentals[1], created_at: '2026-03-02T10:00:00Z' },
];
