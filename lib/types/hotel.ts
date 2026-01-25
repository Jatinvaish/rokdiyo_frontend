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
  name: string;
  description: string;
  base_rate_hourly: number;
  base_rate_daily: number;
  max_occupancy: number;
  amenities: string[];
}

export interface Room {
  id: number;
  hotel_id: number;
  room_type_id: number;
  room_number: string;
  floor: string;
  status: 'available' | 'booked' | 'occupied' | 'dirty' | 'maintenance';
  room_type_name?: string;
  hotel_name?: string;
}

export interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  id_type: string;
  id_number: string;
}

export interface Booking {
  id: number;
  guest_id: number;
  hotel_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  guest_name?: string;
  room_number?: string;
  hotel_name?: string;
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