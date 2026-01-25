// lib/services/dashboard.service.ts
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/config";

export interface DashboardOverview {
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  dirty_rooms: number;
  todays_checkins: number;
  todays_checkouts: number;
  todays_revenue: number;
}

export interface RoomGridItem {
  id: number;
  room_number: string;
  floor: string;
  status: string;
  room_type_name: string;
  hotel_name: string;
  booking_id?: number;
  booking_status?: string;
  first_name?: string;
  last_name?: string;
  check_out_date?: string;
}

export interface BranchSummary {
  id: number;
  name: string;
  is_headquarters: boolean;
  total_rooms: number;
  occupied_rooms: number;
  occupancy_percentage: number;
  todays_revenue: number;
  todays_checkins: number;
  todays_checkouts: number;
}

export interface OverviewResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: DashboardOverview;
  timestamp: string;
}

export interface RoomsGridResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: RoomGridItem[];
  timestamp: string;
}

export interface BranchesSummaryResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: BranchSummary[];
  timestamp: string;
}

export const dashboardService = {
  async getOverview(filters?: any): Promise<DashboardOverview> {
    try {
      const response = await apiClient.post<OverviewResponse>(
        API_ENDPOINTS.DASHBOARD.OVERVIEW,
        filters || {}
      );
      return response.data;
    } catch (error: any) {
      console.error("Get overview failed:", error);
      throw new Error(error.message || "Failed to get overview");
    }
  },

  async getRoomsGrid(filters?: any): Promise<RoomGridItem[]> {
    try {
      const response = await apiClient.post<RoomsGridResponse>(
        API_ENDPOINTS.DASHBOARD.ROOMS_GRID,
        filters || {}
      );
      return response.data;
    } catch (error: any) {
      console.error("Get rooms grid failed:", error);
      throw new Error(error.message || "Failed to get rooms grid");
    }
  },

  async getBranchesSummary(): Promise<BranchSummary[]> {
    try {
      const response = await apiClient.post<BranchesSummaryResponse>(
        API_ENDPOINTS.DASHBOARD.BRANCHES_SUMMARY,
        {}
      );
      return response.data;
    } catch (error: any) {
      console.error("Get branches summary failed:", error);
      throw new Error(error.message || "Failed to get branches summary");
    }
  },

  async getBranchComparison(filters?: any): Promise<any> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.DASHBOARD.BRANCH_COMPARISON,
        filters || {}
      );
      return response.data;
    } catch (error: any) {
      console.error("Get branch comparison failed:", error);
      throw new Error(error.message || "Failed to get branch comparison");
    }
  },
};
