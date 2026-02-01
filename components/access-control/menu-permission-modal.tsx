'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
  Menu,
  Settings,
  CheckCircle2,
  Loader2,
  Info,
  Layout,
  Home,
  Calendar,
  Users,
  Bed,
  ChartBar,
  DollarSign,
  FileText,
  Package,
  Truck,
  Link
} from 'lucide-react'
import { cn } from '@/lib/utils'

const matchTypeOptions = [
  { value: 'any', label: 'Any Permission' },
  { value: 'all', label: 'All Permissions' },
  { value: 'none', label: 'No Permissions Required' }
]

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
]

const iconOptions = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'users', label: 'Users' },
  { value: 'bed', label: 'Bed/Rooms' },
  { value: 'chart', label: 'Charts' },
  { value: 'dollar', label: 'Dollar/Billing' },
  { value: 'settings', label: 'Settings' },
  { value: 'menu', label: 'Menu' },
  { value: 'home', label: 'Home' },
  { value: 'file-text', label: 'Documents' },
  { value: 'package', label: 'Package' },
  { value: 'truck', label: 'Truck/Delivery' }
]

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
      onClose()
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !loading) {
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
                <Menu className="w-4 h-4 text-primary" />
                Create Menu Permission
              </DialogTitle>
              <DialogDescription className="text-xs">Configure menu items with access control rules and permissions</DialogDescription>
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
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Menu Key *</Label>
                <div className="relative">
                  <Layout className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input 
                    className="h-9 pl-7 font-mono" 
                    placeholder="e.g., dashboard, rooms" 
                    value={formData.menu_key}
                    onChange={(e) => setFormData(prev => ({ ...prev, menu_key: e.target.value }))}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Menu Name *</Label>
                <div className="relative">
                  <Menu className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input 
                    className="h-9 pl-7" 
                    placeholder="e.g., Dashboard, Rooms" 
                    value={formData.menu_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, menu_name: e.target.value }))}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Parent Menu Key</Label>
                <div className="relative">
                  <Layout className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input 
                    className="h-9 pl-7" 
                    placeholder="e.g., dashboard, settings" 
                    value={formData.parent_menu_key}
                    onChange={(e) => setFormData(prev => ({ ...prev, parent_menu_key: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Configuration Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-4 w-1 bg-primary rounded-full" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/70">Configuration</h4>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Permission IDs</Label>
                <div className="relative">
                  <Settings className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input 
                    className="h-9 pl-7" 
                    placeholder="e.g., 1,2,3" 
                    value={formData.permission_ids}
                    onChange={(e) => setFormData(prev => ({ ...prev, permission_ids: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Match Type</Label>
                  <Combobox
                    options={matchTypeOptions}
                    value={formData.match_type}
                    onChange={(val: string) => setFormData(prev => ({ ...prev, match_type: val }))}
                    placeholder="Select match type"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Display Order</Label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full h-9 pl-3 pr-3 text-sm border rounded-md bg-background"
                      placeholder="0"
                      value={formData.display_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Icon</Label>
                  <Combobox
                    options={iconOptions}
                    value={formData.icon}
                    onChange={(val: string) => setFormData(prev => ({ ...prev, icon: val }))}
                    placeholder="Select icon"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Status</Label>
                  <Combobox
                    options={statusOptions}
                    value={formData.status}
                    onChange={(val: string) => setFormData(prev => ({ ...prev, status: val }))}
                    placeholder="Select status"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Route</Label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input 
                    className="h-9 pl-7" 
                    placeholder="e.g., /dashboard/rooms" 
                    value={formData.route}
                    onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/5">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs font-bold">Active Status</p>
                    <p className="text-[9px] text-muted-foreground">Enable this menu item</p>
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
                <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Creating</>
              ) : (
                <><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Create Menu</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
