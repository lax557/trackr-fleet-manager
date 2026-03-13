// System roles
export type SystemRole = 'operator' | 'manager' | 'executive' | 'admin';

// Permission actions
export type PermissionAction =
  | 'vehicle:view'
  | 'vehicle:create'
  | 'vehicle:edit'
  | 'vehicle:delete'
  | 'vehicle:change_status'
  | 'driver:view'
  | 'driver:create'
  | 'driver:edit'
  | 'driver:delete'
  | 'rental:view'
  | 'rental:create'
  | 'rental:edit'
  | 'rental:cancel'
  | 'rental:edit_contract'
  | 'maintenance:view'
  | 'maintenance:create'
  | 'maintenance:edit'
  | 'maintenance:delete'
  | 'fine:view'
  | 'fine:create'
  | 'fine:edit'
  | 'finance:view_costs'
  | 'finance:view_revenue'
  | 'finance:view_margin'
  | 'dashboard:operational'
  | 'dashboard:executive'
  | 'settings:view'
  | 'settings:manage_users'
  | 'audit:view';

// Permission matrix
export const rolePermissions: Record<SystemRole, PermissionAction[]> = {
  operator: [
    'vehicle:view',
    'vehicle:change_status',
    'driver:view',
    'driver:create',
    'driver:edit',
    'rental:view',
    'rental:create',
    'maintenance:view',
    'maintenance:create',
    'maintenance:edit',
    'fine:view',
    'fine:create',
    'fine:edit',
    'dashboard:operational',
  ],
  manager: [
    'vehicle:view',
    'vehicle:create',
    'vehicle:edit',
    'vehicle:change_status',
    'driver:view',
    'driver:create',
    'driver:edit',
    'rental:view',
    'rental:create',
    'rental:edit',
    'rental:edit_contract',
    'maintenance:view',
    'maintenance:create',
    'maintenance:edit',
    'maintenance:delete',
    'fine:view',
    'fine:create',
    'fine:edit',
    'dashboard:operational',
  ],
  executive: [
    'vehicle:view',
    'driver:view',
    'rental:view',
    'maintenance:view',
    'fine:view',
    'finance:view_costs',
    'finance:view_revenue',
    'finance:view_margin',
    'dashboard:operational',
    'dashboard:executive',
    'audit:view',
  ],
  admin: [
    'vehicle:view',
    'vehicle:create',
    'vehicle:edit',
    'vehicle:delete',
    'vehicle:change_status',
    'driver:view',
    'driver:create',
    'driver:edit',
    'driver:delete',
    'rental:view',
    'rental:create',
    'rental:edit',
    'rental:cancel',
    'rental:edit_contract',
    'maintenance:view',
    'maintenance:create',
    'maintenance:edit',
    'maintenance:delete',
    'fine:view',
    'fine:create',
    'fine:edit',
    'finance:view_costs',
    'finance:view_revenue',
    'finance:view_margin',
    'dashboard:operational',
    'dashboard:executive',
    'settings:view',
    'settings:manage_users',
    'audit:view',
  ],
};

// Role labels
export const roleLabels: Record<SystemRole, string> = {
  operator: 'Operador',
  manager: 'Gerente',
  executive: 'Executivo',
  admin: 'Administrador',
};

// Role descriptions
export const roleDescriptions: Record<SystemRole, string> = {
  operator: 'Acesso operacional: veículos, motoristas, locações, manutenções e multas',
  manager: 'Acesso gerencial: tudo do operador + edição de contratos e custos parciais',
  executive: 'Acesso estratégico: KPIs financeiros, receita, margens e análises',
  admin: 'Acesso total: CRUD completo, configurações, usuários e logs',
};

// Helper to check permission
export function hasPermission(role: SystemRole, action: PermissionAction): boolean {
  return rolePermissions[role].includes(action);
}
