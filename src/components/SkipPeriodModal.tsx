interface SkipPeriodModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SkipPeriodModal({ open, onClose, onConfirm }: SkipPeriodModalProps) {
  if (!open) return null;

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
        <div className="space-y-1.5">
          <h2 className="text-base font-semibold text-foreground">Skip Period</h2>
          <p className="text-sm text-muted-foreground">
            This will increase total periods by 1, pushing the end date out. Periods remaining will not change.
          </p>
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
            type="button"
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            Skip Period
          </button>
        </div>
      </div>
    </div>
  );
}
