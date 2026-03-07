import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { TransactionType, PaymentFrequency, InstallmentStatus, TransactionDirection } from '@/types';
import { calculateNextPaymentDate } from '@/types';
import { ArrowLeft, Send } from 'lucide-react';
import { format } from 'date-fns';


export function toLocalDateTime(date: string): string {
  const [year, month, day] = date.split('-');
  return `${year}-${month}-${day}T00:00:00`;
}

export default function LendPage() {
  const navigate = useNavigate();
  const { persons, addTransaction, addInstallmentPlan } = useApp();
  const { toast } = useToast();
  
  const [entryName, setEntryName] = useState('');
  const [description, setDescription] = useState('');
  const [borrowerId, setBorrowerId] = useState('');
  const [amountBorrowed, setAmountBorrowed] = useState('');
  const [dateBorrowed, setDateBorrowed] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [hasInstallments, setHasInstallments] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('MONTHLY');
  const [terms, setTerms] = useState('');
  const [notes, setNotes] = useState('');

  const LENDER_ID = '49e46789-d54e-4cb1-af9b-8af4e452a001';

  const contacts = persons.filter(p => p.id !== LENDER_ID);
  const [searchParams] = useSearchParams();

  // Get selected contact from URL params
  useEffect(() => {
    const selected = searchParams.get('selected');
    const field = searchParams.get('field');
    if (selected === 'true' && field === 'borrower') {
      const selectedId = sessionStorage.getItem('selected_borrower');
      if (selectedId) {
        setBorrowerId(selectedId);
        sessionStorage.removeItem('selected_borrower');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!entryName || !borrowerId || !amountBorrowed) {
    toast({
      title: 'Missing fields',
      description: 'Entry name, borrower, and amount are required',
      variant: 'destructive',
    });
    return;
  }

  const amount = parseFloat(amountBorrowed);
  if (isNaN(amount) || amount <= 0) {
    toast({ title: 'Invalid amount', variant: 'destructive' });
    return;
  }

  if (hasInstallments && (!startDate || !terms || parseInt(terms) <= 0)) {
    toast({
      title: 'Installment info required',
      description: 'Start date and number of terms are required for installments',
      variant: 'destructive',
    });
    return;
  }

  try {
    const loanEntryPayload: any = {
      entryName,
      description: description || null,
      transactionType: hasInstallments ? 'INSTALLMENT_EXPENSE' : 'STRAIGHT_EXPENSE',
      direction: 'LEND',
      amountBorrowed: amount,
      amountRemaining: amount,
      dateBorrowed: new Date(dateBorrowed).toISOString(),
      hasInstallments: undefined,
      lender: { id: LENDER_ID },
      borrower: { id: borrowerId },
      notes: notes || null,
    };

    const loanRes = await fetch('http://localhost:8080/api/loanentries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loanEntryPayload),
    });

    if (!loanRes.ok) {
      const err = await loanRes.text();
      throw new Error(err);
    }

    const createdLoanEntry = await loanRes.json();

    addTransaction({
      ...createdLoanEntry,
      borrowerContactId: borrowerId,
      lenderContactId: LENDER_ID,
      borrowerGroupId: null, // or group ID if needed
    });

    if (hasInstallments) {
      const installmentPayload = {
        startDate: new Date(startDate).toISOString(),
        paymentFrequency,
        paymentTerms: parseInt(terms, 10),
        notes: notes || null,
      };

      const instRes = await fetch(
        `http://localhost:8080/api/installments/${createdLoanEntry.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(installmentPayload),
        }
      );

      if (!instRes.ok) {
        const err = await instRes.text();
        throw new Error('Installment creation failed: ' + err);
      }
    }

    toast({ title: 'Loan entry created successfully' });
    navigate('/');

  } catch (err: any) {
    toast({
      title: 'Failed to create entry',
      description: err.message,
      variant: 'destructive',
    });
  }
};


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
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Lend Money</h1>
              <p className="text-sm text-muted-foreground mt-1">Create a new entry for money you lent</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="entryName">Entry Name *</Label>
              <Input
                id="entryName"
                value={entryName}
                onChange={(e) => setEntryName(e.target.value)}
                placeholder="e.g., Emergency Loan, Gadget Purchase"
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
                placeholder="Additional details about this loan..."
                rows={4}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="borrower">Borrower *</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/contacts/select?returnTo=/lend&field=borrower')}
                className="w-full h-12 justify-start text-left font-normal"
              >
                {borrowerId 
                  ? contacts.find(p => p.id === borrowerId)?.name || 'Select borrower'
                  : 'Select borrower'}
              </Button>
              <input type="hidden" value={borrowerId} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₱) *</Label>
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
                <Label htmlFor="dateBorrowed">Date Borrowed *</Label>
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

            <div className="flex items-center justify-between p-5 rounded-xl bg-muted/50 border border-border">
              <div className="space-y-0.5">
                <Label htmlFor="installments" className="text-base font-medium">Installment Payment</Label>
                <p className="text-sm text-muted-foreground">Enable if payment will be made in installments</p>
              </div>
              <Switch
                id="installments"
                checked={hasInstallments}
                onCheckedChange={(val) => setHasInstallments(!!val)} 
              />
            </div>

            {hasInstallments && (
              <div className="space-y-4 p-5 rounded-xl bg-accent/30 border border-border">
                <h3 className="font-semibold text-foreground text-lg">Installment Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-12 text-base"
                      required={hasInstallments}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">Payment Frequency *</Label>
                    <Select value={paymentFrequency} onValueChange={(v) => setPaymentFrequency(v as PaymentFrequency)} required>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terms">Number of Terms *</Label>
                  <Input
                    id="terms"
                    type="number"
                    min="1"
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="e.g., 6"
                    className="h-12 text-base"
                    required={hasInstallments}
                  />
                  {terms && !isNaN(parseFloat(terms)) && amountBorrowed && (
                    <p className="text-sm text-muted-foreground">
                      Amount per term: ₱{((parseFloat(amountBorrowed) || 0) / parseFloat(terms)).toFixed(2)}
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
              <Button type="submit" className="flex-1 h-12">
                Create Entry
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}