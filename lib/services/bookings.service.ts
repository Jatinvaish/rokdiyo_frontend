import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/config";
import { ApiResponse, Booking, PaginatedResponse, AvailableRoom } from "../types/hotel";

export interface CheckAvailabilityDto {
  room_type_id: number;
  check_in: string;
  check_out: string;
  hotel_ids?: number[];
}

export interface CreateBookingDto {
  guest_id?: number;
  guest?: any;
  hotel_id: number;
  room_id: number;
  check_in_date?: string; // Legacy support
  check_out_date?: string; // Legacy support
  check_in?: string;
  check_out?: string;
  total_hours?: number;
  total_nights?: number;
  adults: number;
  children?: number;
  total_amount: number;
  booking_type?: string;
  special_requests?: string;
  booking_source?: string;
}

export const bookingService = {
  async checkAvailability(data: CheckAvailabilityDto): Promise<AvailableRoom[]> {
    try {
      const response = await apiClient.post<ApiResponse<AvailableRoom[]>>(
        API_ENDPOINTS.BOOKINGS.CHECK_AVAILABILITY,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Check availability failed:", error);
      throw new Error(error.message || "Failed to check availability");
    }
  },

  async create(data: CreateBookingDto): Promise<Booking> {
    try {
      const response = await apiClient.post<ApiResponse<Booking>>(
        API_ENDPOINTS.BOOKINGS.CREATE,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Create booking failed:", error);
      throw new Error(error.message || "Failed to create booking");
    }
  },

  async list(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    firm_id?: number;
    fromDate?: string;
    toDate?: string;
    search?: string;
  }): Promise<PaginatedResponse<Booking>> {
    try {
      const response = await apiClient.post<ApiResponse<PaginatedResponse<Booking>>>(
        API_ENDPOINTS.BOOKINGS.LIST,
        filters || {}
      );
      return response.data;
    } catch (error: any) {
      console.error("List bookings failed:", error);
      throw new Error(error.message || "Failed to list bookings");
    }
  },

  async get(id: number): Promise<Booking> {
    try {
      const response = await apiClient.post<ApiResponse<Booking>>(
        API_ENDPOINTS.BOOKINGS.GET(id),
        {}
      );
      return response.data;
    } catch (error: any) {
      console.error("Get booking failed:", error);
      throw new Error(error.message || "Failed to get booking");
    }
  },

  async recordPayment(bookingId: number, amount: number, method: string = 'cash', reference: string = ''): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        API_ENDPOINTS.BOOKINGS.RECORD_PAYMENT,
        {
          booking_id: bookingId,
          amount,
          payment_method: method,
          reference_number: reference
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Record payment failed:", error);
      throw new Error(error.message || "Failed to record payment");
    }
  },
};
