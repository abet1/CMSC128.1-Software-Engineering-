import { formatCurrencyCompact } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ActivityItemProps {
  description: string;
  amount: number;
  date: Date;
  isPositive: boolean;
}

export function ActivityItem({ description, amount, date, isPositive }: ActivityItemProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-lg",
        isPositive ? "bg-success/10" : "bg-destructive/10"
      )}>
        {isPositive ? (
          <ArrowUpRight className="w-4 h-4 text-success" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-destructive" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{description}</p>
        <p className="text-xs text-muted-foreground">{format(date, 'MMM d, yyyy')}</p>
      </div>
      <span className={cn(
        "text-sm font-bold tabular-nums",
        isPositive ? "text-success" : "text-destructive"
      )}>
        {isPositive ? '+' : '-'}{formatCurrencyCompact(amount)}
      </span>
    </div>
  );
}
