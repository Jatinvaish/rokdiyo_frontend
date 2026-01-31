// lib/services/subscription.service.ts
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/config';

export interface SubscriptionPlan {
  id: number;
  plan_name: string;
  plan_slug: string;
  plan_type: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  trial_days: number;
  max_staff: number;
  max_storage_gb: number;
  max_branches: number;
  max_rooms: number;
  max_bookings_per_month: number;
  max_integrations: number;
  features: string;
  is_active: boolean;
  sort_order: number;
  is_free: boolean;
  is_default: boolean;
  plan_tier: string;
  billing_cycle: string;
  max_file_size_mb: number;
  max_api_calls_per_day: number;
  priority_support: boolean;
  custom_branding: boolean;
  white_label: boolean;
  sso_enabled: boolean;
  created_at: string;
  updated_at?: string;
}

export interface SubscriptionFeature {
  id: number;
  subscription_id: number;
  name: string;
  feature_price: number;
  is_deleted: boolean;
  created_at: string;
  updated_at?: string;
}

export interface SubscriptionFeaturePermission {
  id: number;
  subscription_id: number;
  feature_id: number;
  permission_id: number;
  is_deleted: boolean;
  created_at: string;
  created_by?: number;
}

export class SubscriptionService {
  // Subscription Plans Management
  static async getPlans() {
    return apiClient.post<SubscriptionPlan[]>(API_ENDPOINTS.SUBSCRIPTIONS.PLANS.LIST, {});
  }

  static async createPlan(data: Partial<SubscriptionPlan>) {
    return apiClient.post<SubscriptionPlan>(API_ENDPOINTS.SUBSCRIPTIONS.PLANS.CREATE, data);
  }

  static async getPlan(id: number) {
    return apiClient.post<SubscriptionPlan>(`/subscriptions/plans/${id}`, {});
  }

  static async updatePlan(id: number, data: Partial<SubscriptionPlan>) {
    return apiClient.post<SubscriptionPlan>(`/subscriptions/plans/${id}`, data);
  }

  static async deletePlan(id: number) {
    return apiClient.post<{ message: string }>(`/subscriptions/plans/${id}`, { id });
  }

  // Features Management
  static async getFeatures(planId: number) {
    return apiClient.post<SubscriptionFeature[]>(`/subscriptions/features/${planId}`, {});
  }

  static async createFeature(data: Partial<SubscriptionFeature>) {
    return apiClient.post<SubscriptionFeature>(API_ENDPOINTS.SUBSCRIPTIONS.FEATURES.CREATE, data);
  }

  static async updateFeature(id: number, data: Partial<SubscriptionFeature>) {
    return apiClient.post<SubscriptionFeature>(`/subscriptions/features/${id}`, data);
  }

  static async deleteFeature(id: number) {
    return apiClient.post<{ message: string }>(`/subscriptions/features/${id}`, { id });
  }

  // Feature Permissions Management
  static async assignFeaturePermissions(data: {
    subscription_id: number;
    feature_id: number;
    permission_ids: number[];
  }) {
    return apiClient.post<{ message: string }>(API_ENDPOINTS.SUBSCRIPTIONS.FEATURE_PERMISSIONS.ASSIGN, data);
  }

  // User Permissions
  static async getEffectivePermissions() {
    return apiClient.post<any[]>(API_ENDPOINTS.SUBSCRIPTIONS.EFFECTIVE_PERMISSIONS, {});
  }

  static async getSubscriptionPermissions() {
    return apiClient.post<any[]>(API_ENDPOINTS.SUBSCRIPTIONS.SUBSCRIPTION_PERMISSIONS, {});
  }
}
