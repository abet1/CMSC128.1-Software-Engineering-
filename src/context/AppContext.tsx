import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import {
  Transaction,
  Person,
  Group,
  Payment,
  Installment,
  InstallmentPlan,
  PaymentAllocation,
  TransactionType,
  PaymentStatus,
  InstallmentStatus,
  PaymentFrequency,
  generateReferenceId,
  calculateNextPaymentDate,
  calculateInstallmentStatus,
} from '@/types';
import { getDueNotificationsFromData } from '@/utils/notifications';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

interface AppContextType {
  // Data
  transactions: Transaction[];
  persons: Person[];
  groups: Group[];
  payments: Payment[];
  installmentPlans: InstallmentPlan[];
  paymentAllocations: PaymentAllocation[];
  clearedNotifications: Set<string>;
  
  // Transaction CRUD
  addTransaction: (transaction: Omit<Transaction, 'id' | 'referenceId' | 'createdAt'>) => Promise<Transaction>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  completeTransaction: (id: string) => void;
  
  // Payment CRUD
  addPayment: (payment: Omit<Payment, 'id'>) => Payment;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  
  // Person CRUD
  addPerson: (person: Omit<Person, 'id' | 'createdAt'>) => Person;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  
  // Group CRUD
  addGroup: (group: Omit<Group, 'id' | 'createdAt'>) => Promise<Group>;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  
  // Installment operations
  addInstallmentPlan: (plan: InstallmentPlan) => void;
  updateInstallmentPlan: (transactionId: string, plan: Partial<InstallmentPlan>) => void;
  skipInstallment: (transactionId: string, installmentId: string) => void;
  
  // Payment Allocation
  addPaymentAllocation: (allocation: Omit<PaymentAllocation, 'id'>) => PaymentAllocation;
  updatePaymentAllocation: (id: string, updates: Partial<PaymentAllocation>) => void;
  divideEqually: (transactionId: string, groupId: string) => void;
  divideByPercentage: (transactionId: string, percentages: Record<string, number>) => void;
  divideByAmount: (transactionId: string, amounts: Record<string, number>) => void;
  
