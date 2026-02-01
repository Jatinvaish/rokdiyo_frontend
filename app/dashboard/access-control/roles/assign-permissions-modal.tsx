'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SubscriptionService } from '@/lib/services/subscription.service'
import { toast } from 'sonner'
import { Loader2, Shield, CheckCircle } from 'lucide-react'
import AccessControlService from '@/lib/services/access-control.service'
import { Role, Permission } from '@/lib/types/rbac'
import { useAuthStore } from '@/lib/store/auth.store'

interface AssignPermissionsModalProps {
  open: boolean
  onClose: () => void
  role: Role | null
  onSuccess: () => void
}

export function AssignPermissionsModal({ open, onClose, role, onSuccess }: AssignPermissionsModalProps) {
  const [loading, setLoading] = useState(false)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [loadingPermissions, setLoadingPermissions] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    if (open && role) {
      loadPermissions()
    }
  }, [open, role])

  const loadPermissions = async () => {
    setLoadingPermissions(true)
    try {
      console.log('Loading permissions for role:', role?.id)
      
      // Get subscription-based permissions for tenant users
      let subscriptionPerms
      try {
        if (user?.userType === 'SUPER_ADMIN') {
          // For super admin, get all permissions
          subscriptionPerms = await AccessControlService.getPermissions({ include_system_permissions: true })
          console.log('Super admin - all permissions response:', subscriptionPerms)
        } else if (user?.tenantId) {
          // For tenant users, get permissions based on subscription + role
          subscriptionPerms = await AccessControlService.getUserPermissionsWithSubscription(user.id)
          console.log('Tenant user - subscription permissions response:', subscriptionPerms)
        } else {
          // Fallback to regular permissions
          subscriptionPerms = await AccessControlService.getPermissions({ include_system_permissions: true })
          console.log('Fallback - all permissions response:', subscriptionPerms)
        }
      } catch (subError) {
        console.log('Subscription permissions failed, trying regular permissions:', subError)
        subscriptionPerms = await AccessControlService.getPermissions({ include_system_permissions: true })
        console.log('Regular permissions response:', subscriptionPerms)
      }
      
      const rolePerms = await AccessControlService.getRolePermissions({
        role_id: role!.id,
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
      // Set empty array to prevent errors
      setPermissions([])
      setSelectedPermissions([])
    } finally {
      setLoadingPermissions(false)
    }
  }

  const handleSubmit = async () => {
    if (!role) return
    
    setLoading(true)
    try {
      // Convert string IDs back to numbers for the backend
      const permissionIdsAsNumbers = selectedPermissions.map(id => Number(id))
      
      console.log('Submitting permissions:', {
        role_id: role.id,
        permission_ids: permissionIdsAsNumbers,
        original_selected_permissions: selectedPermissions
      })
      
      await AccessControlService.assignRolePermissions({
        role_id: role.id,
        permission_ids: permissionIdsAsNumbers
      })
      toast.success('Permissions assigned successfully')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to assign permissions:', error)
      toast.error(error.message || 'Failed to assign permissions')
    } finally {
      setLoading(false)
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
    const categoryPermissionIds = permissions
      .filter(p => p.category === category)
      .map(p => p.id.toString())
    
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

  const groupedPermissions = (permissions || []).reduce((acc, permission) => {
    const category = permission.category || 'uncategorized'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  const handleClose = () => {
    if (!loading) {
      onClose()
      setSelectedPermissions([])
    }
  }

  const getCategorySelectedCount = (category: string) => {
    const categoryPermissionIds = (permissions || [])
      .filter(p => (p.category || 'uncategorized') === category)
      .map(p => p.id.toString())
    return categoryPermissionIds.filter(id => selectedPermissions.includes(id)).length
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Assign Permissions
          </DialogTitle>
          <DialogDescription>
            Select permissions for role: <strong>{role?.display_name}</strong>
            <br />
            <span className="text-sm text-muted-foreground">
              Selected: {selectedPermissions.length} of {permissions.length} permissions
            </span>
          </DialogDescription>
        </DialogHeader>
        
        {loadingPermissions ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <div className="text-sm text-muted-foreground">Loading permissions...</div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
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
                        <Label 
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
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || loadingPermissions}
            className="min-w-[140px]"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Assign Permissions ({selectedPermissions.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
