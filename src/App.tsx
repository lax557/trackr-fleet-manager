import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
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
import NotFound from "./pages/NotFound";
import NewVehiclePage from "./pages/NewVehiclePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
