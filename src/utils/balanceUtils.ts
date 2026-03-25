import { Person, Transaction, PaymentAllocation, PersonBalance } from '@/types';
import { formatCurrencyCompact } from '@/types';

export function calculatePersonBalance(
  personId: string,
  transactions: Transaction[],
  paymentAllocations: PaymentAllocation[]
): PersonBalance {
  let receivable = 0;
  let payable = 0;

  // Build set of GROUP_EXPENSE transaction IDs for quick lookup
  const groupExpenseIds = new Set(
    transactions.filter(t => t.transactionType === 'GROUP_EXPENSE').map(t => t.id)
  );

  for (const t of transactions) {
    const remaining = t.amountRemaining ?? 0;
    const type = t.transactionType;

    // They owe you: you lent them money directly
    if ((type === 'LEND' || type === 'STRAIGHT_EXPENSE') && t.borrowerContactId === personId) {
      receivable += remaining;
    }

    // You owe them: they lent you money
    if ((type === 'BORROW' || type === 'INSTALLMENT_EXPENSE') && t.lenderContactId === personId) {
      payable += remaining;
    }
  }

  // They owe you: their share in group expenses
  for (const alloc of paymentAllocations) {
    if (alloc.personId === personId && groupExpenseIds.has(alloc.transactionId)) {
      const owed = alloc.allocated_amount - alloc.amount_paid;
      if (owed > 0) receivable += owed;
    }
  }

  return {
    personId,
    receivable,
    payable,
    net: receivable - payable,
  };
}

export function calculateAllPersonBalances(
  persons: Person[],
  transactions: Transaction[],
  paymentAllocations: PaymentAllocation[],
  currentUserId: string
): Map<string, PersonBalance> {
  const map = new Map<string, PersonBalance>();
  for (const person of persons) {
    if (person.id === currentUserId) continue;
    map.set(person.id, calculatePersonBalance(person.id, transactions, paymentAllocations));
  }
  return map;
}

export function getBalanceLabel(net: number): { text: string; colorClass: string } {
  if (net > 0.009) {
    return { text: `owes you ${formatCurrencyCompact(net)}`, colorClass: 'text-success' };
  }
  if (net < -0.009) {
    return { text: `you owe ${formatCurrencyCompact(Math.abs(net))}`, colorClass: 'text-destructive' };
  }
  return { text: 'Settled', colorClass: 'text-muted-foreground' };
}
