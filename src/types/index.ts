// Enums
// Transaction Type: Straight Expense (one person, non-installments), Installment Expense (one person, installments), Group Expense (group of people)
export type TransactionType = 'STRAIGHT_EXPENSE' | 'INSTALLMENT_EXPENSE' | 'GROUP_EXPENSE';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
// Installment Status: NOT_STARTED (before start date), UNPAID, PAID, SKIPPED (manually skipped), DELINQUENT (past due)
export type InstallmentStatus = 'NOT_STARTED' | 'UNPAID' | 'PAID' | 'SKIPPED' | 'DELINQUENT';
export type PaymentFrequency = 'WEEKLY' | 'MONTHLY';
// For Monthly: day of month (1-28), For Weekly: day of week (0=Sunday to 6=Saturday)
export type PaymentFrequencyDay = number;
export type AllocationMethod = 'EQUAL' | 'BY_PERCENT' | 'BY_AMOUNT';

// Direction for Straight and Installment Expenses
export type TransactionDirection = 'LEND' | 'BORROW';

// Core Entities
export interface Person {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  notes?: string;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  members: Person[];
  createdAt: Date;
}

export interface GroupMember {
  groupId: string;
  contactId: string;
  joinedAt: Date;
}

// Transaction - The Main Entry
export interface Transaction {
  id: string;
  referenceId: string;
  entryName: string;
  description?: string;
  transactionType: TransactionType;
  // Direction only applies to STRAIGHT_EXPENSE and INSTALLMENT_EXPENSE (LEND = I lent money, BORROW = I borrowed money)
  direction?: TransactionDirection;
  amountBorrowed: number;
  amountRemaining: number;
  status: PaymentStatus;
  dateBorrowed: Date;
  // Start Date: For installment expenses, this is when installments begin
  startDate?: Date;
  // Lender/Borrower: For STRAIGHT_EXPENSE and INSTALLMENT_EXPENSE, one of these will be set
  // For GROUP_EXPENSE, lenderContactId is the payer (usually current user), borrowerGroupId is the group
  lenderContactId?: string;
  borrowerContactId?: string;
  borrowerGroupId?: string;
  // Has installments flag (true for INSTALLMENT_EXPENSE)
  hasInstallments: boolean;
  notes?: string;
  createdAt: Date;
}

// Installments
export interface Installment {
  id: string;
  transactionId: string;
  termNumber: number;
  amountDue: number;
  amountPaid: number;
  status: InstallmentStatus;
  dueDate: Date;
  paidDate?: Date;
  notes?: string;
}

export interface InstallmentPlan {
  transactionId: string;
  frequency: PaymentFrequency;
  // For MONTHLY: day of month (1-28), For WEEKLY: day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
  paymentDay?: PaymentFrequencyDay;
  terms: number;
  amountPerTerm: number;
  startDate: Date;
  installments: Installment[];
}

// Payments
export interface Payment {
  id: string;
  transactionId: string;
  installmentId?: string;
  paymentDate: Date;
  paymentAmount: number;
  // For group expenses, who made the payment
  payeeContactId?: string;
  // Optional: Proof of payment (image/blob)
  proof?: string; // Base64 or URL
  notes?: string;
}

// Payment Allocations (for Group Expenses)
export interface PaymentAllocation {
  id: string;
  transactionId: string;
  payeeContactId: string;
  description?: string;
  amount: number;
  percentageOfTotal?: number;
  status: PaymentStatus;
  notes?: string;
}

// Computed/Display Types
export interface TransactionWithDetails extends Transaction {
  lender?: Person;
  borrower?: Person;
  group?: Group;
  payments: Payment[];
  installmentPlan?: InstallmentPlan;
  allocations?: PaymentAllocation[];
}

export interface FinancialSummary {
  totalLent: number;
  totalBorrowed: number;
  netBalance: number;
  pendingReceivables: number;
  pendingPayables: number;
  activeTransactions: number;
}

// Utility function to generate reference ID
export function generateReferenceId(borrowerName: string, lenderName: string): string {
  const getInitials = (name: string) => 
    name.split(' ').map(n => n[0]?.toUpperCase() || '').join('').slice(0, 2);
  
  const borrowerInitials = getInitials(borrowerName);
  const lenderInitials = getInitials(lenderName);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `${borrowerInitials}-${lenderInitials}-${random}`;
}

// Currency formatter for PHP
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatCurrencyCompact = (amount?: number | null): string => {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    return '₱0.00';
  }

  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};


// Helper function to calculate installment status based on dates and payment status
export function calculateInstallmentStatus(
  installment: Installment,
  planStartDate: Date,
  currentDate: Date = new Date()
): InstallmentStatus {
  // If already paid or skipped, return current status
  if (installment.status === 'PAID' || installment.status === 'SKIPPED') {
    return installment.status;
  }

  // If current date is before plan start date, installment hasn't started yet
  if (currentDate < planStartDate && installment.termNumber === 1) {
    return 'NOT_STARTED';
  }

  // If due date has passed and not paid, it's delinquent
  if (currentDate > installment.dueDate && installment.amountPaid < installment.amountDue) {
    return 'DELINQUENT';
  }

  // If due date hasn't arrived yet, it's unpaid
  if (currentDate < installment.dueDate) {
    return 'UNPAID';
  }

  // Due date has arrived, check payment status
  if (installment.amountPaid >= installment.amountDue) {
    return 'PAID';
  }

  // Due date passed but partially paid or unpaid
  return currentDate > installment.dueDate ? 'DELINQUENT' : 'UNPAID';
}

// Helper function to calculate next payment date based on frequency and day
export function calculateNextPaymentDate(
  startDate: Date,
  frequency: PaymentFrequency,
  paymentDay: PaymentFrequencyDay | undefined,
  termNumber: number
): Date {
  const nextDate = new Date(startDate);

  if (frequency === 'MONTHLY') {
    // For monthly, add termNumber months and set to paymentDay (1-28)
    nextDate.setMonth(startDate.getMonth() + termNumber - 1);
    if (paymentDay !== undefined && paymentDay >= 1 && paymentDay <= 28) {
      nextDate.setDate(paymentDay);
    }
  } else if (frequency === 'WEEKLY') {
    // For weekly, add termNumber weeks and set to paymentDay (0=Sunday to 6=Saturday)
    const daysToAdd = (termNumber - 1) * 7;
    nextDate.setDate(startDate.getDate() + daysToAdd);
    
    if (paymentDay !== undefined && paymentDay >= 0 && paymentDay <= 6) {
      const currentDay = nextDate.getDay();
      const daysToAdjust = paymentDay - currentDay;
      nextDate.setDate(nextDate.getDate() + daysToAdjust);
    }
  }

  return nextDate;
}

// Helper functions to check transaction direction
export function isLendTransaction(transaction: Transaction): boolean {
  if (transaction.transactionType === 'GROUP_EXPENSE') return false;
  return transaction.direction === 'LEND';
}

export function isBorrowTransaction(transaction: Transaction): boolean {
  if (transaction.transactionType === 'GROUP_EXPENSE') return false;
  return transaction.direction === 'BORROW';
}
