const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }
}

export const api = new ApiClient();

// Hotel APIs
export const hotelApi = {
  create: (data: any) => api.post('/api/v1/hotels/create', data),
  list: () => api.post('/api/v1/hotels/list'),
  branches: (hotel_id: number) => api.post('/api/v1/hotels/branches', { hotel_id }),
  update: (data: any) => api.post('/api/v1/hotels/update', data),
};

// Room APIs
export const roomApi = {
  createType: (data: any) => api.post('/api/v1/room-types/create', data),
  listTypes: () => api.post('/api/v1/room-types/list'),
  bulkCreate: (data: any) => api.post('/api/v1/rooms/bulk-create', data),
  list: (filters?: any) => api.post('/api/v1/rooms/list', filters),
  updateStatus: (data: any) => api.post('/api/v1/rooms/update-status', data),
};

// Guest APIs
export const guestApi = {
  create: (data: any) => api.post('/api/v1/guests/create', data),
  search: (email: string) => api.post('/api/v1/guests/search', { email }),
  history: (guest_id: number) => api.post('/api/v1/guests/history', { guest_id }),
};

// Booking APIs
export const bookingApi = {
  checkAvailability: (data: any) => api.post('/api/v1/bookings/check-availability', data),
  create: (data: any) => api.post('/api/v1/bookings/create', data),
  list: (filters?: any) => api.post('/api/v1/bookings/list', filters),
  recordPayment: (data: any) => api.post('/api/v1/bookings/payment/record', data),
};

// Check-in/out APIs
export const checkinApi = {
  complete: (data: any) => api.post('/api/v1/checkin/complete', data),
  calculateBill: (data: any) => api.post('/api/v1/checkout/calculate-bill', data),
  checkout: (data: any) => api.post('/api/v1/checkout/complete', data),
};

// Dashboard APIs
export const dashboardApi = {
  overview: (filters?: any) => api.post('/api/v1/dashboard/overview', filters),
  branchesSummary: () => api.post('/api/v1/dashboard/branches-summary'),
  roomsGrid: (filters?: any) => api.post('/api/v1/dashboard/rooms-grid', filters),
  branchComparison: (filters?: any) => api.post('/api/v1/dashboard/branch-comparison', filters),
};