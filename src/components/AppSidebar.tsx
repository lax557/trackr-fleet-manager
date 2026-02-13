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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { 
  Car, 
  Users, 
  Wrench, 
  AlertTriangle, 
  Settings,
  LayoutDashboard,
  FileSignature,
  FileText,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Veículos', url: '/vehicles', icon: Car },
  { title: 'Motoristas', url: '/drivers', icon: Users },
  {
    title: 'Locações',
    url: '/rentals',
    icon: FileSignature,
    children: [
      { title: 'Todas as Locações', url: '/rentals' },
      { title: 'Modelos de Contrato', url: '/rentals/templates' },
    ],
  },
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
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                if (item.children) {
                  const isParentActive = location.pathname.startsWith(item.url);
                  return (
                    <Collapsible key={item.title} defaultOpen={isParentActive}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton isActive={isParentActive}>
                            <item.icon className="h-4 w-4" />
                            <span className="flex-1">{item.title}</span>
                            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((child) => (
                              <SidebarMenuSubItem key={child.url}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={location.pathname === child.url}
                                >
                                  <NavLink to={child.url}>
                                    <span>{child.title}</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
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
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div 
          className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent cursor-pointer transition-colors"
          onClick={() => window.location.href = '/settings'}
        >
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
