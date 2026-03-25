import { Group, Transaction, PaymentAllocation, GroupMemberBalance, DebtSimplification } from '@/types';

export function calculateGroupMemberBalances(
  group: Group,
  transactions: Transaction[],
  paymentAllocations: PaymentAllocation[]
): GroupMemberBalance[] {
  // Get all transaction IDs for this group
  const groupTxIds = new Set(
    transactions
      .filter(t => t.borrowerGroupId === group.id)
      .map(t => t.id)
  );

  return group.members.map(member => {
    const memberAllocs = paymentAllocations.filter(
      a => a.personId === member.id && groupTxIds.has(a.transactionId)
    );

    const totalShare = memberAllocs.reduce((s, a) => s + a.allocated_amount, 0);
    const amountPaid = memberAllocs.reduce((s, a) => s + a.amount_paid, 0);
    const amountOwed = Math.max(0, totalShare - amountPaid);

    return {
      memberId: member.id,
      name: member.name,
      totalShare,
      amountPaid,
      amountOwed,
    };
  });
}

export function simplifyDebts(balances: GroupMemberBalance[]): DebtSimplification[] {
  // net > 0: creditor (overpaid / paid more than their share)
  // net < 0: debtor (underpaid / owes more)
  const nets = balances.map(b => ({
    id: b.memberId,
    name: b.name,
    net: b.amountPaid - b.totalShare,
  }));

  const creditors = nets.filter(n => n.net > 0.009).sort((a, b) => b.net - a.net);
  const debtors = nets.filter(n => n.net < -0.009).sort((a, b) => a.net - b.net);

  const result: DebtSimplification[] = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const credit = creditors[ci].net;
    const debt = Math.abs(debtors[di].net);
    const amount = Math.min(credit, debt);

    if (amount > 0.009) {
      result.push({
        fromMemberId: debtors[di].id,
        fromMemberName: debtors[di].name,
        toMemberId: creditors[ci].id,
        toMemberName: creditors[ci].name,
        amount: parseFloat(amount.toFixed(2)),
      });
    }

    creditors[ci].net -= amount;
    debtors[di].net += amount;

    if (Math.abs(creditors[ci].net) < 0.009) ci++;
    if (Math.abs(debtors[di].net) < 0.009) di++;
  }

  return result;
}
