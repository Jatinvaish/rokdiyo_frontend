'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { usePermissions } from '@/hooks/usePermissions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface RouteGuardProps {
  permission?: string | string[]
  fallback?: string
  requireAll?: boolean // If true, requires all permissions (AND logic), if false, requires any (OR logic)
  checkMenuAccess?: boolean // Additional check for menu-based access control
  children: React.ReactNode
}

export function RouteGuard({ 
  permission, 
  fallback = '/dashboard', 
  requireAll = false,
  checkMenuAccess = false, // Disabled by default since hasMenuAccess might not exist
  children 
}: RouteGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { hasPermission, isSuperAdmin, loading } = usePermissions()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      setIsChecking(true)
      
      try {
        // Super admin bypasses all permission checks
        if (isSuperAdmin()) {
          setIsChecking(false)
          return
        }

        let hasAccess = true

        // Check explicit permissions if provided
        if (permission) {
          if (Array.isArray(permission)) {
            hasAccess = requireAll 
              ? permission.every(p => hasPermission(p)) // AND logic
              : permission.some(p => hasPermission(p))  // OR logic
          } else {
            hasAccess = hasPermission(permission)
          }
        }

        // Additional menu access check if enabled (commented out for now)
        /*
        if (hasAccess && checkMenuAccess && pathname) {
          const menuKey = pathname.replace('/dashboard/', '').replace(/\//g, '_')
          // const menuAccess = await hasMenuAccess(menuKey)
          // hasAccess = hasAccess && (menuAccess !== false)
        }
        */

        if (!hasAccess) {
          console.warn(`Access denied to ${pathname}. Required permissions:`, permission)
          toast.error('You do not have permission to access this page')
          router.push(fallback)
        }
      } catch (error) {
        console.error('Error checking route access:', error)
        toast.error('Error verifying access permissions')
        router.push(fallback)
      } finally {
        setIsChecking(false)
      }
    }

    if (!loading) {
      checkAccess()
    }
  }, [permission, requireAll, checkMenuAccess, pathname, fallback, router, hasPermission, isSuperAdmin, loading])

  // Show loading state while checking permissions
  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying access permissions...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Specific route guards for common patterns
export function AdminRoute({ children, fallback = '/dashboard' }: { children: React.ReactNode; fallback?: string }) {
  return (
    <RouteGuard 
      permission={['manage_users', 'manage_roles']} 
      fallback={fallback}
      requireAll={false}
    >
      {children}
    </RouteGuard>
  )
}

export function ManagementRoute({ children, fallback = '/dashboard' }: { children: React.ReactNode; fallback?: string }) {
  return (
    <RouteGuard 
      permission={['manage_bookings', 'manage_rooms', 'manage_guests']} 
      fallback={fallback}
      requireAll={false}
    >
      {children}
    </RouteGuard>
  )
}

export function TenantAdminRoute({ children, fallback = '/dashboard' }: { children: React.ReactNode; fallback?: string }) {
  return (
    <RouteGuard 
      permission={['manage_users', 'manage_roles', 'manage_settings']} 
      fallback={fallback}
      requireAll={false}
      checkMenuAccess={true}
    >
      {children}
    </RouteGuard>
  )
}
