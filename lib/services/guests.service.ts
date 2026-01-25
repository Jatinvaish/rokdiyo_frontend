import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/config";
import { ApiResponse, Guest, PaginatedResponse } from "../types/hotel";

export interface CreateGuestDto {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  id_type: string;
  id_number: string;
  id_document_url?: string;
  date_of_birth?: string;
  nationality?: string;
  address?: string;
}

export const guestService = {
  async create(data: CreateGuestDto): Promise<Guest> {
    try {
      const response = await apiClient.post<ApiResponse<Guest>>(
        API_ENDPOINTS.GUESTS.CREATE,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Create guest failed:", error);
      throw new Error(error.message || "Failed to create guest");
    }
  },

  async list(filters?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Guest>> {
    try {
      const response = await apiClient.post<ApiResponse<PaginatedResponse<Guest>>>(
        API_ENDPOINTS.GUESTS.LIST,
        filters || {}
      );
      return response.data;
    } catch (error: any) {
      console.error("List guests failed:", error);
      throw new Error(error.message || "Failed to list guests");
    }
  },

  async get(id: number): Promise<Guest> {
    try {
      const response = await apiClient.post<ApiResponse<Guest>>(
        API_ENDPOINTS.GUESTS.GET(id),
        {}
      );
      return response.data;
    } catch (error: any) {
      console.error("Get guest failed:", error);
      throw new Error(error.message || "Failed to get guest");
    }
  },

  async search(email: string): Promise<Guest | null> {
    try {
      const response = await apiClient.post<ApiResponse<Guest>>(
        API_ENDPOINTS.GUESTS.SEARCH,
        { email }
      );
      return response.data;
    } catch (error: any) {
      console.error("Search guest failed:", error);
      return null;
    }
  },

  async getHistory(guestId: number): Promise<any[]> {
    try {
      const response = await apiClient.post<ApiResponse<any[]>>(
        API_ENDPOINTS.GUESTS.HISTORY(guestId),
        {}
      );
      return response.data;
    } catch (error: any) {
      console.error("Get guest history failed:", error);
      throw new Error(error.message || "Failed to get guest history");
    }
  },

  async update(id: number, data: Partial<CreateGuestDto>): Promise<Guest> {
    try {
      const response = await apiClient.post<ApiResponse<Guest>>(
        API_ENDPOINTS.GUESTS.UPDATE,
        { id, ...data }
      );
      return response.data;
    } catch (error: any) {
      console.error("Update guest failed:", error);
      throw new Error(error.message || "Failed to update guest");
    }
  },
};
