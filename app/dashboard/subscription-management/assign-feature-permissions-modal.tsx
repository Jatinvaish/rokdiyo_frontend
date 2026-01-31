'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

interface AssignFeaturePermissionsModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  planId?: number
}

export function AssignFeaturePermissionsModal({ open, onClose, onSuccess, planId }: AssignFeaturePermissionsModalProps) {
  const [loading, setLoading] = useState(false)
  const [permissions, setPermissions] = useState<any[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
  const [features, setFeatures] = useState<any[]>([])
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null)

  useEffect(() => {
    if (open && planId) {
      loadPermissions()
      loadFeatures()
    }
  }, [open, planId])

  const loadPermissions = async () => {
    try {
      const permissionsData = await SubscriptionService.getEffectivePermissions()
      setPermissions(permissionsData || [])
    } catch (error) {
      console.error('Failed to load permissions:', error)
    }
  }

  const loadFeatures = async () => {
    if (!planId) return
    try {
      const featuresData = await SubscriptionService.getFeatures(planId)
      setFeatures(featuresData || [])
    } catch (error) {
      console.error('Failed to load features:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!planId || !selectedFeature) {
      toast.error('Plan and Feature selection are required')
      return
    }

    setLoading(true)

    try {
      await SubscriptionService.assignFeaturePermissions({
        subscription_id: planId,
        feature_id: selectedFeature,
        permission_ids: selectedPermissions
      })
      toast.success('Permissions assigned successfully')
      onSuccess()
      onClose()
      setSelectedPermissions([])
      setSelectedFeature(null)
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

  const toggleAllPermissions = () => {
    if (selectedPermissions.length === permissions.length) {
      setSelectedPermissions([])
    } else {
      setSelectedPermissions(permissions.map(p => p.id))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Permissions</DialogTitle>
          <DialogDescription>
            Select which permissions should be available for this subscription plan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <div className="grid gap-4 mb-4">
              <div className="grid gap-2">
                <Label>Select Feature</Label>
                <Select value={selectedFeature?.toString()} onValueChange={(value) => setSelectedFeature(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a feature" />
                  </SelectTrigger>
                  <SelectContent>
                    {features.map((feature) => (
                      <SelectItem key={feature.id} value={feature.id.toString()}>
                        {feature.name} - ₹{feature.feature_price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium">Permissions</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleAllPermissions}
                disabled={!selectedFeature}
              >
                {selectedPermissions.length === permissions.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{permission.permission_key}</div>
                    <div className="text-xs text-muted-foreground">
                      {permission.resource} • {permission.action}
                    </div>
                  </div>
                  <Switch
                    checked={selectedPermissions.includes(permission.id)}
                    onCheckedChange={() => togglePermission(permission.id)}
                    disabled={!selectedFeature}
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Assigning...' : 'Assign Permissions'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
