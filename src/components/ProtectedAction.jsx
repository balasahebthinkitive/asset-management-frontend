import { usePermission } from '../hooks/usePermission';

/**
 * Renders children only when the logged-in user has the required permission.
 * Falls back to `fallback` (default: nothing) when access is denied.
 *
 * Usage:
 *   <ProtectedAction action="delete">
 *     <button onClick={handleDelete}>Delete</button>
 *   </ProtectedAction>
 *
 *   <ProtectedAction action="create" fallback={<span title="No permission">—</span>}>
 *     <button onClick={openAddModal}>+ Add</button>
 *   </ProtectedAction>
 */
export default function ProtectedAction({ action, fallback = null, children }) {
  const { can } = usePermission();
  return can(action) ? children : fallback;
}
