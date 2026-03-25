import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { TransactionType, PaymentStatus, SplitType } from '@/types';
import { ArrowLeft, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function toLocalDateTime(date: string): string {
  const [year, month, day] = date.split('-');
  return `${year}-${month}-${day}T00:00:00`;
}

export default function ExpensePage() {
  const navigate = useNavigate();
  const { persons, groups, addTransaction, divideEqually, divideByPercentage, divideByAmount } = useApp();
  const { toast } = useToast();

  const [entryName, setEntryName] = useState('');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState('');
  const [amountBorrowed, setAmountBorrowed] = useState('');
  const [dateBorrowed, setDateBorrowed] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [memberSplits, setMemberSplits] = useState<Record<string, string>>({});

  const LENDER_ID = '49e46789-d54e-4cb1-af9b-8af4e452a001';

  const contacts = persons.filter(p => p.id !== LENDER_ID);


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!entryName || !groupId || !amountBorrowed) {
    toast({
      title: 'Validation Error',
      description: 'Please fill in all required fields',
      variant: 'destructive',
    });
    return;
  }

  const amount = parseFloat(amountBorrowed);
  if (isNaN(amount) || amount <= 0) {
    toast({
      title: 'Validation Error',
      description: 'Please enter a valid amount',
      variant: 'destructive',
    });
    return;
  }

  const payload = {
  entryName,
  description: description || undefined,
  transactionType: 'GROUP_EXPENSE' as TransactionType,
  amountBorrowed: amount,
  amountRemaining: amount,
  status: 'UNPAID' as PaymentStatus,
  dateBorrowed: new Date(dateBorrowed).toISOString(),
  lenderContactId: LENDER_ID,
  borrowerGroupId: groupId,
  hasInstallments: false,
  notes: notes || undefined,
};


  try {
    const res = await fetch('http://localhost:8080/api/loanentries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to create expense');
    }

    const createdTransaction = await res.json();

    toast({
      title: 'Success',
      description: 'Group expense created successfully',
    });

    // Divide using context based on split type
    if (splitType === 'EQUAL') {
      divideEqually(createdTransaction.id, groupId);
    } else if (splitType === 'PERCENTAGE') {
      const percentages: Record<string, number> = {};
      Object.entries(memberSplits).forEach(([pid, val]) => {
        percentages[pid] = parseFloat(val) || 0;
      });
      divideByPercentage(createdTransaction.id, percentages);
    } else {
      const amounts: Record<string, number> = {};
      Object.entries(memberSplits).forEach(([pid, val]) => {
        amounts[pid] = parseFloat(val) || 0;
      });
      divideByAmount(createdTransaction.id, amounts);
    }

    navigate('/');
  } catch (err: any) {
    toast({
      title: 'Error',
      description: err.message || 'Something went wrong',
      variant: 'destructive',
    });
  }
};

  const selectedGroup = groups.find(g => g.id === groupId);
  const [searchParams] = useSearchParams();

  // Auto-initialize member splits when group or splitType changes
  useEffect(() => {
    if (!selectedGroup || selectedGroup.members.length === 0) return;
    const total = parseFloat(amountBorrowed) || 0;
    const count = selectedGroup.members.length;
    const init: Record<string, string> = {};
    if (splitType === 'EQUAL') {
      const share = count > 0 ? (total / count).toFixed(2) : '0.00';
      selectedGroup.members.forEach(m => { init[m.id] = share; });
    } else if (splitType === 'PERCENTAGE') {
      const pct = count > 0 ? (100 / count).toFixed(2) : '0.00';
      selectedGroup.members.forEach(m => { init[m.id] = pct; });
    } else {
      selectedGroup.members.forEach(m => { init[m.id] = ''; });
    }
    setMemberSplits(init);
  }, [selectedGroup, splitType, amountBorrowed]);

  // Validation for split
  const totalSplitPercent = useMemo(
    () => Object.values(memberSplits).reduce((s, v) => s + (parseFloat(v) || 0), 0),
    [memberSplits]
  );
  const totalSplitAmount = useMemo(
    () => Object.values(memberSplits).reduce((s, v) => s + (parseFloat(v) || 0), 0),
    [memberSplits]
  );
  const isSplitValid = useMemo(() => {
    if (splitType === 'EQUAL') return true;
    if (splitType === 'PERCENTAGE') return Math.abs(totalSplitPercent - 100) < 0.01;
    return Math.abs(totalSplitAmount - (parseFloat(amountBorrowed) || 0)) < 0.01;
  }, [splitType, totalSplitPercent, totalSplitAmount, amountBorrowed]);

  // Get selected group from URL params
  useEffect(() => {
    const selected = searchParams.get('selected');
    const field = searchParams.get('field');
    if (selected === 'true' && field === 'group') {
      const selectedId = sessionStorage.getItem('selected_group');
      if (selectedId) {
        setGroupId(selectedId);
        sessionStorage.removeItem('selected_group');
      }
    }
  }, [searchParams]);

  return (
    <AppLayout>
      <div className="px-4 lg:px-8 py-4 lg:py-6 lg:animate-slide-in-right">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Group Expense</h1>
              <p className="text-sm text-muted-foreground mt-1">Create a new group expense</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="entryName">Expense Name *</Label>
              <Input
                id="entryName"
                value={entryName}
                onChange={(e) => setEntryName(e.target.value)}
                placeholder="e.g., Dinner, Movie Tickets, Groceries"
                className="h-12 text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional details about this expense..."
                rows={4}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group">Group *</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/groups/select?returnTo=/expense&field=group')}
                className="w-full h-12 justify-start text-left font-normal"
              >
                {selectedGroup ? (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{selectedGroup.name} ({selectedGroup.members.length} members)</span>
                  </div>
                ) : (
                  'Select group'
                )}
              </Button>
              <input type="hidden" value={groupId} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Total Amount (₱) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amountBorrowed}
                  onChange={(e) => setAmountBorrowed(e.target.value)}
                  placeholder="0.00"
                  className="h-12 text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateBorrowed">Date *</Label>
                <Input
                  id="dateBorrowed"
                  type="date"
                  value={dateBorrowed}
                  onChange={(e) => setDateBorrowed(e.target.value)}
                  className="h-12 text-base"
                  required
                />
              </div>
            </div>

            {selectedGroup && (
              <div className="space-y-3">
                {/* Split type selector */}
                <Label>Split Method</Label>
                <div className="flex gap-1 p-1 bg-muted rounded-xl">
                  {([
                    { key: 'EQUAL' as SplitType, label: 'Equal' },
                    { key: 'PERCENTAGE' as SplitType, label: 'By %' },
                    { key: 'EXACT_AMOUNT' as SplitType, label: 'By Amount' },
                  ]).map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSplitType(opt.key)}
                      className={cn(
                        'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                        splitType === opt.key
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Member rows */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                  <p className="text-sm font-medium text-foreground">Split Preview</p>
                  {selectedGroup.members.map(member => {
                    const val = memberSplits[member.id] ?? '';
                    const numVal = parseFloat(val) || 0;
                    const total = parseFloat(amountBorrowed) || 0;
                    const derivedAmount = splitType === 'PERCENTAGE' ? (total * numVal) / 100 : numVal;
                    const derivedPercent = splitType === 'EXACT_AMOUNT' && total > 0 ? (numVal / total) * 100 : numVal;

                    return (
                      <div key={member.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary font-bold text-xs">
                            {member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="flex-1 text-sm font-medium text-foreground truncate">{member.name}</span>
                        {splitType === 'EQUAL' ? (
                          <span className="text-sm font-semibold text-primary">₱{val}</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={val}
                              onChange={e => setMemberSplits(prev => ({ ...prev, [member.id]: e.target.value }))}
                              className="h-8 w-24 text-sm text-right"
                              placeholder={splitType === 'PERCENTAGE' ? '%' : '₱'}
                            />
                            <span className="text-xs text-muted-foreground w-20 text-right">
                              {splitType === 'PERCENTAGE'
                                ? `= ₱${derivedAmount.toFixed(2)}`
                                : `= ${derivedPercent.toFixed(1)}%`}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Validation summary */}
                  {splitType === 'PERCENTAGE' && (
                    <p className={cn('text-xs font-medium mt-1', Math.abs(totalSplitPercent - 100) < 0.01 ? 'text-success' : 'text-destructive')}>
                      Total: {totalSplitPercent.toFixed(1)}% {Math.abs(totalSplitPercent - 100) < 0.01 ? '✓' : '(must equal 100%)'}
                    </p>
                  )}
                  {splitType === 'EXACT_AMOUNT' && (
                    <p className={cn('text-xs font-medium mt-1', isSplitValid ? 'text-success' : 'text-destructive')}>
                      Total: ₱{totalSplitAmount.toFixed(2)} of ₱{(parseFloat(amountBorrowed) || 0).toFixed(2)} {isSplitValid ? '✓' : '(must equal total)'}
                    </p>
                  )}
                  {splitType === 'EQUAL' && (
                    <p className="text-xs text-muted-foreground">
                      Divided equally among {selectedGroup.members.length} members
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={3}
                className="text-base"
              />
            </div>

            <div className="flex gap-3 pt-4 pb-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 h-12" disabled={!groupId || !isSplitValid}>
                Create Expense
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

