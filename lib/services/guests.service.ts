// lib/services/guests.service.ts
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/config";

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

export interface Guest {
  id: number;
  tenantId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  idType: string;
  idNumber: string;
  idDocumentUrl?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface GuestsListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Guest[];
  timestamp: string;
}

export interface GuestResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Guest;
  timestamp: string;
}

export interface GuestHistoryResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: any[];
  timestamp: string;
}

export const guestService = {
  async create(data: CreateGuestDto): Promise<Guest> {
    try {
      const response = await apiClient.post<GuestResponse>(
        API_ENDPOINTS.GUESTS.CREATE,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Create guest failed:", error);
      throw new Error(error.message || "Failed to create guest");
    }
  },

  async list(): Promise<Guest[]> {
    try {
      const response = await apiClient.post<GuestsListResponse>(
        API_ENDPOINTS.GUESTS.LIST,
        {}
      );
      return response.data;
    } catch (error: any) {
      console.error("List guests failed:", error);
      throw new Error(error.message || "Failed to list guests");
    }
  },

  async get(id: number): Promise<Guest> {
    try {
      const response = await apiClient.post<GuestResponse>(
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
      const response = await apiClient.post<GuestResponse>(
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
      const response = await apiClient.post<GuestHistoryResponse>(
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
      const response = await apiClient.post<GuestResponse>(
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
