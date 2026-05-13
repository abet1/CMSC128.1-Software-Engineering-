import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ScrollToTop } from '@/components/ScrollToTop';
import { ReactNode } from 'react';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';

import LoginPage             from './pages/LoginPage';
import Index                 from './pages/Index';
import Records               from './pages/Records';
import TransactionDetail     from './pages/TransactionDetail';
import LendPage              from './pages/LendPage';
import BorrowPage            from './pages/BorrowPage';
import ExpensePage           from './pages/ExpensePage';
import ExpenseDetailPage     from './pages/ExpenseDetailPage';
import GroupExpenseDetailPage from './pages/GroupExpenseDetailPage';
import People                from './pages/People';
import AddContactPage        from './pages/AddContactPage';
import EditContactPage       from './pages/EditContactPage';
import ContactDetailPage     from './pages/ContactDetailPage';
import AddGroupPage          from './pages/AddGroupPage';
import EditGroupPage         from './pages/EditGroupPage';
import GroupDetailPage       from './pages/GroupDetailPage';
import ContactSelectPage     from './pages/ContactSelectPage';
import GroupSelectPage       from './pages/GroupSelectPage';
import RecordPaymentPage     from './pages/RecordPaymentPage';
import Analytics             from './pages/Analytics';
import PaymentsPage          from './pages/PaymentsPage';
import Settings              from './pages/Settings';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />

        {/* Protected */}
        <Route path="/"                       element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/records"                element={<ProtectedRoute><Records /></ProtectedRoute>} />
        <Route path="/transaction/:id"        element={<ProtectedRoute><TransactionDetail /></ProtectedRoute>} />
        <Route path="/lend"                   element={<ProtectedRoute><LendPage /></ProtectedRoute>} />
        <Route path="/borrow"                 element={<ProtectedRoute><BorrowPage /></ProtectedRoute>} />
        <Route path="/expense"                element={<ProtectedRoute><ExpensePage /></ProtectedRoute>} />
        <Route path="/expense/:id"            element={<ProtectedRoute><ExpenseDetailPage /></ProtectedRoute>} />
        <Route path="/group-expense/:id"      element={<ProtectedRoute><GroupExpenseDetailPage /></ProtectedRoute>} />
        <Route path="/people"                 element={<ProtectedRoute><People /></ProtectedRoute>} />
        <Route path="/contacts/add"           element={<ProtectedRoute><AddContactPage /></ProtectedRoute>} />
        <Route path="/contacts/:id"           element={<ProtectedRoute><ContactDetailPage /></ProtectedRoute>} />
        <Route path="/contacts/:id/edit"      element={<ProtectedRoute><EditContactPage /></ProtectedRoute>} />
        <Route path="/contacts/select"        element={<ProtectedRoute><ContactSelectPage /></ProtectedRoute>} />
        <Route path="/groups/add"             element={<ProtectedRoute><AddGroupPage /></ProtectedRoute>} />
        <Route path="/groups/:id"             element={<ProtectedRoute><GroupDetailPage /></ProtectedRoute>} />
        <Route path="/groups/:id/edit"        element={<ProtectedRoute><EditGroupPage /></ProtectedRoute>} />
        <Route path="/groups/select"          element={<ProtectedRoute><GroupSelectPage /></ProtectedRoute>} />
        <Route path="/payments"               element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
        <Route path="/record-payment/:id"     element={<ProtectedRoute><RecordPaymentPage /></ProtectedRoute>} />
        <Route path="/analytics"              element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/settings"               element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster richColors position="top-right" />
        <BrowserRouter>
          <AuthProvider>
            <AppProvider>
              <AppRoutes />
            </AppProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
