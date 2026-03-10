import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ScrollToTop } from '@/components/ScrollToTop';

import LoginPage               from './pages/LoginPage';
import DashboardPage           from './pages/DashboardPage';
import RentalsPage             from './pages/RentalsPage';
import RentalDetailPage        from './pages/RentalDetailPage';
import InventoryPage           from './pages/InventoryPage';
import PeoplePage              from './pages/PeoplePage';
import PaymentsPage            from './pages/PaymentsPage';
// NEW: Import your Analytics page
import Analytics               from './pages/Analytics'; 

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster richColors position="top-right" />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/login"                element={<LoginPage />} />
            <Route path="/"                     element={<DashboardPage />} />
            
            {/* NEW: Analytics Route */}
            <Route path="/analytics"            element={<Analytics />} /> 
            
            <Route path="/rentals"              element={<RentalsPage />} />
            <Route path="/rentals/:id"          element={<RentalDetailPage />} />
            <Route path="/inventory"            element={<InventoryPage />} />
            <Route path="/people"               element={<PeoplePage />} />
            <Route path="/payments"             element={<PaymentsPage />} />
            <Route path="*"                     element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}