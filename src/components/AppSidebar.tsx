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
  Car, Users, Wrench, AlertTriangle, Settings,
  LayoutDashboard, FileSignature, DollarSign, LogOut, Bell,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { roleLabels, PermissionAction } from '@/types/roles';
import { LucideIcon } from 'lucide-react';

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  permission?: PermissionAction;
  children?: { title: string; url: string }[];
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard, permission: 'dashboard:operational' },
  { title: 'Veículos', url: '/vehicles', icon: Car, permission: 'vehicle:view' },
  { title: 'Motoristas', url: '/drivers', icon: Users, permission: 'driver:view' },
  {
    title: 'Locações',
    url: '/rentals',
    icon: FileSignature,
    permission: 'rental:view',
    children: [
      { title: 'Todas as Locações', url: '/rentals' },
      { title: 'Modelos de Contrato', url: '/rentals/templates' },
    ],
  },
  { title: 'Manutenções', url: '/maintenance', icon: Wrench, permission: 'maintenance:view' },
  { title: 'Multas', url: '/fines', icon: AlertTriangle, permission: 'fine:view' },
  {
    title: 'Financeiro',
    url: '/financial',
    icon: DollarSign,
    permission: 'finance:view_costs',
    children: [
      { title: 'Visão Geral', url: '/financial' },
      { title: 'Transações', url: '/financial/transactions' },
      { title: 'Contas Bancárias', url: '/financial/accounts' },
      { title: 'Contas a Pagar', url: '/financial/payables' },
      { title: 'Contas a Receber', url: '/financial/receivables' },
      { title: 'Parceiros', url: '/financial/partners' },
      { title: 'Plano de Contas', url: '/financial/chart-of-accounts' },
      { title: 'Relatórios', url: '/financial/reports' },
      { title: 'Conciliação', url: '/financial/reconciliation' },
      { title: 'Consultor IA', url: '/financial/ai' },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { role, can } = usePermissions();

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const visibleItems = menuItems.filter(item => !item.permission || can(item.permission));

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <NavLink to="/" className="flex items-center justify-center py-5">
          <img
            src="/targa-logo.png"
            alt="Targa"
            className="h-10 sm:h-12 w-auto object-contain"
            onError={(e) => {
              const el = e.currentTarget;
              el.style.display = 'none';
              const fb = document.createElement('div');
              fb.className = 'h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg';
              fb.textContent = 'T';
              el.parentElement?.appendChild(fb);
            }}
          />
        </NavLink>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                if (item.children) {
                  const isParentActive = item.url === '/financial' 
                    ? location.pathname.startsWith('/financial')
                    : location.pathname.startsWith(item.url);
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
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{profile?.full_name || 'Usuário'}</p>
            <p className="text-xs text-muted-foreground truncate">{roleLabels[role]}</p>
          </div>
        </div>
        <SidebarMenu>
          {can('settings:view') && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/settings">
                  <Settings className="h-4 w-4" />
                  <span>Configurações</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
