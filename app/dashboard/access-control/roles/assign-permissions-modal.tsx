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

  useEffect(() => {
    if (open && role) {
      loadPermissions()
    }
  }, [open, role])

  const loadPermissions = async () => {
    setLoadingPermissions(true)
    try {
      const [subscriptionPerms, rolePerms] = await Promise.all([
        SubscriptionService.getSubscriptionPermissions(),
        AccessControlService.getRolePermissions({
          role_id: role!.id,
          include_subscription_permissions: true
        })
      ])
      
      setPermissions(subscriptionPerms || [])
      
      // Set currently assigned permissions
      const currentPermissionIds = (rolePerms.data || [])
        .filter((p: any) => p.granted && p.status === 'active')
        .map((p: any) => p.id.toString())
      setSelectedPermissions(currentPermissionIds)
    } catch (error) {
      console.error('Failed to load permissions:', error)
      toast.error('Failed to load permissions')
    } finally {
      setLoadingPermissions(false)
    }
  }

  const handleSubmit = async () => {
    if (!role) return
    
    setLoading(true)
    try {
      await AccessControlService.assignRolePermissions({
        role_id: role.id,
        permission_ids: selectedPermissions
      })
      toast.success('Permissions assigned successfully')
      onSuccess()
      onClose()
    } catch (error: any) {
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

  const groupedPermissions = permissions.reduce((acc, permission) => {
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
    const categoryPermissionIds = permissions
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
