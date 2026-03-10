import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, PermissionAction, SystemRole } from '@/types/roles';

export function usePermissions() {
  const { profile } = useAuth();
  
  const role: SystemRole = profile?.role ?? 'operator';

  const can = (action: PermissionAction): boolean => {
    return hasPermission(role, action);
  };

  return { role, can };
}
