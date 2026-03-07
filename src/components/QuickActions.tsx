import { useNavigate } from 'react-router-dom';
import { Send, Download, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  onLend?: () => void;
  onBorrow?: () => void;
  onExpense?: () => void;
}

export function QuickActions({ onLend, onBorrow, onExpense }: QuickActionsProps) {
  const navigate = useNavigate();
  const handleLend = () => {
    navigate('/lend');
    onLend?.();
  };

  const handleBorrow = () => {
    navigate('/borrow');
    onBorrow?.();
  };

  const handleExpense = () => {
    navigate('/expense');
    onExpense?.();
  };

  const actions = [
    { 
      label: 'Lend', 
      icon: Send, 
      onClick: handleLend,
      gradient: 'from-primary via-primary to-primary/90',
      textColor: 'text-primary-foreground',
      iconBg: 'bg-primary-foreground/20',
      glow: 'shadow-[0_4px_20px_hsl(var(--primary)/0.25)]',
    },
    { 
      label: 'Borrow', 
      icon: Download, 
      onClick: handleBorrow,
      gradient: 'from-card via-card to-card/95',
      textColor: 'text-foreground',
      iconBg: 'bg-muted/60',
      glow: 'shadow-sm',
    },
    { 
      label: 'Expense', 
      icon: Users, 
      onClick: handleExpense,
      gradient: 'from-card via-card to-card/95',
      textColor: 'text-foreground',
      iconBg: 'bg-muted/60',
      glow: 'shadow-sm',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 lg:gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex flex-col items-center justify-center gap-2.5 py-5 px-3 rounded-xl font-medium transition-all duration-200 active:scale-[0.98] bg-card text-foreground border border-border hover:border-primary/40 hover:bg-muted/50"
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 rounded-lg transition-colors bg-muted">
              <Icon className="w-5 h-5 text-foreground" />
            </div>
            
            {/* Label */}
            <span className="text-xs font-semibold tracking-wide">
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
