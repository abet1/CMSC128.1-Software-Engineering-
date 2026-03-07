import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { TransactionItem } from '@/components/TransactionItem';
import { useApp } from '@/context/AppContext';
import { formatCurrencyCompact, isLendTransaction, isBorrowTransaction } from '@/types';
import { Search, Filter, TrendingUp, TrendingDown, Users, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
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
      const matchesSearch = t.entryName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
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
    { key: 'all', label: 'All', icon: LayoutGrid },
    { key: 'lent', label: 'Lent', icon: TrendingUp },
    { key: 'borrowed', label: 'Borrowed', icon: TrendingDown },
    { key: 'group', label: 'Group', icon: Users },
  ];

  const statusFilters: { key: StatusType; label: string }[] = [
    { key: 'all', label: 'All Status' },
    { key: 'unpaid', label: 'Unpaid' },
    { key: 'partial', label: 'Partial' },
    { key: 'paid', label: 'Paid' },
  ];
  console.log(transactions);

  return (
    <AppLayout title="Records">
      <div className="px-4 lg:px-8 py-4 lg:py-6">
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          {/* Header with Stats - Desktop */}
          <div className="hidden lg:grid grid-cols-3 gap-4 lg:gap-6 animate-fade-in">
            <div className="bg-card rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-border shadow-sm">
              <p className="text-sm lg:text-base text-muted-foreground mb-2">Total Records</p>
              <p className="text-2xl lg:text-3xl font-display font-bold text-foreground">{summary.count}</p>
            </div>
            <div className="bg-card rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-success/20 shadow-sm">
              <p className="text-sm lg:text-base text-muted-foreground mb-2">Total Receivables</p>
              <p className="text-2xl lg:text-3xl font-display font-bold text-success">{formatCurrencyCompact(summary.totalLent)}</p>
            </div>
            <div className="bg-card rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-destructive/20 shadow-sm">
              <p className="text-sm lg:text-base text-muted-foreground mb-2">Total Payables</p>
              <p className="text-2xl lg:text-3xl font-display font-bold text-destructive">{formatCurrencyCompact(summary.totalBorrowed)}</p>
            </div>
          </div>

          {/* Mobile Title */}
          <h1 className="lg:hidden font-display text-2xl font-bold text-foreground animate-fade-in">Records</h1>

          {/* Search & Controls */}
          <div className="flex items-center gap-2 lg:gap-3 animate-fade-in stagger-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, person, or reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 lg:pl-12 pr-10 lg:pr-12 py-3 lg:py-3.5 rounded-xl lg:rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm lg:text-base"
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
            
            {/* Filter Toggle - Mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "lg:hidden flex items-center justify-center w-12 h-12 rounded-xl border transition-all active:scale-95",
                showFilters 
                  ? "bg-primary text-primary-foreground border-primary shadow-maya" 
                  : "bg-card text-foreground border-border"
              )}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            {/* View Toggle - Desktop */}
            <div className="hidden lg:flex items-center gap-1 p-1 bg-card rounded-xl border border-border shadow-soft">
              <button
                onClick={() => setView('list')}
                className={cn(
                  "p-2 rounded-lg transition-all active:scale-95",
                  view === 'list' ? "bg-primary text-primary-foreground shadow-maya" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView('grid')}
                className={cn(
                  "p-2 rounded-lg transition-all active:scale-95",
                  view === 'grid' ? "bg-primary text-primary-foreground shadow-maya" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters - Enhanced UI */}
          <div className={cn(
            "space-y-4 lg:space-y-5 animate-fade-in stagger-2",
            !showFilters && "hidden lg:block"
          )}>
            {/* Type Filters - Premium Style */}
            <div className="space-y-2.5 lg:space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-4 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                <p className="text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Transaction Type</p>
              </div>
              <div className="flex gap-2.5 lg:gap-3 overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
                {typeFilters.map(f => {
                  const Icon = f.icon;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className={cn(
                        "group relative flex items-center gap-2.5 px-5 lg:px-6 py-3 lg:py-3.5 rounded-xl lg:rounded-2xl text-sm lg:text-base font-semibold transition-all whitespace-nowrap active:scale-[0.97]",
                        filter === f.key 
                          ? "bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/20 border-2 border-primary/20" 
                          : "bg-card text-muted-foreground hover:text-foreground border-2 border-border/60 hover:border-primary/40 hover:bg-accent/50 shadow-sm"
                      )}
                    >
                      <Icon className={cn(
                        "w-4 h-4 lg:w-5 lg:h-5 transition-transform",
                        filter === f.key && "scale-110"
                      )} />
                      <span>{f.label}</span>
                      {filter === f.key && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary-foreground rounded-full border-2 border-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Filters - Pill Style */}
            <div className="space-y-2.5 lg:space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-4 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                <p className="text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Payment Status</p>
              </div>
              <div className="flex flex-wrap gap-2 lg:gap-2.5">
                {statusFilters.map(f => (
                  <button
                    key={f.key}
                    onClick={() => setStatus(f.key)}
                    className={cn(
                      "group relative px-4 lg:px-5 py-2 lg:py-2.5 rounded-full text-xs lg:text-sm font-semibold transition-all active:scale-95 border-2",
                      status === f.key 
                        ? "bg-foreground text-background shadow-md border-foreground/20" 
                        : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border-border/40 hover:border-foreground/30"
                    )}
                  >
                    {f.label}
                    {status === f.key && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-foreground/5 to-transparent animate-shimmer" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between animate-fade-in stagger-3">
            <p className="text-sm lg:text-base text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredTransactions.length}</span> records
            </p>
          </div>

          {/* Transactions */}
          <div className={cn(
            "animate-fade-in stagger-4",
            view === 'grid' && "lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 xl:gap-6",
            view === 'list' && "space-y-3"
          )}>
          {filteredTransactions.map((transaction) => (
            <TransactionItem 
              key={transaction.id}
              transaction={transaction} 
              onClick={() => navigate(`/transaction/${transaction.id}`)}
              variant={view === 'grid' ? 'compact' : 'default'}
            />
          ))}
            {filteredTransactions.length === 0 && (
              <div className="text-center py-16 col-span-full">
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Search className="w-8 h-8 lg:w-10 lg:h-10 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg lg:text-xl text-foreground mb-1">No records found</h3>
                <p className="text-muted-foreground text-sm lg:text-base">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Records;