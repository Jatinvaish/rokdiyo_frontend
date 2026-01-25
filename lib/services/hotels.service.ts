// lib/services/hotels.service.ts
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/config";

export interface CreateHotelDto {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  website?: string;
  is_headquarters?: boolean;
}

export interface Hotel {
  id: number;
  tenantId: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  website?: string;
  is_headquarters: boolean;
  created_at: string;
  updated_at: string;
}

export interface HotelsListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Hotel[];
  timestamp: string;
}

export interface HotelResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Hotel;
  timestamp: string;
}

export const hotelService = {
  async create(data: CreateHotelDto): Promise<Hotel> {
    try {
      const response = await apiClient.post<HotelResponse>(
        API_ENDPOINTS.HOTELS.CREATE,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Create hotel failed:", error);
      throw new Error(error.message || "Failed to create hotel");
    }
  },

  async list(): Promise<Hotel[]> {
    try {
      const response = await apiClient.post<HotelsListResponse>(
        API_ENDPOINTS.HOTELS.LIST,
        {}
      );
      return response.data;
    } catch (error: any) {
      console.error("List hotels failed:", error);
      throw new Error(error.message || "Failed to list hotels");
    }
  },

  async get(id: number): Promise<Hotel> {
    try {
      const response = await apiClient.post<HotelResponse>(
        API_ENDPOINTS.HOTELS.GET(id),
        {}
      );
      return response.data;
    } catch (error: any) {
      console.error("Get hotel failed:", error);
      throw new Error(error.message || "Failed to get hotel");
    }
  },

  async update(id: number, data: Partial<CreateHotelDto>): Promise<Hotel> {
    try {
      const response = await apiClient.post<HotelResponse>(
        API_ENDPOINTS.HOTELS.UPDATE(id),
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Update hotel failed:", error);
      throw new Error(error.message || "Failed to update hotel");
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.HOTELS.DELETE(id), {});
    } catch (error: any) {
      console.error("Delete hotel failed:", error);
      throw new Error(error.message || "Failed to delete hotel");
    }
  },

  async getBranches(hotelId: number): Promise<Hotel[]> {
    try {
      const response = await apiClient.post<HotelsListResponse>(
        API_ENDPOINTS.HOTELS.BRANCHES(hotelId),
        {}
      );
      return response.data;
    } catch (error: any) {
      console.error("Get branches failed:", error);
      throw new Error(error.message || "Failed to get branches");
    }
  },
};
