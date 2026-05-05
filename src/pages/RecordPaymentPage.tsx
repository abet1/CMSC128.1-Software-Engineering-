import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

export default function RecordPaymentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { transactions, persons, groups, installmentPlans, addPayment } = useApp();
  const { toast } = useToast();
  
  const transaction = transactions.find(t => String(t.id) === String(id));
  const installmentPlan = installmentPlans.find(ip => String(ip.transactionId) === String(id));
  
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [installmentId, setInstallmentId] = useState('');
  const [payeeId, setPayeeId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (transaction) {
      if (transaction.transactionType === 'GROUP_EXPENSE' && transaction.borrowerGroupId) {
        const group = groups.find(g => g.id === transaction.borrowerGroupId);
        if (group && group.members.length > 0) {
          setPayeeId(group.members[0].id);
        }
      } else if (transaction.borrowerContactId) {
        setPayeeId(transaction.borrowerContactId);
      }
    }
  }, [transaction, groups]);

  if (!transaction) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h2 className="font-display font-semibold text-foreground mb-2">Transaction not found</h2>
          <Button onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </AppLayout>
    );
  }

  const availableInstallments = installmentPlan?.installments.filter(
    inst => inst.status === 'UNPAID' || inst.status === 'OVERDUE'
  ) || [];

  const maxAmount = transaction.amountRemaining;
  const isGroupExpense = transaction.transactionType === 'GROUP_EXPENSE';
  const group = isGroupExpense && transaction.borrowerGroupId 
    ? groups.find(g => g.id === transaction.borrowerGroupId)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentAmount) {
      toast({
        title: 'Validation Error',
        description: 'Please enter payment amount',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    if (amount > maxAmount) {
      toast({
        title: 'Validation Error',
        description: `Payment amount cannot exceed remaining balance of ₱${maxAmount.toFixed(2)}`,
        variant: 'destructive',
      });
      return;
    }

    if (isGroupExpense && !payeeId) {
      toast({
        title: 'Validation Error',
        description: 'Please select who is making the payment',
        variant: 'destructive',
      });
      return;
    }

    addPayment({
      transactionId: transaction.id,
      installmentId: (installmentId && installmentId !== "none") ? installmentId : undefined,
      paymentDate: new Date(paymentDate),
      paymentAmount: amount,
      payeeId: payeeId || undefined,
      notes: notes || undefined,
    });

    toast({
      title: 'Success',
      description: 'Payment recorded successfully',
    });

    navigate(`/transaction/${transaction.id}`);
  };

  return (
    <AppLayout>
      <div className="px-4 lg:px-8 py-4 lg:py-6">
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
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Record Payment</h1>
              <p className="text-sm text-muted-foreground mt-1">{transaction.entryName}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-5 rounded-xl bg-muted/50 border border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Remaining Balance</span>
                <span className="text-2xl font-bold text-foreground">₱{transaction.amountRemaining.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Payment Amount (₱) *</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={maxAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-12 text-base"
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
                  className="h-12 text-base"
                  required
                />
              </div>
            </div>

            {isGroupExpense && group && (
              <div className="space-y-2">
                <Label htmlFor="payee">Who is paying? *</Label>
                <Select 
                  value={payeeId} 
                  onValueChange={setPayeeId} 
                  required
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select payee" />
                  </SelectTrigger>
                  <SelectContent>
                    {group.members.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {availableInstallments.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="installment">Apply to Installment (Optional)</Label>
                <Select value={installmentId || undefined} onValueChange={(value) => setInstallmentId(value === "none" ? "" : value)}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select installment term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (General Payment)</SelectItem>
                    {availableInstallments.map(inst => (
                      <SelectItem key={inst.id} value={inst.id}>
                        Term {inst.termNumber} - Due: {format(inst.dueDate, 'MMM d, yyyy')} (₱{inst.amountDue.toFixed(2)})
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
                rows={4}
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
              <Button type="submit" className="flex-1 h-12">
                Record Payment
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

