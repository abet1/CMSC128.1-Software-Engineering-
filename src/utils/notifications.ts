import { Transaction, InstallmentPlan } from '@/types';

// Helper function to get notifications from data
export const getDueNotificationsFromData = (
  transactions: Transaction[],
  installmentPlans: InstallmentPlan[]
) => {
  const notifications: Array<{
    id: string;
    title: string;
    description: string;
    type: 'overdue' | 'upcoming' | 'reminder';
    amount: number;
    dueDate: Date;
    transactionId: string;
  }> = [];

  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  installmentPlans.forEach(plan => {
    const transaction = transactions.find(t => t.id === plan.transactionId);
    if (!transaction) return;

    plan.installments.forEach(installment => {
      if (installment.status === 'DELINQUENT') {
        notifications.push({
          id: `notif-${installment.id}`,
          title: `Overdue: ${transaction.entryName}`,
          description: `Term ${installment.termNumber} is past due`,
          type: 'overdue',
          amount: installment.amountDue,
          dueDate: installment.dueDate,
          transactionId: transaction.id,
        });
      } else if (installment.status === 'UNPAID' && installment.dueDate <= nextWeek) {
        notifications.push({
          id: `notif-${installment.id}`,
          title: `Upcoming: ${transaction.entryName}`,
          description: `Term ${installment.termNumber} due soon`,
          type: 'upcoming',
          amount: installment.amountDue,
          dueDate: installment.dueDate,
          transactionId: transaction.id,
        });
      }
    });
  });

  return notifications.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
};

