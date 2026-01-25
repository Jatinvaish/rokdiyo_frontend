// lib/api/config.ts

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3060",
  API_PREFIX: "api/v1",
  ENCRYPTION_ENABLED: process.env.NEXT_PUBLIC_ENCRYPTION_ENABLED === "true",
  ENCRYPTION_KEY: process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "",
};

export const API_ENDPOINTS = {
  // Auth & Tenant Management
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    TENANT_CREATE: "/auth/tenant/create",
    TENANTS_LIST: "/auth/tenants/list",
    TENANTS_GET: (id: number) => `/auth/tenants/get/${id}`,
    TENANTS_UPDATE: (id: number) => `/auth/tenants/update/${id}`,
    TENANTS_DELETE: (id: number) => `/auth/tenants/delete/${id}`,
    TENANTS_ACTIVATE: (id: number) => `/auth/tenants/activate/${id}`,
    TENANTS_DEACTIVATE: (id: number) => `/auth/tenants/deactivate/${id}`,
    INVITATION_SEND: "/auth/invitation/send",
    INVITATION_ACCEPT: (token: string) => `/auth/invitation/accept/${token}`,
    INVITATION_REJECT: (token: string) => `/auth/invitation/reject/${token}`,
  },

  // Hotel Management
  HOTELS: {
    CREATE: "/hotels/create",
    LIST: "/hotels/list",
    GET: (id: number) => `/hotels/get/${id}`,
    UPDATE: (id: number) => `/hotels/update/${id}`,
    DELETE: (id: number) => `/hotels/delete/${id}`,
    BRANCHES: (id: number) => `/hotels/branches/${id}`,
  },

  // Room Management
  ROOMS: {
    CREATE: "/rooms/create",
    CREATE_TYPE: "/rooms/room-types/create",
    LIST_TYPES: "/rooms/room-types/list",
    UPDATE_TYPE: "/rooms/room-types/update",
    LIST: "/rooms/list",
    BULK_CREATE: "/rooms/bulk-create",
    GET: (id: number) => `/rooms/get/${id}`,
    UPDATE: "/rooms/update",
    UPDATE_STATUS: "/rooms/update-status",
  },

  // Guest Management
  GUESTS: {
    CREATE: "/guests/create",
    LIST: "/guests/list",
    GET: (id: number) => `/guests/get/${id}`,
    UPDATE: "/guests/update",
    SEARCH: "/guests/search",
    HISTORY: (id: number) => `/guests/history/${id}`,
  },

  // Booking Management
  BOOKINGS: {
    CHECK_AVAILABILITY: "/bookings/check-availability",
    CREATE: "/bookings/create",
    LIST: "/bookings/list",
    GET: (id: number) => `/bookings/get/${id}`,
    RECORD_PAYMENT: "/bookings/payment/record",
  },

  // Check-in/Check-out
  CHECKIN: {
    COMPLETE: "/checkin/complete",
    CALCULATE_BILL: "/checkout/calculate-bill",
    COMPLETE_CHECKOUT: "/checkout/complete",
  },

  // Pricing
  PRICING: {
    CREATE_HOURLY_RULE: "/pricing/hourly-rules/create",
    CREATE_SEASONAL_RATE: "/pricing/seasonal-rates/create",
    CALCULATE_PRICE: "/pricing/calculate",
  },

  // Dashboard
  DASHBOARD: {
    OVERVIEW: "/dashboard/overview",
    BRANCHES_SUMMARY: "/dashboard/branches-summary",
    ROOMS_GRID: "/dashboard/rooms-grid",
    BRANCH_COMPARISON: "/dashboard/branch-comparison",
  },

  // Health Check
  HEALTH: {
    CHECK: "/health",
    DATABASES: "/health/databases",
    DETAILED: "/health/detailed",
  },
};