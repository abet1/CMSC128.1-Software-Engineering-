import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { TransactionItem } from '@/components/TransactionItem';
import { useApp } from '@/context/AppContext';
import { formatCurrencyCompact, isLendTransaction, isBorrowTransaction } from '@/types';
import { Search, TrendingUp, TrendingDown, Users, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { currentUser } from '@/data/user';
import { useDebounce } from '@/hooks/useDebounce';
import { format } from 'date-fns';

type FilterType = 'all' | 'lent' | 'borrowed' | 'group';
type StatusType = 'all' | 'unpaid' | 'partial' | 'paid';
type ViewType = 'list' | 'grid';

const statusBadgeMap: Record<string, { bg: string; text: string; label: string }> = {
  PAID:           { bg: 'bg-success/10',     text: 'text-success',    label: 'Paid'    },
  PARTIALLY_PAID: { bg: 'bg-amber-500/10',   text: 'text-amber-500',  label: 'Partial' },
  UNPAID:         { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Unpaid'  },
};

const Records = () => {
  const { transactions, persons, groups } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');
  const [status, setStatus] = useState<StatusType>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [view, setView] = useState<ViewType>('list');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const getContactName = (transaction: typeof transactions[0]) => {
    if (transaction.transactionType === 'GROUP_EXPENSE' && transaction.borrowerGroupId) {
      return groups.find(g => g.id === transaction.borrowerGroupId)?.name || '';
    }
    if (isLendTransaction(transaction) && transaction.borrowerContactId) {
      if (transaction.borrowerContactId === 'current') return currentUser.name ?? '';
      return persons.find(p => p.id === transaction.borrowerContactId)?.name || '';
    }
    if (isBorrowTransaction(transaction) && transaction.lenderContactId) {
      if (transaction.lenderContactId === 'current') return currentUser.name ?? '';
      return persons.find(p => p.id === transaction.lenderContactId)?.name || '';
    }
    return '';
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesFilter = filter === 'all' ||
        (filter === 'lent'     && (isLendTransaction(t) || t.transactionType === 'GROUP_EXPENSE')) ||
        (filter === 'borrowed' && isBorrowTransaction(t)) ||
        (filter === 'group'    && t.transactionType === 'GROUP_EXPENSE');
      const matchesStatus = status === 'all' ||
        (status === 'unpaid'  && t.status === 'UNPAID') ||
        (status === 'partial' && t.status === 'PARTIALLY_PAID') ||
        (status === 'paid'    && t.status === 'PAID');
      const contactName = getContactName(t);
      const q = debouncedSearch.toLowerCase();
      const matchesSearch =
        t.entryName.toLowerCase().includes(q) ||
        t.referenceId.toLowerCase().includes(q) ||
        contactName.toLowerCase().includes(q);
      return matchesFilter && matchesStatus && matchesSearch;
    });
  }, [filter, status, debouncedSearch, transactions, persons, groups]);

  const summary = useMemo(() => {
    const lent = filteredTransactions.filter(t => isLendTransaction(t) || t.transactionType === 'GROUP_EXPENSE');
    const borrowed = filteredTransactions.filter(t => isBorrowTransaction(t));
    return {
      totalLent:     lent.reduce((s, t) => s + t.amountRemaining, 0),
      totalBorrowed: borrowed.reduce((s, t) => s + t.amountRemaining, 0),
      count:         filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const typeFilters: { key: FilterType; label: string; icon: React.ElementType }[] = [
    { key: 'all',      label: 'All',      icon: LayoutGrid },
    { key: 'lent',     label: 'Lent',     icon: TrendingUp },
    { key: 'borrowed', label: 'Borrowed', icon: TrendingDown },
    { key: 'group',    label: 'Group',    icon: Users },
  ];
  const statusFilters: { key: StatusType; label: string }[] = [
    { key: 'all',     label: 'All Status' },
    { key: 'unpaid',  label: 'Unpaid'     },
    { key: 'partial', label: 'Partial'    },
    { key: 'paid',    label: 'Paid'       },
  ];

  return (
    <AppLayout>
      <div className="px-4 lg:px-8 py-4 lg:py-6">
        <div className="max-w-7xl mx-auto">

          {/* ── Desktop stats row ── */}
          <div className="hidden lg:grid grid-cols-3 gap-5 mb-8">
            <div className="bg-card rounded-xl p-5 border border-border">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Records</p>
              <p className="text-3xl font-display font-bold text-foreground tabular-nums">{summary.count}</p>
            </div>
            <div className="bg-card rounded-xl p-5 border border-success/20">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Receivables</p>
              <p className="text-3xl font-display font-bold text-success tabular-nums">{formatCurrencyCompact(summary.totalLent)}</p>
            </div>
            <div className="bg-card rounded-xl p-5 border border-destructive/20">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Payables</p>
              <p className="text-3xl font-display font-bold text-destructive tabular-nums">{formatCurrencyCompact(summary.totalBorrowed)}</p>
            </div>
          </div>

          {/* Mobile title */}
          <h1 className="lg:hidden font-display text-2xl font-bold text-foreground mb-4">Records</h1>

          {/* ── Two-column: filter panel + content ── */}
          <div className="lg:flex lg:gap-8 lg:items-start">

            {/* ── LEFT: Filter Panel ── */}
            <div className="lg:w-48 lg:shrink-0 lg:sticky lg:top-6">

              {/* Mobile: search + filter toggle */}
              <div className="flex items-center gap-2 lg:hidden mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm"
                  />
                  {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="w-4 h-4" /></button>}
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn('flex items-center justify-center w-11 h-11 rounded-xl border transition-all shrink-0', showFilters ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border')}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Desktop: search full-width */}
              <div className="hidden lg:block mb-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm"
                  />
                  {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="w-4 h-4" /></button>}
                </div>
              </div>

              {/* Filters */}
              <div className={cn(!showFilters && 'hidden lg:block', 'space-y-5')}>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">Type</p>
                  {/* Mobile: pills */}
                  <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
                    {typeFilters.map(f => {
                      const Icon = f.icon;
                      return (
                        <button key={f.key} onClick={() => setFilter(f.key)}
                          className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all',
                            filter === f.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:text-foreground')}>
                          <Icon className="w-3.5 h-3.5" />{f.label}
                        </button>
                      );
                    })}
                  </div>
                  {/* Desktop: vertical nav list */}
                  <div className="hidden lg:flex flex-col gap-0.5">
                    {typeFilters.map(f => {
                      const Icon = f.icon;
                      return (
                        <button key={f.key} onClick={() => setFilter(f.key)}
                          className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left',
                            filter === f.key ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground')}>
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="flex-1">{f.label}</span>
                          {filter === f.key && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">Status</p>
                  {/* Mobile: pills */}
                  <div className="flex flex-wrap gap-2 lg:hidden">
                    {statusFilters.map(f => (
                      <button key={f.key} onClick={() => setStatus(f.key)}
                        className={cn('px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                          status === f.key ? 'bg-foreground text-background border-foreground/20' : 'bg-card text-muted-foreground border-border hover:text-foreground')}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                  {/* Desktop: vertical nav list */}
                  <div className="hidden lg:flex flex-col gap-0.5">
                    {statusFilters.map(f => (
                      <button key={f.key} onClick={() => setStatus(f.key)}
                        className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left',
                          status === f.key ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground')}>
                        <span className="flex-1">{f.label}</span>
                        {status === f.key && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Main content ── */}
            <div className="lg:flex-1 lg:min-w-0 mt-4 lg:mt-0">

              {/* Results bar - mobile only */}
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredTransactions.length}</span> record{filteredTransactions.length !== 1 ? 's' : ''}
                </p>
                {/* View toggle */}
                <div className="flex items-center gap-1 p-1 bg-card rounded-xl border border-border">
                  <button onClick={() => setView('list')} className={cn('p-1.5 rounded-lg transition-all', view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>
                    <List className="w-4 h-4" />
                  </button>
                  <button onClick={() => setView('grid')} className={cn('p-1.5 rounded-lg transition-all', view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ── Desktop: Data Table ── */}
              <div className="hidden lg:block rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1 h-5 rounded-full bg-primary" />
                    <h2 className="font-display text-base font-bold text-foreground">Records</h2>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{filteredTransactions.length}</span> record{filteredTransactions.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 w-[35%]">Entry</th>
                      <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Contact</th>
                      <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Total</th>
                      <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Remaining</th>
                      <th className="text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                      <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 bg-card">
                    {filteredTransactions.map(t => {
                      const isLendT  = isLendTransaction(t);
                      const isGroupT = t.transactionType === 'GROUP_EXPENSE';
                      const TIcon    = isGroupT ? Users : isLendT ? TrendingUp : TrendingDown;
                      const cName    = getContactName(t);
                      const badge    = statusBadgeMap[t.status] ?? { bg: 'bg-muted', text: 'text-muted-foreground', label: t.status };
                      return (
                        <tr
                          key={t.id}
                          onClick={() => navigate(`/transaction/${t.id}`)}
                          className="cursor-pointer hover:bg-muted/30 transition-colors group"
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                                isLendT ? 'bg-success/10' : isGroupT ? 'bg-primary/10' : 'bg-destructive/10')}>
                                <TIcon className={cn('w-3.5 h-3.5',
                                  isLendT ? 'text-success' : isGroupT ? 'text-primary' : 'text-destructive')} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-foreground truncate leading-tight">{t.entryName}</p>
                                <p className="text-[11px] text-muted-foreground/70 font-mono leading-tight mt-0.5">{t.referenceId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-muted-foreground max-w-[140px] truncate">{cName || '—'}</td>
                          <td className="px-4 py-3.5 text-right text-sm font-medium tabular-nums text-foreground whitespace-nowrap">
                            {formatCurrencyCompact(t.amountBorrowed)}
                          </td>
                          <td className={cn('px-4 py-3.5 text-right text-sm font-semibold tabular-nums whitespace-nowrap',
                            isLendT || isGroupT ? 'text-success' : 'text-destructive')}>
                            {formatCurrencyCompact(t.amountRemaining)}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={cn('inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold', badge.bg, badge.text)}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-muted-foreground whitespace-nowrap">
                            {format(t.dateBorrowed, 'MMM d, yyyy')}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-16 text-center">
                          <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm font-medium text-foreground mb-1">No records found</p>
                          <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile: Cards ── */}
              <div className={cn('lg:hidden', view === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-2.5')}>
                {filteredTransactions.map(t => (
                  <TransactionItem
                    key={t.id}
                    transaction={t}
                    onClick={() => navigate(`/transaction/${t.id}`)}
                    variant={view === 'grid' ? 'compact' : 'default'}
                  />
                ))}
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-16">
                    <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No records found</p>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
};

export default Records;
