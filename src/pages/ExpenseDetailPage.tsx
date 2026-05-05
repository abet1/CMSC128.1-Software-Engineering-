import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { ProgressBar } from '@/components/ProgressBar';
import { AddPaymentModal } from '@/components/AddPaymentModal';
import { useApp } from '@/context/AppContext';
import {
  personFullName,
  formatCurrencyCompact,
} from '@/types';
import { cn } from '@/lib/utils';

function statusClass(status: string): string {
  switch (status) {
    case 'PAID':           return 'text-primary';
    case 'PARTIALLY_PAID': return 'text-amber-400';
    case 'PENDING':        return 'text-amber-400';
    default:               return 'text-muted-foreground';
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const { transactions, payments, persons, groups } = useApp();

  const expense = transactions.find(
    (t) => t.id === id && (t.transactionType === 'STRAIGHT_EXPENSE' || t.transactionType === 'INSTALLMENT_EXPENSE')
  );

  if (!expense) {
    return (
      <AppLayout>
        <div className="p-4 lg:p-6 max-w-3xl mx-auto">
          <Link
            to="/records"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            ← Back
          </Link>
          <p className="text-sm text-muted-foreground">Expense not found.</p>
        </div>
      </AppLayout>
    );
  }

  const expensePayments = payments.filter((p) => p.transactionId === expense.id);
  const amountBorrowed = Number(expense.amountBorrowed ?? 0);
  const amountRemaining = Number(expense.amountRemaining ?? amountBorrowed);
  const amountPaid = Math.max(0, amountBorrowed - amountRemaining);
  const progress = amountBorrowed > 0 ? Math.min((amountPaid / amountBorrowed) * 100, 100) : 0;
  const isPaid = expense.status === 'PAID';

  const borrowerPerson = persons.find((p) => p.id === expense.borrowerContactId);
  const borrowerGroup = groups.find((g) => g.id === expense.borrowerGroupId);
  const renterName = borrowerPerson
    ? personFullName(borrowerPerson)
    : borrowerGroup?.name ?? '—';

  const infoItems: { label: string; value: string }[] = [
    { label: 'Payer',   value: renterName },
    { label: 'Amount',  value: formatCurrencyCompact(amountBorrowed) },
    { label: 'Status',  value: expense.status.replace('_', ' ') },
    { label: 'Created', value: formatDate(expense.createdAt ?? new Date().toISOString()) },
  ];

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 max-w-3xl mx-auto space-y-4">
        {/* Back */}
        <Link
          to="/records"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          ← Back
        </Link>

        {/* Header card */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-3">
          {/* Description + status */}
          <div className="flex justify-between items-start gap-3">
            <h1 className="text-base font-semibold text-foreground leading-snug">
              {expense.description}
            </h1>
            <span className={cn('text-sm font-medium shrink-0', statusClass(expense.status))}>
              {expense.status.replace('_', ' ')}
            </span>
          </div>

          {/* Total amount */}
          <p className="text-2xl font-bold text-foreground">
            {formatCurrencyCompact(amountBorrowed)}
          </p>

          {/* Progress bar */}
          <ProgressBar paid={progress} total={100} size="md" />

          {/* Paid vs total */}
          <div className="flex justify-between text-sm">
            <span className="text-primary font-medium">
              {formatCurrencyCompact(amountPaid)} paid
            </span>
            <span className="text-muted-foreground">
              of {formatCurrencyCompact(amountBorrowed)}
            </span>
          </div>

          {/* Add Payment button */}
          <div className="pt-1">
            <button
              onClick={() => setPaymentOpen(true)}
              disabled={isPaid}
              className={cn(
                'w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors',
                isPaid && 'opacity-40 cursor-not-allowed'
              )}
            >
              Add Payment
            </button>
          </div>
        </div>

        {/* Info grid */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Expense Details
          </p>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {infoItems.map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={cn(
                  'text-sm font-medium mt-0.5',
                  label === 'Status' ? statusClass(expense.status) : 'text-foreground'
                )}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Payment History
            </p>
            <span className="text-xs text-muted-foreground bg-background border border-border rounded-full px-2 py-0.5">
              {expensePayments.length}
            </span>
          </div>

          {expensePayments.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">No payments recorded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {expensePayments.map((pay) => {
                const payerName = pay.payee_person
                  ? personFullName(pay.payee_person)
                  : persons.find((p) => p.id === pay.payeeId)?.name ?? '—';
                return (
                  <div key={pay.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{payerName}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(pay.payment_date)}</p>
                    </div>
                    <span className="text-sm font-medium text-primary shrink-0">
                      {formatCurrencyCompact(Number(pay.paymentAmount ?? 0))}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AddPaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        type="expense"
        onSubmit={() => setPaymentOpen(false)}
      />
    </AppLayout>
  );
}
