import type {
  Person,
  Expense,
  GroupExpenseAllocation,
  Payment,
  Transaction,
} from '../types';

// ── Persons ───────────────────────────────────────────────────────────────────

export const mockPersons: Person[] = [
  { id: 'p1', name: 'David Pasumbal', phone: '+63 917 111 2222', email: 'dave@email.com', created_at: '2025-10-01T00:00:00Z' },
  { id: 'p2', name: 'Josh Cimanes',   phone: '+63 917 333 4444', email: 'josh@email.com', created_at: '2025-10-02T00:00:00Z' },
  { id: 'p3', name: 'Albert Caro',    phone: '+63 917 555 6666', created_at: '2025-10-03T00:00:00Z' },
  { id: 'p4', name: 'Maria Santos',   phone: '+63 917 777 8888', email: 'maria@email.com', created_at: '2025-10-04T00:00:00Z' },
  { id: 'p5', name: 'Carlo Reyes',    phone: '+63 917 999 0000', created_at: '2025-10-05T00:00:00Z' },
];

// ── Transactions (Loan entries) ────────────────────────────────────────────────

export const mockTransactions: Transaction[] = [
  {
    id: 'tx1',
    entryName: 'iPhone Purchase Loan',
    referenceId: 'DPJC-7f2a1',
    amount: 30000, amountBorrowed: 30000, amountRemaining: 18000,
    borrowerContactId: 'p1', lenderContactId: 'p2',
    transactionType: 'LEND',
    status: 'PARTIALLY_PAID',
    dateBorrowed: '2025-12-01',
    paymentFrequency: 'MONTHLY',
    numberOfTerms: 6,
    loanChannel: 'GCash',
    createdAt: '2025-12-01T00:00:00Z',
  },
  {
    id: 'tx2',
    entryName: 'Laptop Emergency Fund',
    referenceId: 'ACJC-9b3c2',
    amount: 15000, amountBorrowed: 15000, amountRemaining: 15000,
    borrowerContactId: 'p3', lenderContactId: 'p2',
    transactionType: 'LEND',
    status: 'UNPAID',
    dateBorrowed: '2026-01-10',
    paymentFrequency: 'MONTHLY',
    numberOfTerms: 3,
    loanChannel: 'Cash',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'tx3',
    entryName: 'Business Capital',
    referenceId: 'MSJC-4e5f3',
    amount: 50000, amountBorrowed: 50000, amountRemaining: 20000,
    borrowerContactId: 'p4', lenderContactId: 'p2',
    transactionType: 'LEND',
    status: 'PARTIALLY_PAID',
    dateBorrowed: '2025-11-01',
    paymentFrequency: 'MONTHLY',
    numberOfTerms: 5,
    loanChannel: 'Bank Transfer',
    createdAt: '2025-11-01T00:00:00Z',
  },
  {
    id: 'tx4',
    entryName: 'Tuition Fee Loan',
    referenceId: 'JCDP-1a2b4',
    amount: 20000, amountBorrowed: 20000, amountRemaining: 0,
    borrowerContactId: 'p2', lenderContactId: 'p1',
    transactionType: 'BORROW',
    status: 'PAID',
    dateBorrowed: '2025-09-01',
    paymentFrequency: 'MONTHLY',
    numberOfTerms: 4,
    loanChannel: 'GCash',
    createdAt: '2025-09-01T00:00:00Z',
  },
  {
    id: 'tx5',
    entryName: 'Medical Bills',
    referenceId: 'CRJC-8d7e5',
    amount: 8000, amountBorrowed: 8000, amountRemaining: 4000,
    borrowerContactId: 'p5', lenderContactId: 'p2',
    transactionType: 'LEND',
    status: 'PARTIALLY_PAID',
    dateBorrowed: '2026-02-15',
    paymentFrequency: 'WEEKLY',
    numberOfTerms: 8,
    loanChannel: 'GCash',
    createdAt: '2026-02-15T00:00:00Z',
  },
];

// ── Expenses ──────────────────────────────────────────────────────────────────

export const mockExpenses: Expense[] = [
  {
    id: 'exp1',
    description: 'Office Supplies',
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
    description: 'Team Lunch',
    amount: 4500,
    status: 'PARTIALLY_PAID',
    created_at: '2026-02-20T00:00:00Z',
    is_group_expense: true,
    renter_group: { id: 'g1', group_name: 'Team A' },
    allocations: [
      { id: 'al1', expense_id: 'exp2', person_id: 'p1', person: mockPersons[0], allocated_amount: 1500, amount_paid: 500,  is_fully_paid: false, allocated_percent: 33.33 },
      { id: 'al2', expense_id: 'exp2', person_id: 'p2', person: mockPersons[1], allocated_amount: 1500, amount_paid: 1500, is_fully_paid: true,  allocated_percent: 33.33 },
      { id: 'al3', expense_id: 'exp2', person_id: 'p3', person: mockPersons[2], allocated_amount: 1500, amount_paid: 0,    is_fully_paid: false, allocated_percent: 33.33 },
    ] as GroupExpenseAllocation[],
    payment_allocation_type: 'EQUAL',
  },
];

