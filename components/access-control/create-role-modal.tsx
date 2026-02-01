'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
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
  Shield,
  Users,
  Settings,
  CheckCircle2,
  Loader2,
  Info,
  UserCheck,
  Crown,
  Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreateRoleModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateRoleModal({ open, onClose, onSuccess }: CreateRoleModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    role_type: 'custom',
    is_active: true
  })

  const roleTypeOptions = [
    { value: 'custom', label: 'Custom Role' },
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'staff', label: 'Staff Member' },
    { value: 'tenant', label: 'Tenant Admin' },
    { value: 'guest', label: 'Guest Access' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await AccessControlService.createRole(formData)
      toast.success('Role created successfully')
      onSuccess()
      onClose()
      setFormData({ name: '', display_name: '', description: '', role_type: 'custom', is_active: true })
    } catch (error: any) {
      toast.error(error.message || 'Failed to create role')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: '', display_name: '', description: '', role_type: 'custom', is_active: true })
      onClose()
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !loading) {
      setFormData({ name: '', display_name: '', description: '', role_type: 'custom', is_active: true })
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
                <Shield className="w-4 h-4 text-primary" />
                Create New Role
              </DialogTitle>
              <DialogDescription className="text-xs">Define user roles with specific permissions and access levels</DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 max-h-[500px] overflow-y-auto space-y-4">
            {/* Basic Information Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-4 w-1 bg-primary rounded-full" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/70">Basic Information</h4>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Role Name *</Label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input 
                    className="h-9 pl-7 font-mono" 
                    placeholder="e.g., receptionist" 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Display Name *</Label>
                <div className="relative">
                  <Crown className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input 
                    className="h-9 pl-7" 
                    placeholder="e.g., Hotel Receptionist" 
                    value={formData.display_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Role Type</Label>
                <Combobox
                  options={roleTypeOptions}
                  value={formData.role_type}
                  onChange={(val: string) => setFormData(prev => ({ ...prev, role_type: val }))}
                  placeholder="Select role type"
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
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Description</Label>
                <div className="relative">
                  <Info className="absolute left-3 top-3 h-3 w-3 text-muted-foreground" />
                  <Textarea
                    className="pl-7 min-h-[60px] resize-none"
                    placeholder="Describe the role's responsibilities and access level..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/5">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs font-bold">Active Status</p>
                    <p className="text-[9px] text-muted-foreground">Enable this role for assignment</p>
                  </div>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-muted/30 border-t border-primary/5 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={loading} className="h-9 px-4 font-bold uppercase text-[10px] tracking-widest border-muted-foreground/20">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="flex-1 h-9 px-4 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">
              {loading ? (
                <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Creating Role</>
              ) : (
                <><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Create Role</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
