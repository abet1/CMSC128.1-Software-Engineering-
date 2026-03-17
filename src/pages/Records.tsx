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

type FilterType = 'all' | 'lent' | 'borrowed' | 'group';
type StatusType = 'all' | 'unpaid' | 'partial' | 'paid';
type ViewType = 'list' | 'grid';

const Records = () => {
  const { transactions, persons, groups } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');
  const [status, setStatus] = useState<StatusType>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [view, setView] = useState<ViewType>('list');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const filteredTransactions = useMemo(() => {
    const getContactName = (transaction: typeof transactions[0]) => {
      if (transaction.transactionType === 'GROUP_EXPENSE' && transaction.borrowerGroupId) {
        const group = groups.find(g => g.id === transaction.borrowerGroupId);
        return group?.name || '';
      }
      if (isLendTransaction(transaction) && transaction.borrowerContactId) {
        if (transaction.borrowerContactId === 'current') return currentUser.name;
        const person = persons.find(p => p.id === transaction.borrowerContactId);
        return person?.name || '';
      }
      if (isBorrowTransaction(transaction) && transaction.lenderContactId) {
        if (transaction.lenderContactId === 'current') return currentUser.name;
        const person = persons.find(p => p.id === transaction.lenderContactId);
        return person?.name || '';
      }
      return '';
    };
    return transactions.filter(t => {
      const matchesFilter = filter === 'all' ||
        (filter === 'lent' && (isLendTransaction(t) || t.transactionType === 'GROUP_EXPENSE')) ||
        (filter === 'borrowed' && isBorrowTransaction(t)) ||
        (filter === 'group' && t.transactionType === 'GROUP_EXPENSE');
      const matchesStatus = status === 'all' ||
        (status === 'unpaid' && t.status === 'UNPAID') ||
        (status === 'partial' && t.status === 'PARTIALLY_PAID') ||
        (status === 'paid' && t.status === 'PAID');
      const contactName = getContactName(t);
      const matchesSearch =
        t.entryName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        t.referenceId.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        contactName.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesFilter && matchesStatus && matchesSearch;
    });
  }, [filter, status, debouncedSearch, transactions, persons, groups]);

  const summary = useMemo(() => {
    const lent = filteredTransactions.filter(t => isLendTransaction(t) || t.transactionType === 'GROUP_EXPENSE');
    const borrowed = filteredTransactions.filter(t => isBorrowTransaction(t));
    return {
      totalLent: lent.reduce((acc, t) => acc + t.amountRemaining, 0),
      totalBorrowed: borrowed.reduce((acc, t) => acc + t.amountRemaining, 0),
      count: filteredTransactions.length,
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
    { key: 'unpaid',  label: 'Unpaid' },
    { key: 'partial', label: 'Partial' },
    { key: 'paid',    label: 'Paid' },
  ];

  const SearchInput = ({ className }: { className?: string }) => (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        placeholder="Search by name or reference…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all text-sm"
      />
      {search && (
        <button
          onClick={() => setSearch('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <AppLayout title="Records">
      <div className="px-4 lg:px-8 py-4 lg:py-6">
        <div className="max-w-7xl mx-auto">

          {/* ── Desktop: Stats row (hidden on mobile) ── */}
          <div className="hidden lg:grid grid-cols-3 gap-5 mb-8 animate-fade-in">
            <div className="bg-card rounded-xl p-5 border border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Total Records</p>
              <p className="text-3xl font-display font-bold text-foreground">{summary.count}</p>
            </div>
            <div className="bg-card rounded-xl p-5 border border-success/20">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Receivables</p>
              <p className="text-3xl font-display font-bold text-success">{formatCurrencyCompact(summary.totalLent)}</p>
            </div>
            <div className="bg-card rounded-xl p-5 border border-destructive/20">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Payables</p>
              <p className="text-3xl font-display font-bold text-destructive">{formatCurrencyCompact(summary.totalBorrowed)}</p>
            </div>
          </div>

          {/* Mobile title */}
          <h1 className="lg:hidden font-display text-2xl font-bold text-foreground mb-4 animate-fade-in">Records</h1>

          {/* ── Two-column: filter panel + content ── */}
          <div className="lg:flex lg:gap-8 lg:items-start">

            {/* ── LEFT: Filter panel ── */}
            <div className="lg:w-52 lg:shrink-0 lg:sticky lg:top-6 animate-fade-in">

              {/* Mobile: search + filter toggle in one row */}
              <div className="flex items-center gap-2 lg:hidden mb-4">
                <SearchInput className="flex-1" />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    'flex items-center justify-center w-11 h-11 rounded-xl border transition-all shrink-0',
                    showFilters ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border'
                  )}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Desktop: search full-width */}
              <div className="hidden lg:block mb-5">
                <SearchInput />
              </div>

              {/* Filters: toggle on mobile, always on desktop */}
              <div className={cn(!showFilters && 'hidden lg:block', 'space-y-5')}>

                {/* Type filter */}
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.1em] mb-2 px-1">
                    Type
                  </p>
                  {/* Mobile: horizontal scroll pills */}
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 lg:hidden">
                    {typeFilters.map(f => {
                      const Icon = f.icon;
                      return (
                        <button
                          key={f.key}
                          onClick={() => setFilter(f.key)}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border',
                            filter === f.key
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card text-muted-foreground border-border hover:text-foreground'
                          )}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                  {/* Desktop: vertical list */}
                  <div className="hidden lg:flex lg:flex-col lg:gap-0.5">
                    {typeFilters.map(f => {
                      const Icon = f.icon;
                      return (
                        <button
                          key={f.key}
                          onClick={() => setFilter(f.key)}
                          className={cn(
                            'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                            filter === f.key
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:bg-card hover:text-foreground'
                          )}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          {f.label}
                          {filter === f.key && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status filter */}
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.1em] mb-2 px-1">
                    Status
                  </p>
                  {/* Mobile: horizontal pills */}
                  <div className="flex flex-wrap gap-2 lg:hidden">
                    {statusFilters.map(f => (
                      <button
                        key={f.key}
                        onClick={() => setStatus(f.key)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-semibold transition-all border',
                          status === f.key
                            ? 'bg-foreground text-background border-foreground/20'
                            : 'bg-card text-muted-foreground border-border hover:text-foreground'
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  {/* Desktop: vertical list */}
                  <div className="hidden lg:flex lg:flex-col lg:gap-0.5">
                    {statusFilters.map(f => (
                      <button
                        key={f.key}
                        onClick={() => setStatus(f.key)}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                          status === f.key
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-card hover:text-foreground'
                        )}
                      >
                        {f.label}
                        {status === f.key && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* ── RIGHT: Transactions ── */}
            <div className="lg:flex-1 lg:min-w-0 mt-4 lg:mt-0">

              {/* Results count + view toggle */}
              <div className="flex items-center justify-between mb-4 animate-fade-in stagger-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredTransactions.length}</span> record{filteredTransactions.length !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-1 p-1 bg-card rounded-xl border border-border">
                  <button
                    onClick={() => setView('list')}
                    className={cn('p-1.5 rounded-lg transition-all', view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setView('grid')}
                    className={cn('p-1.5 rounded-lg transition-all', view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Transaction list */}
              <div className={cn(
                'animate-fade-in stagger-2',
                view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3' : 'space-y-2.5'
              )}>
                {filteredTransactions.map(t => (
                  <TransactionItem
                    key={t.id}
                    transaction={t}
                    onClick={() => navigate(`/transaction/${t.id}`)}
                    variant={view === 'grid' ? 'compact' : 'default'}
                  />
                ))}
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-16 col-span-full">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-display font-semibold text-lg text-foreground mb-1">No records found</h3>
                    <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
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
