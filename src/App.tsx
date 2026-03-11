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
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import VehiclesPage from "./pages/VehiclesPage";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import DriversPage from "./pages/DriversPage";
import DriverDetailPage from "./pages/DriverDetailPage";
import NewDriverPage from "./pages/NewDriverPage";
import RentalsPage from "./pages/RentalsPage";
import NewRentalPage from "./pages/NewRentalPage";
import RentalDetailPage from "./pages/RentalDetailPage";
import ContractTemplatesPage from "./pages/ContractTemplatesPage";
import ContractTemplateEditorPage from "./pages/ContractTemplateEditorPage";
import MaintenancesPage from "./pages/MaintenancesPage";
import NewMaintenancePage from "./pages/NewMaintenancePage";
import MaintenanceDetailPage from "./pages/MaintenanceDetailPage";
import FinesPage from "./pages/FinesPage";
import FineDetailPage from "./pages/FineDetailPage";
import NewFinePage from "./pages/NewFinePage";
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
            <Route path="/vehicles/new" element={<ProtectedRoute requiredPermission="vehicle:create"><NewVehiclePage /></ProtectedRoute>} />
            <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/drivers/new" element={<ProtectedRoute requiredPermission="driver:create"><NewDriverPage /></ProtectedRoute>} />
            <Route path="/drivers/:id" element={<DriverDetailPage />} />
            <Route path="/rentals" element={<RentalsPage />} />
            <Route path="/rentals/new" element={<ProtectedRoute requiredPermission="rental:create"><NewRentalPage /></ProtectedRoute>} />
            <Route path="/rentals/:id" element={<RentalDetailPage />} />
            <Route path="/rentals/templates" element={<ContractTemplatesPage />} />
            <Route path="/rentals/templates/new" element={<ContractTemplateEditorPage />} />
            <Route path="/rentals/templates/:id" element={<ContractTemplateEditorPage />} />
            <Route path="/maintenance" element={<MaintenancesPage />} />
            <Route path="/maintenance/new" element={<ProtectedRoute requiredPermission="maintenance:create"><NewMaintenancePage /></ProtectedRoute>} />
            <Route path="/maintenance/:id" element={<MaintenanceDetailPage />} />
            <Route path="/maintenance/:id/edit" element={<NewMaintenancePage />} />
            <Route path="/fines" element={<FinesPage />} />
            <Route path="/fines/new" element={<ProtectedRoute requiredPermission="fine:create"><NewFinePage /></ProtectedRoute>} />
            <Route path="/fines/:id" element={<FineDetailPage />} />
            {/* Financial module - protected */}
            <Route path="/financial" element={<ProtectedRoute requiredPermission="finance:view_costs"><FinancialDashboardPage /></ProtectedRoute>} />
            <Route path="/financial/transactions" element={<ProtectedRoute requiredPermission="finance:view_costs"><TransactionsPage /></ProtectedRoute>} />
            <Route path="/financial/accounts" element={<ProtectedRoute requiredPermission="finance:view_costs"><BankAccountsPage /></ProtectedRoute>} />
            <Route path="/financial/payables" element={<ProtectedRoute requiredPermission="finance:view_costs"><BillsPage type="PAGAR" /></ProtectedRoute>} />
            <Route path="/financial/receivables" element={<ProtectedRoute requiredPermission="finance:view_revenue"><BillsPage type="RECEBER" /></ProtectedRoute>} />
            <Route path="/financial/partners" element={<ProtectedRoute requiredPermission="finance:view_costs"><PartnersPage /></ProtectedRoute>} />
            <Route path="/financial/chart-of-accounts" element={<ProtectedRoute requiredPermission="finance:view_costs"><ChartOfAccountsPage /></ProtectedRoute>} />
            <Route path="/financial/reports" element={<ProtectedRoute requiredPermission="finance:view_costs"><FinancialReportsPage /></ProtectedRoute>} />
            <Route path="/financial/reconciliation" element={<ProtectedRoute requiredPermission="finance:view_costs"><ReconciliationPage /></ProtectedRoute>} />
            <Route path="/financial/ai" element={<ProtectedRoute requiredPermission="finance:view_costs"><FinancialAIPage /></ProtectedRoute>} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/users" element={<ProtectedRoute requiredPermission="settings:manage_users"><UsersPermissionsPage /></ProtectedRoute>} />
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
              <Route path="/signup" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
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
