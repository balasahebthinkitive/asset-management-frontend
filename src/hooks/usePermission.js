import { useAuth } from '../auth';

const PERMISSIONS = {
  admin:   ['view', 'create', 'edit', 'delete', 'manage_people', 'manage_settings', 'manage_vendors'],
  manager: ['view', 'create', 'edit', 'manage_tickets'],
  user:    ['view'],
};

/**
 * Returns permission helpers for the current logged-in user.
 *
 * Usage:
 *   const { can, role, isAdmin } = usePermission();
 *   can('delete')        // true only for admin
 *   can('create')        // true for admin and manager
 */
export function usePermission() {
  const { user } = useAuth();
  const role = user?.role || 'user';
  const perms = PERMISSIONS[role] || PERMISSIONS.user;

  const can    = (action)       => perms.includes(action);
  const canAny = (...actions)   => actions.some(a => perms.includes(a));

  return {
    can,
    canAny,
    role,
    isAdmin:   role === 'admin',
    isManager: role === 'manager',
  };
}
