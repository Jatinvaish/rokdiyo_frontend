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