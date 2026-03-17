import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrencyCompact } from '@/types';

interface AddPaymentModalProps {
  open: boolean;
  onClose: () => void;
  type: 'loan' | 'expense';
  fixedAmount?: number;
  onSubmit: (amount: number, notes?: string) => void;
}

export function AddPaymentModal({
  open,
  onClose,
  type,
  fixedAmount,
  onSubmit,
}: AddPaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const resolvedAmount = type === 'loan' && fixedAmount != null
      ? fixedAmount
      : parseFloat(amount);
    if (isNaN(resolvedAmount) || resolvedAmount <= 0) return;
    onSubmit(resolvedAmount, notes.trim() || undefined);
    setAmount('');
    setNotes('');
    onClose();
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4">
        {/* Mobile drag handle */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4 sm:hidden" />
        <h2 className="text-base font-semibold text-foreground">Add Payment</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'loan' && fixedAmount != null ? (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Amount (fixed)
              </label>
              <div className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground">
                {formatCurrencyCompact(fixedAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                Loan payments must be the full term amount
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Amount
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border text-muted-foreground hover:bg-card hover:text-foreground rounded-lg px-4 py-2 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
