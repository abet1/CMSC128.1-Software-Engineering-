import { Send, Download, Users, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction, formatCurrencyCompact } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

interface TransactionItemProps {
  transaction: Transaction;
  onClick?: () => void;
  variant?: 'default' | 'compact';
}

export function TransactionItem({ transaction, onClick, variant = 'default' }: TransactionItemProps) {
  const { user } = useAuth();
  const { persons, groups } = useApp();
  const isGroupExpense = transaction.transactionType === 'GROUP_EXPENSE';

  const isSelfContactId = (contactId?: string | null) => {
    if (!contactId) return false;
    if (contactId === user?.id) return true;

    const person = persons.find(p => p.id === contactId);
    return person?.notes === '__self__' ||
      (!!user?.email && person?.email === user.email) ||
      (!!user?.name && person?.name === user.name);
  };

  const getPersonName = (contactId?: string | null) => {
    if (!contactId || isSelfContactId(contactId)) return '';
    return persons.find(p => p.id === contactId)?.name || '';
  };

  const isReceivable = isGroupExpense ||
    isSelfContactId(transaction.lenderContactId) ||
    (
      !isSelfContactId(transaction.borrowerContactId) &&
      (transaction.direction === 'LEND' ||
        transaction.transactionType === 'LEND')
    );
  
  const getContactName = () => {
    if (isGroupExpense && transaction.borrowerGroupId) {
      const group = groups.find(g => g.id === transaction.borrowerGroupId);
      return group?.name || 'Group';
    }
    if (isReceivable) return getPersonName(transaction.borrowerContactId) || getPersonName(transaction.lenderContactId) || 'Unknown';
    return getPersonName(transaction.lenderContactId) || getPersonName(transaction.borrowerContactId) || 'Unknown';
  };
  
  const contactName = getContactName();
  
  const getIcon = () => {
    if (isGroupExpense) return Users;
    return isReceivable ? TrendingUp : TrendingDown;
  };
  
  const Icon = getIcon();
  
  const getStatusConfig = () => {
    switch (transaction.status) {
      case 'PAID': return { bg: 'bg-success/10', text: 'text-success', label: 'Paid' };
      case 'PARTIALLY_PAID': return { bg: 'bg-warning/10', text: 'text-warning', label: 'Partial' };
      case 'UNPAID': return { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Unpaid' };
    }
  };

  const statusConfig = getStatusConfig();
  const progressPercent = ((transaction.amountBorrowed - transaction.amountRemaining) / transaction.amountBorrowed) * 100;

  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-card hover:bg-muted/50 transition-all duration-200 active:scale-[0.99] text-left border border-border/50 hover:border-border"
      >
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg",
          isReceivable ? "bg-success/10" : isGroupExpense ? "bg-primary/10" : "bg-destructive/10"
        )}>
          <Icon className={cn(
            "w-4 h-4",
            isReceivable ? "text-success" : isGroupExpense ? "text-primary" : "text-destructive"
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-6 text-foreground truncate pb-0.5">{transaction.entryName}</p>
          {contactName && (
            <p className="text-[10px] text-muted-foreground/70 truncate">{contactName}</p>
          )}
          <p className="text-xs text-muted-foreground">{format(transaction.dateBorrowed, 'MMM d')}</p>
        </div>

        <span className={cn(
          "text-sm font-bold",
          isReceivable ? "text-success" : "text-destructive"
        )}>
          {isReceivable ? '+' : '-'}{formatCurrencyCompact(transaction.amountRemaining)}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl bg-card hover:bg-muted/50 transition-colors duration-200 active:scale-[0.99] text-left border border-border"
    >
      {/* Icon */}
      <div className={cn(
        "flex items-center justify-center w-12 h-12 rounded-lg",
        isReceivable ? "bg-success/10" : isGroupExpense ? "bg-primary/10" : "bg-destructive/10"
      )}>
        <Icon className={cn(
          "w-5 h-5",
          isReceivable ? "text-success" : isGroupExpense ? "text-primary" : "text-destructive"
        )} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex-1 min-w-0">
            <h3 className="font-sans font-medium text-[15px] leading-6 text-foreground truncate pr-2 pb-0.5">
              {transaction.entryName}
            </h3>
            {contactName && (
              <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">{contactName}</p>
            )}
          </div>
          <span className={cn(
            "text-sm font-bold tabular-nums flex-shrink-0 ml-2",
            isReceivable ? "text-success" : "text-destructive"
          )}>
            {isReceivable ? '+' : '-'}{formatCurrencyCompact(transaction.amountRemaining)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {format(transaction.dateBorrowed, 'MMM d, yyyy')}
          </span>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            statusConfig.bg,
            statusConfig.text
          )}>
            {statusConfig.label}
          </span>
        </div>

        {/* Progress bar for installments */}
        {transaction.hasInstallments && transaction.status !== 'PAID' && (
          <div className="mt-2.5">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  progressPercent >= 100 ? "bg-success" : "bg-primary"
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
    </button>
  );
}
