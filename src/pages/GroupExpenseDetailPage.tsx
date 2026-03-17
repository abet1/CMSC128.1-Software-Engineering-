import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { ProgressBar } from '@/components/ProgressBar';
import { AddPaymentModal } from '@/components/AddPaymentModal';
import { mockExpenses, mockPayments } from '@/api/mock';
import {
  personFullName,
  personInitials,
  expenseProgress,
  formatCurrencyCompact,
} from '@/types';
import type { GroupExpenseAllocation } from '@/types';
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

export default function GroupExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedAllocation, setSelectedAllocation] = useState<GroupExpenseAllocation | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const expense = mockExpenses.find((e) => e.id === id && e.is_group_expense);

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
          <p className="text-sm text-muted-foreground">Group expense not found.</p>
        </div>
      </AppLayout>
    );
  }

  const expensePayments = mockPayments.filter((p) => p.expense_id === expense.id);
  const progress = expenseProgress(expense);
  const groupName = expense.renter_group?.group_name ?? '—';
  const allocations = expense.allocations ?? [];

  const totalPaid = allocations.reduce((sum, a) => sum + a.amount_paid, 0);

  function openPayFor(allocation: GroupExpenseAllocation) {
    setSelectedAllocation(allocation);
    setPaymentOpen(true);
  }

  function handlePaymentClose() {
    setPaymentOpen(false);
    setSelectedAllocation(null);
  }

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
          {/* Description + status + allocation type */}
          <div className="flex justify-between items-start gap-3">
            <h1 className="text-base font-semibold text-foreground leading-snug">
              {expense.description}
            </h1>
            <div className="flex items-center gap-1.5 shrink-0">
              {expense.payment_allocation_type && (
                <span className="text-xs border border-border text-muted-foreground rounded px-1.5 py-0.5">
                  {expense.payment_allocation_type}
                </span>
              )}
              <span className={cn('text-sm font-medium', statusClass(expense.status))}>
                {expense.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Group name + amount */}
          <p className="text-xs text-muted-foreground">
            {groupName} · {formatCurrencyCompact(expense.amount)}
          </p>

          {/* Total amount */}
          <p className="text-2xl font-bold text-foreground">
            {formatCurrencyCompact(expense.amount)}
          </p>

          {/* Overall progress */}
          <ProgressBar paid={progress} total={100} size="md" />

          {/* Paid vs total */}
          <div className="flex justify-between text-sm">
            <span className="text-primary font-medium">
              {formatCurrencyCompact(totalPaid)} paid
            </span>
            <span className="text-muted-foreground">
              of {formatCurrencyCompact(expense.amount)}
            </span>
          </div>
        </div>

        {/* Allocations section */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Members
            </p>
            {expense.payment_allocation_type && (
              <span className="text-xs border border-border text-muted-foreground rounded px-1.5 py-0.5">
                {expense.payment_allocation_type}
              </span>
            )}
          </div>

          {allocations.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">No allocations found.</p>
          ) : (
            <div className="divide-y divide-border">
              {allocations.map((alloc) => {
                const person = alloc.person;
                const initials = person ? personInitials(person) : '?';
                const name = person ? personFullName(person) : '—';
                const perPct = alloc.allocated_amount === 0
                  ? 0
                  : Math.min((alloc.amount_paid / alloc.allocated_amount) * 100, 100);

                return (
                  <div key={alloc.id} className="flex items-center gap-3 px-4 py-3">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {initials}
                    </div>

                    {/* Name + allocation + per-person progress */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-medium text-foreground truncate">{name}</p>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] sm:text-xs text-muted-foreground tabular-nums">
                            {formatCurrencyCompact(alloc.amount_paid)}<span className="hidden sm:inline"> / {formatCurrencyCompact(alloc.allocated_amount)}</span>
                          </span>
                          {!alloc.is_fully_paid && (
                            <button
                              onClick={() => openPayFor(alloc)}
                              className="text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded px-2 py-0.5 font-medium transition-colors"
                            >
                              Pay
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5">
                        {formatCurrencyCompact(alloc.allocated_amount)}
                        {alloc.allocated_percent != null && ` (${alloc.allocated_percent.toFixed(1)}%)`}
                      </p>
                      <ProgressBar paid={perPct} total={100} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
        onClose={handlePaymentClose}
        type="expense"
        onSubmit={handlePaymentClose}
      />
    </AppLayout>
  );
}
