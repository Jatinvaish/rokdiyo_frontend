// lib/services/tenant.service.ts
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/config";
import { Tenant, CreateTenantFormData } from "@/lib/types/tenant";

export interface CreateTenantDto {
  companyName: string;
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface TenantResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Tenant;
  timestamp: string;
}

export interface TenantsListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    data: Tenant[];
    total: number;
    page: number;
    limit: number;
  };
  timestamp: string;
}

export const tenantService = {
  /**
   * Create a new tenant with admin user
   */
  async createTenant(data: CreateTenantFormData): Promise<Tenant> {
    try {
      const createDto: CreateTenantDto = {
        companyName: data.name,
        email: data.admin_email,
        username: data.admin_email.split("@")[0],
        password: data.admin_password,
        firstName: data.admin_name.split(" ")[0],
        lastName: data.admin_name.split(" ").slice(1).join(" ") || "",
        phone: data.phone,
      };

      const response = await apiClient.post<TenantResponse>(
        API_ENDPOINTS.AUTH.TENANT_CREATE,
        createDto
      );

      return response.data;
    } catch (error: any) {
      console.error("Error creating tenant:", error);
      throw new Error(error.message || "Failed to create tenant");
    }
  },

  /**
   * Get all tenants with pagination and filters
   */
  async getTenants(
    page: number = 1,
    limit: number = 10,
    search?: string,
    is_active?: boolean
  ): Promise<{ data: Tenant[]; total: number; page: number; limit: number }> {
    try {
      const response = await apiClient.post<TenantsListResponse>(
        API_ENDPOINTS.AUTH.TENANTS_LIST,
        {
          page,
          limit,
          ...(search && { search }),
          ...(is_active !== undefined && { is_active }),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Error fetching tenants:", error);
      throw new Error(error.message || "Failed to fetch tenants");
    }
  },

  /**
   * Get a single tenant by ID
   */
  async getTenantById(id: number): Promise<Tenant> {
    try {
      const response = await apiClient.post<TenantResponse>(
        API_ENDPOINTS.AUTH.TENANTS_GET(id),
        {}
      );

      return response.data;
    } catch (error: any) {
      console.error("Error fetching tenant:", error);
      throw new Error(error.message || "Failed to fetch tenant");
    }
  },

  /**
   * Update a tenant
   */
  async updateTenant(
    id: number,
    data: Partial<CreateTenantFormData>
  ): Promise<Tenant> {
    try {
      const response = await apiClient.post<TenantResponse>(
        API_ENDPOINTS.AUTH.TENANTS_UPDATE(id),
        data
      );

      return response.data;
    } catch (error: any) {
      console.error("Error updating tenant:", error);
      throw new Error(error.message || "Failed to update tenant");
    }
  },

  /**
   * Delete a tenant
   */
  async deleteTenant(id: number): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.TENANTS_DELETE(id), {});
    } catch (error: any) {
      console.error("Error deleting tenant:", error);
      throw new Error(error.message || "Failed to delete tenant");
    }
  },

  /**
   * Activate a tenant
   */
  async activateTenant(id: number): Promise<Tenant> {
    try {
      const response = await apiClient.post<TenantResponse>(
        API_ENDPOINTS.AUTH.TENANTS_ACTIVATE(id),
        {}
      );

      return response.data;
    } catch (error: any) {
      console.error("Error activating tenant:", error);
      throw new Error(error.message || "Failed to activate tenant");
    }
  },

  /**
   * Deactivate a tenant
   */
  async deactivateTenant(id: number): Promise<Tenant> {
    try {
      const response = await apiClient.post<TenantResponse>(
        API_ENDPOINTS.AUTH.TENANTS_DEACTIVATE(id),
        {}
      );

      return response.data;
    } catch (error: any) {
      console.error("Error deactivating tenant:", error);
      throw new Error(error.message || "Failed to deactivate tenant");
    }
  },
};

