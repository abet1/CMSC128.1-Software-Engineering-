import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useApp } from '@/context/AppContext';
import { currentUser } from '@/data/user';
import { formatCurrencyCompact, InstallmentStatus, isLendTransaction } from '@/types';
import {
  ArrowLeft, Calendar, User, Users, FileText, Check, Clock,
  AlertTriangle, SkipForward, CreditCard, Hash, TrendingUp, TrendingDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const getInstallmentStatusConfig = (status: InstallmentStatus | string) => {
  switch (status) {
    case 'PAID':
      return { icon: Check,         color: 'text-success',          bg: 'bg-success/10',     border: 'border-success/20',     label: 'Paid'    };
    case 'SKIPPED':
      return { icon: SkipForward,   color: 'text-warning',          bg: 'bg-warning/10',     border: 'border-warning/20',     label: 'Skipped' };
    case 'DELINQUENT':
    case 'OVERDUE':
      return { icon: AlertTriangle, color: 'text-destructive',      bg: 'bg-destructive/10', border: 'border-destructive/20', label: 'Overdue' };
    default:
      return { icon: Clock,         color: 'text-muted-foreground', bg: 'bg-muted',          border: 'border-border',         label: 'Pending' };
  }
};

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { transactions, persons, groups, payments, installmentPlans, paymentAllocations, skipInstallment } = useApp();

  const transaction = id ? transactions.find(t => String(t.id) === String(id)) : undefined;

  const transactionWithDetails = transaction ? {
    ...transaction,
    lender:          transaction.lenderContactId  ? persons.find(p => p.id === transaction.lenderContactId)  : undefined,
    borrower:        transaction.borrowerContactId ? persons.find(p => p.id === transaction.borrowerContactId) : undefined,
    group:           transaction.borrowerGroupId   ? groups.find(g => g.id === transaction.borrowerGroupId)   : undefined,
    payments:        payments.filter(p => p.transactionId === transaction.id),
    installmentPlan: installmentPlans.find(ip => ip.transactionId === transaction.id),
    allocations:     paymentAllocations.filter(a => a.transactionId === transaction.id),
  } : undefined;

  if (!transaction || !transactionWithDetails) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="font-display font-semibold text-foreground mb-2">Transaction not found</h2>
          <p className="text-muted-foreground text-center mb-4">This record may have been deleted or doesn't exist.</p>
          <button onClick={() => navigate(-1)} className="text-primary font-medium hover:underline">Go back</button>
        </div>
      </AppLayout>
    );
  }

  const isLend        = isLendTransaction(transaction);
  const isGroupExpense = transaction.transactionType === 'GROUP_EXPENSE';
  const amountBorrowed  = transaction.amountBorrowed ?? 0;
  const amountRemaining = transaction.amountRemaining ?? 0;
  const progressPercent = amountBorrowed > 0
    ? ((amountBorrowed - amountRemaining) / amountBorrowed) * 100
    : 0;

  const getContactName = (contactId?: string) => {
    if (!contactId) return 'Unknown';
    if (contactId === currentUser.id) return currentUser.name;
    return persons.find(p => p.id === contactId)?.name || 'Unknown';
  };

  const handleSkipTerm = () => {
    if (transactionWithDetails.installmentPlan) {
      const unpaid = transactionWithDetails.installmentPlan.installments.find(
        i => i.status === 'UNPAID' || i.status === 'DELINQUENT'
      );
      if (unpaid) skipInstallment(transaction.id, unpaid.id);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Status badge config
  const statusConfig = {
    PAID:            { label: 'Paid',           cls: 'bg-success/10 text-success'   },
    PARTIALLY_PAID:  { label: 'Partially Paid', cls: 'bg-warning/10 text-warning'   },
    UNPAID:          { label: 'Unpaid',          cls: 'bg-destructive/10 text-destructive' },
  }[transaction.status] ?? { label: transaction.status, cls: 'bg-muted text-muted-foreground' };

  return (
    <AppLayout>
      <div className="px-4 lg:px-8 py-4 lg:py-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* ── Page Header ── */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-colors active:scale-95 shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground truncate">
                {transaction.entryName}
              </h1>
              <p className="text-sm text-muted-foreground font-mono mt-0.5">{transaction.referenceId}</p>
            </div>
            <div className={cn(
              'flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-xl shrink-0',
              isLend ? 'bg-success/10' : 'bg-destructive/10'
            )}>
              {isLend
                ? <TrendingUp  className="w-5 h-5 lg:w-6 lg:h-6 text-success"     />
                : <TrendingDown className="w-5 h-5 lg:w-6 lg:h-6 text-destructive" />}
            </div>
          </div>

          {/* ── Desktop two-column / Mobile single-column ── */}
          <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-8 lg:items-start space-y-6 lg:space-y-0">

            {/* ── LEFT ── */}
            <div className="space-y-5">

              {/* Amount card */}
              <div className="bg-card rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-border/50 shadow-soft">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {transaction.status === 'PAID' ? 'Total Amount' : 'Amount Remaining'}
                    </p>
                    <h2 className={cn(
                      'font-display text-4xl lg:text-5xl font-bold',
                      isLend ? 'text-success' : 'text-destructive'
                    )}>
                      {formatCurrencyCompact(transaction.status === 'PAID' ? amountBorrowed : amountRemaining)}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      of {formatCurrencyCompact(amountBorrowed)} total
                    </p>
                  </div>
                  <span className={cn('px-4 py-2 rounded-full text-sm font-semibold self-start lg:self-auto', statusConfig.cls)}>
                    {statusConfig.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-foreground">{progressPercent.toFixed(0)}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', progressPercent >= 100 ? 'bg-success' : 'bg-primary')}
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Paid: {formatCurrencyCompact(amountBorrowed - amountRemaining)}</span>
                    <span>Remaining: {formatCurrencyCompact(amountRemaining)}</span>
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 shadow-soft">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium text-sm text-foreground truncate">
                      {transaction.dateBorrowed ? format(new Date(transaction.dateBorrowed), 'MMM d, yyyy') : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 shadow-soft">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Hash className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Reference</p>
                    <p className="font-medium text-foreground font-mono text-xs truncate">{transaction.referenceId || '—'}</p>
                  </div>
                </div>

                {!isGroupExpense && (
                  <>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-success/20 shadow-soft">
                      <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-success" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Lender</p>
                        <p className="font-medium text-sm text-foreground truncate">{getContactName(transaction.lenderContactId)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-destructive/20 shadow-soft">
                      <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-destructive" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Borrower</p>
                        <p className="font-medium text-sm text-foreground truncate">{getContactName(transaction.borrowerContactId)}</p>
                      </div>
                    </div>
                  </>
                )}

                {isGroupExpense && transactionWithDetails.group && (
                  <div className="col-span-2 flex items-center gap-3 p-4 rounded-xl bg-card border border-primary/20 shadow-soft">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Group</p>
                      <p className="font-medium text-sm text-foreground truncate">
                        {transactionWithDetails.group.name} · {transactionWithDetails.group.members.length} members
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description / Notes */}
              {(transaction.description || transaction.notes) && (
                <div className="p-5 rounded-xl bg-card border border-border/50 shadow-soft">
                  <p className="text-xs text-muted-foreground mb-2">Notes</p>
                  <p className="text-foreground text-sm">{transaction.description || transaction.notes}</p>
                </div>
              )}

              {/* Payment Allocations (group expenses) */}
              {isGroupExpense && transactionWithDetails.allocations.length > 0 && (
                <div className="bg-card rounded-2xl lg:rounded-3xl p-5 lg:p-6 border border-border/50 shadow-soft">
                  <h3 className="font-display font-semibold text-foreground mb-4">Payment Allocations</h3>
                  <div className="space-y-2">
                    {transactionWithDetails.allocations.map(alloc => {
                      const person = persons.find(p => p.id === alloc.personId);
                      const isPaid = alloc.is_fully_paid ?? false;
                      const owed = alloc.allocated_amount - alloc.amount_paid;
                      return (
                        <div
                          key={alloc.id}
                          className={cn(
                            'flex items-center gap-3 p-3 lg:p-4 rounded-xl border',
                            isPaid ? 'border-success/20 bg-success/5' : 'border-border bg-muted/30'
                          )}
                        >
                          <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', isPaid ? 'bg-success/10' : 'bg-muted')}>
                            {isPaid
                              ? <Check className="w-4 h-4 text-success" />
                              : <User  className="w-4 h-4 text-muted-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-foreground text-sm truncate">{person?.name || 'Unknown'}</p>
                              <p className="font-semibold text-foreground tabular-nums text-sm shrink-0">
                                {formatCurrencyCompact(alloc.allocated_amount)}
                              </p>
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                              <p className="text-xs text-muted-foreground">
                                {(alloc.allocated_percent ?? 0).toFixed(1)}% · Paid {formatCurrencyCompact(alloc.amount_paid)}
                              </p>
                              <span className={cn('text-xs font-medium shrink-0', isPaid ? 'text-success' : 'text-destructive')}>
                                {isPaid ? 'Settled' : `Owes ${formatCurrencyCompact(owed)}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>{/* end LEFT */}

            {/* ── RIGHT ── */}
            <div className="space-y-5">

              {/* Action Buttons */}
              {transaction.status !== 'PAID' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/record-payment/${transaction.id}`)}
                    className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold transition-all active:scale-[0.98] hover:bg-primary/90"
                  >
                    Record Payment
                  </button>
                  {transaction.hasInstallments && transactionWithDetails.installmentPlan && (
                    <button
                      onClick={handleSkipTerm}
                      className="py-3.5 px-5 rounded-xl bg-card border border-border text-foreground font-semibold hover:bg-muted transition-all active:scale-[0.98]"
                    >
                      Skip Term
                    </button>
                  )}
                </div>
              )}

              {/* Installment Schedule */}
              {transactionWithDetails.installmentPlan && (
                <div className="bg-card rounded-2xl lg:rounded-3xl p-5 lg:p-6 border border-border/50 shadow-soft space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-foreground">Installment Schedule</h3>
                    <span className="text-xs text-muted-foreground px-3 py-1 rounded-full bg-muted">
                      {transactionWithDetails.installmentPlan.frequency} · {transactionWithDetails.installmentPlan.terms} terms
                    </span>
                  </div>
                  <div className="space-y-2">
                    {transactionWithDetails.installmentPlan.installments.map(inst => {
                      const cfg  = getInstallmentStatusConfig(inst.status);
                      const Icon = cfg.icon;
                      return (
                        <div key={inst.id} className={cn('flex items-center gap-3 p-3 rounded-xl border', cfg.border)}>
                          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', cfg.bg)}>
                            <Icon className={cn('w-4 h-4', cfg.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-foreground text-sm">Term {inst.termNumber}</p>
                              <p className="font-semibold text-foreground tabular-nums text-sm">{formatCurrencyCompact(inst.amountDue)}</p>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs text-muted-foreground">
                                Due: {inst.dueDate ? format(new Date(inst.dueDate), 'MMM d, yyyy') : '—'}
                              </p>
                              <span className={cn('text-xs font-medium', cfg.color)}>{cfg.label}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Payment History */}
              {transactionWithDetails.payments.length > 0 && (
                <div className="bg-card rounded-2xl lg:rounded-3xl p-5 lg:p-6 border border-border/50 shadow-soft space-y-4">
                  <h3 className="font-display font-semibold text-foreground">
                    Payment History
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      ({transactionWithDetails.payments.length})
                    </span>
                  </h3>
                  <div className="space-y-1">
                    {transactionWithDetails.payments.map(payment => (
                      <div key={payment.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                            <CreditCard className="w-4 h-4 text-success" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {payment.paymentDate
                                ? format(new Date(payment.paymentDate as string), 'MMM d, yyyy')
                                : '—'}
                            </p>
                            {payment.notes && <p className="text-xs text-muted-foreground">{payment.notes}</p>}
                          </div>
                        </div>
                        <p className="font-semibold text-success tabular-nums text-sm">
                          +{formatCurrencyCompact(payment.paymentAmount ?? 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty right column placeholder when no installments/payments */}
              {!transactionWithDetails.installmentPlan && transactionWithDetails.payments.length === 0 && (
                <div className="hidden lg:flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-border text-center">
                  <CreditCard className="w-10 h-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No payments recorded yet</p>
                </div>
              )}

            </div>{/* end RIGHT */}
          </div>

        </div>
      </div>
    </AppLayout>
  );
};

export default TransactionDetail;
