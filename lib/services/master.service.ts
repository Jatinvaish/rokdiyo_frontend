// lib/services/master.service.ts
import { apiClient } from '../api/client'
import { API_ENDPOINTS } from '../api/config'

export interface Firm {
  id: number
  tenant_id: number
  firm_name: string
  firm_code: string
  description?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  phone?: string
  email?: string
  website?: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface Branch {
  id: number
  tenant_id: number
  firm_id: number
  branch_name: string
  branch_code: string
  description?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  phone?: string
  email?: string
  is_headquarters: boolean
  is_active: boolean
  created_at: string
  updated_at?: string
}

export class MasterService {
  // Firms Management
  static async getFirmsByTenant(tenantId?: number) {
    return apiClient.post<Firm[]>(API_ENDPOINTS.MASTER.FIRMS.BY_TENANT, { tenant_id: tenantId })
  }

  static async getFirm(id: number) {
    return apiClient.post<Firm>(API_ENDPOINTS.MASTER.FIRMS.GET(id), {})
  }

  static async createFirm(data: Partial<Firm>) {
    return apiClient.post<Firm>(API_ENDPOINTS.MASTER.FIRMS.CREATE, data)
  }

  static async updateFirm(id: number, data: Partial<Firm>) {
    return apiClient.post<Firm>(API_ENDPOINTS.MASTER.FIRMS.UPDATE(id), data)
  }

  static async deleteFirm(id: number) {
    return apiClient.post<{ message: string }>(API_ENDPOINTS.MASTER.FIRMS.DELETE(id), { id })
  }

  // Branches Management
  static async getBranchesByTenant(tenantId?: number) {
    return apiClient.post<Branch[]>(API_ENDPOINTS.MASTER.BRANCHES.BY_TENANT, { tenant_id: tenantId })
  }

  static async getBranchesByFirm(firmId: number) {
    return apiClient.post<Branch[]>(API_ENDPOINTS.MASTER.BRANCHES.BY_FIRM, { firm_id: firmId })
  }

  static async getBranch(id: number) {
    return apiClient.post<Branch>(API_ENDPOINTS.MASTER.BRANCHES.GET(id), {})
  }

  static async createBranch(data: Partial<Branch>) {
    return apiClient.post<Branch>(API_ENDPOINTS.MASTER.BRANCHES.CREATE, data)
  }

  static async updateBranch(id: number, data: Partial<Branch>) {
    return apiClient.post<Branch>(API_ENDPOINTS.MASTER.BRANCHES.UPDATE(id), data)
  }

  static async deleteBranch(id: number) {
    return apiClient.post<{ message: string }>(API_ENDPOINTS.MASTER.BRANCHES.DELETE(id), { id })
  }

  // Combined Methods
  static async getTenantHierarchy(tenantId?: number) {
    try {
      const [firms, branches] = await Promise.all([
        this.getFirmsByTenant(tenantId),
        this.getBranchesByTenant(tenantId)
      ])
      
      return {
        firms: firms || [],
        branches: branches || []
      }
    } catch (error) {
      console.error('Failed to load tenant hierarchy:', error)
      throw error
    }
  }

  static async getFirmHierarchy(firmId: number) {
    try {
      const [firm, branches] = await Promise.all([
        this.getFirm(firmId),
        this.getBranchesByFirm(firmId)
      ])
      
      return {
        firm,
        branches: branches || []
      }
    } catch (error) {
      console.error('Failed to load firm hierarchy:', error)
      throw error
    }
  }
}
