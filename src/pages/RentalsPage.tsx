import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Search, X } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { ProgressBar } from '@/components/ProgressBar';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
import { mockRentals } from '@/api/mock';
import {
  personFullName,
  rentalProgress,
  formatCurrencyCompact,
} from '@/types';
import type { Rental, RentalStatus } from '@/types';
import { cn } from '@/lib/utils';

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusClass(status: string): string {
  switch (status) {
    case 'ACTIVE':    return 'text-blue-400';
    case 'COMPLETED': return 'text-primary';
    case 'OVERDUE':   return 'text-red-400';
    case 'CANCELLED': return 'text-muted-foreground';
    default:          return 'text-muted-foreground';
  }
}

function borderL(status: string): string {
  switch (status) {
    case 'ACTIVE':    return 'border-l-blue-400';
    case 'OVERDUE':   return 'border-l-red-400';
    case 'COMPLETED': return 'border-l-primary';
    default:          return 'border-l-muted-foreground/30';
  }
}

function rentalDateRange(r: Rental): string {
  const start = new Date(r.created_at);
  const end   = new Date(start);
  if (r.period_type === 'DAILY')       end.setDate(end.getDate() + r.num_periods);
  else if (r.period_type === 'WEEKLY') end.setDate(end.getDate() + r.num_periods * 7);
  else                                 end.setMonth(end.getMonth() + r.num_periods);
  const fmt = (d: Date) => d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

// ── Data ──────────────────────────────────────────────────────────────────────

type Filter = RentalStatus | 'ALL';
const FILTERS: Filter[] = ['ALL', 'ACTIVE', 'OVERDUE', 'COMPLETED', 'CANCELLED'];
const STATUS_ORDER: Record<RentalStatus, number> = { ACTIVE: 0, OVERDUE: 1, COMPLETED: 2, CANCELLED: 3 };
const baseSorted = [...mockRentals].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RentalsPage() {
  const [filter, setFilter]     = useState<Filter>('ALL');
  const [query, setQuery]       = useState('');
  const [rentals, setRentals]   = useState<Rental[]>(baseSorted);
  const [deleting, setDeleting] = useState<Rental | null>(null);

  const counts: Record<string, number> = { ALL: rentals.length };
  rentals.forEach(r => { counts[r.status] = (counts[r.status] ?? 0) + 1; });

  const filtered = useMemo(() => {
    let list = rentals;
    if (filter !== 'ALL') list = list.filter(r => r.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(r =>
        (r.product?.product_name ?? '').toLowerCase().includes(q) ||
        r.reference_id.toLowerCase().includes(q) ||
        (r.renter_person ? personFullName(r.renter_person) : '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [rentals, filter, query]);

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 max-w-4xl mx-auto space-y-4">

        {/* Desktop header */}
        <div className="hidden lg:flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Rentals</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{rentals.length} rentals</p>
          </div>
          <button
            onClick={() => alert('New Rental — coming soon')}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> New Rental
          </button>
        </div>

        {/* Mobile header */}
        <div className="flex items-center justify-between lg:hidden">
          <p className="text-xs text-muted-foreground">{rentals.length} rentals</p>
          <button
            onClick={() => alert('New Rental — coming soon')}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Rental
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by product, renter, ref…"
            className="w-full bg-card border border-border rounded-xl pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'flex items-center gap-1.5 shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                filter === f
                  ? 'bg-primary/10 text-primary'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {f}
              <span className={cn(
                'text-[10px] rounded-full px-1.5 py-0.5',
                filter === f ? 'bg-primary/20 text-primary' : 'bg-background text-muted-foreground'
              )}>
                {counts[f] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Rental list */}
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <X className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No rentals found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => {
              const progress         = rentalProgress(r);
              const periodsCompleted = r.num_periods - r.periods_remaining;
              const renterName       = r.renter_person
                ? personFullName(r.renter_person)
                : '—';

              return (
                <div key={r.id} className={cn(
                  'relative bg-card border border-border border-l-4 rounded-xl overflow-hidden hover:border-primary/20 transition-colors',
                  borderL(r.status)
                )}>
                  <Link to={`/rentals/${r.id}`} className="absolute inset-0 z-0 rounded-xl" aria-label="View rental" />
                  <div className="relative z-10 p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-1 mb-0.5">
                      <p className="text-sm font-semibold text-foreground leading-snug truncate">
                        {r.product?.product_name ?? '—'}
                      </p>
                      <button
                        onClick={e => { e.preventDefault(); e.stopPropagation(); setDeleting(r); }}
                        className="p-2 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 -mt-0.5"
                        aria-label="Delete rental"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground truncate mb-2">{renterName}</p>

                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn('text-xs font-medium', statusClass(r.status))}>{r.status}</span>
                      <span className="text-xs text-muted-foreground">· {rentalDateRange(r)}</span>
                    </div>

                    <div className="mb-2">
                      <ProgressBar paid={progress} total={100} />
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{periodsCompleted}/{r.num_periods} {r.period_type.toLowerCase()}</span>
                      <span className="text-primary font-medium tabular-nums">{formatCurrencyCompact(r.amount_paid)} paid</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <ConfirmDeleteModal
        open={deleting !== null}
        title={`Delete rental for "${deleting?.product?.product_name ?? ''}"?`}
        description="This rental and its payment history will be removed."
        onClose={() => setDeleting(null)}
        onConfirm={() => { if (deleting) setRentals(prev => prev.filter(r => r.id !== deleting.id)); }}
      />
    </AppLayout>
  );
}
