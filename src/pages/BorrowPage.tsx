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
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { TransactionType, PaymentFrequency, InstallmentStatus, TransactionDirection } from '@/types';
import { calculateNextPaymentDate } from '@/types';
import { ArrowLeft, Send } from 'lucide-react';
import { format } from 'date-fns';

export function toLocalDateTime(date: string): string {
  const [year, month, day] = date.split('-');
  return `${year}-${month}-${day}T00:00:00`;
}

const BORROW_DRAFT_KEY = 'borrow_form_draft';

export default function BorrowPage() {
  const navigate = useNavigate();
  const { persons, addTransaction, addInstallmentPlan } = useApp();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [entryName, setEntryName] = useState('');
  const [description, setDescription] = useState('');
  const [lenderId, setLenderId] = useState('');
  const [amountBorrowed, setAmountBorrowed] = useState('');
  const [dateBorrowed, setDateBorrowed] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [hasInstallments, setHasInstallments] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('MONTHLY');
  const [terms, setTerms] = useState('');
  const [notes, setNotes] = useState('');

  const BORROWER_ID = user?.id ?? '';

  const contacts = persons.filter(p => p.id !== BORROWER_ID);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const savedDraft = sessionStorage.getItem(BORROW_DRAFT_KEY);
    if (!savedDraft) return;

    try {
      const draft = JSON.parse(savedDraft);
      setEntryName(draft.entryName ?? '');
      setDescription(draft.description ?? '');
      setLenderId(draft.lenderId ?? '');
      setAmountBorrowed(draft.amountBorrowed ?? '');
      setDateBorrowed(draft.dateBorrowed ?? format(new Date(), 'yyyy-MM-dd'));
      setHasInstallments(Boolean(draft.hasInstallments));
      setStartDate(draft.startDate ?? '');
      setPaymentFrequency(draft.paymentFrequency ?? 'MONTHLY');
      setTerms(draft.terms ?? '');
      setNotes(draft.notes ?? '');
    } catch {
      sessionStorage.removeItem(BORROW_DRAFT_KEY);
      return;
    }

    sessionStorage.removeItem(BORROW_DRAFT_KEY);
  }, []);

  useEffect(() => {
  const selected = searchParams.get('selected');
  const field = searchParams.get('field');

  if (selected === 'true') {
    if (field === 'borrower') {
      const selectedId = sessionStorage.getItem('selected_borrower');
      if (selectedId) {
        setLenderId(selectedId);
        sessionStorage.removeItem('selected_borrower');
      }
    } else if (field === 'lender') {
      const selectedId = sessionStorage.getItem('selected_lender');
      if (selectedId) {
        setLenderId(selectedId);
        sessionStorage.removeItem('selected_lender');
      }
    }
  }
}, [searchParams]);

  const saveDraft = () => {
    sessionStorage.setItem(
      BORROW_DRAFT_KEY,
      JSON.stringify({
        entryName,
        description,
        lenderId,
        amountBorrowed,
        dateBorrowed,
        hasInstallments,
        startDate,
        paymentFrequency,
        terms,
        notes,
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

  if (!BORROWER_ID) {
    toast({ title: 'Not authenticated', description: 'Please sign in again.', variant: 'destructive' });
    return;
  }

  if (!entryName || !lenderId || !amountBorrowed) {
    return toast({ 
      title: 'Validation Error', 
      description: 'Fill all required fields', 
      variant: 'destructive' });
  }

  const amount = parseFloat(amountBorrowed);
  if (isNaN(amount) || amount <= 0) {
    return toast({ 
      title: 'Validation Error', 
      description: 'Invalid amount', 
      variant: 'destructive' });
  }

  if (hasInstallments && (!startDate || !terms || parseInt(terms) <= 0)) {
    return toast({ 
      title: 'Validation Error', 
      description: 'Invalid installment info', 
      variant: 'destructive' });
  }

  try {
    const resolveCurrentUserPersonId = async (): Promise<string> => {
      const { data: existingByEmail, error: existingError } = await supabase
        .from('persons')
        .select('id')
        .eq('owner_user_id', BORROWER_ID)
        .eq('email', user?.email ?? '')
        .limit(1)
        .maybeSingle();

      if (existingError) throw existingError;
      if (existingByEmail?.id) return existingByEmail.id;

      const { data: existingAny, error: existingAnyError } = await supabase
        .from('persons')
        .select('id')
        .eq('owner_user_id', BORROWER_ID)
        .ilike('notes', '__self__')
        .limit(1)
        .maybeSingle();

      if (existingAnyError) throw existingAnyError;
      if (existingAny?.id) return existingAny.id;

      const { data: createdSelf, error: createError } = await supabase
        .from('persons')
        .insert({
          owner_user_id: BORROWER_ID,
          name: user?.name ?? 'Me',
          email: user?.email ?? null,
          notes: '__self__',
        })
        .select('id')
        .single();

      if (createError) throw createError;
      return createdSelf.id;
    };

    const borrowerPersonId = await resolveCurrentUserPersonId();

    const createdLoan = await addTransaction({
      entryName,
      description: description || undefined,
      transactionType: hasInstallments ? 'INSTALLMENT_EXPENSE' : 'STRAIGHT_EXPENSE',
      direction: 'BORROW',
      amountBorrowed: amount,
      amountRemaining: amount,
      dateBorrowed: dateBorrowed,
      lenderContactId: lenderId,
      borrowerContactId: borrowerPersonId,
      borrowerGroupId: null,
      notes: notes || undefined,
    });

    if (hasInstallments) {
      const paymentTerms = parseInt(terms, 10);
      const amountPerTerm = amount / paymentTerms;
      const installments = Array.from({ length: paymentTerms }, (_, i) => {
        let dueDate = startDate;
        for (let termIdx = 0; termIdx < i; termIdx++) {
          dueDate = calculateNextPaymentDate(dueDate, paymentFrequency);
        }
        return {
          id: `${createdLoan.id}-term-${i + 1}`,
          termNumber: i + 1,
          dueDate,
          amountDue: amountPerTerm,
          amountPaid: 0,
          status: 'UNPAID' as InstallmentStatus,
        };
      });
      addInstallmentPlan({ transactionId: createdLoan.id, installments });
    }

    toast({ title: 'Success', description: 'Loan entry created!' });
    sessionStorage.removeItem(BORROW_DRAFT_KEY);
    navigate('/'); // go back to dashboard
  } catch (err: any) {
    toast({ title: 'Error', description: err.message, variant: 'destructive' });
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
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Borrow Money</h1>
              <p className="text-sm text-muted-foreground mt-1">Create a new entry for money you borrowed</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="entryName">Entry Name *</Label>
              <Input
                id="entryName"
                value={entryName}
                onChange={(e) => setEntryName(e.target.value)}
                placeholder="e.g., Emergency Loan, Business Capital"
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
              <Label htmlFor="lender">Lender *</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  saveDraft();
                  navigate('/contacts/select?returnTo=/borrow&field=lender');
                }}
                className="w-full h-12 justify-start text-left font-normal"
              >
                {lenderId 
                  ? contacts.find(p => p.id === lenderId)?.name || 'Select lender'
                  : 'Select lender'}
              </Button>
              <input type="hidden" value={lenderId} required />
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
                onClick={() => {
                  sessionStorage.removeItem(BORROW_DRAFT_KEY);
                  navigate(-1);
                }}
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

