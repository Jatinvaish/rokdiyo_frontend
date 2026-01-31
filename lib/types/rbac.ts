export interface Permission {
  id: string;
  permission_key: string;
  resource: string;
  action: string;
  description?: string;
  category?: string;
  applicable_to?: string;
  is_system_permission?: boolean;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  resource_id?: string;
  scope?: string;
  fields?: string;
}

export interface Role {
  id: string;
  tenant_id?: string;
  name: string;
  display_name?: string;
  description?: string;
  is_system_role?: boolean;
  is_default?: boolean;
  hierarchy_level?: number;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  is_visible_to_all?: boolean;
}

export interface RolePermission {
  id?: string;
  role_id: string;
  permission_id: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  granted?: boolean;
  status?: string;
}

export interface MenuPermission {
  id: string;
  menu_key: string;
  menu_name: string;
  parent_menu_key?: string;
  permission_ids?: string;
  match_type: string;
  display_order?: number;
  icon?: string;
  route?: string;
  status: string;
  is_active: boolean;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}
