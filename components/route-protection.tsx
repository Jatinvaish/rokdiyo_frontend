"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import { AccessControlService } from "@/lib/services/access-control.service";

interface RouteProtectionProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export function RouteProtection({ children, requiredPermission }: RouteProtectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    checkAccess();
  }, [user, pathname, requiredPermission]);

  const checkAccess = async () => {
    if (!user?.id) {
      setHasAccess(false);
      return;
    }

    if (!requiredPermission) {
      setHasAccess(true);
      return;
    }

    try {
      const response = await AccessControlService.getEffectivePermissions();

      const hasRequiredPermission = response.success && response.data
        ? response.data.some((perm: any) => perm.permission_key === requiredPermission)
        : false;

      setHasAccess(hasRequiredPermission);
    } catch (error) {
      console.error('Error checking route access:', error);
      setHasAccess(false);
    }
  };

  if (hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
