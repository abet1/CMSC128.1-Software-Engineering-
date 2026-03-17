import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { ProgressBar } from '@/components/ProgressBar';
import { AddPaymentModal } from '@/components/AddPaymentModal';
import { mockExpenses, mockPayments } from '@/api/mock';
import {
  personFullName,
  expenseProgress,
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

  const expense = mockExpenses.find((e) => e.id === id && !e.is_group_expense);

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

  const expensePayments = mockPayments.filter((p) => p.expense_id === expense.id);
  const progress = expenseProgress(expense);
  const isPaid = expense.status === 'PAID';

  const renterName = expense.renter_person
    ? personFullName(expense.renter_person)
    : expense.renter_group?.group_name ?? '—';

  const amountPaid =
    expense.status === 'PAID' ? expense.amount
    : expense.status === 'PENDING' ? 0
    : expense.amount * (progress / 100);

  const infoItems: { label: string; value: string }[] = [
    { label: 'Payer',   value: renterName },
    { label: 'Amount',  value: formatCurrencyCompact(expense.amount) },
    { label: 'Status',  value: expense.status.replace('_', ' ') },
    { label: 'Created', value: formatDate(expense.created_at) },
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
            {formatCurrencyCompact(expense.amount)}
          </p>

          {/* Progress bar */}
          <ProgressBar paid={progress} total={100} size="md" />

          {/* Paid vs total */}
          <div className="flex justify-between text-sm">
            <span className="text-primary font-medium">
              {formatCurrencyCompact(amountPaid)} paid
            </span>
            <span className="text-muted-foreground">
              of {formatCurrencyCompact(expense.amount)}
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
                  : '—';
                return (
                  <div key={pay.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{payerName}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(pay.payment_date)}</p>
                    </div>
                    <span className="text-sm font-medium text-primary shrink-0">
                      {formatCurrencyCompact(pay.amount)}
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
