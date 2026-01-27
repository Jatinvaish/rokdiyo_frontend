// lib/api/client.ts
import { API_CONFIG } from "./config";
import { EncryptionUtil } from "./encryption";

class EncryptedApiClient {
  private baseUrl: string;
  private encryptionEnabled: boolean;

  constructor() {
    this.baseUrl = `${API_CONFIG.BASE_URL}/${API_CONFIG.API_PREFIX}`;
    this.encryptionEnabled = API_CONFIG.ENCRYPTION_ENABLED;
  }

  private getHeaders(encrypted: boolean = false): HeadersInit {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (encrypted) headers["X-Encryption-Enabled"] = "true";

    return headers;
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const isFormData = options.body instanceof FormData;
      // Only encrypt non-GET requests and non-FormData
      const isEncrypted = this.encryptionEnabled && options.method !== "GET" && !isFormData;

      if (isEncrypted && options.body) {
        const encrypted = await EncryptionUtil.encrypt(options.body as string);
        options.body = JSON.stringify(encrypted);
      }

      const headers: any = { ...this.getHeaders(isEncrypted), ...options.headers };
      if (isFormData) {
        // fetch will automatically set the boundary if Content-Type is not set
        delete headers["Content-Type"];
      }

      const res = await fetch(`${this.baseUrl}${url}`, {
        ...options,
        headers,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({
          message: `HTTP ${res.status}: ${res.statusText}`
        }));
        throw new Error(error.message || `Request failed with status ${res.status}`);
      }

      const data = await res.json();

      // Check if response is encrypted
      if (data.__payload && data.__checksum) {
        const decrypted = await EncryptionUtil.decrypt(data);
        return decrypted as T;
      }

      return data as T;
    } catch (error) {
      console.error(`API request failed [${options.method || 'GET'} ${url}]:`, error);
      throw error;
    }
  }

  async post<T>(url: string, body: any, options: RequestInit = {}): Promise<T> {
    const isFormData = body instanceof FormData;
    return this.request<T>(url, {
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
      ...options
    });
  }

  async get<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: "GET" });
  }

  async patch<T>(url: string, body: any): Promise<T> {
    return this.request<T>(url, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: "DELETE" });
  }
}

export const apiClient = new EncryptedApiClient();