// ── Payments ──────────────────────────────────────────────────────────────────

export const mockPayments: Payment[] = [
  // tx1 — iPhone Purchase Loan (6 payments of ₱5,000)
  { id: 'pay1',  payment_date: '2025-12-01', amount: 5000, payee_person_id: 'p1', payee_person: mockPersons[0], transactionId: 'tx1', created_at: '2025-12-01T10:00:00Z' },
  { id: 'pay2',  payment_date: '2026-01-01', amount: 5000, payee_person_id: 'p1', payee_person: mockPersons[0], transactionId: 'tx1', created_at: '2026-01-01T10:00:00Z' },
  { id: 'pay3',  payment_date: '2026-02-01', amount: 2000, payee_person_id: 'p1', payee_person: mockPersons[0], transactionId: 'tx1', created_at: '2026-02-01T10:00:00Z' },
  // tx3 — Business Capital (3 payments of ₱10,000)
  { id: 'pay4',  payment_date: '2025-11-01', amount: 10000, payee_person_id: 'p4', payee_person: mockPersons[3], transactionId: 'tx3', created_at: '2025-11-01T10:00:00Z' },
  { id: 'pay5',  payment_date: '2025-12-01', amount: 10000, payee_person_id: 'p4', payee_person: mockPersons[3], transactionId: 'tx3', created_at: '2025-12-01T10:00:00Z' },
  { id: 'pay6',  payment_date: '2026-01-01', amount: 10000, payee_person_id: 'p4', payee_person: mockPersons[3], transactionId: 'tx3', created_at: '2026-01-01T10:00:00Z' },
  // tx4 — Tuition Fee (fully paid)
  { id: 'pay7',  payment_date: '2025-09-01', amount: 5000, payee_person_id: 'p2', payee_person: mockPersons[1], transactionId: 'tx4', created_at: '2025-09-01T10:00:00Z' },
  { id: 'pay8',  payment_date: '2025-10-01', amount: 5000, payee_person_id: 'p2', payee_person: mockPersons[1], transactionId: 'tx4', created_at: '2025-10-01T10:00:00Z' },
  { id: 'pay9',  payment_date: '2025-11-01', amount: 5000, payee_person_id: 'p2', payee_person: mockPersons[1], transactionId: 'tx4', created_at: '2025-11-01T10:00:00Z' },
  { id: 'pay10', payment_date: '2025-12-01', amount: 5000, payee_person_id: 'p2', payee_person: mockPersons[1], transactionId: 'tx4', created_at: '2025-12-01T10:00:00Z' },
  // tx5 — Medical Bills
  { id: 'pay11', payment_date: '2026-02-22', amount: 1000, payee_person_id: 'p5', payee_person: mockPersons[4], transactionId: 'tx5', created_at: '2026-02-22T10:00:00Z' },
  { id: 'pay12', payment_date: '2026-03-01', amount: 1000, payee_person_id: 'p5', payee_person: mockPersons[4], transactionId: 'tx5', created_at: '2026-03-01T10:00:00Z' },
  { id: 'pay13', payment_date: '2026-03-08', amount: 1000, payee_person_id: 'p5', payee_person: mockPersons[4], transactionId: 'tx5', created_at: '2026-03-08T10:00:00Z' },
  { id: 'pay14', payment_date: '2026-03-15', amount: 1000, payee_person_id: 'p5', payee_person: mockPersons[4], transactionId: 'tx5', created_at: '2026-03-15T10:00:00Z' },
  // Expense payments
  { id: 'epay1', payment_date: '2026-02-16', amount: 1200, payee_person_id: 'p1', payee_person: mockPersons[0], expense_id: 'exp1', created_at: '2026-02-16T10:00:00Z' },
  { id: 'epay2', payment_date: '2026-02-21', amount: 500,  payee_person_id: 'p1', payee_person: mockPersons[0], expense_id: 'exp2', created_at: '2026-02-21T10:00:00Z' },
  { id: 'epay3', payment_date: '2026-02-22', amount: 1500, payee_person_id: 'p2', payee_person: mockPersons[1], expense_id: 'exp2', created_at: '2026-02-22T10:00:00Z' },
];
