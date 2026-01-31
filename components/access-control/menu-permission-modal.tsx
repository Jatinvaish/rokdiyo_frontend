'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { AccessControlService } from '@/lib/services/access-control.service'
import { toast } from 'sonner'

const matchTypes = ['any', 'all', 'none']
const statuses = ['active', 'inactive']
const commonIcons = ['dashboard', 'calendar', 'users', 'bed', 'chart', 'dollar', 'settings', 'menu', 'home', 'file-text', 'package', 'truck']

interface MenuPermissionModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function MenuPermissionModal({ open, onClose, onSuccess }: MenuPermissionModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    menu_key: '',
    menu_name: '',
    parent_menu_key: '',
    permission_ids: '',
    match_type: 'any',
    display_order: 0,
    icon: '',
    route: '',
    status: 'active',
    is_active: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await AccessControlService.createMenuPermission(formData)
      toast.success('Menu permission created successfully')
      onSuccess()
      onClose()
      setFormData({
        menu_key: '',
        menu_name: '',
        parent_menu_key: '',
        permission_ids: '',
        match_type: 'any',
        display_order: 0,
        icon: '',
        route: '',
        status: 'active',
        is_active: true
      })
    } catch (error: any) {
      toast.error(error.message || 'Failed to create menu permission')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setFormData({
        menu_key: '',
        menu_name: '',
        parent_menu_key: '',
        permission_ids: '',
        match_type: 'any',
        display_order: 0,
        icon: '',
        route: '',
        status: 'active',
        is_active: true
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Menu Permission</DialogTitle>
          <DialogDescription>
            Create a new menu item with access control rules.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="menu_key">Menu Key</Label>
                <Input
                  id="menu_key"
                  value={formData.menu_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, menu_key: e.target.value }))}
                  placeholder="e.g., dashboard, bookings"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="menu_name">Menu Name</Label>
                <Input
                  id="menu_name"
                  value={formData.menu_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, menu_name: e.target.value }))}
                  placeholder="e.g., Dashboard, Bookings"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="match_type">Match Type</Label>
                <Select value={formData.match_type} onValueChange={(value) => setFormData(prev => ({ ...prev, match_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select match type" />
                  </SelectTrigger>
                  <SelectContent>
                    {matchTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="icon">Icon</Label>
                <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No icon</SelectItem>
                    {commonIcons.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="route">Route (Optional)</Label>
              <Input
                id="route"
                value={formData.route}
                onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
                placeholder="e.g., /dashboard, /bookings"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="permission_ids">Required Permissions (Optional)</Label>
              <Input
                id="permission_ids"
                value={formData.permission_ids}
                onChange={(e) => setFormData(prev => ({ ...prev, permission_ids: e.target.value }))}
                placeholder="e.g., 1,2,3 (comma-separated permission IDs)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Menu Permission'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
