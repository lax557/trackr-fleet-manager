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
  Wrench, 
  AlertTriangle, 
  Settings,
  LayoutDashboard,
  FileSignature
} from 'lucide-react';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Veículos', url: '/vehicles', icon: Car },
  { title: 'Motoristas', url: '/drivers', icon: Users },
  { title: 'Locações', url: '/rentals', icon: FileSignature },
  { title: 'Manutenções', url: '/maintenance', icon: Wrench },
  { title: 'Multas', url: '/fines', icon: AlertTriangle },
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
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={
                      item.url === '/' 
                        ? location.pathname === '/' 
                        : location.pathname.startsWith(item.url)
                    }
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
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-sidebar-accent/50">
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary text-primary-foreground text-sm font-medium">
            LA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">Lucas de Assis</p>
            <p className="text-xs text-muted-foreground truncate">Operador</p>
          </div>
        </div>
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
