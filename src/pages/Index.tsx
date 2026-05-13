import { AppLayout } from '@/components/AppLayout';
import { QuickActions } from '@/components/QuickActions';
import { TransactionItem } from '@/components/TransactionItem';
import { ActivityItem } from '@/components/ActivityItem';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, TrendingDown, Users, Clock, CheckCircle2, Calendar, ArrowRightCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isLendTransaction, isBorrowTransaction, formatCurrencyCompact } from '@/types';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';

const Index = () => {
  const navigate = useNavigate();
  const { transactions, payments, installmentPlans } = useApp();
  const [showBalance, setShowBalance] = useState(true);
  
  const summary = useMemo(() => {
    let totalLent = 0;
    let totalBorrowed = 0;
    let pendingReceivables = 0;
    let pendingPayables = 0;
    let activeTransactions = 0;

    transactions.forEach((t) => {
      const amtBorrowed = t.amountBorrowed ?? 0;
      const amtRemaining = t.amountRemaining ?? 0;

      if (t.transactionType === 'GROUP_EXPENSE') {
        // Group expenses are typically receivables (others owe me)
        totalLent += amtBorrowed;
        pendingReceivables += amtRemaining;
      } else if (isLendTransaction(t)) {
        totalLent += amtBorrowed;
        pendingReceivables += amtRemaining;
      } else if (isBorrowTransaction(t)) {
        totalBorrowed += amtBorrowed;
        pendingPayables += amtRemaining;
      }
      
      if (t.status !== 'PAID') {
        activeTransactions++;
      }
    });

    return {
      totalLent,
      totalBorrowed,
      netBalance: pendingReceivables - pendingPayables,
      pendingReceivables,
      pendingPayables,
      activeTransactions,
    };
  }, [transactions]);

  const recentActivities = useMemo(() => {
    const activities: Array<{
      id: string;
      type: 'payment' | 'transaction';
      description: string;
      amount: number;
      date: Date;
      isPositive: boolean;
    }> = [];

    payments.forEach(payment => {
      const transaction = transactions.find(t => t.id === payment.transactionId);
      if (transaction) {
        const isPositive = isLendTransaction(transaction) || transaction.transactionType === 'GROUP_EXPENSE';
        activities.push({
          id: payment.id,
          type: 'payment',
          description: `Payment for ${transaction.entryName}`,
          amount: payment.paymentAmount ?? payment.amount ?? 0,
          date: payment.paymentDate ? new Date(payment.paymentDate) : (payment.payment_date ? new Date(payment.payment_date) : new Date()),
          isPositive,
        });
      }
    });

    return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
  }, [payments, transactions]);

  const activeTransactions = transactions.filter(t => t.status !== 'PAID').slice(0, 4);

  // Find next payment (prioritize overdue, then upcoming)
  const nextPayment = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize to start of day
    
    let earliestPayment: {
      transaction: typeof transactions[0];
      installment: NonNullable<typeof installmentPlans[0]>['installments'][0];
      dueDate: Date;
      isOverdue: boolean;
    } | null = null;

    installmentPlans.forEach(plan => {
      const transaction = transactions.find(t => t.id === plan.transactionId);
      if (!transaction || transaction.status === 'PAID') return;

      plan.installments.forEach(installment => {
        if (installment.status === 'PAID' || installment.status === 'SKIPPED') return;
        
        const dueDate = new Date(installment.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        const isOverdue = dueDate < now;

        // Prioritize overdue payments, otherwise earliest upcoming
        if (!earliestPayment) {
          earliestPayment = {
            transaction,
            installment,
            dueDate,
            isOverdue,
          };
        } else {
          // If we have an overdue, prefer this one if it's also overdue and earlier
          if (isOverdue && earliestPayment.isOverdue && dueDate < earliestPayment.dueDate) {
            earliestPayment = {
              transaction,
              installment,
              dueDate,
              isOverdue,
            };
          } 
          // If we have overdue and this is upcoming, keep overdue
          else if (!isOverdue && !earliestPayment.isOverdue && dueDate < earliestPayment.dueDate) {
            earliestPayment = {
              transaction,
              installment,
              dueDate,
              isOverdue,
            };
          }
          // If we don't have overdue but this is overdue, switch to this
          else if (isOverdue && !earliestPayment.isOverdue) {
            earliestPayment = {
              transaction,
              installment,
              dueDate,
              isOverdue,
            };
          }
          // If both upcoming, pick earliest
          else if (!isOverdue && !earliestPayment.isOverdue && dueDate < earliestPayment.dueDate) {
            earliestPayment = {
              transaction,
              installment,
              dueDate,
              isOverdue,
            };
          }
        }
      });
    });

    return earliestPayment;
  }, [transactions, installmentPlans]);

  const stats = [
    { 
      label: 'Active Loans', 
      value: summary.activeTransactions, 
      icon: Clock, 
      color: 'text-primary',
      bg: 'bg-primary/10' 
    },
    { 
      label: 'Total Lent', 
      value: transactions.filter(t => isLendTransaction(t) || t.transactionType === 'GROUP_EXPENSE').length, 
      icon: TrendingUp, 
      color: 'text-success',
      bg: 'bg-success/10' 
    },
    { 
      label: 'Completed', 
      value: transactions.filter(t => t.status === 'PAID').length, 
      icon: CheckCircle2, 
      color: 'text-muted-foreground',
      bg: 'bg-muted' 
    },
  ];

  return (
    <AppLayout>
      <div className="px-4 lg:px-8 py-4 lg:py-6">
        <div className="max-w-7xl mx-auto space-y-5 lg:space-y-8">
      {/* Balance Cards */}
          <div
            onClick={() => navigate('/analytics')}
            className="animate-fade-in -mt-2 rounded-3xl border border-border bg-card p-5 shadow-card active:scale-[0.99] lg:hidden"
          >
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Net Balance</p>
                <h2 className={cn(
                  "mt-3 font-display text-[40px] font-bold leading-none tracking-normal",
                  summary.netBalance >= 0 ? "text-foreground" : "text-destructive"
                )}>
                  {showBalance
                    ? `${summary.netBalance >= 0 ? '+' : ''}${formatCurrencyCompact(summary.netBalance)}`
                    : '••••••'}
                </h2>
                <p className="mt-4 text-sm leading-5 text-muted-foreground">
                  {summary.netBalance >= 0 ? 'You are ahead overall' : 'You owe more than you are owed'}
                </p>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowBalance(prev => !prev);
                }}
                aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-colors hover:text-foreground active:scale-95"
              >
                {showBalance ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-success/20 bg-success/5 p-4">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-success">Receivables</p>
                  <TrendingUp className="h-4 w-4 shrink-0 text-success" />
                </div>
                <p className="truncate text-lg font-semibold text-success">
                  {showBalance ? formatCurrencyCompact(summary.pendingReceivables) : '••••'}
                </p>
                <p className="mt-2 text-[11px] leading-4 text-muted-foreground">Money owed to you</p>
              </div>
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-destructive">Payables</p>
                  <TrendingDown className="h-4 w-4 shrink-0 text-destructive" />
                </div>
                <p className="truncate text-lg font-semibold text-destructive">
                  {showBalance ? formatCurrencyCompact(summary.pendingPayables) : '••••'}
                </p>
                <p className="mt-2 text-[11px] leading-4 text-muted-foreground">Money you owe</p>
              </div>
            </div>
          </div>

          <div className="animate-fade-in hidden lg:mt-0 lg:grid lg:grid-cols-3 lg:gap-5">
            {/* Net Balance */}
            <div 
              onClick={() => navigate('/analytics')}
              className="bg-card p-5 lg:p-6 rounded-xl border border-border shadow-sm cursor-pointer hover:border-primary/50 hover:shadow-md transition-all active:scale-95"
            >
              <p className="text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Net Balance</p>
              <h2 className={cn(
                "text-2xl lg:text-3xl font-bold font-display",
                summary.netBalance >= 0 ? "text-foreground" : "text-destructive"
              )}>
                {summary.netBalance >= 0 ? '+' : ''}{formatCurrencyCompact(summary.netBalance)}
              </h2>
            </div>

            {/* Pending Receivables */}
            <div 
              onClick={() => navigate('/analytics')}
              className="bg-success/5 p-5 lg:p-6 rounded-xl border border-success/20 cursor-pointer hover:border-success/50 hover:shadow-md transition-all active:scale-95"
            >
              <p className="text-xs lg:text-sm font-semibold text-success uppercase tracking-wide mb-1.5">Receivables (Lent)</p>
              <h2 className="text-2xl lg:text-3xl font-bold font-display text-success">{formatCurrencyCompact(summary.pendingReceivables)}</h2>
            </div>

            {/* Pending Payables */}
            <div 
              onClick={() => navigate('/analytics')}
              className="bg-destructive/5 p-5 lg:p-6 rounded-xl border border-destructive/20 cursor-pointer hover:border-destructive/50 hover:shadow-md transition-all active:scale-95"
            >
              <p className="text-xs lg:text-sm font-semibold text-destructive uppercase tracking-wide mb-1.5">Payables (Borrowed)</p>
              <h2 className="text-2xl lg:text-3xl font-bold font-display text-destructive">{formatCurrencyCompact(summary.pendingPayables)}</h2>
            </div>
          </div>

          {/* Quick Actions — hidden on desktop (sidebar has these) */}
          <div className="animate-fade-in stagger-1 -mx-1 lg:hidden">
            <QuickActions />
          </div>

          {/* Next Payment Section */}
          {nextPayment && (
            <div className="animate-fade-in stagger-1">
              <div 
                onClick={() => navigate(`/transaction/${nextPayment.transaction.id}`)}
                className={cn(
                  "relative rounded-xl lg:rounded-2xl p-5 lg:p-6 cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.99] border",
                  nextPayment.isOverdue
                    ? "bg-destructive/5 border-destructive/30 hover:border-destructive/50"
                    : "bg-primary/5 border-primary/30 hover:border-primary/50"
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={cn(
                      "flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex-shrink-0",
                      nextPayment.isOverdue
                        ? "bg-destructive/10"
                        : "bg-primary/10"
                    )}>
                      <Calendar className={cn(
                        "w-6 h-6 lg:w-7 lg:h-7",
                        nextPayment.isOverdue ? "text-destructive" : "text-primary"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={cn(
                          "text-xs lg:text-sm font-semibold uppercase tracking-wide",
                          nextPayment.isOverdue ? "text-destructive" : "text-primary"
                        )}>
                          {nextPayment.isOverdue ? 'Overdue Payment' : 'Next Payment'}
                        </p>
                      </div>
                      <h3 className="font-display text-lg lg:text-xl font-bold text-foreground mb-1.5 truncate">
                        {nextPayment.transaction.entryName}
                      </h3>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className={cn(
                            "w-4 h-4",
                            nextPayment.isOverdue ? "text-destructive" : "text-muted-foreground"
                          )} />
                          <p className={cn(
                            "text-sm lg:text-base",
                            nextPayment.isOverdue ? "text-destructive font-semibold" : "text-muted-foreground"
                          )}>
                            {format(nextPayment.dueDate, 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg lg:text-xl font-display font-bold text-foreground">
                            {formatCurrencyCompact(nextPayment.installment.amountDue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <ArrowRightCircle className={cn(
                    "w-6 h-6 lg:w-7 lg:h-7 flex-shrink-0",
                    nextPayment.isOverdue ? "text-destructive" : "text-primary"
                  )} />
                </div>
              </div>
            </div>
          )}

          {/* Stats Row - Mobile & Desktop */}
          <div className="grid grid-cols-3 gap-3 lg:gap-4 animate-fade-in stagger-2">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={stat.label} 
                  className="flex flex-col items-center justify-center gap-2 lg:flex-row lg:items-center lg:gap-4 p-4 lg:p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className={cn(
                    "flex items-center justify-center w-11 h-11 lg:w-14 lg:h-14 rounded-xl flex-shrink-0",
                    stat.bg
                  )}>
                    <Icon className={cn("w-5 h-5 lg:w-6 lg:h-6", stat.color)} />
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-xl lg:text-2xl font-display font-bold text-foreground leading-tight">{stat.value}</p>
                    <p className="text-[11px] lg:text-sm text-muted-foreground mt-0.5 lg:mt-1 font-medium">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Two Column Layout for Desktop */}
          <div className="lg:grid lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] lg:gap-6 xl:gap-8 space-y-6 lg:space-y-0">
            {/* Active Transactions */}
            <section className="animate-fade-in stagger-3">
              <div className="bg-card rounded-xl lg:rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 lg:px-6 pt-4 lg:pt-6 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1 h-5 rounded-full bg-primary" />
                    <h2 className="font-display text-lg font-bold text-foreground">Active Loans</h2>
                  </div>
                  <button
                    onClick={() => navigate('/records')}
                    className="group flex items-center gap-1.5 text-sm text-primary font-semibold hover:gap-2 transition-all"
                  >
                    <span>See all</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Desktop: mini table */}
                <div className="hidden lg:block border-t border-border">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Entry</th>
                        <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Remaining</th>
                        <th className="text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Status</th>
                        <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 bg-card">
                      {activeTransactions.map(t => {
                        const isLendT  = isLendTransaction(t);
                        const isGroupT = t.transactionType === 'GROUP_EXPENSE';
                        const TIcon    = isGroupT ? Users : isLendT ? TrendingUp : TrendingDown;
                        const badge = ({
                          PAID:           { bg: 'bg-success/10',     text: 'text-success',    label: 'Paid'    },
                          PARTIALLY_PAID: { bg: 'bg-amber-500/10',   text: 'text-amber-500',  label: 'Partial' },
                          UNPAID:         { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Unpaid'  },
                        } as Record<string, {bg:string;text:string;label:string}>)[t.status] ?? { bg: 'bg-muted', text: 'text-muted-foreground', label: t.status };
                        return (
                          <tr key={t.id} onClick={() => navigate(`/transaction/${t.id}`)} className="cursor-pointer hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                                  isLendT ? 'bg-success/10' : isGroupT ? 'bg-primary/10' : 'bg-destructive/10')}>
                                  <TIcon className={cn('w-3.5 h-3.5', isLendT ? 'text-success' : isGroupT ? 'text-primary' : 'text-destructive')} />
                                </div>
                                <div>
                                  <p className="font-medium text-sm text-foreground">{t.entryName}</p>
                                  <p className="text-[11px] text-muted-foreground/60 font-mono">{t.referenceId}</p>
                                </div>
                              </div>
                            </td>
                            <td className={cn('px-4 py-3.5 text-right text-sm font-semibold tabular-nums', isLendT || isGroupT ? 'text-success' : 'text-destructive')}>
                              {formatCurrencyCompact(t.amountRemaining)}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span className={cn('inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold', badge.bg, badge.text)}>{badge.label}</span>
                            </td>
                            <td className="px-4 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{format(t.dateBorrowed, 'MMM d, yyyy')}</td>
                          </tr>
                        );
                      })}
                      {activeTransactions.length === 0 && (
                        <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">No active loans</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile: cards */}
                <div className="lg:hidden px-4 pb-4 space-y-3">
                  {activeTransactions.map(transaction => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      onClick={() => navigate(`/transaction/${transaction.id}`)}
                    />
                  ))}
                  {activeTransactions.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground text-sm">No active loans</div>
                  )}
                </div>
              </div>
            </section>

          {/* Recent Activity */}
          <section className="animate-fade-in stagger-4">
            <div className="bg-card rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4 lg:mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-1 h-5 rounded-full bg-primary" />
                  <h2 className="font-display text-lg lg:text-xl font-bold text-foreground">Recent Activity</h2>
                </div>
              </div>
              <div>
                {recentActivities.slice(0, 5).map(activity => (
                  <ActivityItem 
                    key={activity.id}
                    description={activity.description}
                    amount={activity.amount}
                    date={activity.date}
                    isPositive={activity.isPositive}
                  />
                ))}
                {recentActivities.length === 0 && (
                  <p className="text-center py-8 lg:py-12 text-muted-foreground text-sm lg:text-base">No recent activity</p>
                )}
              </div>
            </div>
          </section>
        </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
