import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/config";
import { ApiResponse, Room, PaginatedResponse, RoomType } from "../types/hotel";

export interface CreateRoomTypeDto {
  name: string;
  description?: string;
  base_rate_hourly: number;
  base_rate_daily: number;
  max_occupancy: number;
  amenities?: string[];
}

export interface CreateRoomDto {
  hotel_id: number;
  room_number: string;
  room_type_id: number;
  floor: string;
  capacity: number;
  description?: string;
}

export const roomService = {
  async createType(data: CreateRoomTypeDto): Promise<RoomType> {
    try {
      const response = await apiClient.post<ApiResponse<RoomType>>(
        API_ENDPOINTS.ROOMS.CREATE_TYPE,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Create room type failed:", error);
      throw new Error(error.message || "Failed to create room type");
    }
  },

  async listTypes(): Promise<RoomType[]> {
    try {
      const response = await apiClient.post<ApiResponse<RoomType[]>>(
        API_ENDPOINTS.ROOMS.LIST_TYPES,
        {}
      );
      return response.data;
    } catch (error: any) {
      console.error("List room types failed:", error);
      throw new Error(error.message || "Failed to list room types");
    }
  },

  async list(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    firm_id?: number;
    branch_id?: number;
    search?: string;
  }): Promise<PaginatedResponse<Room>> {
    try {
      const response = await apiClient.post<ApiResponse<PaginatedResponse<Room>>>(
        API_ENDPOINTS.ROOMS.LIST,
        filters || {}
      );
      return response.data;
    } catch (error: any) {
      console.error("List rooms failed:", error);
      throw new Error(error.message || "Failed to list rooms");
    }
  },

  async bulkCreate(data: {
    hotel_id: number;
    room_number_prefix: string;
    start_number: number;
    end_number: number;
    room_type_id: number;
    floor: string;
  }): Promise<{ created_count: number; rooms: Room[] }> {
    try {
      const response = await apiClient.post<ApiResponse<{ created_count: number; rooms: Room[] }>>(
        API_ENDPOINTS.ROOMS.BULK_CREATE,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Bulk create rooms failed:", error);
      throw new Error(error.message || "Failed to bulk create rooms");
    }
  },

  async updateStatus(roomId: number, status: string): Promise<Room> {
    try {
      const response = await apiClient.post<ApiResponse<Room>>(
        API_ENDPOINTS.ROOMS.UPDATE_STATUS,
        { room_id: roomId, status }
      );
      return response.data;
    } catch (error: any) {
      console.error("Update room status failed:", error);
      throw new Error(error.message || "Failed to update room status");
    }
  },

  async create(data: any): Promise<Room> {
    try {
      const response = await apiClient.post<ApiResponse<Room>>(
        API_ENDPOINTS.ROOMS.CREATE,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Create room failed:", error);
      throw new Error(error.message || "Failed to create room");
    }
  },

  async update(roomId: number, data: any): Promise<Room> {
    try {
      const response = await apiClient.post<ApiResponse<Room>>(
        API_ENDPOINTS.ROOMS.UPDATE,
        { id: roomId, ...data }
      );
      return response.data;
    } catch (error: any) {
      console.error("Update room failed:", error);
      throw new Error(error.message || "Failed to update room");
    }
  },

  async updateType(typeId: number, data: CreateRoomTypeDto): Promise<RoomType> {
    try {
      const response = await apiClient.post<ApiResponse<RoomType>>(
        API_ENDPOINTS.ROOMS.UPDATE_TYPE,
        { id: typeId, ...data }
      );
      return response.data;
    } catch (error: any) {
      console.error("Update room type failed:", error);
      throw new Error(error.message || "Failed to update room type");
    }
  },
};
