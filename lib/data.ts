// lib/mock-data/rbac.ts
import { Role, Permission, RolePermission, MenuPermission } from "@/lib/types/rbac";    
export const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Full system access',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Admin',
    description: 'Administrative access',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Manager',
    description: 'Management level access',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'User',
    description: 'Standard user access',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

export const mockPermissions: Permission[] = [
  { id: '1', permission_key: 'view', name: 'View', category: 'default', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '2', permission_key: 'list', name: 'List', category: 'default', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '3', permission_key: 'read', name: 'Read', category: 'default', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '4', permission_key: 'create', name: 'Create', category: 'default', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '5', permission_key: 'update', name: 'Update', category: 'default', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '6', permission_key: 'delete', name: 'Delete', category: 'default', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '7', permission_key: 'print', name: 'Print', category: 'default', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '8', permission_key: 'export', name: 'Export', category: 'default', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: '9', permission_key: 'import', name: 'Import', category: 'default', is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
];

export const mockRolePermissions: RolePermission[] = [
  // Super Admin - All permissions
  ...mockPermissions.map((p, i) => ({ id: `sa-${i}`, role_id: '1', permission_id: p.id, created_at: '2025-01-01T00:00:00Z' })),
  // Admin - Most permissions except delete
  ...mockPermissions.filter(p => p.permission_key !== 'delete').map((p, i) => ({ id: `a-${i}`, role_id: '2', permission_id: p.id, created_at: '2025-01-01T00:00:00Z' })),
  // Manager - View, list, read, update, export
  ...mockPermissions.filter(p => ['view', 'list', 'read', 'update', 'export'].includes(p.permission_key)).map((p, i) => ({ id: `m-${i}`, role_id: '3', permission_id: p.id, created_at: '2025-01-01T00:00:00Z' })),
  // User - View, list, read only
  ...mockPermissions.filter(p => ['view', 'list', 'read'].includes(p.permission_key)).map((p, i) => ({ id: `u-${i}`, role_id: '4', permission_id: p.id, created_at: '2025-01-01T00:00:00Z' })),
];

export const mockMenuPermissions: MenuPermission[] = [
  // Dashboard
  { id: 'mp-1', menu_permission_key: 'dashboard', permission_key: 'view', created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-2', menu_permission_key: 'dashboard', permission_key: 'read', created_at: '2025-01-01T00:00:00Z' },
  
  // Continuous Monitoring
  { id: 'mp-3', menu_permission_key: 'continuous-monitoring', permission_key: 'view', created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-4', menu_permission_key: 'continuous-monitoring', permission_key: 'list', created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-5', menu_permission_key: 'continuous-monitoring', permission_key: 'export', created_at: '2025-01-01T00:00:00Z' },
  
  // Access Control
  { id: 'mp-6', menu_permission_key: 'access-control', permission_key: 'view', created_at: '2025-01-01T00:00:00Z' },
  
  // Roles
  { id: 'mp-7', menu_permission_key: 'access-control.roles', permission_key: 'view', created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-8', menu_permission_key: 'access-control.roles', permission_key: 'list', created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-9', menu_permission_key: 'access-control.roles', permission_key: 'create', created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-10', menu_permission_key: 'access-control.roles', permission_key: 'update', created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-11', menu_permission_key: 'access-control.roles', permission_key: 'delete', created_at: '2025-01-01T00:00:00Z' },
  
  // Permissions
  { id: 'mp-12', menu_permission_key: 'access-control.permissions', permission_key: 'view', created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-13', menu_permission_key: 'access-control.permissions', permission_key: 'list', created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-14', menu_permission_key: 'access-control.permissions', permission_key: 'create', created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-15', menu_permission_key: 'access-control.permissions', permission_key: 'update', created_at: '2025-01-01T00:00:00Z' },
  
  // Role Permissions
  { id: 'mp-16', menu_permission_key: 'access-control.role-permissions', permission_key: 'view', created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-17', menu_permission_key: 'access-control.role-permissions', permission_key: 'list', created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-18', menu_permission_key: 'access-control.role-permissions', permission_key: 'update', created_at: '2025-01-01T00:00:00Z' },
  
  // Menu Permissions
  { id: 'mp-19', menu_permission_key: 'access-control.menu-permissions', permission_key: 'view', created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-20', menu_permission_key: 'access-control.menu-permissions', permission_key: 'list', created_at: '2025-01-01T00:00:00Z' },
  { id: 'mp-21', menu_permission_key: 'access-control.menu-permissions', permission_key: 'update', created_at: '2025-01-01T00:00:00Z' },
];