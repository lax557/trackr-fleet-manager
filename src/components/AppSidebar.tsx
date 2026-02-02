import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { 
  Car, 
  Users, 
  FileText, 
  Wrench, 
  AlertTriangle, 
  Gauge, 
  Settings,
  LayoutDashboard,
  ChevronRight
} from 'lucide-react';

const mainNavItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Veículos', url: '/vehicles', icon: Car },
  { title: 'Motoristas', url: '/drivers', icon: Users },
];

const operationalItems = [
  { title: 'Documentação', url: '/documents', icon: FileText, disabled: true },
  { title: 'Manutenções', url: '/maintenance', icon: Wrench, disabled: true },
  { title: 'Multas', url: '/fines', icon: AlertTriangle, disabled: true },
  { title: 'Odômetro', url: '/odometer', icon: Gauge, disabled: true },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            T
          </div>
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">Trackr</h1>
            <p className="text-xs text-muted-foreground">Gestão de Frota</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operacional</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationalItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    disabled={item.disabled}
                    className={item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.disabled && (
                      <span className="ml-auto text-xs text-muted-foreground">Em breve</span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/settings">
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
