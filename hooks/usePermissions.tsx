import { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { AccessControlService } from '@/lib/services/access-control.service'
import { Permission } from '@/lib/types/rbac'

interface User {
  id: number
  userType: string
  tenantId?: number
  firmId?: number
  branchId?: number
}

interface PermissionsContextType {
  permissions: Permission[]
  loading: boolean
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  hasTenantAccess: () => boolean
  hasFirmAccess: () => boolean
  hasBranchAccess: () => boolean
  isSuperAdmin: () => boolean
  refreshPermissions: () => void
  user: User | null
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider')
  }
  return context
}

interface PermissionsProviderProps {
  children: ReactNode
}

export function PermissionsProvider({ children }: PermissionsProviderProps) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Get user from localStorage or session
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    if (userStr) {
      try {
        const userData = JSON.parse(userStr)
        setUser(userData)
      } catch (error) {
        console.error('Failed to parse user data:', error)
      }
    }
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      
      // Get user from localStorage or session
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      let currentUser: User | null = null
      
      if (userStr) {
        try {
          currentUser = JSON.parse(userStr)
        } catch (error) {
          console.error('Failed to parse user data:', error)
        }
      }

      // If no user found, set empty permissions
      if (!currentUser) {
        setUser(null)
        setPermissions([])
        setLoading(false)
        return
      }

      setUser(currentUser)

      // Fetch permissions from backend service
      console.log('🔍 DEBUG: Fetching permissions for user:', currentUser);
      const response = await AccessControlService.getEffectivePermissions();
      console.log('🔍 DEBUG: Permissions response:', response);
      
      if (response.success && response.data) {
        console.log('🔍 DEBUG: Permissions loaded:', response.data.length);
        setPermissions(response.data);
      } else {
        console.warn('🔍 DEBUG: Failed to fetch permissions, response:', response);
        setPermissions([]);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
      setPermissions([])
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!permissions.length) return false
    return permissions.some(p => p.permission_key === permission)
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!permissions.length) return true
    return permissions.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!permissions.length) return true
    return permissions.every(permission => hasPermission(permission))
  }

  const hasTenantAccess = (): boolean => {
    if (!user) return false
    if (user.userType === 'SUPER_ADMIN') return true
    if (!user.tenantId) return false
    return hasAnyPermission(['tenants.read', 'tenants.update', 'tenants.manage'])
  }

  const hasFirmAccess = (): boolean => {
    if (!user) return false
    if (user.userType === 'SUPER_ADMIN') return true
    if (!user.tenantId || !user.firmId) return false
    return hasAnyPermission(['firms.read', 'firms.update', 'firms.manage'])
  }

  const hasBranchAccess = (): boolean => {
    if (!user) return false
    if (user.userType === 'SUPER_ADMIN') return true
    if (!user.tenantId || !user.firmId || !user.branchId) return false
    return hasAnyPermission(['branches.read', 'branches.update', 'branches.manage'])
  }

  const isSuperAdmin = (): boolean => {
    return user?.userType === 'super_admin' || user?.userType === 'SUPER_ADMIN'
  }

  const refreshPermissions = () => {
    fetchPermissions()
  }

  const value: PermissionsContextType = {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasTenantAccess,
    hasFirmAccess,
    hasBranchAccess,
    isSuperAdmin,
    refreshPermissions,
    user
  }

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  )
}

// Higher-order component for permission-based rendering
export function withPermissions<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WrappedComponent(props: P) {
    return (
      <PermissionsProvider>
        <Component {...props} />
      </PermissionsProvider>
    )
  }
}

// Permission guard component
interface PermissionGuardProps {
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  children: ReactNode
  fallback?: ReactNode
  tenantOnly?: boolean
  firmOnly?: boolean
  branchOnly?: boolean
}

export function PermissionGuard({ 
  permission, 
  permissions, 
  requireAll = false, 
  children, 
  fallback = null,
  tenantOnly = false,
  firmOnly = false,
  branchOnly = false
}: PermissionGuardProps) {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    hasTenantAccess,
    hasFirmAccess,
    hasBranchAccess,
    isSuperAdmin,
    loading 
  } = usePermissions()

  if (loading) {
    return <div>Loading...</div>
  }

  // Check tenant-level restrictions
  if (tenantOnly && !hasTenantAccess()) {
    return <>{fallback || null}</>
  }

  // Check firm-level restrictions
  if (firmOnly && !hasFirmAccess()) {
    return <>{fallback || null}</>
  }

  // Check branch-level restrictions
  if (branchOnly && !hasBranchAccess()) {
    return <>{fallback || null}</>
  }

  // Super admin bypasses all checks
  if (isSuperAdmin()) {
    return <>{children}</>
  }

  let hasAccess = true

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// Custom hooks for specific permission checks
export function useResourcePermissions(resource: string) {
  const { permissions } = usePermissions()
  
  const resourcePermissions = permissions.filter(p => p.resource === resource)
  
  return {
    canCreate: resourcePermissions.some(p => p.action === 'create'),
    canRead: resourcePermissions.some(p => p.action === 'read'),
    canUpdate: resourcePermissions.some(p => p.action === 'update'),
    canDelete: resourcePermissions.some(p => p.action === 'delete'),
    canExport: resourcePermissions.some(p => p.action === 'export'),
    canManage: resourcePermissions.some(p => p.action === 'manage'),
    permissions: resourcePermissions
  }
}

export function useCategoryPermissions(category: string) {
  const { permissions } = usePermissions()
  
  const categoryPermissions = permissions.filter(p => p.category === category)
  
  return {
    permissions: categoryPermissions,
    hasAnyInCategory: categoryPermissions.length > 0,
    permissionKeys: categoryPermissions.map(p => p.permission_key)
  }
}

// Button component with permission checking
interface PermissionButtonProps {
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  children: ReactNode
  disabled?: boolean
  onClick?: () => void
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  tenantOnly?: boolean
  firmOnly?: boolean
  branchOnly?: boolean
}

export function PermissionButton({
  permission,
  permissions,
  requireAll = false,
  children,
  disabled = false,
  onClick,
  className,
  variant = 'default',
  size = 'default',
  tenantOnly = false,
  firmOnly = false,
  branchOnly = false
}: PermissionButtonProps) {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    hasTenantAccess,
    hasFirmAccess,
    hasBranchAccess,
    isSuperAdmin,
    loading 
  } = usePermissions()

  if (loading) {
    return <div className={className}>Loading...</div>
  }

  // Check tenant-level restrictions
  if (tenantOnly && !hasTenantAccess()) {
    return null
  }

  // Check firm-level restrictions
  if (firmOnly && !hasFirmAccess()) {
    return null
  }

  // Check branch-level restrictions
  if (branchOnly && !hasBranchAccess()) {
    return null
  }

  // Super admin bypasses all checks
  if (isSuperAdmin()) {
    return (
      <button
        className={className}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
    )
  }

  let hasAccess = true

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
  }

  return hasAccess ? (
    <button
      className={className}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  ) : null
}
