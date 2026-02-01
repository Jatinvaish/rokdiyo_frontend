// lib/services/access-control.service.ts
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import { Role, Permission, MenuPermission, RolePermission } from '../types/rbac';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UserPermission {
  user_id: number;
  permission_id: number;
  permission_name: string;
  permission_slug: string;
  resource_id: number;
  resource_name: string;
  resource_slug: string;
  role_id: number;
  role_name: string;
}

export interface UserMenu {
  user_id: number;
  menu_key: string;
  menu_name: string;
  parent_menu_key: string | null;
  display_order: number;
  icon: string;
  route: string;
}

export interface AccessCheckResult {
  has_access: boolean;
}

export class AccessControlService {
  // Roles Management
  static async createRole(data: Partial<Role>) {
    return apiClient.post<ApiResponse<Role>>(API_ENDPOINTS.ACCESS_CONTROL.ROLES.CREATE, data);
  }

  static async getRoles(params?: {
    search?: string;
    include_system_roles?: boolean;
    page?: number;
    limit?: number;
  }) {
    return apiClient.post<ApiResponse<Role[]>>(API_ENDPOINTS.ACCESS_CONTROL.ROLES.LIST, params);
  }

  static async updateRole(data: Partial<Role> & { id: string }) {
    return apiClient.post<ApiResponse<Role>>(API_ENDPOINTS.ACCESS_CONTROL.ROLES.UPDATE, data);
  }

  static async deleteRole(id: string) {
    return apiClient.post<ApiResponse<{ message: string }>>(API_ENDPOINTS.ACCESS_CONTROL.ROLES.DELETE, { id });
  }

  static async cloneRole(data: {
    source_role_id: string;
    new_name: string;
    new_display_name?: string;
    new_description?: string;
  }) {
    return apiClient.post<ApiResponse<Role>>(API_ENDPOINTS.ACCESS_CONTROL.ROLES.CLONE, data);
  }

  // Permissions Management
  static async createPermission(data: Partial<Permission>) {
    return apiClient.post<ApiResponse<Permission>>(API_ENDPOINTS.ACCESS_CONTROL.PERMISSIONS.CREATE, data);
  }

  static async getPermissions(params?: {
    search?: string;
    category?: string;
    resource?: string;
    include_system_permissions?: boolean;
    page?: number;
    limit?: number;
  }) {
    return apiClient.post<ApiResponse<Permission[]>>(API_ENDPOINTS.ACCESS_CONTROL.PERMISSIONS.LIST, params);
  }

  static async updatePermission(data: Partial<Permission> & { id: string }) {
    return apiClient.post<ApiResponse<Permission>>(API_ENDPOINTS.ACCESS_CONTROL.PERMISSIONS.UPDATE, data);
  }

  static async deletePermission(id: string) {
    return apiClient.post<ApiResponse<{ message: string }>>(API_ENDPOINTS.ACCESS_CONTROL.PERMISSIONS.DELETE, { id });
  }

  // Role Permissions Management
  static async assignRolePermissions(data: {
    role_id: string;
    permission_ids: number[];
  }) {
    return apiClient.post<ApiResponse<{ message: string; assigned_count: number }>>(API_ENDPOINTS.ACCESS_CONTROL.ROLE_PERMISSIONS.ASSIGN, data);
  }

  static async getRolePermissions(params: {
    role_id: string;
    include_subscription_permissions?: boolean;
  }) {
    return apiClient.post<ApiResponse<(Permission & { granted: boolean; status: string })[]>>(API_ENDPOINTS.ACCESS_CONTROL.ROLE_PERMISSIONS.LIST, params);
  }

  // Menu Permissions Management
  static async createMenuPermission(data: Partial<MenuPermission>) {
    return apiClient.post<ApiResponse<MenuPermission>>(API_ENDPOINTS.ACCESS_CONTROL.MENU_PERMISSIONS.CREATE, data);
  }

  static async getMenuPermissions(params?: {
    search?: string;
    include_inactive?: boolean;
    page?: number;
    limit?: number;
  }) {
    return apiClient.post<ApiResponse<MenuPermission[]>>(API_ENDPOINTS.ACCESS_CONTROL.MENU_PERMISSIONS.LIST, params);
  }

  static async updateMenuPermission(data: Partial<MenuPermission> & { id: string }) {
    return apiClient.post<ApiResponse<MenuPermission>>(API_ENDPOINTS.ACCESS_CONTROL.MENU_PERMISSIONS.UPDATE, data);
  }

