'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Shield, Users, ArrowLeft, CheckCircle } from 'lucide-react'
import AccessControlService from '@/lib/services/access-control.service'
import { Role, Permission } from '@/lib/types/rbac'
import { useAuthStore } from '@/lib/store/auth.store'
import Link from 'next/link'

interface RoleWithPermissions extends Role {
  permissions: Permission[]
  permissionCount: number
}

export default function AssignPermissionsPage() {
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<RoleWithPermissions[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [loadingPermissions, setLoadingPermissions] = useState(false)
  const [saving, setSaving] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    setLoading(true)
    try {
      console.log('Loading roles...')
      const response = await AccessControlService.getRoles({ 
        include_system_roles: user?.userType === 'SUPER_ADMIN' 
      })
      console.log('Roles response:', response)
      
      const rolesData = Array.isArray(response) ? response : (response.data || [])
      
      // Get permission counts for each role
      const rolesWithCounts = await Promise.all(
        rolesData.map(async (role: Role) => {
          try {
            const rolePermsResponse = await AccessControlService.getRolePermissions({
              role_id: role.id.toString(),
              include_subscription_permissions: true
            })
            const rolePermissions = ((rolePermsResponse as any)?.data || [])
              .filter((p: any) => p.granted && p.status === 'active')
            
            return {
              ...role,
              permissions: rolePermissions,
              permissionCount: rolePermissions.length
            }
          } catch (error) {
            console.error(`Failed to load permissions for role ${role.id}:`, error)
            return {
              ...role,
              permissions: [],
              permissionCount: 0
            }
          }
        })
      )
      
      setRoles(rolesWithCounts)
    } catch (error) {
      console.error('Failed to load roles:', error)
      toast.error('Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  const loadRolePermissions = async (role: Role) => {
    setLoadingPermissions(true)
    setSelectedRole(role)
    try {
      console.log('Loading permissions for role:', role.id)
      
      // Get subscription-based permissions for tenant users
      let subscriptionPerms
      try {
        if (user?.tenantId) {
          // For tenant users, get permissions based on subscription
          subscriptionPerms = await AccessControlService.getSubscriptionPermissions(user.tenantId)
          console.log('Subscription permissions response:', subscriptionPerms)
        } else {
          // For super admin, get all permissions
          subscriptionPerms = await AccessControlService.getPermissions({ include_system_permissions: true })
          console.log('All permissions response:', subscriptionPerms)
        }
      } catch (subError) {
        console.log('Subscription permissions failed, trying regular permissions:', subError)
        subscriptionPerms = await AccessControlService.getPermissions({ include_system_permissions: true })
        console.log('Regular permissions response:', subscriptionPerms)
      }
      
      const rolePerms = await AccessControlService.getRolePermissions({
        role_id: role.id.toString(),
        include_subscription_permissions: true
      })
      console.log('Role permissions response:', rolePerms)
      
      // Extract data from API response format
      const permissionsData = Array.isArray(subscriptionPerms) ? subscriptionPerms : ((subscriptionPerms as any)?.data || [])
      console.log('Final permissions data:', permissionsData)
      
      // If still no permissions, try to get all permissions as fallback
      if (permissionsData.length === 0) {
        console.log('No permissions from subscription, trying all permissions as fallback')
        const allPerms = await AccessControlService.getPermissions({ include_system_permissions: true })
        const fallbackData = Array.isArray(allPerms) ? allPerms : ((allPerms as any)?.data || [])
        console.log('Fallback permissions data:', fallbackData)
        setPermissions(fallbackData)
      } else {
        setPermissions(permissionsData)
      }
      
      // Set currently assigned permissions
      const currentPermissionIds = ((rolePerms as any)?.data || [])
        .filter((p: any) => p.granted && p.status === 'active')
        .map((p: any) => p.id.toString())
      console.log('Current permission IDs:', currentPermissionIds)
      setSelectedPermissions(currentPermissionIds)
    } catch (error) {
      console.error('Failed to load permissions:', error)
      toast.error('Failed to load permissions')
      setPermissions([])
      setSelectedPermissions([])
    } finally {
      setLoadingPermissions(false)
    }
  }

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const toggleCategory = (category: string) => {
    const categoryPermissions = permissions.filter(p => (p.category || 'uncategorized') === category)
    const categoryPermissionIds = categoryPermissions.map(p => p.id.toString())
    const allSelected = categoryPermissionIds.every(id => selectedPermissions.includes(id))
    
    if (allSelected) {
      // Deselect all in category
      setSelectedPermissions(prev => 
        prev.filter(id => !categoryPermissionIds.includes(id))
      )
    } else {
      // Select all in category
      setSelectedPermissions(prev => [
        ...prev.filter(id => !categoryPermissionIds.includes(id)),
        ...categoryPermissionIds
      ])
    }
  }

  const savePermissions = async () => {
    if (!selectedRole) return
    
    setSaving(true)
    try {
      // Convert string IDs back to numbers for the backend
      const permissionIdsAsNumbers = selectedPermissions.map(id => Number(id))
      
      console.log('Saving permissions:', {
        role_id: selectedRole.id,
        permission_ids: permissionIdsAsNumbers,
        original_selected_permissions: selectedPermissions
      })
      
      await AccessControlService.assignRolePermissions({
        role_id: selectedRole.id,
        permission_ids: permissionIdsAsNumbers
      })
      toast.success('Permissions assigned successfully')
      await loadRoles() // Refresh the roles list
    } catch (error: any) {
      console.error('Failed to save permissions:', error)
      toast.error(error.message || 'Failed to save permissions')
    } finally {
      setSaving(false)
    }
  }

  const groupedPermissions = (permissions || []).reduce((acc, permission) => {
    const category = permission.category || 'uncategorized'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  const getCategorySelectedCount = (category: string) => {
    const categoryPermissionIds = (permissions || [])
      .filter(p => (p.category || 'uncategorized') === category)
      .map(p => p.id.toString())
    return categoryPermissionIds.filter(id => selectedPermissions.includes(id)).length
  }

  // Only allow super_admin to access this page
  if (user?.userType !== 'SUPER_ADMIN') {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Only Super Admin can access role permission assignments.</p>
          <Link href="/dashboard/access-control/roles">
            <Button className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Roles
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/access-control/roles">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Roles
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Role Permission Assignment</h1>
          <p className="text-muted-foreground">Manage permissions for each role</p>
        </div>
      </div>

      {/* Roles List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading roles...</span>
          </div>
        ) : roles.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No roles found</h3>
            <p className="text-muted-foreground">Create your first role to get started.</p>
          </div>
        ) : (
          roles.map((role) => (
            <Card 
              key={role.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedRole?.id === role.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => loadRolePermissions(role)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {role.display_name}
                </CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {role.permissionCount} permissions
                  </Badge>
                  {role.is_system_role && (
                    <Badge variant="secondary">System</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Permission Assignment */}
      {selectedRole && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Assign Permissions: {selectedRole.display_name}
            </CardTitle>
            <CardDescription>
              Select permissions for role: <strong>{selectedRole.display_name}</strong>
              <br />
              <span className="text-sm">
                Selected: {selectedPermissions.length} of {permissions.length} permissions
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPermissions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <div className="text-sm text-muted-foreground">Loading permissions...</div>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => {
                  const selectedCount = getCategorySelectedCount(category)
                  const totalCount = categoryPermissions.length
                  const isAllSelected = selectedCount === totalCount
                  
                  return (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                          {category}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {selectedCount}/{totalCount}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleCategory(category)}
                            className="h-7 px-2"
                          >
                            {isAllSelected ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Deselect All
                              </>
                            ) : (
                              'Select All'
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {categoryPermissions.map((permission) => (
                          <div 
                            key={permission.id} 
                            className="flex items-center space-x-3 p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              id={`perm-${permission.id}`}
                              checked={selectedPermissions.includes(permission.id.toString())}
                              onChange={() => togglePermission(permission.id.toString())}
                              className="rounded w-4 h-4"
                            />
                            <label 
                              htmlFor={`perm-${permission.id}`}
                              className="text-sm cursor-pointer flex-1 flex items-center justify-between"
                            >
                              <div>
                                <div className="font-medium font-mono">{permission.permission_key}</div>
                                <div className="text-muted-foreground text-xs">
                                  {permission.resource} • {permission.action}
                                </div>
                              </div>
                              {permission.is_system_permission && (
                                <Badge variant="secondary" className="text-xs">System</Badge>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
          <div className="px-6 pb-6">
            <div className="flex gap-2">
              <Button 
                onClick={savePermissions} 
                disabled={saving || loadingPermissions}
                className="min-w-[140px]"
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Permissions ({selectedPermissions.length})
              </Button>
              <Button variant="outline" onClick={() => setSelectedRole(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
