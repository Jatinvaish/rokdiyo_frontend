export interface Permission {
  id: string;
  name: string;
  description?: string;
  permission_key?: string;
  category?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RolePermission {
  id?: string;
  roleId?: string;
  role_id?: string;
  permissionId?: string;
  permission_id?: string;
  created_at?: string;
}

export interface MenuPermission {
  id: string;
  menuId?: string;
  menu_permission_key?: string;
  roleId?: string;
  permissionId?: string;
  permission_key?: string;
  created_at?: string;
}
