import { useState, useMemo } from 'react';
import { TrendingUp, Search, X } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { mockPayments, mockTransactions, mockExpenses } from '@/api/mock';
import { formatCurrencyCompact, personFullName } from '@/types';
import type { Payment } from '@/types';
import { cn } from '@/lib/utils';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

function paymentLabel(p: Payment): string {
  if (p.transactionId) {
    const t = mockTransactions.find(tx => tx.id === p.transactionId);
    return t?.entryName ?? '—';
  }
  if (p.expense_id) {
    const e = mockExpenses.find(ex => ex.id === p.expense_id);
    return e?.description ?? '—';
  }
  return '—';
}

function paymentSub(p: Payment): string {
  const name = p.payee_person ? personFullName(p.payee_person) : '—';
  const type = p.transactionId ? 'Loan' : p.expense_id ? 'Expense' : 'Other';
  return `${name} · ${type}`;
}

type FilterType = 'ALL' | 'LOAN' | 'EXPENSE';

interface MonthGroup {
  label: string;
  total: number;
  payments: Payment[];
}

function groupByMonth(payments: Payment[]): MonthGroup[] {
  const map = new Map<string, Payment[]>();
  for (const p of payments) {
    const dateStr = p.payment_date ?? (p.paymentDate ? String(p.paymentDate) : '');
    if (!dateStr) continue;
    const d = new Date(dateStr);
    const key = d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long' });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  return Array.from(map.entries()).map(([label, ps]) => ({
    label,
    payments: ps,
    total: ps.reduce((s, p) => s + (p.amount ?? p.paymentAmount ?? 0), 0),
  }));
}

// ── Page ──────────────────────────────────────────────────────────────────────

const allSorted = [...mockPayments].sort((a, b) => {
  const da = new Date(a.payment_date ?? String(a.paymentDate ?? '')).getTime();
  const db = new Date(b.payment_date ?? String(b.paymentDate ?? '')).getTime();
  return db - da;
});

const grandTotal = allSorted.reduce((s, p) => s + (p.amount ?? p.paymentAmount ?? 0), 0);

export default function PaymentsPage() {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [query, setQuery]   = useState('');

  const filtered = useMemo(() => {
    let list = allSorted;
    if (filter === 'LOAN')    list = list.filter(p => p.transactionId && !p.expense_id);
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
  const totalFiltered = filtered.reduce((s, p) => s + (p.amount ?? p.paymentAmount ?? 0), 0);

  const loanTotal    = allSorted.filter(p => p.transactionId && !p.expense_id).reduce((s, p) => s + (p.amount ?? p.paymentAmount ?? 0), 0);
  const expenseTotal = allSorted.filter(p => p.expense_id).reduce((s, p) => s + (p.amount ?? p.paymentAmount ?? 0), 0);

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-8 max-w-7xl mx-auto">

        {/* Desktop header */}
        <div className="hidden lg:flex lg:items-end lg:justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Payments</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{allSorted.length} total payments recorded</p>
          </div>
        </div>

        {/* Desktop: two-column (summary left, list right); Mobile: single column */}
        <div className="lg:flex lg:gap-8 lg:items-start space-y-4 lg:space-y-0">

          {/* ── LEFT: Summary + Filters (desktop sidebar) ── */}
          <div className="lg:w-56 lg:shrink-0 lg:sticky lg:top-6 space-y-4">

            {/* Desktop stat cards */}
            <div className="hidden lg:block space-y-3">
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
                <p className="text-xl font-display font-bold text-foreground tabular-nums mt-1">{formatCurrencyCompact(grandTotal)}</p>
              </div>
              <div className="bg-card border border-success/20 rounded-xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Loan Payments</p>
                <p className="text-xl font-display font-bold text-success tabular-nums mt-1">{formatCurrencyCompact(loanTotal)}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Expense Payments</p>
                <p className="text-xl font-display font-bold text-foreground tabular-nums mt-1">{formatCurrencyCompact(expenseTotal)}</p>
              </div>
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

            {/* Filter tabs — pills on mobile, vertical list on desktop */}
            <div className="flex gap-1.5 lg:hidden">
              {(['ALL', 'LOAN', 'EXPENSE'] as FilterType[]).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={cn('flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    filter === f ? 'bg-primary/10 text-primary' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                  )}>
                  {f}
                </button>
              ))}
            </div>
            <div className="hidden lg:flex lg:flex-col lg:gap-0.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.1em] mb-1 px-1">Filter</p>
              {(['ALL', 'LOAN', 'EXPENSE'] as FilterType[]).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                    filter === f ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-card hover:text-foreground'
                  )}>
                  {f === 'ALL' ? 'All Payments' : f === 'LOAN' ? 'Loan Payments' : 'Expense Payments'}
                  {filter === f && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              ))}
            </div>

          </div>

          {/* ── RIGHT: Payment list ── */}
          <div className="lg:flex-1 lg:min-w-0 space-y-4">

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
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {group.label}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {formatCurrencyCompact(group.total)}
              </span>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
              {group.payments.map(p => (
                <div key={p.id} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground truncate">{paymentLabel(p)}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {paymentSub(p)} · {formatDate(p.payment_date ?? String(p.paymentDate ?? ''))}
                    </p>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-primary shrink-0 tabular-nums">
                    {formatCurrencyCompact(p.amount ?? p.paymentAmount ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

          </div>{/* end RIGHT */}
        </div>{/* end two-column flex */}
      </div>
    </AppLayout>
  );
}
