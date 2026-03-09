import { cn } from '@/lib/utils';

interface ProgressBarProps {
  paid: number;
  total: number;
  label?: string;
  size?: 'sm' | 'md';
}

export function ProgressBar({ paid, total, label, size = 'sm' }: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.min((paid / total) * 100, 100);

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{label}</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
      )}
      <div
        className={cn(
          'bg-border rounded-full w-full',
          size === 'md' ? 'h-1.5' : 'h-1'
        )}
      >
        <div
          className="bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, height: '100%' }}
        />
      </div>
    </div>
  );
}
