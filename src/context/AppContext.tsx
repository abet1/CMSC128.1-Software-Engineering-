import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import {
  Transaction,
  Person,
  Group,
  Payment,
  InstallmentPlan,
  PaymentAllocation,
  TransactionType,
  PaymentStatus,
  InstallmentStatus,
  PaymentFrequency,
  generateReferenceId,
  calculateInstallmentStatus,
} from '@/types';
import { getDueNotificationsFromData } from '@/utils/notifications';
import { mockPersons, mockGroups, mockTransactions, mockPaymentAllocations } from '@/api/mock';

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

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([]);
  const [paymentAllocations, setPaymentAllocations] = useState<PaymentAllocation[]>([]);
  const [clearedNotifications, setClearedNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("http://localhost:8080/api/persons")
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => {
        console.log("FETCHED PERSONS:", data);
        setPersons(Array.isArray(data) ? data : data.data ?? []);
      })
      .catch(() => {
        console.warn("Backend unavailable — using mock persons");
        setPersons(mockPersons);
      });
  }, []);

  useEffect(() => {
    fetch('http://localhost:8080/api/groups')
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => setGroups(Array.isArray(data) ? data : data.data ?? []))
      .catch(() => {
        console.warn("Backend unavailable — using mock groups");
        setGroups(mockGroups);
      });
  }, []);

  useEffect(() => {
    fetch('http://localhost:8080/api/loanentries')
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => {
        console.log('RAW LOAN ENTRIES:', data);
        const mapped = Array.isArray(data)
          ? data.map(t => ({
              ...t,
              borrowerContactId: t.borrowerId ?? null,
              lenderContactId: t.lenderId ?? null,
              transactionType: t.transactionType ?? 'LEND',
              status: t.status ?? 'UNPAID',
              amountRemaining: t.amountRemaining ?? t.amountBorrowed ?? 0,
              dateBorrowed: t.dateBorrowed ?? new Date().toISOString(),
            }))
          : [];
        setTransactions(mapped);
      })
      .catch(() => {
        console.warn("Backend unavailable — using mock transactions");
        setTransactions(mockTransactions);
        setPaymentAllocations(mockPaymentAllocations);
      });
  }, []);


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
      // Send POST request to backend
      const res = await fetch('http://localhost:8080/api/loanentries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });

      if (!res.ok) throw new Error('Failed to add transaction');

      const newTransaction: Transaction = await res.json();

      // Update frontend state with backend ID
      setTransactions(prev => [...prev, newTransaction]);

      return newTransaction;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  [setTransactions]
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
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    setPayments(prev => prev.filter(p => p.transactionId !== id));
    setInstallmentPlans(prev => prev.filter(ip => ip.transactionId !== id));
    setPaymentAllocations(prev => prev.filter(pa => pa.transactionId !== id));
  }, []);

  const completeTransaction = useCallback((id: string) => {
    updateTransaction(id, {
      amountRemaining: 0,
      status: 'PAID',
    });
  }, [updateTransaction]);

  const fetchTransactions = useCallback(async () => {
  try {
    const res = await fetch('http://localhost:8080/api/loanentries');
    if (!res.ok) throw new Error('Failed to fetch transactions');
    const data = await res.json();
    setTransactions(Array.isArray(data) ? data : data.data ?? []);
  } catch (err) {
    console.error('Error fetching transactions:', err);
  }
}, []);

  // Payment CRUD
  const addPayment = useCallback((paymentData: Omit<Payment, 'id'>): Payment => {
    const newPayment: Payment = {
      ...paymentData,
      id: `p${Date.now()}`,
    };

    setPayments(prev => [...prev, newPayment]);

    // Update transaction amount remaining using functional update
    setTransactions(prev => prev.map(t => {
      if (t.id === paymentData.transactionId) {
        const newAmountRemaining = Math.max(0, t.amountRemaining - paymentData.paymentAmount);
        return {
          ...t,
          amountRemaining: newAmountRemaining,
          status: calculatePaymentStatus(t.amountBorrowed, newAmountRemaining),
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
                  paidDate: isFullyPaid ? paymentData.paymentDate : inst.paidDate,
                };
                // Recalculate status based on dates and payment
                return {
                  ...updatedInst,
                  status: isFullyPaid ? 'PAID' : calculateInstallmentStatus(updatedInst, plan.startDate),
                };
              }
              // Recalculate status for other installments in case dates changed
              return {
                ...inst,
                status: calculateInstallmentStatus(inst, plan.startDate),
              };
            }),
          };
        }
        return plan;
      }));
    }

    return newPayment;
  }, []);

  const updatePayment = useCallback((id: string, updates: Partial<Payment>) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deletePayment = useCallback((id: string) => {
    const payment = payments.find(p => p.id === id);
    if (payment) {
      setPayments(prev => prev.filter(p => p.id !== id));
      
      // Restore transaction amount
      const transaction = transactions.find(t => t.id === payment.transactionId);
      if (transaction) {
        const newAmountRemaining = transaction.amountRemaining + payment.paymentAmount;
        updateTransaction(transaction.id, {
          amountRemaining: newAmountRemaining,
          status: calculatePaymentStatus(transaction.amountBorrowed, newAmountRemaining),
        });
      }
    }
  }, [payments, transactions, updateTransaction]);

  // Person CRUD
  const addPerson = useCallback((personData: Omit<Person, 'id' | 'createdAt'>): Person => {
    const newPerson: Person = {
      ...personData,
      id: `person${Date.now()}`,
      createdAt: new Date(),
    };
    setPersons(prev => [...prev, newPerson]);
    return newPerson;
  }, []);

  const updatePerson = useCallback((id: string, updates: Partial<Person>) => {
    setPersons(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    // Also update in groups
    setGroups(prev => prev.map(g => ({
      ...g,
      members: g.members.map(m => m.id === id ? { ...m, ...updates } : m),
    })));
  }, []);

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
}, []);


  // Group CRUD
  const addGroup = useCallback(
  async (groupData: Omit<Group, 'id' | 'createdAt'>): Promise<Group> => {
    try {
      // Send POST request to backend
      const res = await fetch('http://localhost:8080/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData),
      });

      if (!res.ok) throw new Error('Failed to add group');

      const newGroup: Group = await res.json();

      // Update frontend state
      setGroups(prev => [...prev, newGroup]);

      return newGroup;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  []
);

  const updateGroup = useCallback(
  async (id: string, updates: Partial<Group>): Promise<Group> => {
    const res = await fetch(`http://localhost:8080/api/groups/${id}`, {
      method: 'PUT', // or PATCH
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      throw new Error('Failed to update group');
    }

    const updatedGroup: Group = await res.json();

    setGroups(prev =>
      prev.map(g => (g.id === id ? updatedGroup : g))
    );

    return updatedGroup;
  },
  []
);


  const deleteGroup = useCallback(async (id: string) => {
  const res = await fetch(`http://localhost:8080/api/groups/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete group');
  }

  setGroups(prev => prev.filter(g => g.id !== id));
}, []);


  // Installment operations
  const addInstallmentPlan = useCallback((plan: InstallmentPlan) => {
    setInstallmentPlans(prev => [...prev, plan]);
  }, []);

  const updateInstallmentPlan = useCallback((transactionId: string, updates: Partial<InstallmentPlan>) => {
    setInstallmentPlans(prev => prev.map(plan => 
      plan.transactionId === transactionId ? { ...plan, ...updates } : plan
    ));
  }, []);

  const skipInstallment = useCallback((transactionId: string, installmentId: string) => {
    setInstallmentPlans(prev => prev.map(plan => {
      if (plan.transactionId === transactionId) {
        return {
          ...plan,
          installments: plan.installments.map(inst =>
            inst.id === installmentId ? { ...inst, status: 'SKIPPED' as InstallmentStatus } : inst
          ),
        };
      }
      return plan;
    }));
  }, []);

  // Payment Allocation
  const addPaymentAllocation = useCallback((allocationData: Omit<PaymentAllocation, 'id'>): PaymentAllocation => {
    const newAllocation: PaymentAllocation = {
      ...allocationData,
      id: `pa${Date.now()}`,
    };
    setPaymentAllocations(prev => [...prev, newAllocation]);
    return newAllocation;
  }, []);

  const updatePaymentAllocation = useCallback((id: string, updates: Partial<PaymentAllocation>) => {
    setPaymentAllocations(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const divideEqually = useCallback((transactionId: string, groupId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    const group = groups.find(g => g.id === groupId);
    if (!transaction || !group || group.members.length === 0) return;

    const amountPerPerson = (transaction.amountBorrowed ?? 0) / group.members.length;
    const percentPerPerson = 100 / group.members.length;

    setPaymentAllocations(prev => prev.filter(a => a.transactionId !== transactionId));

    group.members.forEach(member => {
      addPaymentAllocation({
        transactionId,
        personId: member.id,
        allocated_amount: amountPerPerson,
        allocated_percent: percentPerPerson,
        amount_paid: 0,
        is_fully_paid: false,
      });
    });
  }, [transactions, groups, addPaymentAllocation]);

  const divideByPercentage = useCallback((transactionId: string, percentages: Record<string, number>) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    const total = transaction.amountBorrowed ?? 0;

    setPaymentAllocations(prev => prev.filter(a => a.transactionId !== transactionId));

    Object.entries(percentages).forEach(([personId, percent]) => {
      addPaymentAllocation({
        transactionId,
        personId,
        allocated_amount: (total * percent) / 100,
        allocated_percent: percent,
        amount_paid: 0,
        is_fully_paid: false,
      });
    });
  }, [transactions, addPaymentAllocation]);

  const divideByAmount = useCallback((transactionId: string, amounts: Record<string, number>) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    const total = transaction.amountBorrowed ?? 0;

    setPaymentAllocations(prev => prev.filter(a => a.transactionId !== transactionId));

    Object.entries(amounts).forEach(([personId, amount]) => {
      addPaymentAllocation({
        transactionId,
        personId,
        allocated_amount: amount,
        allocated_percent: total > 0 ? (amount / total) * 100 : 0,
        amount_paid: 0,
        is_fully_paid: false,
      });
    });
  }, [transactions, addPaymentAllocation]);

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

