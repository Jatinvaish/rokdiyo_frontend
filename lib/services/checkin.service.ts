// lib/services/checkin.service.ts
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/config";

export interface CompleteCheckInDto {
  booking_id: number;
  notes?: string;
}

export interface CalculateBillDto {
  booking_id: number;
  additional_charges?: number;
  charge_description?: string;
}

export interface CompleteCheckOutDto {
  booking_id: number;
  final_amount: number;
  checkout_notes?: string;
}

export interface CheckInResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    booking_id: number;
    room_id: number;
    status: string;
  };
  timestamp: string;
}

export interface BillResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    booking_id: number;
    base_amount: number;
    additional_charges: number;
    tax_amount: number;
    final_amount: number;
    paid_amount: number;
    balance_due: number;
    actual_hours: number;
  };
  timestamp: string;
}

export interface CheckOutResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    booking_id: number;
    room_id: number;
    status: string;
  };
  timestamp: string;
}

export const checkinService = {
  async completeCheckIn(data: CompleteCheckInDto): Promise<any> {
    try {
      const response = await apiClient.post<CheckInResponse>(
        API_ENDPOINTS.CHECKIN.COMPLETE,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Complete check-in failed:", error);
      throw new Error(error.message || "Failed to complete check-in");
    }
  },

  async calculateBill(data: CalculateBillDto): Promise<any> {
    try {
      const response = await apiClient.post<BillResponse>(
        API_ENDPOINTS.CHECKIN.CALCULATE_BILL,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Calculate bill failed:", error);
      throw new Error(error.message || "Failed to calculate bill");
    }
  },

  async completeCheckOut(data: CompleteCheckOutDto): Promise<any> {
    try {
      const response = await apiClient.post<CheckOutResponse>(
        API_ENDPOINTS.CHECKIN.COMPLETE_CHECKOUT,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Complete check-out failed:", error);
      throw new Error(error.message || "Failed to complete check-out");
    }
  },
};
