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
import { AccessControlService } from '@/lib/services/access-control.service'
import { Role, Permission } from '@/lib/types/rbac'
import { SubscriptionService } from '@/lib/services/subscription.service'
import { toast } from 'sonner'

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
      
      setPermissions(subscriptionPerms)
      
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Permissions</DialogTitle>
          <DialogDescription>
            Select permissions for role: <strong>{role?.display_name}</strong>
          </DialogDescription>
        </DialogHeader>
        
        {loadingPermissions ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading permissions...</div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
              <div key={category} className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {category}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {categoryPermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`perm-${permission.id}`}
                        checked={selectedPermissions.includes(permission.id.toString())}
                        onChange={() => togglePermission(permission.id.toString())}
                        className="rounded"
                      />
                      <Label 
                        htmlFor={`perm-${permission.id}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        <div>
                          <div className="font-medium">{permission.permission_key}</div>
                          <div className="text-muted-foreground text-xs">
                            {permission.resource} - {permission.action}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || loadingPermissions}>
            {loading ? 'Assigning...' : `Assign Permissions (${selectedPermissions.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
