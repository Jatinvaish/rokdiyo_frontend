'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Combobox } from '@/components/ui/custom/combobox'
import {
  Lock,
  Key,
  Shield,
  Settings,
  CheckCircle2,
  Loader2,
  Info,
  Database,
  Target,
  Globe,
  Users,
  Building
} from 'lucide-react'
import { cn } from '@/lib/utils'

const categoryOptions = [
  { value: 'reservations', label: 'Reservations' },
  { value: 'property', label: 'Property Management' },
  { value: 'finance', label: 'Finance & Billing' },
  { value: 'analytics', label: 'Analytics & Reports' },
  { value: 'administration', label: 'Administration' },
  { value: 'guests', label: 'Guest Management' },
  { value: 'staff', label: 'Staff Management' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'food_beverage', label: 'Food & Beverage' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'communications', label: 'Communications' }
]

const actionOptions = [
  { value: 'create', label: 'Create' },
  { value: 'read', label: 'Read/View' },
  { value: 'update', label: 'Update/Edit' },
  { value: 'delete', label: 'Delete' },
  { value: 'export', label: 'Export' },
  { value: 'manage', label: 'Manage' },
  { value: 'approve', label: 'Approve' },
  { value: 'reject', label: 'Reject' }
]

const scopeOptions = [
  { value: 'all', label: 'All (Global)' },
  { value: 'own', label: 'Own Only' },
  { value: 'team', label: 'Team Only' },
  { value: 'branch', label: 'Branch Only' },
  { value: 'firm', label: 'Firm Only' }
]

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
      setFormData({
        permission_key: '',
        resource: '',
        action: '',
        description: '',
        category: '',
        scope: 'all',
        fields: ''
      })
      onClose()
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !loading) {
      setFormData({
        permission_key: '',
        resource: '',
        action: '',
        description: '',
        category: '',
        scope: 'all',
        fields: ''
      })
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-xl border-none shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Create New Permission
              </DialogTitle>
              <DialogDescription className="text-xs">Define granular access permissions for system resources and actions</DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 max-h-[500px] overflow-y-auto space-y-4">
            {/* Permission Details Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-4 w-1 bg-primary rounded-full" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/70">Permission Details</h4>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Permission Key</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input 
                    className="h-9 pl-7 font-mono" 
                    placeholder="e.g., rooms.create" 
                    value={formData.permission_key}
                    onChange={(e) => setFormData(prev => ({ ...prev, permission_key: e.target.value }))}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Resource</Label>
                <div className="relative">
                  <Database className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input 
                    className="h-9 pl-7" 
                    placeholder="e.g., rooms, bookings, users" 
                    value={formData.resource}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, resource: e.target.value }))
                      generatePermissionKey()
                    }}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Action</Label>
                <Combobox
                  options={actionOptions}
                  value={formData.action}
                  onChange={(val: string) => {
                    setFormData(prev => ({ ...prev, action: val }))
                    generatePermissionKey()
                  }}
                  placeholder="Select action"
                />
              </div>
            </div>

            {/* Configuration Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-4 w-1 bg-primary rounded-full" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/70">Configuration</h4>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Category</Label>
                <Combobox
                  options={categoryOptions}
                  value={formData.category}
                  onChange={(val: string) => setFormData(prev => ({ ...prev, category: val }))}
                  placeholder="Select category"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Scope</Label>
                <Combobox
                  options={scopeOptions}
                  value={formData.scope}
                  onChange={(val: string) => setFormData(prev => ({ ...prev, scope: val }))}
                  placeholder="Select scope"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Description</Label>
                <div className="relative">
                  <Info className="absolute left-3 top-3 h-3 w-3 text-muted-foreground" />
                  <Textarea
                    className="pl-7 min-h-[60px] resize-none"
                    placeholder="Describe what this permission allows users to do..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Additional Fields</Label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input 
                    className="h-9 pl-7" 
                    placeholder="e.g., department, level" 
                    value={formData.fields}
                    onChange={(e) => setFormData(prev => ({ ...prev, fields: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-muted/30 border-t border-primary/5 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={loading} className="h-9 px-4 font-bold uppercase text-[10px] tracking-widest border-muted-foreground/20">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="flex-1 h-9 px-4 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">
              {loading ? (
                <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Creating Permission</>
              ) : (
                <><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Create Permission</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
