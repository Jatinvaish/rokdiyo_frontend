// lib/api/config.ts

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3060",
  API_PREFIX: "api/v1",
  ENCRYPTION_ENABLED: process.env.NEXT_PUBLIC_ENCRYPTION_ENABLED === "true",
  ENCRYPTION_KEY: process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "",
};

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    ME: "/auth/me",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    TENANT_CREATE: "/auth/tenant/create",
    INVITATION_SEND: "/auth/invitation/send",
    INVITATION_ACCEPT: (token: string) => `/auth/invitation/accept/${token}`,
    INVITATION_REJECT: (token: string) => `/auth/invitation/reject/${token}`,
  },
  HEALTH: {
    CHECK: "/health",
    DATABASES: "/health/databases",
    DETAILED: "/health/detailed",
  },
};