  static async deleteMenuPermission(id: string) {
    return apiClient.post<ApiResponse<{ message: string }>>(API_ENDPOINTS.ACCESS_CONTROL.MENU_PERMISSIONS.DELETE, { id });
  }

  // User Permissions
  static async getEffectivePermissions() {
    return apiClient.post<ApiResponse<Permission[]>>(API_ENDPOINTS.ACCESS_CONTROL.EFFECTIVE_PERMISSIONS, {});
  }

  // User Menus
  static async getUserMenus(userId: number): Promise<ApiResponse<UserMenu[]>> {
    return apiClient.post<ApiResponse<UserMenu[]>>('/access-control/get-user-menus', {
      user_id: userId
    });
  }

  // Subscription-based permissions
  static async getSubscriptionPermissions(tenantId?: number): Promise<ApiResponse<Permission[]>> {
    return apiClient.post<ApiResponse<Permission[]>>('/access-control/get-subscription-permissions', {
      tenant_id: tenantId
    });
  }

  // Get user permissions with subscription filtering
  static async getUserPermissionsWithSubscription(userId: number): Promise<ApiResponse<Permission[]>> {
    return apiClient.post<ApiResponse<Permission[]>>('/access-control/get-user-permissions-with-subscription', {
      user_id: userId
    });
  }

  // Get tenant-aware menus
  static async getTenantAwareMenus(userId: number): Promise<ApiResponse<UserMenu[]>> {
    return apiClient.post<ApiResponse<UserMenu[]>>('/access-control/get-tenant-aware-menus', {
      user_id: userId
    });
  }

  // Role-based permissions with subscription filtering
  static async getRolePermissionsWithSubscription(params: {
    role_id: string;
    tenant_id?: number;
    include_subscription_permissions?: boolean;
  }) {
    return apiClient.post<ApiResponse<(Permission & { granted: boolean; status: string })[]>>('/access-control/get-role-permissions-with-subscription', params);
  }

  // Access Checks
  static async checkMenuAccess(userId: number, menuKey: string): Promise<ApiResponse<AccessCheckResult>> {
    return apiClient.post<ApiResponse<AccessCheckResult>>('/access-control/check-menu-access', {
      user_id: userId,
      menu_key: menuKey,
    });
  }

  static async checkPermission(userId: number, permissionSlug: string): Promise<ApiResponse<AccessCheckResult>> {
    return apiClient.post<ApiResponse<AccessCheckResult>>('/access-control/check-permission', {
      user_id: userId,
      permission_slug: permissionSlug,
    });
  }

  // Batch Operations
  static async checkMultiplePermissions(userId: number, permissionSlugs: string[]): Promise<ApiResponse<Record<string, boolean>>> {
    return apiClient.post<ApiResponse<Record<string, boolean>>>('/access-control/check-multiple-permissions', {
      user_id: userId,
      permission_slugs: permissionSlugs,
    });
  }

  static async checkMultipleMenuAccess(userId: number, menuKeys: string[]): Promise<ApiResponse<Record<string, boolean>>> {
    return apiClient.post<ApiResponse<Record<string, boolean>>>('/access-control/check-multiple-menu-access', {
      user_id: userId,
      menu_keys: menuKeys,
    });
  }

  // Utility Methods
  static async hasPermission(userId: number, permissionSlug: string): Promise<boolean> {
    const response = await this.checkPermission(userId, permissionSlug);
    return response.success ? response.data?.has_access || false : false;
  }

  static async canAccessMenu(userId: number, menuKey: string): Promise<boolean> {
    const response = await this.checkMenuAccess(userId, menuKey);
    return response.success ? response.data?.has_access || false : false;
  }

  static async getUserPermissionSlugs(userId: number): Promise<string[]> {
    const response = await this.getEffectivePermissions();
    if (response.success && response.data) {
      return response.data.map(p => p.permission_key || '');
    }
    return [];
  }

  static async getUserMenuRoutes(userId: number): Promise<string[]> {
    const response = await this.getUserMenus(userId);
    if (response.success && response.data) {
      return response.data.map(m => m.route).filter(Boolean);
    }
    return [];
  }
}

// Export singleton instance
export const accessControlService = AccessControlService;

// Export types for use in components
export type {
  Role,
  Permission,
  MenuPermission,
  RolePermission,
};

// Default export
export default AccessControlService;