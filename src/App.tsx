import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Records from "./pages/Records";
import People from "./pages/People";
import Settings from "./pages/Settings";
import TransactionDetail from "./pages/TransactionDetail";
import NotFound from "./pages/NotFound";
import LendPage from "./pages/LendPage";
import BorrowPage from "./pages/BorrowPage";
import ExpensePage from "./pages/ExpensePage";
import RecordPaymentPage from "./pages/RecordPaymentPage";
import ContactSelectPage from "./pages/ContactSelectPage";
import AddContactPage from "./pages/AddContactPage";
import ContactDetailPage from "./pages/ContactDetailPage";
import EditContactPage from "./pages/EditContactPage";
import GroupSelectPage from "./pages/GroupSelectPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import AddGroupPage from "./pages/AddGroupPage";
import EditGroupPage from "./pages/EditGroupPage";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show loading screen on initial app load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Show for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/records" element={<Records />} />
            <Route path="/people" element={<People />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/transaction/:id" element={<TransactionDetail />} />
            <Route path="/lend" element={<LendPage />} />
            <Route path="/borrow" element={<BorrowPage />} />
            <Route path="/expense" element={<ExpensePage />} />
            <Route path="/payment/:transactionId" element={<RecordPaymentPage />} />
            <Route path="/contacts/select" element={<ContactSelectPage />} />
            <Route path="/contacts/add" element={<AddContactPage />} />
            <Route path="/contacts/:id" element={<ContactDetailPage />} />
            <Route path="/contacts/:id/edit" element={<EditContactPage />} />
            <Route path="/groups/select" element={<GroupSelectPage />} />
            <Route path="/groups/add" element={<AddGroupPage />} />
            <Route path="/groups/:id" element={<GroupDetailPage />} />
            <Route path="/groups/:id/edit" element={<EditGroupPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
          <PWAInstallPrompt />
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
