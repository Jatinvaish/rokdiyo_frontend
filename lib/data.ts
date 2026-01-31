// lib/mock-data/rbac.ts
import { Role, Permission, RolePermission, MenuPermission } from "@/lib/types/rbac";    
export const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Super Admin',
    display_name: 'Super Admin',
    description: 'Full system access',
    is_visible_to_all: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Admin',
    display_name: 'Admin',
    description: 'Administrative access',
    is_visible_to_all: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Manager',
    display_name: 'Manager',
    description: 'Management level access',
    is_visible_to_all: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'User',
    display_name: 'User',
    description: 'Standard user access',
    is_visible_to_all: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

export const mockPermissions: Permission[] = [
  { id: '1', permission_key: 'view', resource: 'general', action: 'view', description: 'View resources', category: 'default', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '2', permission_key: 'list', resource: 'general', action: 'list', description: 'List resources', category: 'default', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '3', permission_key: 'read', resource: 'general', action: 'read', description: 'Read resources', category: 'default', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '4', permission_key: 'create', resource: 'general', action: 'create', description: 'Create resources', category: 'default', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '5', permission_key: 'update', resource: 'general', action: 'update', description: 'Update resources', category: 'default', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '6', permission_key: 'delete', resource: 'general', action: 'delete', description: 'Delete resources', category: 'default', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '7', permission_key: 'print', resource: 'general', action: 'print', description: 'Print resources', category: 'default', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '8', permission_key: 'export', resource: 'general', action: 'export', description: 'Export resources', category: 'default', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '9', permission_key: 'import', resource: 'general', action: 'import', description: 'Import resources', category: 'default', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
];

export const mockRolePermissions: RolePermission[] = [
  // Super Admin - All permissions
  ...mockPermissions.map((p, i) => ({ id: `sa-${i}`, role_id: '1', permission_id: p.id, created_at: '2025-01-01T00:00:00Z' })),
  // Admin - Most permissions except delete
  ...mockPermissions.filter(p => p.permission_key && p.permission_key !== 'delete').map((p, i) => ({ id: `a-${i}`, role_id: '2', permission_id: p.id, created_at: '2025-01-01T00:00:00Z' })),
  // Manager - View, list, read, update, export
  ...mockPermissions.filter(p => p.permission_key && ['view', 'list', 'read', 'update', 'export'].includes(p.permission_key)).map((p, i) => ({ id: `m-${i}`, role_id: '3', permission_id: p.id, created_at: '2025-01-01T00:00:00Z' })),
  // User - View, list, read only
  ...mockPermissions.filter(p => p.permission_key && ['view', 'list', 'read'].includes(p.permission_key)).map((p, i) => ({ id: `u-${i}`, role_id: '4', permission_id: p.id, created_at: '2025-01-01T00:00:00Z' })),
];

export const mockMenuPermissions: MenuPermission[] = [
  // Dashboard
  { id: 'mp-1', menu_key: 'dashboard', menu_name: 'Dashboard', permission_ids: '1', match_type: 'ANY', status: 'active', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-2', menu_key: 'dashboard', menu_name: 'Dashboard', permission_ids: '3', match_type: 'ANY', status: 'active', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  
  // Continuous Monitoring
  { id: 'mp-3', menu_key: 'continuous-monitoring', menu_name: 'Continuous Monitoring', permission_ids: '1', match_type: 'ANY', status: 'active', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-4', menu_key: 'continuous-monitoring', menu_name: 'Continuous Monitoring', permission_ids: '2', match_type: 'ANY', status: 'active', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-5', menu_key: 'continuous-monitoring', menu_name: 'Continuous Monitoring', permission_ids: '8', match_type: 'ANY', status: 'active', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  
  // Access Control
  { id: 'mp-6', menu_key: 'access-control', menu_name: 'Access Control', permission_ids: '1', match_type: 'ANY', status: 'active', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  
  // Roles
  { id: 'mp-7', menu_key: 'access-control.roles', menu_name: 'Roles', permission_ids: '1', match_type: 'ANY', status: 'active', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-8', menu_key: 'access-control.roles', menu_name: 'Roles', permission_ids: '2', match_type: 'ANY', status: 'active', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-9', menu_key: 'access-control.roles', menu_name: 'Roles', permission_ids: '4', match_type: 'ANY', status: 'active', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-10', menu_key: 'access-control.roles', menu_name: 'Roles', permission_ids: '5', match_type: 'ANY', status: 'active', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-11', menu_key: 'access-control.roles', menu_name: 'Roles', permission_ids: '6', match_type: 'ANY', status: 'active', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  
  // Permissions
  { id: 'mp-12', menu_key: 'access-control.permissions', menu_name: 'Permissions', permission_ids: '1', match_type: 'ANY', status: 'active', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-13', menu_key: 'access-control.permissions', menu_name: 'Permissions', permission_ids: '2', match_type: 'ANY', status: 'active', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-14', menu_key: 'access-control.permissions', menu_name: 'Permissions', permission_ids: '4', match_type: 'ANY', status: 'active', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-15', menu_key: 'access-control.permissions', menu_name: 'Permissions', permission_ids: '5', match_type: 'ANY', status: 'active', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  
  // Role Permissions
  { id: 'mp-16', menu_key: 'access-control.role-permissions', menu_name: 'Role Permissions', permission_ids: '1', match_type: 'ANY', status: 'active', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-17', menu_key: 'access-control.role-permissions', menu_name: 'Role Permissions', permission_ids: '2', match_type: 'ANY', status: 'active', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-18', menu_key: 'access-control.role-permissions', menu_name: 'Role Permissions', permission_ids: '5', match_type: 'ANY', status: 'active', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  
  // Menu Permissions
  { id: 'mp-19', menu_key: 'access-control.menu-permissions', menu_name: 'Menu Permissions', permission_ids: '1', match_type: 'ANY', status: 'active', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-20', menu_key: 'access-control.menu-permissions', menu_name: 'Menu Permissions', permission_ids: '2', match_type: 'ANY', status: 'active', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-21', menu_key: 'access-control.menu-permissions', menu_name: 'Menu Permissions', permission_ids: '5', match_type: 'ANY', status: 'active', is_active: true, created_at: '2025-01-01T00:00:00Z' },
];