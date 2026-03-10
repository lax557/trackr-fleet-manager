import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import VehiclesPage from "./pages/VehiclesPage";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import DriversPage from "./pages/DriversPage";
import DriverDetailPage from "./pages/DriverDetailPage";
import NewDriverPage from "./pages/NewDriverPage";
import RentalsPage from "./pages/RentalsPage";
import NewRentalPage from "./pages/NewRentalPage";
import ContractTemplatesPage from "./pages/ContractTemplatesPage";
import ContractTemplateEditorPage from "./pages/ContractTemplateEditorPage";
import MaintenancesPage from "./pages/MaintenancesPage";
import NewMaintenancePage from "./pages/NewMaintenancePage";
import MaintenanceDetailPage from "./pages/MaintenanceDetailPage";
import FinesPage from "./pages/FinesPage";
import FineDetailPage from "./pages/FineDetailPage";
import SettingsPage from "./pages/SettingsPage";
import UsersPermissionsPage from "./pages/UsersPermissionsPage";
import NotFound from "./pages/NotFound";
import NewVehiclePage from "./pages/NewVehiclePage";
// Financial module
import FinancialDashboardPage from "./pages/FinancialDashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import BankAccountsPage from "./pages/BankAccountsPage";
import BillsPage from "./pages/BillsPage";
import PartnersPage from "./pages/PartnersPage";
import ChartOfAccountsPage from "./pages/ChartOfAccountsPage";
import FinancialReportsPage from "./pages/FinancialReportsPage";
import ReconciliationPage from "./pages/ReconciliationPage";
import FinancialAIPage from "./pages/FinancialAIPage";

const queryClient = new QueryClient();

function AuthenticatedLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger className="-ml-2" />
          <div className="flex-1" />
          <ThemeToggle />
        </header>
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/vehicles/new" element={<NewVehiclePage />} />
            <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/drivers/new" element={<NewDriverPage />} />
            <Route path="/drivers/:id" element={<DriverDetailPage />} />
            <Route path="/rentals" element={<RentalsPage />} />
            <Route path="/rentals/new" element={<NewRentalPage />} />
            <Route path="/rentals/templates" element={<ContractTemplatesPage />} />
            <Route path="/rentals/templates/new" element={<ContractTemplateEditorPage />} />
            <Route path="/rentals/templates/:id" element={<ContractTemplateEditorPage />} />
            <Route path="/maintenance" element={<MaintenancesPage />} />
            <Route path="/maintenance/new" element={<NewMaintenancePage />} />
            <Route path="/maintenance/:id" element={<MaintenanceDetailPage />} />
            <Route path="/maintenance/:id/edit" element={<NewMaintenancePage />} />
            <Route path="/fines" element={<FinesPage />} />
            <Route path="/fines/:id" element={<FineDetailPage />} />
            {/* Financial module */}
            <Route path="/financial" element={<FinancialDashboardPage />} />
            <Route path="/financial/transactions" element={<TransactionsPage />} />
            <Route path="/financial/accounts" element={<BankAccountsPage />} />
            <Route path="/financial/payables" element={<BillsPage type="PAGAR" />} />
            <Route path="/financial/receivables" element={<BillsPage type="RECEBER" />} />
            <Route path="/financial/partners" element={<PartnersPage />} />
            <Route path="/financial/chart-of-accounts" element={<ChartOfAccountsPage />} />
            <Route path="/financial/reports" element={<FinancialReportsPage />} />
            <Route path="/financial/reconciliation" element={<ReconciliationPage />} />
            <Route path="/financial/ai" element={<FinancialAIPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
