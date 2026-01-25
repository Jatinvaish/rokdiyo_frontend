// types/rbac.ts
export interface Role {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  permission_key: string;
  name: string;
  description?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  created_at: string;
}

export interface MenuPermission {
  id: string;
  menu_permission_key: string;
  permission_key: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role_id: string;
  is_active: boolean;
}

export type PermissionKey = 'view' | 'list' | 'read' | 'create' | 'update' | 'delete' | 'print' | 'export' | 'import';

// config/menu-structure.ts
export interface MenuItem {
  key: string;
  title: string;
  icon: string;
  path: string;
  order: number;
  children?: MenuItem[];
}

export const MENU_STRUCTURE: MenuItem[] = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/dashboard',
    order: 1,
  },
  {
    key: 'continuous-monitoring',
    title: 'Continuous Monitoring',
    icon: 'Activity',
    path: '/dashboard/continuous-monitoring',
    order: 2,
  },
  {
    key: 'access-control',
    title: 'Access Control',
    icon: 'Shield',
    path: '/dashboard/access-control',
    order: 3,
    children: [
      {
        key: 'access-control.roles',
        title: 'Roles',
        icon: 'Shield',
        path: '/dashboard/access-control/roles',
        order: 1,
      },
      {
        key: 'access-control.permissions',
        title: 'Permissions',
        icon: 'Key',
        path: '/dashboard/access-control/permissions',
        order: 2,
      },
      {
        key: 'access-control.role-permissions',
        title: 'Role Permissions',
        icon: 'ShieldCheck',
        path: '/dashboard/access-control/role-permissions',
        order: 3,
      },
      {
        key: 'access-control.menu-permissions',
        title: 'Menu Permissions',
        icon: 'Menu',
        path: '/dashboard/access-control/menu-permissions',
        order: 4,
      },
    ],
  },
];