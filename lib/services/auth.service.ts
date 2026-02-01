// lib/services/auth.service.ts
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/config";
import { useAuthStore } from "../store/auth.store";

export interface LoginDto {
  identifier: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  userType: string;
  tenantId: number | null;
  firmId: number | null;
  branchId: number | null;
  firstName: string | null;
  lastName: string | null;
  onboardingCompleted: boolean;
}

export interface LoginResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    user: User;
  };
  timestamp: string;
}

export const authService = {
  async login(data: LoginDto): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        data
      );

      // Store auth data
      if (response?.data?.accessToken) {
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", response.data.accessToken);
          localStorage.setItem("user", JSON.stringify(response.data.user));

          useAuthStore.getState().setUser(response.data.user);

          // Also set cookie for middleware
          document.cookie = `accessToken=${response.data.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
      }

      return response;
    } catch (error: any) {
      console.error("Login failed:", error);
      throw new Error(error.message || "Login failed");
    }
  },

  async register(data: RegisterDto) {
    try {
      return await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
    } catch (error: any) {
      console.error("Registration failed:", error);
      throw new Error(error.message || "Registration failed");
    }
  },

  async getProfile() {
    try {
      return await apiClient.post(API_ENDPOINTS.AUTH.ME, {});
    } catch (error: any) {
      console.error("Get profile failed:", error);
      throw new Error(error.message || "Failed to get profile");
    }
  },

  async logout() {
    try {
      // Call backend logout endpoint if token exists
      const token = this.getToken();
      if (token) {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
      }
    } catch (error) {
      console.error("Backend logout failed:", error);
      // Continue with client-side cleanup even if backend call fails
    } finally {
      // Always clear client-side data
      if (typeof window !== "undefined") {
        useAuthStore.getState().clearUser();
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        // Clear cookie
        document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        // Redirect to sign-in
        window.location.href = "/sign-in";
      }
    }
  },

  getUser(): User | null {
    if (typeof window === "undefined") return null;

    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  },

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("accessToken");
  },
};