import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, User, Phone, Mail, Edit2, Trash2, FileText, HandCoins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Person, formatCurrencyCompact } from '@/types';
import { cn } from '@/lib/utils';
import { calculatePersonBalance, getBalanceLabel } from '@/utils/balanceUtils';

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { transactions, groups, paymentAllocations, deletePerson } = useApp();
  const { toast } = useToast();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

   // Fetch person from backend
  useEffect(() => {
    if (!id) return;

    const fetchPerson = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/persons/${id}`);
        if (!res.ok) throw new Error('Person not found');
        const data: Person = await res.json();
        setPerson(data);
      } catch (err) {
        console.error(err);
        toast({
          title: 'Error',
          description: 'Could not fetch contact details.',
        });
        navigate('/people');
      } finally {
        setLoading(false);
      }
    };

    fetchPerson();
  }, [id, toast, navigate]);


  if (!person) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="font-display font-semibold text-foreground mb-2">Contact not found</h2>
          <Button onClick={() => navigate('/people')}>Go back</Button>
        </div>
      </AppLayout>
    );
  }

  const initials = person.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const isCurrentUser = false; // We don't track current user in the persons list

  // Get related transactions
  const relatedTransactions = transactions.filter(t => {
    if (t.lenderContactId === person.id || t.borrowerContactId === person.id) {
      return true;
    }
    // Check if person is in a group that's the borrower
    if (t.borrowerGroupId) {
      const group = groups.find(g => g.id === t.borrowerGroupId);
      if (group && group.members.some(m => m.id === person.id)) {
        return true;
      }
    }
    return false;
  });

  // Balance for this contact
  const balance = person
    ? calculatePersonBalance(person.id, transactions, paymentAllocations)
    : null;
  const balanceLabel = balance ? getBalanceLabel(balance.net) : null;

  // Settle Up: navigate to the largest outstanding transaction with this person
  function handleSettleUp() {
    if (!person) return;
    const candidates = relatedTransactions.filter(t =>
      t.status !== 'PAID' && (t.amountRemaining ?? 0) > 0
    );
    if (candidates.length === 0) return;
    const largest = candidates.reduce((a, b) =>
      (b.amountRemaining ?? 0) > (a.amountRemaining ?? 0) ? b : a
    );
    navigate(`/record-payment/${largest.id}`);
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/person/${person.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete contact');

      // Update frontend state
      deletePerson(person.id);

      toast({
        title: 'Success',
        description: 'Contact deleted successfully',
      });
      navigate('/people');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Could not delete contact. Try again later.',
        variant: 'destructive',
      });
    }
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
            <div className="flex-1">
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Contact Details</h1>
            </div>
            {!isCurrentUser && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate(`/contacts/${person.id}/edit`)}
                  className="h-10 w-10"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                  className="h-10 w-10 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Profile Card */}
          <div className="bg-card rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-border/50 shadow-soft">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 ring-4 ring-primary/10">
                <span className="text-primary font-bold text-2xl lg:text-3xl">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-1">{person.name}</h2>
                <p className="text-sm lg:text-base text-muted-foreground">Contact</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              {person.phone && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                    <p className="font-medium text-foreground">{person.phone}</p>
                  </div>
                </div>
              )}

              {person.email && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                    <p className="font-medium text-foreground truncate">{person.email}</p>
                  </div>
                </div>
              )}

              {person.notes && (
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Notes</p>
                  </div>
                  <p className="text-sm text-foreground">{person.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Balance Summary */}
          {balance && (
            <div className="bg-card rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-border/50 shadow-soft">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Balance Summary</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Net Balance</p>
                  <p className={cn('text-3xl font-bold font-display', balanceLabel?.colorClass)}>
                    {balance.net >= 0 ? '+' : ''}{formatCurrencyCompact(balance.net)}
                  </p>
                  <p className={cn('text-sm mt-1', balanceLabel?.colorClass)}>{balanceLabel?.text}</p>
                </div>
                {Math.abs(balance.net) > 0.009 && (
                  <Button onClick={handleSettleUp} className="h-10 gap-1.5">
                    <HandCoins className="w-4 h-4" />
                    Settle Up
                  </Button>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">They owe you</span>
                  <span className="text-success font-medium">{formatCurrencyCompact(balance.receivable)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">You owe them</span>
                  <span className="text-destructive font-medium">{formatCurrencyCompact(balance.payable)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Related Transactions */}
          {relatedTransactions.length > 0 && (
            <div className="bg-card rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-border/50 shadow-soft">
              <h3 className="font-display text-lg lg:text-xl font-semibold text-foreground mb-4">
                Related Transactions ({relatedTransactions.length})
              </h3>
              <div className="space-y-2">
                {relatedTransactions.slice(0, 5).map(transaction => (
                  <button
                    key={transaction.id}
                    onClick={() => navigate(`/transaction/${transaction.id}`)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 hover:shadow-soft transition-all text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{transaction.entryName}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.transactionType === 'GROUP_EXPENSE' 
                          ? 'Group Expense' 
                          : (transaction.direction === 'LEND' ? 'Lent' : 'Borrowed')} • {transaction.referenceId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">₱{transaction.amountRemaining.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                    </div>
                  </button>
                ))}
                {relatedTransactions.length > 5 && (
                  <button
                    onClick={() => navigate('/records')}
                    className="w-full p-3 text-sm text-primary font-medium hover:underline"
                  >
                    View all {relatedTransactions.length} transactions
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {person.name}? This action cannot be undone.
              {relatedTransactions.length > 0 && (
                <span className="block mt-2 text-destructive">
                  This contact has {relatedTransactions.length} transaction(s). They will need to be handled separately.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