  // Notifications
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

const inferInstallmentFrequency = (installments: Installment[]): PaymentFrequency => {
  const datedInstallments = installments
    .filter(inst => inst.dueDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  if (datedInstallments.length < 2) return 'MONTHLY';

  const previousDue = new Date(datedInstallments[datedInstallments.length - 2].dueDate);
  const lastDue = new Date(datedInstallments[datedInstallments.length - 1].dueDate);
  const daysBetween = Math.round((lastDue.getTime() - previousDue.getTime()) / (1000 * 60 * 60 * 24));

  return daysBetween >= 6 && daysBetween <= 8 ? 'WEEKLY' : 'MONTHLY';
};

const createReplacementInstallment = (
  transactionId: string,
  installments: Installment[],
  skippedInstallment: Installment
): Installment => {
  const maxTermNumber = installments.reduce(
    (max, inst, index) => Math.max(max, inst.termNumber ?? index + 1),
    0
  );
  const sortedByDueDate = installments
    .filter(inst => inst.dueDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const lastDueDate = sortedByDueDate[sortedByDueDate.length - 1]?.dueDate ?? skippedInstallment.dueDate;

  return {
    id: `${transactionId}-term-${maxTermNumber + 1}-${Date.now()}`,
    termNumber: maxTermNumber + 1,
    dueDate: calculateNextPaymentDate(lastDueDate, inferInstallmentFrequency(installments)),
    amountDue: skippedInstallment.amountDue,
    amountPaid: 0,
    status: 'UNPAID',
  };
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([]);
  const [paymentAllocations, setPaymentAllocations] = useState<PaymentAllocation[]>([]);
  const [clearedNotifications, setClearedNotifications] = useState<Set<string>>(new Set());

  const getCurrentUserId = useCallback(async (): Promise<string | null> => {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user?.id ?? null;
  }, []);

  const fetchPersonsFromSupabase = useCallback(async () => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('No authenticated Supabase user');

    const { data, error } = await supabase
      .from('persons')
      .select('*')
      .eq('owner_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setPersons((data ?? []) as Person[]);
  }, [getCurrentUserId]);

  const fetchGroupsFromSupabase = useCallback(async () => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('No authenticated Supabase user');

    const [{ data: groupsData, error: groupsError }, { data: membershipsData, error: membershipsError }] =
      await Promise.all([
        supabase
          .from('contact_groups')
          .select('id, name, created_at')
          .eq('owner_user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('group_members')
          .select('group_id, person_id, persons(id, name, phone, first_name, last_name)')
          .eq('owner_user_id', userId),
      ]);

    if (groupsError) throw groupsError;
    if (membershipsError) throw membershipsError;

    const membersByGroup = new Map<string, { id: string; name: string; phone?: string }[]>();
    (membershipsData ?? []).forEach((m: any) => {
      const groupId = m.group_id as string;
      const person = m.persons as any;
      const name =
        person?.name ??
        [person?.first_name, person?.last_name].filter(Boolean).join(' ').trim() ??
        'Unknown';
      const member = {
        id: m.person_id as string,
        name,
        phone: person?.phone ?? undefined,
      };
      const existing = membersByGroup.get(groupId) ?? [];
      existing.push(member);
      membersByGroup.set(groupId, existing);
    });

    const mappedGroups: Group[] = (groupsData ?? []).map((g: any) => ({
      id: g.id,
      name: g.name,
      createdAt: g.created_at,
      members: membersByGroup.get(g.id) ?? [],
    }));

    setGroups(mappedGroups);
  }, [getCurrentUserId]);

  const mapDbLoanEntryToTransaction = useCallback((row: any): Transaction => {
    return {
      id: row.id,
      entryName: row.entry_name,
      referenceId: row.reference_id,
      amountBorrowed: Number(row.amount_borrowed ?? 0),
      amountRemaining: Number(row.amount_remaining ?? row.amount_borrowed ?? 0),
      borrowerContactId: row.borrower_contact_id ?? null,
      borrowerGroupId: row.borrower_group_id ?? null,
      lenderContactId: row.lender_contact_id ?? null,
      transactionType: row.transaction_type ?? 'LEND',
      status: row.status ?? 'UNPAID',
      dateBorrowed: row.date_borrowed ?? new Date().toISOString().split('T')[0],
      paymentFrequency: row.payment_frequency ?? undefined,
      numberOfTerms: row.number_of_terms ?? undefined,
      notes: row.notes ?? undefined,
      loanChannel: row.loan_channel ?? undefined,
      proofUrl: row.proof_url ?? undefined,
      createdAt: row.created_at ?? undefined,
    };
  }, []);

  const mapTransactionToDbLoanEntry = useCallback((transactionData: Omit<Transaction, 'id' | 'referenceId' | 'createdAt'>, userId: string) => {
    const amountBorrowed = Number(transactionData.amountBorrowed ?? transactionData.amount ?? 0);
    const amountRemaining = Number(transactionData.amountRemaining ?? amountBorrowed);
    return {
      owner_user_id: userId,
      entry_name: transactionData.entryName ?? 'Untitled entry',
      amount_borrowed: amountBorrowed,
      amount_remaining: amountRemaining,
      borrower_contact_id: transactionData.borrowerContactId ?? null,
      borrower_group_id: transactionData.borrowerGroupId ?? null,
      lender_contact_id: transactionData.lenderContactId ?? null,
      transaction_type: transactionData.transactionType ?? 'LEND',
      status: transactionData.status ?? calculatePaymentStatus(amountBorrowed, amountRemaining),
      date_borrowed: transactionData.dateBorrowed
        ? new Date(transactionData.dateBorrowed).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      payment_frequency: transactionData.paymentFrequency ?? null,
      number_of_terms: transactionData.numberOfTerms ?? null,
      notes: transactionData.notes ?? null,
      loan_channel: transactionData.loanChannel ?? null,
      proof_url: transactionData.proofUrl ?? null,
    };
  }, []);

  const fetchTransactionsFromSupabase = useCallback(async () => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('No authenticated Supabase user');

    const { data, error } = await supabase
      .from('loan_entries')
      .select('*')
      .eq('owner_user_id', userId)
      .order('date_borrowed', { ascending: false });

    if (error) throw error;
    setTransactions((data ?? []).map(mapDbLoanEntryToTransaction));
  }, [getCurrentUserId, mapDbLoanEntryToTransaction]);

  const mapDbPaymentToPayment = useCallback((row: any): Payment => {
    return {
      id: row.id,
      transactionId: row.transaction_id,
      paymentAmount: Number(row.payment_amount ?? 0),
      paymentDate: row.payment_date,
      payeeId: row.payee_id ?? undefined,
      installmentId: row.installment_id ?? undefined,
      proofUrl: row.proof_url ?? undefined,
      notes: row.notes ?? undefined,
      created_at: row.created_at ?? undefined,
    };
  }, []);

  const fetchPaymentsFromSupabase = useCallback(async () => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('No authenticated Supabase user');

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('owner_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setPayments((data ?? []).map(mapDbPaymentToPayment));
  }, [getCurrentUserId, mapDbPaymentToPayment]);

  const mapDbPaymentAllocationToPaymentAllocation = useCallback((row: any): PaymentAllocation => {
    return {
      id: row.id,
      transactionId: row.transaction_id,
      personId: row.person_id,
      allocated_amount: Number(row.allocated_amount ?? 0),
      allocated_percent: row.allocated_percent != null ? Number(row.allocated_percent) : undefined,
      amount_paid: Number(row.amount_paid ?? 0),
      is_fully_paid: Boolean(row.is_fully_paid),
    };
  }, []);

  const fetchPaymentAllocationsFromSupabase = useCallback(async () => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('No authenticated Supabase user');

    const { data, error } = await supabase
      .from('payment_allocations')
      .select('*')
      .eq('owner_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setPaymentAllocations((data ?? []).map(mapDbPaymentAllocationToPaymentAllocation));
  }, [getCurrentUserId, mapDbPaymentAllocationToPaymentAllocation]);

  const mapDbInstallmentPlanRows = useCallback((rows: any[]): InstallmentPlan[] => {
    return (rows ?? []).map((planRow: any) => ({
      transactionId: planRow.transaction_id,
      installments: (planRow.installments ?? [])
        .slice()
        .sort((a: any, b: any) => (a.term_number ?? 0) - (b.term_number ?? 0))
        .map((inst: any) => ({
          id: inst.id,
          termNumber: inst.term_number ?? undefined,
          dueDate: inst.due_date,
          amountDue: Number(inst.amount_due ?? 0),
          amountPaid: Number(inst.amount_paid ?? 0),
          status: (inst.status ?? 'PENDING') as InstallmentStatus,
          paidDate: inst.paid_date ?? undefined,
        })),
    }));
  }, []);

  const fetchInstallmentPlansFromSupabase = useCallback(async () => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('No authenticated Supabase user');

    const { data, error } = await supabase
      .from('installment_plans')
      .select(`
        id,
        transaction_id,
        installments (
          id,
          term_number,
          due_date,
          amount_due,
          amount_paid,
          status,
          paid_date
        )
      `)
      .eq('owner_user_id', userId);

    if (error) throw error;
    setInstallmentPlans(mapDbInstallmentPlanRows(data ?? []));
  }, [getCurrentUserId, mapDbInstallmentPlanRows]);

  useEffect(() => {
    fetchPersonsFromSupabase().catch(() => {
      console.warn('Supabase persons unavailable — using empty list');
      setPersons([]);
    });
  }, [fetchPersonsFromSupabase]);

  useEffect(() => {
    fetchGroupsFromSupabase().catch(() => {
      console.warn('Supabase groups unavailable — using empty list');
      setGroups([]);
    });
  }, [fetchGroupsFromSupabase]);

  useEffect(() => {
    fetchTransactionsFromSupabase().catch(() => {
      console.warn('Supabase transactions unavailable — using empty list');
      setTransactions([]);
      setPaymentAllocations([]);
    });
  }, [fetchTransactionsFromSupabase]);

  useEffect(() => {
    fetchPaymentsFromSupabase().catch(() => {
      console.warn('Supabase payments unavailable — using local empty payments');
      setPayments([]);
    });
  }, [fetchPaymentsFromSupabase]);

  useEffect(() => {
    fetchInstallmentPlansFromSupabase().catch(() => {
      console.warn('Supabase installments unavailable — using local empty installment plans');
      setInstallmentPlans([]);
    });
  }, [fetchInstallmentPlansFromSupabase]);

  useEffect(() => {
    fetchPaymentAllocationsFromSupabase().catch(() => {
      console.warn('Supabase payment allocations unavailable — using local empty payment allocations');
      setPaymentAllocations([]);
    });
  }, [fetchPaymentAllocationsFromSupabase]);


  // Helper to calculate payment status
  const calculatePaymentStatus = (amountBorrowed: number, amountRemaining: number): PaymentStatus => {
    if (amountRemaining <= 0) return 'PAID';
    if (amountRemaining < amountBorrowed) return 'PARTIALLY_PAID';
    return 'UNPAID';
  };

  // Transaction CRUD
  const addTransaction = useCallback(
  async (transactionData: Omit<Transaction, 'id' | 'referenceId' | 'createdAt'>): Promise<Transaction> => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('No authenticated Supabase user');

      const payload = mapTransactionToDbLoanEntry(transactionData, userId);
      const { data, error } = await supabase
        .from('loan_entries')
        .insert(payload)
        .select('*')
        .single();
      if (error) throw error;

      const newTransaction = mapDbLoanEntryToTransaction(data);
      setTransactions(prev => [...prev, newTransaction]);

      return newTransaction;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  [getCurrentUserId, mapDbLoanEntryToTransaction, mapTransactionToDbLoanEntry]
);


  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updates };
        // Recalculate status if amounts changed
        if (updates.amountBorrowed !== undefined || updates.amountRemaining !== undefined) {
          updated.status = calculatePaymentStatus(
            updated.amountBorrowed,
            updated.amountRemaining
          );
        }
        return updated;
      }
      return t;
    }));
    void (async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) return;
        const patch: Record<string, unknown> = {};
        if (updates.entryName !== undefined) patch.entry_name = updates.entryName;
        if (updates.amountBorrowed !== undefined) patch.amount_borrowed = Number(updates.amountBorrowed);
        if (updates.amountRemaining !== undefined) patch.amount_remaining = Number(updates.amountRemaining);
        if (updates.borrowerContactId !== undefined) patch.borrower_contact_id = updates.borrowerContactId ?? null;
        if (updates.borrowerGroupId !== undefined) patch.borrower_group_id = updates.borrowerGroupId ?? null;
        if (updates.lenderContactId !== undefined) patch.lender_contact_id = updates.lenderContactId ?? null;
        if (updates.transactionType !== undefined) patch.transaction_type = updates.transactionType;
        if (updates.status !== undefined) patch.status = updates.status;
        if (updates.dateBorrowed !== undefined) {
          patch.date_borrowed = updates.dateBorrowed
            ? new Date(updates.dateBorrowed).toISOString().split('T')[0]
            : null;
        }
        if (updates.paymentFrequency !== undefined) patch.payment_frequency = updates.paymentFrequency ?? null;
        if (updates.numberOfTerms !== undefined) patch.number_of_terms = updates.numberOfTerms ?? null;
        if (updates.notes !== undefined) patch.notes = updates.notes ?? null;
        if (updates.loanChannel !== undefined) patch.loan_channel = updates.loanChannel ?? null;
        if (updates.proofUrl !== undefined) patch.proof_url = updates.proofUrl ?? null;
        const { error } = await supabase
          .from('loan_entries')
          .update(patch)
          .eq('id', id)
          .eq('owner_user_id', userId);
        if (error) throw error;
      } catch (error) {
        console.error('Failed to update transaction in Supabase:', error);
      }
    })();
  }, [getCurrentUserId]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    setPayments(prev => prev.filter(p => p.transactionId !== id));
    setInstallmentPlans(prev => prev.filter(ip => ip.transactionId !== id));
    setPaymentAllocations(prev => prev.filter(pa => pa.transactionId !== id));
    void (async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) return;
        const { error } = await supabase
          .from('loan_entries')
          .delete()
          .eq('id', id)
          .eq('owner_user_id', userId);
        if (error) throw error;
      } catch (error) {
        console.error('Failed to delete transaction in Supabase:', error);
      }
    })();
  }, [getCurrentUserId]);

  const completeTransaction = useCallback((id: string) => {
    updateTransaction(id, {
      amountRemaining: 0,
      status: 'PAID',
    });
  }, [updateTransaction]);

  const fetchTransactions = useCallback(async () => {
  try {
    await fetchTransactionsFromSupabase();
  } catch (err) {
    console.error('Error fetching transactions:', err);
  }
}, [fetchTransactionsFromSupabase]);

  // Payment CRUD
  const addPayment = useCallback((paymentData: Omit<Payment, 'id'>): Payment => {
    const newPayment: Payment = {
      ...paymentData,
      id: `p${Date.now()}`,
    };

    setPayments(prev => [...prev, newPayment]);

    const transaction = transactions.find(t => t.id === paymentData.transactionId);
    const previousRemaining = Number(transaction?.amountRemaining ?? 0);
    const paymentAmount = Number(paymentData.paymentAmount ?? 0);
    const amountBorrowed = Number(transaction?.amountBorrowed ?? 0);
    const newAmountRemaining = Math.max(0, previousRemaining - paymentAmount);

    // Update transaction amount remaining using functional update
    setTransactions(prev => prev.map(t => {
      if (t.id === paymentData.transactionId) {
        return {
          ...t,
          amountRemaining: newAmountRemaining,
          status: calculatePaymentStatus(amountBorrowed, newAmountRemaining),
        };
      }
      return t;
    }));

    // If payment is for an installment, update installment
    if (paymentData.installmentId) {
      setInstallmentPlans(prev => prev.map(plan => {
        if (plan.transactionId === paymentData.transactionId) {
          return {
            ...plan,
            installments: plan.installments.map(inst => {
              if (inst.id === paymentData.installmentId) {
                const newAmountPaid = inst.amountPaid + paymentData.paymentAmount;
                const isFullyPaid = newAmountPaid >= inst.amountDue;
                const updatedInst = {
                  ...inst,
                  amountPaid: newAmountPaid,
                  paidDate: isFullyPaid
                    ? (paymentData.paymentDate instanceof Date
                        ? paymentData.paymentDate.toISOString()
                        : paymentData.paymentDate)
                    : inst.paidDate,
                };
                // Recalculate status based on dates and payment
                return {
                  ...updatedInst,
                  status: isFullyPaid ? 'PAID' : calculateInstallmentStatus(updatedInst),
                };
              }
              // Recalculate status for other installments in case dates changed
              return {
                ...inst,
                status: calculateInstallmentStatus(inst),
              };
            }),
          };
        }
        return plan;
      }));
    }

    void (async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) return;

        const paymentDate =
          paymentData.paymentDate instanceof Date
            ? paymentData.paymentDate.toISOString().split('T')[0]
            : (paymentData.paymentDate ?? new Date().toISOString().split('T')[0]);

        const { data, error } = await supabase.rpc('record_payment_atomic', {
          p_transaction_id: paymentData.transactionId,
          p_payment_amount: paymentAmount,
          p_payment_date: paymentDate,
          p_payee_id: paymentData.payeeId ?? null,
          p_installment_id: paymentData.installmentId ?? null,
          p_proof_url: paymentData.proofUrl ?? null,
          p_notes: paymentData.notes ?? null,
        });
        if (error) throw error;

        setPayments(prev => prev.map(p => (p.id === newPayment.id ? mapDbPaymentToPayment(data) : p)));
      } catch (error) {
        console.error('Failed to persist payment in Supabase:', error);
      }
    })();

    return newPayment;
  }, [transactions, installmentPlans, calculatePaymentStatus, getCurrentUserId, mapDbPaymentToPayment]);

  const updatePayment = useCallback((id: string, updates: Partial<Payment>) => {
    const existingPayment = payments.find(p => p.id === id);
    if (!existingPayment) return;

    const prevPayments = payments;
    const prevTransactions = transactions;
    const oldAmount = Number(existingPayment.paymentAmount ?? 0);
    const nextAmount = updates.paymentAmount != null ? Number(updates.paymentAmount) : oldAmount;
    const delta = nextAmount - oldAmount;
    const transactionId = existingPayment.transactionId;

    setPayments(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));

    if (transactionId) {
      setTransactions(prev => prev.map(t => {
        if (t.id !== transactionId) return t;
        const nextRemaining = Math.max(0, Number(t.amountRemaining ?? 0) - delta);
        return {
          ...t,
          amountRemaining: nextRemaining,
          status: calculatePaymentStatus(Number(t.amountBorrowed ?? 0), nextRemaining),
        };
      }));
    }

    void (async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) return;

        const nextPaymentDate =
          updates.paymentDate !== undefined
            ? (updates.paymentDate instanceof Date
              ? updates.paymentDate.toISOString().split('T')[0]
              : updates.paymentDate)
            : (existingPayment.paymentDate instanceof Date
              ? existingPayment.paymentDate.toISOString().split('T')[0]
              : existingPayment.paymentDate);

        const { error: paymentError } = await supabase.rpc('update_payment_atomic', {
          p_payment_id: id,
          p_payment_amount: nextAmount,
          p_payment_date: nextPaymentDate ?? new Date().toISOString().split('T')[0],
          p_payee_id: updates.payeeId !== undefined ? (updates.payeeId ?? null) : (existingPayment.payeeId ?? null),
          p_installment_id:
            updates.installmentId !== undefined
              ? (updates.installmentId ?? null)
              : (existingPayment.installmentId ?? null),
          p_proof_url: updates.proofUrl !== undefined ? (updates.proofUrl ?? null) : (existingPayment.proofUrl ?? null),
          p_notes: updates.notes !== undefined ? (updates.notes ?? null) : (existingPayment.notes ?? null),
        });
        if (paymentError) throw paymentError;

        // Keep local state aligned with DB-triggered status and calculated balances.
        await fetchTransactionsFromSupabase();
        await fetchInstallmentPlansFromSupabase();
      } catch (error) {
        console.error('Failed to update payment in Supabase:', error);
        setPayments(prevPayments);
        setTransactions(prevTransactions);
      }
    })();
  }, [
    payments,
    transactions,
    calculatePaymentStatus,
    getCurrentUserId,
    fetchInstallmentPlansFromSupabase,
    fetchTransactionsFromSupabase,
  ]);

  const deletePayment = useCallback((id: string) => {
    const payment = payments.find(p => p.id === id);
    if (!payment) return;

    const prevPayments = payments;
    const prevTransactions = transactions;
    const transaction = transactions.find(t => t.id === payment.transactionId);
    const restoredAmount = Number(payment.paymentAmount ?? 0);

    setPayments(prev => prev.filter(p => p.id !== id));

    if (transaction) {
      const newAmountRemaining = Math.max(0, Number(transaction.amountRemaining ?? 0) + restoredAmount);
      setTransactions(prev => prev.map(t => (
        t.id === transaction.id
          ? {
              ...t,
              amountRemaining: newAmountRemaining,
              status: calculatePaymentStatus(Number(t.amountBorrowed ?? 0), newAmountRemaining),
            }
          : t
      )));
    }

    void (async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) return;

        const { error: paymentDeleteError } = await supabase.rpc('delete_payment_atomic', {
          p_payment_id: id,
        });
        if (paymentDeleteError) throw paymentDeleteError;

        // Keep local state aligned with DB-triggered status and calculated balances.
        await fetchTransactionsFromSupabase();
        await fetchInstallmentPlansFromSupabase();
      } catch (error) {
        console.error('Failed to delete payment in Supabase:', error);
        setPayments(prevPayments);
        setTransactions(prevTransactions);
      }
    })();
  }, [
    payments,
    transactions,
    calculatePaymentStatus,
    getCurrentUserId,
    fetchInstallmentPlansFromSupabase,
    fetchTransactionsFromSupabase,
  ]);

  // Person CRUD
  const addPerson = useCallback((personData: Omit<Person, 'id' | 'createdAt'>): Person => {
    const newPerson: Person = {
      ...personData,
      id: `person${Date.now()}`,
      createdAt: new Date(),
    };
    setPersons(prev => [...prev, newPerson]);

    void (async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) return;
        const { data, error } = await supabase
          .from('persons')
          .insert({
            owner_user_id: userId,
            name: newPerson.name,
            first_name: newPerson.first_name,
            middle_name: newPerson.middle_name,
            last_name: newPerson.last_name,
            nickname: newPerson.nickname,
            phone: newPerson.phone,
            email: newPerson.email,
            notes: newPerson.notes,
          })
          .select('*')
          .single();
        if (error) throw error;
        setPersons(prev => prev.map(p => (p.id === newPerson.id ? (data as Person) : p)));
      } catch (error) {
        console.error('Failed to persist person in Supabase:', error);
      }
    })();

    return newPerson;
  }, [getCurrentUserId]);

  const updatePerson = useCallback((id: string, updates: Partial<Person>) => {
    setPersons(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    // Also update in groups
    setGroups(prev => prev.map(g => ({
      ...g,
      members: g.members.map(m => m.id === id ? { ...m, ...updates } : m),
    })));
    void (async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) return;
        const { error } = await supabase
          .from('persons')
          .update({
            name: updates.name,
            first_name: updates.first_name,
            middle_name: updates.middle_name,
            last_name: updates.last_name,
            nickname: updates.nickname,
            phone: updates.phone,
            email: updates.email,
            notes: updates.notes,
          })
          .eq('id', id)
          .eq('owner_user_id', userId);
        if (error) throw error;
      } catch (error) {
        console.error('Failed to update person in Supabase:', error);
      }
    })();
  }, [getCurrentUserId]);

  const deletePerson = useCallback((id: string) => {
  console.log("Deleting person id:", id);
  if (id === 'current') {
    console.warn("Cannot delete current user");
    return;
  }
  setPersons(prev => prev.filter(p => p.id !== id));
  setGroups(prev => prev.map(g => ({
    ...g,
    members: g.members.filter(m => m.id !== id),
  })));
  void (async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) return;
      const { error } = await supabase
        .from('persons')
        .delete()
        .eq('id', id)
        .eq('owner_user_id', userId);
      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete person in Supabase:', error);
    }
  })();
}, [getCurrentUserId]);


  // Group CRUD
  const addGroup = useCallback(
  async (groupData: Omit<Group, 'id' | 'createdAt'>): Promise<Group> => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('No authenticated Supabase user');

      const { data, error } = await supabase
        .from('contact_groups')
        .insert({ owner_user_id: userId, name: groupData.name })
        .select('id, name, created_at')
        .single();
      if (error) throw error;

      const newGroup: Group = {
        id: data.id,
        name: data.name,
        members: groupData.members ?? [],
        createdAt: data.created_at,
      };

      if (newGroup.members.length > 0) {
        const memberRows = newGroup.members.map(member => ({
          owner_user_id: userId,
          group_id: newGroup.id,
          person_id: member.id,
        }));
        const { error: memberError } = await supabase.from('group_members').insert(memberRows);
        if (memberError) throw memberError;
      }

      setGroups(prev => [...prev, newGroup]);

      return newGroup;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  [getCurrentUserId]
);

  const updateGroup = useCallback(
  async (id: string, updates: Partial<Group>): Promise<Group> => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('No authenticated Supabase user');

    const { data, error } = await supabase
      .from('contact_groups')
      .update({ name: updates.name })
      .eq('id', id)
      .eq('owner_user_id', userId)
      .select('id, name, created_at')
      .single();
    if (error) throw error;

    if (updates.members) {
      const { error: clearMembersError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', id)
        .eq('owner_user_id', userId);
      if (clearMembersError) throw clearMembersError;

      if (updates.members.length > 0) {
        const memberRows = updates.members.map(member => ({
          owner_user_id: userId,
          group_id: id,
          person_id: member.id,
        }));
        const { error: insertMembersError } = await supabase
          .from('group_members')
          .insert(memberRows);
        if (insertMembersError) throw insertMembersError;
      }
    }

    const updatedGroup: Group = {
      id: data.id,
      name: data.name,
      createdAt: data.created_at,
      members: updates.members ?? groups.find(g => g.id === id)?.members ?? [],
    };

    setGroups(prev =>
      prev.map(g => (g.id === id ? updatedGroup : g))
    );

    return updatedGroup;
  },
  [getCurrentUserId, groups]
);


  const deleteGroup = useCallback(async (id: string) => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('No authenticated Supabase user');
  const { error } = await supabase
    .from('contact_groups')
    .delete()
    .eq('id', id)
    .eq('owner_user_id', userId);
  if (error) throw error;

  setGroups(prev => prev.filter(g => g.id !== id));
}, [getCurrentUserId]);


  // Installment operations
  const addInstallmentPlan = useCallback((plan: InstallmentPlan) => {
    setInstallmentPlans(prev => [...prev, plan]);

    void (async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) return;

        const startDate =
          plan.installments
            .slice()
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]
            ?.dueDate ?? null;

        const { data: createdPlan, error: createPlanError } = await supabase
          .from('installment_plans')
          .insert({
            owner_user_id: userId,
            transaction_id: plan.transactionId,
            start_date: startDate,
          })
          .select('id')
          .single();
        if (createPlanError) throw createPlanError;

        if (plan.installments.length > 0) {
          const installmentRows = plan.installments.map((inst, idx) => ({
            owner_user_id: userId,
            plan_id: createdPlan.id,
            term_number: inst.termNumber ?? idx + 1,
            due_date: inst.dueDate,
            amount_due: Number(inst.amountDue ?? 0),
            amount_paid: Number(inst.amountPaid ?? 0),
            status: inst.status ?? 'PENDING',
            paid_date: inst.paidDate ?? null,
          }));
          const { error: createInstallmentsError } = await supabase
            .from('installments')
            .insert(installmentRows);
          if (createInstallmentsError) throw createInstallmentsError;
        }

        await fetchInstallmentPlansFromSupabase();
      } catch (error) {
        console.error('Failed to persist installment plan in Supabase:', error);
      }
    })();
  }, [getCurrentUserId, fetchInstallmentPlansFromSupabase]);

  const updateInstallmentPlan = useCallback((transactionId: string, updates: Partial<InstallmentPlan>) => {
    setInstallmentPlans(prev => prev.map(plan => 
      plan.transactionId === transactionId ? { ...plan, ...updates } : plan
    ));
  }, []);

  const skipInstallment = useCallback((transactionId: string, installmentId: string) => {
    let replacementInstallment: Installment | null = null;

    setInstallmentPlans(prev => prev.map(plan => {
      if (plan.transactionId === transactionId) {
        const installmentToSkip = plan.installments.find(inst => inst.id === installmentId);
        if (!installmentToSkip || installmentToSkip.status === 'SKIPPED') return plan;

        replacementInstallment = createReplacementInstallment(
          transactionId,
          plan.installments,
          installmentToSkip
        );

        return {
          ...plan,
          installments: [
            ...plan.installments.map(inst =>
              inst.id === installmentId ? { ...inst, status: 'SKIPPED' as InstallmentStatus } : inst
            ),
            replacementInstallment,
          ],
        };
      }
      return plan;
    }));
    void (async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) return;
        const { error } = await supabase
          .from('installments')
          .update({ status: 'SKIPPED' })
          .eq('id', installmentId)
          .eq('owner_user_id', userId);
        if (error) throw error;

        if (!replacementInstallment) return;

        const { data: skippedRow, error: lookupError } = await supabase
          .from('installments')
          .select('plan_id')
          .eq('id', installmentId)
          .eq('owner_user_id', userId)
          .single();
        if (lookupError) throw lookupError;
        if (!skippedRow?.plan_id) return;

        const { error: insertError } = await supabase
          .from('installments')
          .insert({
            owner_user_id: userId,
            plan_id: skippedRow.plan_id,
            term_number: replacementInstallment.termNumber,
            due_date: replacementInstallment.dueDate,
            amount_due: Number(replacementInstallment.amountDue ?? 0),
            amount_paid: 0,
            status: replacementInstallment.status,
            paid_date: null,
          });
        if (insertError) throw insertError;

        await fetchInstallmentPlansFromSupabase();
      } catch (error) {
        console.error('Failed to persist skipped installment in Supabase:', error);
      }
    })();
  }, [getCurrentUserId, fetchInstallmentPlansFromSupabase]);

  // Payment Allocation
  const addPaymentAllocation = useCallback((allocationData: Omit<PaymentAllocation, 'id'>): PaymentAllocation => {
    const newAllocation: PaymentAllocation = {
      ...allocationData,
      id: `pa${Date.now()}`,
    };
    setPaymentAllocations(prev => [...prev, newAllocation]);

    void (async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) return;
        const { data, error } = await supabase
          .from('payment_allocations')
          .insert({
            owner_user_id: userId,
            transaction_id: allocationData.transactionId,
            person_id: allocationData.personId,
            allocated_amount: Number(allocationData.allocated_amount ?? 0),
            allocated_percent:
              allocationData.allocated_percent != null ? Number(allocationData.allocated_percent) : null,
            amount_paid: Number(allocationData.amount_paid ?? 0),
            is_fully_paid: Boolean(allocationData.is_fully_paid),
          })
          .select('*')
          .single();
        if (error) throw error;
        setPaymentAllocations(prev =>
          prev.map(p => (p.id === newAllocation.id ? mapDbPaymentAllocationToPaymentAllocation(data) : p))
        );
      } catch (error) {
        console.error('Failed to persist payment allocation in Supabase:', error);
      }
    })();

    return newAllocation;
  }, [getCurrentUserId, mapDbPaymentAllocationToPaymentAllocation]);

  const updatePaymentAllocation = useCallback((id: string, updates: Partial<PaymentAllocation>) => {
    setPaymentAllocations(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    void (async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId) return;
        const patch: Record<string, unknown> = {};
        if (updates.allocated_amount !== undefined) patch.allocated_amount = Number(updates.allocated_amount);
        if (updates.allocated_percent !== undefined) patch.allocated_percent = updates.allocated_percent ?? null;
        if (updates.amount_paid !== undefined) patch.amount_paid = Number(updates.amount_paid);
        if (updates.is_fully_paid !== undefined) patch.is_fully_paid = Boolean(updates.is_fully_paid);
        const { error } = await supabase
          .from('payment_allocations')
          .update(patch)
          .eq('id', id)
          .eq('owner_user_id', userId);
        if (error) throw error;
      } catch (error) {
        console.error('Failed to update payment allocation in Supabase:', error);
      }
    })();
  }, [getCurrentUserId]);

  const replacePaymentAllocationsForTransaction = useCallback(async (
    transactionId: string,
    nextAllocations: Omit<PaymentAllocation, 'id'>[]
  ) => {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const { error: clearError } = await supabase
      .from('payment_allocations')
      .delete()
      .eq('transaction_id', transactionId)
      .eq('owner_user_id', userId);
    if (clearError) throw clearError;

    if (nextAllocations.length === 0) {
      setPaymentAllocations(prev => prev.filter(a => a.transactionId !== transactionId));
      return;
    }

    const rows = nextAllocations.map(a => ({
      owner_user_id: userId,
      transaction_id: a.transactionId,
      person_id: a.personId,
      allocated_amount: Number(a.allocated_amount ?? 0),
      allocated_percent: a.allocated_percent != null ? Number(a.allocated_percent) : null,
      amount_paid: Number(a.amount_paid ?? 0),
      is_fully_paid: Boolean(a.is_fully_paid),
    }));

    const { data, error: insertError } = await supabase
      .from('payment_allocations')
      .insert(rows)
      .select('*');
    if (insertError) throw insertError;

    const mapped = (data ?? []).map(mapDbPaymentAllocationToPaymentAllocation);
    setPaymentAllocations(prev => [...prev.filter(a => a.transactionId !== transactionId), ...mapped]);
  }, [getCurrentUserId, mapDbPaymentAllocationToPaymentAllocation]);

  const divideEqually = useCallback((transactionId: string, groupId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    const group = groups.find(g => g.id === groupId);
    if (!transaction || !group || group.members.length === 0) return;

    const amountPerPerson = (transaction.amountBorrowed ?? 0) / group.members.length;
    const percentPerPerson = 100 / group.members.length;

    const nextAllocations: Omit<PaymentAllocation, 'id'>[] = group.members.map(member => ({
      transactionId,
      personId: member.id,
      allocated_amount: amountPerPerson,
      allocated_percent: percentPerPerson,
      amount_paid: 0,
      is_fully_paid: false,
    }));

    setPaymentAllocations(prev => [
      ...prev.filter(a => a.transactionId !== transactionId),
      ...nextAllocations.map((a, idx) => ({ ...a, id: `pa${Date.now()}_${idx}` })),
    ]);

    void replacePaymentAllocationsForTransaction(transactionId, nextAllocations).catch(error => {
      console.error('Failed to persist equal payment allocations:', error);
    });
  }, [transactions, groups, replacePaymentAllocationsForTransaction]);

  const divideByPercentage = useCallback((transactionId: string, percentages: Record<string, number>) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    const total = transaction.amountBorrowed ?? 0;

    const nextAllocations: Omit<PaymentAllocation, 'id'>[] = Object.entries(percentages).map(([personId, percent]) => ({
      transactionId,
      personId,
      allocated_amount: (total * percent) / 100,
      allocated_percent: percent,
      amount_paid: 0,
      is_fully_paid: false,
    }));

    setPaymentAllocations(prev => [
      ...prev.filter(a => a.transactionId !== transactionId),
      ...nextAllocations.map((a, idx) => ({ ...a, id: `pa${Date.now()}_${idx}` })),
    ]);

    void replacePaymentAllocationsForTransaction(transactionId, nextAllocations).catch(error => {
      console.error('Failed to persist percentage payment allocations:', error);
    });
  }, [transactions, replacePaymentAllocationsForTransaction]);

  const divideByAmount = useCallback((transactionId: string, amounts: Record<string, number>) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    const total = transaction.amountBorrowed ?? 0;

    const nextAllocations: Omit<PaymentAllocation, 'id'>[] = Object.entries(amounts).map(([personId, amount]) => ({
      transactionId,
      personId,
      allocated_amount: amount,
      allocated_percent: total > 0 ? (amount / total) * 100 : 0,
      amount_paid: 0,
      is_fully_paid: false,
    }));

    setPaymentAllocations(prev => [
      ...prev.filter(a => a.transactionId !== transactionId),
      ...nextAllocations.map((a, idx) => ({ ...a, id: `pa${Date.now()}_${idx}` })),
    ]);

    void replacePaymentAllocationsForTransaction(transactionId, nextAllocations).catch(error => {
      console.error('Failed to persist amount-based payment allocations:', error);
    });
  }, [transactions, replacePaymentAllocationsForTransaction]);

  // Notifications
  const clearNotification = useCallback((notificationId: string) => {
    setClearedNotifications(prev => new Set(prev).add(notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    // Clear all notifications by marking all current ones as cleared
    const allNotifications = getDueNotificationsFromData(transactions, installmentPlans);
    setClearedNotifications(prev => {
      const newSet = new Set(prev);
      allNotifications.forEach(n => newSet.add(n.id));
      return newSet;
    });
  }, [transactions, installmentPlans]);

  const value: AppContextType = {
    transactions,
    persons,
    groups,
    payments,
    installmentPlans,
    paymentAllocations,
    clearedNotifications,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    completeTransaction,
    addPayment,
    updatePayment,
    deletePayment,
    addPerson,
    updatePerson,
    deletePerson,
    addGroup,
    updateGroup,
    deleteGroup,
    addInstallmentPlan,
    updateInstallmentPlan,
    skipInstallment,
    addPaymentAllocation,
    updatePaymentAllocation,
    divideEqually,
    divideByPercentage,
    divideByAmount,
    clearNotification,
    clearAllNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

