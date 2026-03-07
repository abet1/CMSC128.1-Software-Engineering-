import { AppLayout } from '@/components/AppLayout';
import { BalanceCard } from '@/components/BalanceCard';
import { QuickActions } from '@/components/QuickActions';
import { TransactionItem } from '@/components/TransactionItem';
import { ActivityItem } from '@/components/ActivityItem';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, Clock, CheckCircle2, Calendar, ArrowRightCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isLendTransaction, isBorrowTransaction, formatCurrencyCompact } from '@/types';
import { useMemo } from 'react';
import { format } from 'date-fns';

const Index = () => {
  const navigate = useNavigate();
  const { transactions, payments, installmentPlans } = useApp();
  
  const summary = useMemo(() => {
    let totalLent = 0;
    let totalBorrowed = 0;
    let pendingReceivables = 0;
    let pendingPayables = 0;
    let activeTransactions = 0;

    transactions.forEach((t) => {
      if (t.transactionType === 'GROUP_EXPENSE') {
        // Group expenses are typically receivables (others owe me)
        totalLent += t.amountBorrowed;
        pendingReceivables += t.amountRemaining;
      } else if (isLendTransaction(t)) {
        totalLent += t.amountBorrowed;
        pendingReceivables += t.amountRemaining;
      } else if (isBorrowTransaction(t)) {
        totalBorrowed += t.amountBorrowed;
        pendingPayables += t.amountRemaining;
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
          amount: payment.paymentAmount,
          date: payment.paymentDate,
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
    <AppLayout title="Dashboard" showHeader={true}>
      <div className="px-4 lg:px-8 py-4 lg:py-6">
        <div className="max-w-7xl mx-auto space-y-5 lg:space-y-8">
          {/* Balance Card - Hero Section */}
          <div className="animate-fade-in -mt-2 lg:mt-0">
            <BalanceCard 
              netBalance={summary.netBalance}
              pendingReceivables={summary.pendingReceivables}
              pendingPayables={summary.pendingPayables}
            />
          </div>

          {/* Quick Actions - Floating Style */}
          <div className="animate-fade-in stagger-1 -mx-1">
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
          <div className="lg:grid lg:grid-cols-5 lg:gap-6 xl:gap-8 space-y-6 lg:space-y-0">
            {/* Active Transactions */}
            <section className="lg:col-span-3 animate-fade-in stagger-3">
              <div className="flex items-center justify-between mb-4 lg:mb-5 px-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-primary to-primary/50" />
                  <h2 className="font-display text-lg lg:text-xl font-bold text-foreground">Active Loans</h2>
                </div>
                <button 
                  onClick={() => navigate('/records')} 
                  className="group flex items-center gap-1.5 text-sm lg:text-base text-primary font-semibold hover:gap-2 transition-all"
                >
                  <span>See all</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
              <div className="space-y-3 lg:space-y-3.5">
              {activeTransactions.map((transaction) => (
                <TransactionItem 
                  key={transaction.id}
                  transaction={transaction} 
                  onClick={() => navigate(`/transaction/${transaction.id}`)}
                />
              ))}
              {activeTransactions.length === 0 && (
                <div className="text-center py-12 lg:py-16 text-muted-foreground">
                  <p className="text-sm lg:text-base">No active loans</p>
                </div>
              )}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="lg:col-span-2 animate-fade-in stagger-4">
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
