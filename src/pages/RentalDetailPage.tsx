import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { ProgressBar } from '@/components/ProgressBar';
import { AddPaymentModal } from '@/components/AddPaymentModal';
import { SkipPeriodModal } from '@/components/SkipPeriodModal';
import { mockRentals, mockPayments } from '@/api/mock';
import {
  personFullName,
  rentalProgress,
  formatCurrencyCompact,
} from '@/types';
import { cn } from '@/lib/utils';

function statusClass(status: string): string {
  switch (status) {
    case 'ACTIVE':    return 'text-blue-400';
    case 'COMPLETED': return 'text-primary';
    case 'OVERDUE':   return 'text-red-400';
    case 'CANCELLED': return 'text-muted-foreground';
    default:          return 'text-muted-foreground';
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function RentalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [skipOpen, setSkipOpen] = useState(false);

  const rental = mockRentals.find((r) => r.id === id);

  if (!rental) {
    return (
      <AppLayout>
        <div className="p-4 lg:p-6 max-w-3xl mx-auto">
          <Link
            to="/rentals"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            ← Back
          </Link>
          <p className="text-sm text-muted-foreground">Rental not found.</p>
        </div>
      </AppLayout>
    );
  }

  const rentalPayments = mockPayments.filter((p) => p.rental_id === rental.id);
  const progress = rentalProgress(rental);
  const periodsCompleted = rental.num_periods - rental.periods_remaining;
  const isDone = rental.status === 'COMPLETED' || rental.status === 'CANCELLED';

  const renterName = rental.renter_person
    ? personFullName(rental.renter_person)
    : rental.renter_group?.group_name ?? '—';

  const infoItems: { label: string; value: string }[] = [
    { label: 'Product',          value: rental.product?.product_name ?? '—' },
    { label: 'Renter',           value: renterName },
    { label: 'Period Type',      value: rental.period_type },
    { label: 'Payment / Period', value: formatCurrencyCompact(rental.payment_per_period) },
    { label: 'Periods',          value: `${periodsCompleted} of ${rental.num_periods}` },
    { label: 'Channel',          value: rental.rental_channel ?? '—' },
  ];

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 max-w-3xl mx-auto space-y-4">
        {/* Back */}
        <Link
          to="/rentals"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          ← Back
        </Link>

        {/* Header card */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-3">
          {/* Title + status */}
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-foreground leading-snug">
                {rental.title}
              </h1>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {rental.reference_id}
              </p>
            </div>
            <span className={cn('text-sm font-medium shrink-0', statusClass(rental.status))}>
              {rental.status}
            </span>
          </div>

          {/* Progress bar */}
          <ProgressBar paid={progress} total={100} size="md" />

          {/* Amount row */}
          <div className="flex justify-between text-sm">
            <span className="text-primary font-medium">
              {formatCurrencyCompact(rental.amount_paid)} paid
            </span>
            <span className="text-muted-foreground">
              {formatCurrencyCompact(rental.amount_remaining)} remaining
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              onClick={() => setPaymentOpen(true)}
              disabled={isDone}
              className={cn(
                'w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors',
                isDone && 'opacity-40 cursor-not-allowed'
              )}
            >
              Add Payment
            </button>
            <button
              onClick={() => setSkipOpen(true)}
              disabled={isDone}
              className={cn(
                'w-full sm:w-auto border border-border text-muted-foreground hover:bg-card hover:text-foreground rounded-lg px-4 py-2.5 sm:py-2 text-sm transition-colors',
                isDone && 'opacity-40 cursor-not-allowed'
              )}
            >
              Skip Period
            </button>
          </div>
        </div>

        {/* Info grid */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Rental Details
          </p>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {infoItems.map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Payment History
            </p>
            <span className="text-xs text-muted-foreground bg-background border border-border rounded-full px-2 py-0.5">
              {rentalPayments.length}
            </span>
          </div>

          {rentalPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">No payments recorded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {rentalPayments.map((pay) => {
                const payerName = pay.payee_person
                  ? personFullName(pay.payee_person)
                  : '—';
                return (
                  <div key={pay.id} className="flex items-center gap-3 px-4 py-3">
                    {/* Period indicator */}
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary text-xs font-bold">
                        {pay.period_number ?? '—'}
                      </span>
                    </div>

                    {/* Name + date */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{payerName}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(pay.payment_date)}</p>
                    </div>

                    {/* Amount */}
                    <span className="text-sm font-medium text-primary shrink-0">
                      {formatCurrencyCompact(pay.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AddPaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        type="rental"
        fixedAmount={rental.payment_per_period}
        onSubmit={() => setPaymentOpen(false)}
      />

      <SkipPeriodModal
        open={skipOpen}
        onClose={() => setSkipOpen(false)}
        onConfirm={() => setSkipOpen(false)}
      />
    </AppLayout>
  );
}
