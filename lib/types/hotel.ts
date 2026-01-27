import { z } from 'zod';

export interface Hotel {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  parent_hotel_id?: number;
  is_headquarters: boolean;
  branch_count?: number;
}

export const createHotelSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters').optional().or(z.literal('')),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  zip_code: z.string().min(3, 'Zip code must be at least 3 characters').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  is_headquarters: z.boolean().optional(),
});

export type CreateHotelFormData = z.infer<typeof createHotelSchema>;

export interface RoomType {
  id: number;
  type_code: string;
  type_name: string;
  description?: string;
  max_adults: number;
  max_children: number;
  max_occupancy: number;
  max_extra_beds: number;
  base_rate_hourly: number;
  base_rate_daily: number;
  base_rate_weekly?: number;
  base_rate_monthly?: number;
  extra_bed_rate?: number;
  extra_person_rate?: number;
  child_rate?: number;
  size_sqft?: number;
  bed_type?: string;
  bed_count?: number;
  view_type?: string;
  is_active: boolean;
  firm_id: number;
  branch_id?: number;
}

export interface Room {
  id: number;
  tenant_id: number;
  firm_id: number;
  branch_id: number;
  room_type_id: number;
  room_number: string;
  floor_number: number;
  block_name?: string;
  status: string;
  condition: string;
  is_accessible: boolean;
  notes?: string;
  room_type_name?: string;
  firm_name?: string;
  branch_name?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Guest {
  id: number;
  tenantId: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  id_type: string;
  id_number: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  booking_code: string;
  guest_id: number;
  hotel_id: number;
  assigned_to: number;
  room_number?: string;
  hotel_name?: string;
  firm_name?: string;
  guest_name?: string;
  first_name?: string;
  last_name?: string;
  check_in: string;
  check_out: string;
  total_hours?: number;
  total_nights?: number;
  total_amount: number;
  paid_amount: number;
  booking_status: string;
  payment_status: string;
  created_at: string;
  updated_at?: string;
}

export interface DashboardStats {
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  dirty_rooms: number;
  todays_checkins: number;
  todays_checkouts: number;
  todays_revenue: number;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AvailableRoom {
  id: number;
  room_number: string;
  hotel_id: number;
  hotel_name: string;
  room_type_name: string;
}