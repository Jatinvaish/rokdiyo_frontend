// lib/services/pricing.service.ts
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/config";

export interface CreateHourlyRuleDto {
  room_type_id: number;
  hotel_id: number;
  start_time: string;
  end_time: string;
  rate_multiplier: number;
  days_of_week?: string;
}

export interface CreateSeasonalRateDto {
  room_type_id: number;
  hotel_id: number;
  start_date: string;
  end_date: string;
  rate_multiplier: number;
  season_name: string;
}

export interface CalculatePriceDto {
  room_type_id: number;
  check_in: string;
  check_out: string;
}

export interface PriceCalculation {
  room_type_id: number;
  base_amount: number;
  multiplier: number;
  final_price: number;
}

export interface PricingResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: any;
  timestamp: string;
}

export const pricingService = {
  async createHourlyRule(data: CreateHourlyRuleDto): Promise<any> {
    try {
      const response = await apiClient.post<PricingResponse>(
        API_ENDPOINTS.PRICING.CREATE_HOURLY_RULE,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Create hourly rule failed:", error);
      throw new Error(error.message || "Failed to create hourly rule");
    }
  },

  async createSeasonalRate(data: CreateSeasonalRateDto): Promise<any> {
    try {
      const response = await apiClient.post<PricingResponse>(
        API_ENDPOINTS.PRICING.CREATE_SEASONAL_RATE,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Create seasonal rate failed:", error);
      throw new Error(error.message || "Failed to create seasonal rate");
    }
  },

  async calculatePrice(data: CalculatePriceDto): Promise<PriceCalculation> {
    try {
      const response = await apiClient.post<PricingResponse>(
        API_ENDPOINTS.PRICING.CALCULATE_PRICE,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Calculate price failed:", error);
      throw new Error(error.message || "Failed to calculate price");
    }
  },
};
