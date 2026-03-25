import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Users, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { formatCurrencyCompact } from '@/types';
import { cn } from '@/lib/utils';
import { calculateGroupMemberBalances, simplifyDebts } from '@/utils/groupBalanceUtils';

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { groups, transactions, paymentAllocations, deleteGroup } = useApp();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSimplified, setShowSimplified] = useState(false);

  const group = groups.find(g => g.id === id);

  if (!group) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="font-display font-semibold text-foreground mb-2">Group not found</h2>
          <Button onClick={() => navigate('/people')}>Go back</Button>
        </div>
      </AppLayout>
    );
  }

  // Get related transactions
  const relatedTransactions = transactions.filter(t => t.borrowerGroupId === group.id);

  const totalGroupExpense = relatedTransactions.reduce((s, t) => s + (t.amountBorrowed ?? 0), 0);

  const memberBalances = useMemo(
    () => calculateGroupMemberBalances(group, transactions, paymentAllocations),
    [group, transactions, paymentAllocations]
  );

  const simplifiedDebts = useMemo(
    () => simplifyDebts(memberBalances),
    [memberBalances]
  );

  const handleDelete = () => {
    // Check if group has active transactions
    const hasActiveTransactions = relatedTransactions.some(t => t.status !== 'PAID');
    
    if (hasActiveTransactions) {
      toast({
        title: 'Cannot Delete',
        description: 'Cannot delete group with active transactions',
        variant: 'destructive',
      });
      setShowDeleteDialog(false);
      return;
    }

    deleteGroup(group.id);
    toast({
      title: 'Success',
      description: 'Group deleted successfully',
    });
    navigate('/people');
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
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Group Details</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate(`/groups/${group.id}/edit`)}
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
          </div>

          {/* Group Card */}
          <div className="bg-card rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-border/50 shadow-soft">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 ring-4 ring-primary/10">
                <Users className="w-10 h-10 lg:w-12 lg:h-12 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-1">{group.name}</h2>
                <p className="text-sm lg:text-base text-muted-foreground">{group.members.length} members</p>
              </div>
            </div>

            {/* Members List */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground mb-3">Members</h3>
              <div className="space-y-2">
                {group.members.map(member => (
                  <button
                    key={member.id}
                    onClick={() => navigate(`/contacts/${member.id}`)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/30 hover:shadow-soft transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{member.name}</p>
                      {member.phone && (
                        <p className="text-sm text-muted-foreground">{member.phone}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Group Balances */}
          {totalGroupExpense > 0 && (
            <div className="bg-card rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-border/50 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold text-foreground">Group Balances</h3>
                <span className="text-sm text-muted-foreground">
                  Total: {formatCurrencyCompact(totalGroupExpense)}
                </span>
              </div>

              {memberBalances.length > 0 ? (
                <div className="space-y-4">
                  {memberBalances.map(mb => (
                    <div key={mb.memberId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{mb.name}</span>
                        <span className={mb.amountOwed > 0.009 ? 'text-destructive font-medium' : 'text-success font-medium'}>
                          {mb.amountOwed > 0.009
                            ? `Owes ${formatCurrencyCompact(mb.amountOwed)}`
                            : 'Settled'}
                        </span>
                      </div>
                      <Progress
                        value={mb.totalShare > 0 ? (mb.amountPaid / mb.totalShare) * 100 : 0}
                        className="h-1.5"
                      />
                      <p className="text-xs text-muted-foreground">
                        Paid {formatCurrencyCompact(mb.amountPaid)} of {formatCurrencyCompact(mb.totalShare)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No allocations recorded yet. Create a group expense to track balances.
                </p>
              )}

              {/* Simplify Debts */}
              {simplifiedDebts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <button
                    onClick={() => setShowSimplified(s => !s)}
                    className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
                  >
                    {showSimplified ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {showSimplified ? 'Hide simplified debts' : 'Simplify Debts'}
                  </button>
                  {showSimplified && (
                    <div className="mt-3 space-y-2">
                      {simplifiedDebts.map((d, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50 text-sm"
                        >
                          <span className="text-foreground">
                            <span className="font-medium">{d.fromMemberName}</span>
                            <span className="text-muted-foreground mx-1.5">→</span>
                            <span className="font-medium">{d.toMemberName}</span>
                          </span>
                          <span className="font-semibold text-foreground">
                            {formatCurrencyCompact(d.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
                        Group Expense • {transaction.referenceId}
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
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {group.name}? This action cannot be undone.
              {relatedTransactions.length > 0 && (
                <span className="block mt-2 text-destructive">
                  This group has {relatedTransactions.length} transaction(s). They will need to be handled separately.
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

