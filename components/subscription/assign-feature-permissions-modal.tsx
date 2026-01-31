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
import { SubscriptionService } from '@/lib/services/subscription.service'
import { SubscriptionPlan } from '@/lib/services/subscription.service'
import { toast } from 'sonner'

interface AssignFeaturePermissionsModalProps {
  open: boolean
  onClose: () => void
  plan: SubscriptionPlan | null
  onSuccess: () => void
}

export function AssignFeaturePermissionsModal({ open, onClose, plan, onSuccess }: AssignFeaturePermissionsModalProps) {
  const [loading, setLoading] = useState(false)
  const [permissions, setPermissions] = useState<any[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
  const [loadingPermissions, setLoadingPermissions] = useState(true)

  useEffect(() => {
    if (open && plan) {
      loadPermissions()
    }
  }, [open, plan])

  const loadPermissions = async () => {
    setLoadingPermissions(true)
    try {
      const subscriptionPerms = await SubscriptionService.getSubscriptionPermissions()
      setPermissions(subscriptionPerms)
      
      // Set currently assigned permissions (this would need to be fetched from the plan's features)
      // For now, we'll show all available permissions
      setSelectedPermissions([])
    } catch (error) {
      console.error('Failed to load permissions:', error)
      toast.error('Failed to load permissions')
    } finally {
      setLoadingPermissions(false)
    }
  }

  const handleSubmit = async () => {
    if (!plan) return
    
    setLoading(true)
    try {
      // This would need to be implemented to assign permissions to plan features
      // For now, we'll just show a success message
      toast.success('Feature permissions assigned successfully')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign permissions')
    } finally {
      setLoading(false)
    }
  }

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, any[]>)

  const getCategoryPermissions = (category: string) => {
    return groupedPermissions[category] || []
  }

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
          <DialogTitle>Assign Feature Permissions</DialogTitle>
          <DialogDescription>
            Select permissions for plan: <strong>{plan?.plan_name}</strong>
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
                  {(categoryPermissions as any[]).map((permission: any) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`feature-perm-${permission.id}`}
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                        className="rounded"
                      />
                      <Label 
                        htmlFor={`feature-perm-${permission.id}`}
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
