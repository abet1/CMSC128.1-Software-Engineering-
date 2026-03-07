import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Eye, EyeOff } from 'lucide-react';
import { formatCurrencyCompact } from '@/types';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  netBalance: number;
  pendingReceivables: number;
  pendingPayables: number;
}

export function BalanceCard({ netBalance, pendingReceivables, pendingPayables }: BalanceCardProps) {
  const [isHidden, setIsHidden] = useState(false);
  const isPositive = netBalance >= 0;

  return (
    <div className="relative rounded-2xl lg:rounded-3xl bg-card p-6 lg:p-8 border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="relative">
        {/* Header - Simple */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Net Balance</span>
          <button
            onClick={() => setIsHidden(!isHidden)}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
            aria-label={isHidden ? "Show values" : "Hide values"}
          >
            {isHidden ? (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Eye className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Main Balance - Clean */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-3">
            <span className={cn(
              "text-4xl lg:text-5xl font-display font-bold tracking-tight",
              isPositive ? "text-foreground" : "text-destructive"
            )}>
              {isHidden ? '......' : (isPositive ? '+' : '') + formatCurrencyCompact(netBalance)}
            </span>
          </div>
          <div className="h-0.5 w-16 bg-primary/30 rounded-full mb-3" />
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
            {isPositive 
              ? "You have more money coming in than going out" 
              : "You owe more than what's owed to you"}
          </p>
        </div>

        {/* Stats Row - Simple */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          <div className="p-4 rounded-xl bg-success/5 border border-success/20">
            <div className="flex items-start gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-success/10 flex-shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">Receivables</p>
                <p className="text-sm lg:text-base font-bold text-success leading-tight truncate">
                  {isHidden ? '......' : formatCurrencyCompact(pendingReceivables)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <div className="flex items-start gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/10 flex-shrink-0">
                <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">Payables</p>
                <p className="text-sm lg:text-base font-bold text-destructive leading-tight truncate">
                  {isHidden ? '......' : formatCurrencyCompact(pendingPayables)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
