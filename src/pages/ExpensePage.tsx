import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { TransactionType, PaymentStatus } from '@/types';
import { ArrowLeft, Users } from 'lucide-react';
import { format } from 'date-fns';

export function toLocalDateTime(date: string): string {
  const [year, month, day] = date.split('-');
  return `${year}-${month}-${day}T00:00:00`;
}

export default function ExpensePage() {
  const navigate = useNavigate();
  const { persons, groups, addTransaction, divideEqually } = useApp();
  const { toast } = useToast();
  
  const [entryName, setEntryName] = useState('');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState('');
  const [amountBorrowed, setAmountBorrowed] = useState('');
  const [dateBorrowed, setDateBorrowed] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');

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

    // Optionally, divide equally using your context
    divideEqually(createdTransaction.referenceID, groupId);

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
              <div className="p-5 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium text-foreground mb-2">Amount per person:</p>
                <p className="text-2xl font-bold text-primary">
                  ₱{amountBorrowed && !isNaN(parseFloat(amountBorrowed))
                    ? (parseFloat(amountBorrowed) / selectedGroup.members.length).toFixed(2)
                    : '0.00'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Will be automatically divided equally among {selectedGroup.members.length} members
                </p>
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
              <Button type="submit" className="flex-1 h-12" disabled={!groupId}>
                Create Expense
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

