import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useApp } from '@/context/AppContext';
import { currentUser } from '@/data/user';
import { formatCurrencyCompact, InstallmentStatus, isLendTransaction } from '@/types';
import { ArrowLeft, Calendar, User, Users, FileText, Check, Clock, AlertTriangle, SkipForward, CreditCard, Hash, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const getInstallmentStatusConfig = (status: InstallmentStatus) => {
  switch (status) {
    case 'PAID':
      return { icon: Check, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20', label: 'Paid' };
    case 'UNPAID':
      return { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border', label: 'Pending' };
    case 'DELINQUENT':
      return { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', label: 'Overdue' };
    case 'SKIPPED':
      return { icon: SkipForward, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', label: 'Skipped' };
  }
};

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { transactions, persons, groups, payments, installmentPlans, paymentAllocations, skipInstallment } = useApp();
  
  const transaction = id 
  ? transactions.find(t => String(t.id) === String(id))
  : undefined;
  
  // Build transaction with details
  const transactionWithDetails = transaction ? {
    ...transaction,
    lender: transaction.lenderContactId ? persons.find(p => p.id === transaction.lenderContactId) : undefined,
    borrower: transaction.borrowerContactId ? persons.find(p => p.id === transaction.borrowerContactId) : undefined,
    group: transaction.borrowerGroupId ? groups.find(g => g.id === transaction.borrowerGroupId) : undefined,
    payments: payments.filter(p => p.transactionId === transaction.id),
    installmentPlan: installmentPlans.find(ip => ip.transactionId === transaction.id),
    allocations: paymentAllocations.filter(a => a.transactionId === transaction.id),
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
          <button 
            onClick={() => navigate(-1)} 
            className="text-primary font-medium hover:underline"
          >
            Go back
          </button>
        </div>
      </AppLayout>
    );
  }

  const isLend = isLendTransaction(transaction);
  const isGroupExpense = transaction.transactionType === 'GROUP_EXPENSE';
  const progressPercent = ((transaction.amountBorrowed - transaction.amountRemaining) / transaction.amountBorrowed) * 100;

  const getContactName = (contactId?: string) => {
    if (!contactId) return 'Unknown';
    if (contactId === 'current') return currentUser.name;
    const person = persons.find(p => p.id === contactId);
    return person?.name || 'Unknown';
  };

  const handleSkipTerm = () => {
    if (transactionWithDetails.installmentPlan) {
      const unpaidInstallment = transactionWithDetails.installmentPlan.installments.find(
        inst => inst.status === 'UNPAID' || inst.status === 'DELINQUENT'
      );
      if (unpaidInstallment) {
        skipInstallment(transaction.id, unpaidInstallment.id);
      }
    }
  };

  return (
    <AppLayout showHeader={false}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-xl border-b border-border shadow-soft">
          <div className="flex items-center gap-3 px-4 py-3 lg:px-6 lg:py-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-lg lg:text-xl font-bold text-foreground truncate">{transaction.entryName}</h1>
              <p className="text-xs lg:text-sm text-muted-foreground font-mono">{transaction.referenceId}</p>
            </div>
            <div className={cn(
              "flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex-shrink-0",
              isLend ? "bg-success/10" : "bg-destructive/10"
            )}>
              {isLend ? (
                <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-success" />
              ) : (
                <TrendingDown className="w-5 h-5 lg:w-6 lg:h-6 text-destructive" />
              )}
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-6 lg:py-8 py-6 space-y-6 lg:space-y-8">
          {/* Amount Card */}
          <div className="bg-card rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-border/50 shadow-soft animate-fade-in">
            <div className="text-center mb-5 lg:mb-6">
              <p className="text-sm lg:text-base text-muted-foreground mb-2 lg:mb-3">
                {transaction.status === 'PAID' ? 'Total Amount' : 'Amount Remaining'}
              </p>
              <h2 className={cn(
                "font-display text-4xl lg:text-5xl xl:text-6xl font-bold",
                isLend ? "text-success" : "text-destructive"
              )}>
                {formatCurrencyCompact(transaction.status === 'PAID' ? transaction.amountBorrowed : transaction.amountRemaining)}
              </h2>
              <p className="text-sm lg:text-base text-muted-foreground mt-2 lg:mt-3">
                of {formatCurrencyCompact(transaction.amountBorrowed)} total
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold text-foreground">{progressPercent.toFixed(0)}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    progressPercent >= 100 ? "bg-success" : "bg-primary"
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center mt-5">
              <span className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold",
                transaction.status === 'PAID' && "bg-success/10 text-success",
                transaction.status === 'PARTIALLY_PAID' && "bg-warning/10 text-warning",
                transaction.status === 'UNPAID' && "bg-destructive/10 text-destructive"
              )}>
                {transaction.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-3 lg:gap-4 lg:grid-cols-2 animate-fade-in stagger-1">
            <div className="flex items-center gap-3 lg:gap-4 p-4 lg:p-5 rounded-xl lg:rounded-2xl bg-card border border-border/50 shadow-soft">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs lg:text-sm text-muted-foreground">Date Created</p>
                <p className="font-medium lg:text-base text-foreground truncate">{format(transaction.dateBorrowed, 'MMMM d, yyyy')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-4 p-4 lg:p-5 rounded-xl lg:rounded-2xl bg-card border border-border/50 shadow-soft">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <Hash className="w-5 h-5 lg:w-6 lg:h-6 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs lg:text-sm text-muted-foreground">Reference ID</p>
                <p className="font-medium text-foreground font-mono text-sm lg:text-base truncate">{transaction.referenceId}</p>
              </div>
            </div>

            {!isGroupExpense && (
              <>
                <div className="flex items-center gap-3 lg:gap-4 p-4 lg:p-5 rounded-xl lg:rounded-2xl bg-card border border-success/20 shadow-soft">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 lg:w-6 lg:h-6 text-success" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-muted-foreground">Lender</p>
                    <p className="font-medium lg:text-base text-foreground truncate">{getContactName(transaction.lenderContactId)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 lg:gap-4 p-4 lg:p-5 rounded-xl lg:rounded-2xl bg-card border border-destructive/20 shadow-soft">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 lg:w-6 lg:h-6 text-destructive" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-muted-foreground">Borrower</p>
                    <p className="font-medium lg:text-base text-foreground truncate">{getContactName(transaction.borrowerContactId)}</p>
                  </div>
                </div>
              </>
            )}

            {isGroupExpense && transactionWithDetails.group && (
              <div className="flex items-center gap-3 lg:gap-4 p-4 lg:p-5 rounded-xl lg:rounded-2xl bg-card border border-primary/20 shadow-soft lg:col-span-2">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-muted-foreground">Group</p>
                  <p className="font-medium lg:text-base text-foreground truncate">{transactionWithDetails.group.name} ({transactionWithDetails.group.members.length} members)</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {transaction.description && (
            <div className="p-4 lg:p-5 rounded-xl lg:rounded-2xl bg-card border border-border/50 shadow-soft animate-fade-in stagger-2">
              <p className="text-xs lg:text-sm text-muted-foreground mb-2">Description</p>
              <p className="text-foreground lg:text-base">{transaction.description}</p>
            </div>
          )}

          {/* Installments */}
          {transactionWithDetails.installmentPlan && (
            <div className="bg-card rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-border/50 shadow-soft space-y-4 lg:space-y-5 animate-fade-in stagger-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-foreground">Installment Schedule</h3>
                <span className="text-sm text-muted-foreground px-3 py-1 rounded-full bg-muted">
                  {transactionWithDetails.installmentPlan.frequency} • {transactionWithDetails.installmentPlan.terms} terms
                </span>
              </div>

              <div className="space-y-2">
                {transactionWithDetails.installmentPlan.installments.map((installment) => {
                  const config = getInstallmentStatusConfig(installment.status);
                  const Icon = config.icon;
                  
                  return (
                    <div 
                      key={installment.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                        config.border
                      )}
                    >
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", config.bg)}>
                        <Icon className={cn("w-4 h-4", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground text-sm">Term {installment.termNumber}</p>
                          <p className="font-semibold text-foreground tabular-nums">{formatCurrencyCompact(installment.amountDue)}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Due: {format(installment.dueDate, 'MMM d, yyyy')}
                          </p>
                          <span className={cn("text-xs font-medium", config.color)}>
                            {config.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Group Allocations */}
          {isGroupExpense && transactionWithDetails.allocations && transactionWithDetails.allocations.length > 0 && (
            <div className="bg-card rounded-2xl p-4 border border-border/50 space-y-4 animate-fade-in stagger-3">
              <h3 className="font-display font-semibold text-foreground">Payment Allocations</h3>
              
              <div className="space-y-2">
                {transactionWithDetails.allocations.map((allocation) => {
                  const person = persons.find(p => p.id === allocation.payeeContactId);
                  const isPaid = allocation.status === 'PAID';
                  
                  return (
                    <div 
                      key={allocation.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border",
                        isPaid ? "border-success/20" : "border-border"
                      )}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center",
                        isPaid ? "bg-success/10" : "bg-muted"
                      )}>
                        {isPaid ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <User className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground text-sm">{person?.name || 'Unknown'}</p>
                          <p className="font-semibold text-foreground tabular-nums">{formatCurrencyCompact(allocation.amount)}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {allocation.percentageOfTotal?.toFixed(1)}% share
                          </p>
                          <span className={cn(
                            "text-xs font-medium",
                            isPaid ? "text-success" : "text-muted-foreground"
                          )}>
                            {isPaid ? 'Paid' : 'Pending'}
                          </span>
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
            <div className="bg-card rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-border/50 shadow-soft space-y-4 lg:space-y-5 animate-fade-in stagger-4">
              <h3 className="font-display font-semibold text-foreground">Payment History</h3>
              
              <div className="space-y-1">
                {transactionWithDetails.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{format(payment.paymentDate, 'MMM d, yyyy')}</p>
                        {payment.notes && <p className="text-xs text-muted-foreground">{payment.notes}</p>}
                      </div>
                    </div>
                    <p className="font-semibold text-success tabular-nums">+{formatCurrencyCompact(payment.paymentAmount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {transaction.status !== 'PAID' && (
            <div className="flex gap-3 lg:gap-4 animate-fade-in stagger-5 pb-4">
              <button 
                onClick={() => navigate(`/payment/${transaction.id}`)}
                className="flex-1 py-4 lg:py-5 rounded-xl lg:rounded-2xl bg-primary text-primary-foreground font-semibold lg:text-lg shadow-maya hover:shadow-maya-lg transition-all active:scale-[0.98]"
              >
                Record Payment
              </button>
              {transaction.hasInstallments && transactionWithDetails.installmentPlan && (
                <button 
                  onClick={handleSkipTerm}
                  className="py-4 lg:py-5 px-5 lg:px-6 rounded-xl lg:rounded-2xl bg-card border border-border text-foreground font-semibold lg:text-base hover:bg-muted transition-all active:scale-[0.98]"
                >
                  Skip Term
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default TransactionDetail;
