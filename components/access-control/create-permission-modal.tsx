'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AccessControlService } from '@/lib/services/access-control.service'
import { toast } from 'sonner'

const categories = [
  'reservations',
  'property', 
  'finance',
  'analytics',
  'administration',
  'guests',
  'staff',
  'inventory',
  'food_beverage',
  'housekeeping',
  'maintenance',
  'communications'
]

const actions = ['create', 'read', 'update', 'delete', 'export', 'manage', 'approve', 'reject']
const scopes = ['all', 'own', 'team', 'branch', 'firm']

interface CreatePermissionModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreatePermissionModal({ open, onClose, onSuccess }: CreatePermissionModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    permission_key: '',
    resource: '',
    action: '',
    description: '',
    category: '',
    scope: 'all',
    fields: ''
  })

  const generatePermissionKey = () => {
    if (formData.resource && formData.action) {
      const key = `${formData.resource}.${formData.action}`
      setFormData(prev => ({ ...prev, permission_key: key }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await AccessControlService.createPermission(formData)
      toast.success('Permission created successfully')
      onSuccess()
      onClose()
      setFormData({
        permission_key: '',
        resource: '',
        action: '',
        description: '',
        category: '',
        scope: 'all',
        fields: ''
      })
    } catch (error: any) {
      toast.error(error.message || 'Failed to create permission')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setFormData({
        permission_key: '',
        resource: '',
        action: '',
        description: '',
        category: '',
        scope: 'all',
        fields: ''
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Permission</DialogTitle>
          <DialogDescription>
            Create a new system permission for access control.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="resource">Resource</Label>
                <Input
                  id="resource"
                  value={formData.resource}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, resource: e.target.value }))
                    generatePermissionKey()
                  }}
                  placeholder="e.g., bookings, users"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="action">Action</Label>
                <Select value={formData.action} onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, action: value }))
                  generatePermissionKey()
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    {actions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="permission_key">Permission Key</Label>
              <Input
                id="permission_key"
                value={formData.permission_key}
                onChange={(e) => setFormData(prev => ({ ...prev, permission_key: e.target.value }))}
                placeholder="e.g., bookings.create"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="scope">Scope</Label>
                <Select value={formData.scope} onValueChange={(value) => setFormData(prev => ({ ...prev, scope: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    {scopes.map((scope) => (
                      <SelectItem key={scope} value={scope}>
                        {scope.charAt(0).toUpperCase() + scope.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this permission allows..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fields">Fields (Optional)</Label>
              <Input
                id="fields"
                value={formData.fields}
                onChange={(e) => setFormData(prev => ({ ...prev, fields: e.target.value }))}
                placeholder="e.g., id,name,email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Permission'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
