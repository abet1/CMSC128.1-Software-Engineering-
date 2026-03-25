import { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { formatCurrencyCompact, isLendTransaction, isBorrowTransaction } from '@/types';
import { format } from 'date-fns';
import { Search, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface QuickPaymentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickPaymentSheet({ open, onOpenChange }: QuickPaymentSheetProps) {
  const { transactions, persons, groups, installmentPlans, addPayment } = useApp();
  const { toast } = useToast();

  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filter, setFilter] = useState<'all' | 'lent' | 'borrowed' | 'group'>('all');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [installmentId, setInstallmentId] = useState('');
  const [payeeId, setPayeeId] = useState('');
  const [notes, setNotes] = useState('');

  // Reset form function
  const resetForm = () => {
    setSelectedTransactionId(null);
    setPaymentAmount('');
    setPaymentDate(format(new Date(), 'yyyy-MM-dd'));
    setInstallmentId('');
    setPayeeId('');
    setNotes('');
    setSearch('');
  };

  // Selected transaction and related data
  const selectedTransaction = selectedTransactionId
    ? transactions.find(t => t.id === selectedTransactionId) || null
    : null;

  const installmentPlan = selectedTransaction
    ? installmentPlans.find(ip => ip.transactionId === selectedTransaction.id)
    : null;

  const availableInstallments =
    installmentPlan?.installments.filter(inst => inst.status === 'UNPAID' || inst.status === 'DELINQUENT') || [];

  const isGroupExpense = selectedTransaction?.transactionType === 'GROUP_EXPENSE';
  const group = isGroupExpense && selectedTransaction?.borrowerGroupId
    ? groups.find(g => g.id === selectedTransaction.borrowerGroupId)
    : null;

  // Helper function
  const getContactName = (transaction: typeof transactions[0]) => {
    if (transaction.transactionType === 'GROUP_EXPENSE' && transaction.borrowerGroupId) {
      const grp = groups.find(g => g.id === transaction.borrowerGroupId);
      return grp?.name || 'Group';
    }
    if (isLendTransaction(transaction) && transaction.borrowerContactId) {
      const person = persons.find(p => p.id === transaction.borrowerContactId);
      return person?.name || 'Unknown';
    }
    if (isBorrowTransaction(transaction) && transaction.lenderContactId) {
      const person = persons.find(p => p.id === transaction.lenderContactId);
      return person?.name || 'Unknown';
    }
    return 'Unknown';
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (t.status === 'PAID') return false;

      const contactName = getContactName(t);

      const matchesFilter =
        filter === 'all' ||
        (filter === 'lent' && t.direction === 'LEND') ||
        (filter === 'borrowed' && t.direction === 'BORROW') ||
        (filter === 'group' && t.transactionType === 'GROUP_EXPENSE');

      const matchesSearch =
        t.entryName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        contactName.toLowerCase().includes(debouncedSearch.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [transactions, persons, groups, filter, debouncedSearch]);

  // Handle selecting a transaction
  const handleSelectTransaction = (transactionId: string) => {
    resetForm();
    setSelectedTransactionId(transactionId);

    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction?.transactionType === 'GROUP_EXPENSE' && transaction.borrowerGroupId) {
      const grp = groups.find(g => g.id === transaction.borrowerGroupId);
      if (grp?.members.length) setPayeeId(grp.members[0].id);
    } else if (transaction?.borrowerContactId) {
      setPayeeId(transaction.borrowerContactId);
    }
  };

  // Handle payment submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransaction) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      return toast({ title: 'Validation Error', description: 'Invalid amount', variant: 'destructive' });
    }

    if (amount > Number(selectedTransaction.amountRemaining)) {
      return toast({
        title: 'Validation Error',
        description: `Payment cannot exceed remaining ₱${Number(selectedTransaction.amountRemaining).toFixed(2)}`,
        variant: 'destructive',
      });
    }

    if (selectedTransaction.transactionType === 'GROUP_EXPENSE' && !payeeId) {
      return toast({ title: 'Validation Error', description: 'Select payee', variant: 'destructive' });
    }

    addPayment({
      transactionId: selectedTransaction.id,
      installmentId: installmentId && installmentId !== 'none' ? installmentId : undefined,
      paymentDate: new Date(paymentDate),
      paymentAmount: amount,
      notes: notes || undefined,
    });

    toast({ title: 'Success', description: 'Payment recorded successfully' });
    resetForm();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] max-h-[85vh] overflow-y-auto pb-24">
        <SheetHeader>
          <SheetTitle className="text-2xl font-display">Record Payment</SheetTitle>
          <SheetDescription>Select a transaction to record a payment</SheetDescription>
        </SheetHeader>

        {!selectedTransaction ? (
          <div className="mt-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {[
                { key: 'all', label: 'All', icon: null },
                { key: 'lent', label: 'Lent', icon: TrendingUp },
                { key: 'borrowed', label: 'Borrowed', icon: TrendingDown },
                { key: 'group', label: 'Group', icon: Users },
              ].map(f => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key as any)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                      filter === f.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-foreground border border-border hover:bg-muted/50"
                    )}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Transaction List */}
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {filteredTransactions.map(transaction => {
                const contactName = getContactName(transaction);
                const isLend = isLendTransaction(transaction);
                const isGroup = transaction.transactionType === 'GROUP_EXPENSE';

                return (
                  <button
                    key={transaction.id}
                    onClick={() => handleSelectTransaction(transaction.id)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0",
                      isLend ? "bg-success/10" : isGroup ? "bg-primary/10" : "bg-destructive/10"
                    )}>
                      {isGroup ? <Users className="w-5 h-5 text-primary" /> : isLend ? <TrendingUp className="w-5 h-5 text-success" /> : <TrendingDown className="w-5 h-5 text-destructive" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{transaction.entryName}</p>
                      <p className="text-xs text-muted-foreground/70 truncate">{contactName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(transaction.dateBorrowed), 'MMM d, yyyy')}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={cn("text-sm font-bold", isLend ? "text-success" : "text-destructive")}>
                        {formatCurrencyCompact(Number(transaction.amountRemaining))}
                      </p>
                      <p className="text-xs text-muted-foreground">remaining</p>
                    </div>
                  </button>
                );
              })}
              {filteredTransactions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">No transactions found</div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Transaction Info */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-foreground">{selectedTransaction.entryName}</p>
                <button type="button" onClick={resetForm} className="text-xs text-muted-foreground hover:text-foreground">
                  Change
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Remaining Balance</span>
                <span className="text-xl font-bold text-foreground">₱{Number(selectedTransaction.amountRemaining).toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Payment Amount (₱) *</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={Number(selectedTransaction.amountRemaining)}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date *</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Group payee */}
            {isGroupExpense && group && (
              <div className="space-y-2">
                <Label htmlFor="payee">Who is paying? *</Label>
                <Select value={payeeId} onValueChange={setPayeeId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payee" />
                  </SelectTrigger>
                  <SelectContent>
                    {group.members.map(member => (
                      <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Installments */}
            {availableInstallments.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="installment">Apply to Installment (Optional)</Label>
                <Select value={installmentId} onValueChange={setInstallmentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select installment term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (General Payment)</SelectItem>
                    {availableInstallments.map(inst => (
                      <SelectItem key={inst.id} value={inst.id}>
                        Term {inst.termNumber} - Due: {format(new Date(inst.dueDate), 'MMM d, yyyy')} (₱{inst.amountDue.toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Payment Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Paid via GCash, Bank transfer..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4 pb-8">
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1">Back</Button>
              <Button type="submit" className="flex-1">Record Payment</Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
