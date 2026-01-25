// lib/services/bookings.service.ts
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/config";

export interface CheckAvailabilityDto {
  room_type_id: number;
  check_in: string;
  check_out: string;
  hotel_ids?: number[];
}

export interface CreateBookingDto {
  guest_id: number;
  hotel_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  booking_type?: string;
  special_requests?: string;
  booking_source?: string;
}

export interface AvailableRoom {
  id: number;
  room_number: string;
  hotel_id: number;
  hotel_name: string;
  room_type_name: string;
}

export interface Booking {
  id: number;
  tenantId: number;
  guestId: number;
  hotelId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  bookingType: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: AvailableRoom[];
  timestamp: string;
}

export interface BookingsListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Booking[];
  timestamp: string;
}

export interface BookingResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Booking;
  timestamp: string;
}

export const bookingService = {
  async checkAvailability(data: CheckAvailabilityDto): Promise<AvailableRoom[]> {
    try {
      const response = await apiClient.post<AvailabilityResponse>(
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
      const response = await apiClient.post<BookingResponse>(
        API_ENDPOINTS.BOOKINGS.CREATE,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Create booking failed:", error);
      throw new Error(error.message || "Failed to create booking");
    }
  },

  async list(filters?: any): Promise<Booking[]> {
    try {
      const response = await apiClient.post<BookingsListResponse>(
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
      const response = await apiClient.post<BookingResponse>(
        API_ENDPOINTS.BOOKINGS.GET(id),
        {}
      );
      return response.data;
    } catch (error: any) {
      console.error("Get booking failed:", error);
      throw new Error(error.message || "Failed to get booking");
    }
  },

  async recordPayment(bookingId: number, amount: number): Promise<any> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.BOOKINGS.RECORD_PAYMENT,
        { booking_id: bookingId, amount, payment_method: 'cash', reference_number: '' }
      );
      return response.data;
    } catch (error: any) {
      console.error("Record payment failed:", error);
      throw new Error(error.message || "Failed to record payment");
    }
  },
};
