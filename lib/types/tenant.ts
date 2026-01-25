import { z } from "zod";

/**
 * Tenant Interface - Represents a hotel/business tenant in the system
 */
export interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  currency?: string;
  website?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  admin_name: string;
  admin_email: string;
  admin_password?: string; // Only in creation request
}

/**
 * Zod Schema for Tenant Creation - Validates form input
 */
export const createTenantSchema = z.object({
  // Tenant Information
  name: z
    .string()
    .min(2, "Tenant name must be at least 2 characters")
    .max(100, "Tenant name cannot exceed 100 characters")
    .trim(),
  email: z
    .string()
    .email("Invalid email address")
    .lowercase(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number cannot exceed 20 characters")
    .regex(/^\+?[\d\s\-()]*$/, "Invalid phone number format"),
  address: z
    .string()
    .max(255, "Address cannot exceed 255 characters")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .max(100, "City cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .max(100, "Country cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
  timezone: z
    .string()
    .min(1, "Timezone is required"),
  currency: z
    .string()
    .length(3, "Currency code must be 3 characters (e.g., INR)"),
  website: z
    .string()
    .url("Invalid website URL")
    .optional()
    .or(z.literal("")),

  // Admin User Information
  admin_name: z
    .string()
    .min(2, "Admin name must be at least 2 characters")
    .max(100, "Admin name cannot exceed 100 characters")
    .trim(),
  admin_email: z
    .string()
    .email("Invalid admin email address")
    .lowercase(),
  admin_password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[\d]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one special character"),
  confirm_password: z
    .string()
    .min(1, "Please confirm your password"),
}).refine(
  (data) => data.admin_password === data.confirm_password,
  {
    message: "Passwords do not match",
    path: ["confirm_password"],
  }
).refine(
  (data) => data.email !== data.admin_email,
  {
    message: "Tenant email and admin email cannot be the same",
    path: ["admin_email"],
  }
);

export type CreateTenantFormData = z.infer<typeof createTenantSchema>;

/**
 * Edit Tenant Schema - For updating existing tenants
 */
export const editTenantSchema = createTenantSchema.omit({
  admin_password: true,
  confirm_password: true,
}).extend({
  admin_password: z
    .string()
    .optional()
    .or(z.literal("")),
  confirm_password: z
    .string()
    .optional()
    .or(z.literal("")),
});

export type EditTenantFormData = z.infer<typeof editTenantSchema>;

/**
 * Tenant List Response
 */
export interface TenantListResponse {
  data: Tenant[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Tenant Creation Response
 */
export interface TenantCreationResponse {
  id: number;
  name: string;
  email: string;
  admin_email: string;
  created_at: string;
}
