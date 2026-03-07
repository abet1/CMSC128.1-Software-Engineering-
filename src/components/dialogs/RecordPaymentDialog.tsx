import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
}

export function RecordPaymentDialog({ open, onOpenChange, transactionId }: RecordPaymentDialogProps) {
  const { transactions, persons, groups, installmentPlans, addPayment } = useApp();
  const { toast } = useToast();
  
  const transaction = transactions.find(t => t.id === transactionId);
  const installmentPlan = installmentPlans.find(ip => ip.transactionId === transactionId);
  
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [installmentId, setInstallmentId] = useState('');
  const [payeeId, setPayeeId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (transaction) {
      // Set default payee based on transaction type
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
    return null;
  }

  const availableInstallments = installmentPlan?.installments.filter(
    inst => inst.status === 'UNPAID' || inst.status === 'DELINQUENT'
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
      installmentId: installmentId || undefined,
      paymentDate: new Date(paymentDate),
      paymentAmount: amount,
      notes: notes || undefined,
    });

    toast({
      title: 'Success',
      description: 'Payment recorded successfully',
    });

    // Reset form
    setPaymentAmount('');
    setPaymentDate(format(new Date(), 'yyyy-MM-dd'));
    setInstallmentId('');
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment for: {transaction.entryName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Remaining Balance</span>
              <span className="text-lg font-bold text-foreground">₱{transaction.amountRemaining.toFixed(2)}</span>
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

          {isGroupExpense && group && (
            <div className="space-y-2">
              <Label htmlFor="payee">Who is paying? *</Label>
              <Select value={payeeId} onValueChange={setPayeeId} required>
                <SelectTrigger>
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
              <Select value={installmentId} onValueChange={setInstallmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select installment term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (General Payment)</SelectItem>
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
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

