import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ScrollToTop } from '@/components/ScrollToTop';

import LoginPage           from './pages/LoginPage';
import Index               from './pages/Index';
import Records             from './pages/Records';
import TransactionDetail   from './pages/TransactionDetail';
import LendPage            from './pages/LendPage';
import BorrowPage          from './pages/BorrowPage';
import ExpensePage         from './pages/ExpensePage';
import ExpenseDetailPage   from './pages/ExpenseDetailPage';
import GroupExpenseDetailPage from './pages/GroupExpenseDetailPage';
import People              from './pages/People';
import AddContactPage      from './pages/AddContactPage';
import EditContactPage     from './pages/EditContactPage';
import ContactDetailPage   from './pages/ContactDetailPage';
import AddGroupPage        from './pages/AddGroupPage';
import EditGroupPage       from './pages/EditGroupPage';
import GroupDetailPage     from './pages/GroupDetailPage';
import ContactSelectPage   from './pages/ContactSelectPage';
import GroupSelectPage     from './pages/GroupSelectPage';
import RecordPaymentPage   from './pages/RecordPaymentPage';
import Analytics           from './pages/Analytics';
import PaymentsPage        from './pages/PaymentsPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster richColors position="top-right" />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/login"                  element={<LoginPage />} />
            <Route path="/"                       element={<Index />} />

            {/* Loans */}
            <Route path="/records"                element={<Records />} />
            <Route path="/transaction/:id"        element={<TransactionDetail />} />
            <Route path="/lend"                   element={<LendPage />} />
            <Route path="/borrow"                 element={<BorrowPage />} />

            {/* Expenses */}
            <Route path="/expense"                element={<ExpensePage />} />
            <Route path="/expense/:id"            element={<ExpenseDetailPage />} />
            <Route path="/group-expense/:id"      element={<GroupExpenseDetailPage />} />

            {/* People */}
            <Route path="/people"                 element={<People />} />
            <Route path="/contacts/add"           element={<AddContactPage />} />
            <Route path="/contacts/:id"           element={<ContactDetailPage />} />
            <Route path="/contacts/:id/edit"      element={<EditContactPage />} />
            <Route path="/contacts/select"        element={<ContactSelectPage />} />
            <Route path="/groups/add"             element={<AddGroupPage />} />
            <Route path="/groups/:id"             element={<GroupDetailPage />} />
            <Route path="/groups/:id/edit"        element={<EditGroupPage />} />
            <Route path="/groups/select"          element={<GroupSelectPage />} />

            {/* Payments & Analytics */}
            <Route path="/payments"               element={<PaymentsPage />} />
            <Route path="/record-payment/:id"     element={<RecordPaymentPage />} />
            <Route path="/analytics"              element={<Analytics />} />

            <Route path="*"                       element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
