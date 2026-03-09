import { useState, useMemo } from 'react';
import { TrendingUp, Search, X } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { mockPayments } from '@/api/mock';
import { formatCurrencyCompact, personFullName } from '@/types';
import type { Payment } from '@/types';
import { cn } from '@/lib/utils';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

function paymentLabel(p: Payment): string {
  if (p.rental) return p.rental.title;
  if (p.expense) return p.expense.description;
  return '—';
}

function paymentSub(p: Payment): string {
  const name = p.payee_person ? personFullName(p.payee_person) : '—';
  const type = p.rental_id ? 'Rental' : p.expense_id ? 'Expense' : 'Other';
  const period = p.period_number != null ? ` · Period ${p.period_number}` : '';
  return `${name} · ${type}${period}`;
}

type FilterType = 'ALL' | 'RENTAL' | 'EXPENSE';

interface MonthGroup {
  label: string;
  total: number;
  payments: Payment[];
}

function groupByMonth(payments: Payment[]): MonthGroup[] {
  const map = new Map<string, Payment[]>();
  for (const p of payments) {
    const d = new Date(p.payment_date);
    const key = d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long' });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  return Array.from(map.entries()).map(([label, ps]) => ({
    label,
    payments: ps,
    total: ps.reduce((s, p) => s + p.amount, 0),
  }));
}

// ── Page ──────────────────────────────────────────────────────────────────────

const allSorted = [...mockPayments].sort(
  (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
);

const grandTotal = allSorted.reduce((s, p) => s + p.amount, 0);

export default function PaymentsPage() {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [query, setQuery]   = useState('');

  const filtered = useMemo(() => {
    let list = allSorted;
    if (filter === 'RENTAL')  list = list.filter(p => p.rental_id);
    if (filter === 'EXPENSE') list = list.filter(p => p.expense_id);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(p =>
        paymentLabel(p).toLowerCase().includes(q) ||
        (p.payee_person ? personFullName(p.payee_person).toLowerCase().includes(q) : false)
      );
    }
    return list;
  }, [filter, query]);

  const groups = useMemo(() => groupByMonth(filtered), [filtered]);
  const totalFiltered = filtered.reduce((s, p) => s + p.amount, 0);

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 max-w-4xl mx-auto">

        {/* Desktop header */}
        <div className="hidden lg:block">
          <h1 className="font-display text-2xl font-bold text-foreground">Payments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {allSorted.length} total · {formatCurrencyCompact(grandTotal)}
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search payments…"
            className="w-full bg-card border border-border rounded-xl pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5">
          {(['ALL', 'RENTAL', 'EXPENSE'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'flex-1 sm:flex-none rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                filter === f
                  ? 'bg-primary/10 text-primary'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Summary */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>{filtered.length} payment{filtered.length !== 1 ? 's' : ''}</span>
            <span className="text-foreground font-medium tabular-nums">{formatCurrencyCompact(totalFiltered)}</span>
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <X className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No payments found.</p>
          </div>
        )}

        {/* Grouped by month */}
        {groups.map(group => (
          <div key={group.label} className="space-y-1.5">
            {/* Month header */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {group.label}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {formatCurrencyCompact(group.total)}
              </span>
            </div>

            {/* Payment rows */}
            <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
              {group.payments.map(p => (
                <div key={p.id} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground truncate">{paymentLabel(p)}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {paymentSub(p)} · {formatDate(p.payment_date)}
                    </p>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-primary shrink-0 tabular-nums">
                    {formatCurrencyCompact(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </AppLayout>
  );
}
