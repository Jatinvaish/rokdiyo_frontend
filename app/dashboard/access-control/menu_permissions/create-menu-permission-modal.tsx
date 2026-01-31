'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Badge } from '@/components/ui/badge'
import { AccessControlService } from '@/lib/services/access-control.service'
import { MasterService } from '@/lib/services/master.service'
import { authService } from '@/lib/services/auth.service'
import { toast } from 'sonner'
import { Loader2, Menu, Settings } from 'lucide-react'

const menuPermissionSchema = z.object({
  menu_key: z.string().min(1, 'Menu key is required'),
  menu_name: z.string().min(1, 'Menu name is required'),
  parent_menu_key: z.string().optional(),
  permission_ids: z.string().optional(),
  match_type: z.string().min(1, 'Match type is required'),
  display_order: z.number().min(0, 'Display order is required'),
  icon: z.string().optional(),
  route: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
  is_active: z.boolean(),
  tenant_id: z.number().optional(),
  firm_id: z.number().optional(),
  branch_id: z.number().optional(),
})

type MenuPermissionFormData = z.infer<typeof menuPermissionSchema>

interface CreateMenuPermissionModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  menuPermission?: any
}

export function CreateMenuPermissionModal({ open, onClose, onSuccess, menuPermission }: CreateMenuPermissionModalProps) {
  const [loading, setLoading] = useState(false)
  const [firms, setFirms] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const isEditMode = !!menuPermission?.id
  const user = authService.getUser()

  const form = useForm<MenuPermissionFormData>({
    resolver: zodResolver(menuPermissionSchema),
    defaultValues: {
      menu_key: '',
      menu_name: '',
      parent_menu_key: '',
      permission_ids: '',
      match_type: 'any',
      display_order: 0,
      icon: '',
      route: '',
      status: 'active',
      is_active: true,
      tenant_id: user?.tenantId || undefined,
      firm_id: user?.firmId || undefined,
      branch_id: user?.branchId || undefined,
    },
  })

  useEffect(() => {
    if (open && user?.tenantId) {
      loadFirms()
      if (user?.firmId) {
        loadBranches(user.firmId)
      }
    }
  }, [open, user])

  useEffect(() => {
    if (open) {
      if (menuPermission) {
        form.reset({
          menu_key: menuPermission.menu_key,
          menu_name: menuPermission.menu_name,
          parent_menu_key: menuPermission.parent_menu_key || '',
          permission_ids: menuPermission.permission_ids || '',
          match_type: menuPermission.match_type,
          display_order: menuPermission.display_order,
          icon: menuPermission.icon || '',
          route: menuPermission.route || '',
          status: menuPermission.status,
          is_active: menuPermission.is_active,
          tenant_id: menuPermission.tenant_id || undefined,
          firm_id: menuPermission.firm_id || undefined,
          branch_id: menuPermission.branch_id || undefined,
        })
        
        // Load branches if firm is selected
        if (menuPermission.firm_id) {
          loadBranches(menuPermission.firm_id)
        }
      } else {
        form.reset({
          menu_key: '',
          menu_name: '',
          parent_menu_key: '',
          permission_ids: '',
          match_type: 'any',
          display_order: 0,
          icon: '',
          route: '',
          status: 'active',
          is_active: true,
          tenant_id: user?.tenantId || undefined,
          firm_id: user?.firmId || undefined,
          branch_id: user?.branchId || undefined,
        })
      }
    }
  }, [menuPermission, form, open, user])

  const loadFirms = async () => {
    try {
      const firmsData = await MasterService.getFirmsByTenant(user?.tenantId || undefined)
      setFirms(firmsData || [])
    } catch (error) {
      console.error('Failed to load firms:', error)
    }
  }

  const loadBranches = async (firmId: number) => {
    try {
      const branchesData = await MasterService.getBranchesByFirm(firmId)
      setBranches(branchesData || [])
    } catch (error) {
      console.error('Failed to load branches:', error)
    }
  }

  const handleFirmChange = (firmId: string) => {
    const id = parseInt(firmId)
    form.setValue('firm_id', id)
    form.setValue('branch_id', undefined) // Reset branch when firm changes
    setBranches([])
    
    if (id) {
      loadBranches(id)
    }
  }

  const onSubmit = async (data: MenuPermissionFormData) => {
    setLoading(true)
    try {
      if (isEditMode) {
        await AccessControlService.updateMenuPermission({
          id: menuPermission!.id,
          ...data,
        })
        toast.success('Menu permission updated successfully')
      } else {
        await AccessControlService.createMenuPermission(data)
        toast.success('Menu permission created successfully')
      }
      
      onSuccess()
      onClose()
      form.reset()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save menu permission')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      form.reset()
      setBranches([])
    }
  }

  const matchTypes = ['any', 'all', 'none']
  const statuses = ['active', 'inactive']
  const commonIcons = ['dashboard', 'calendar', 'users', 'bed', 'chart', 'dollar', 'settings', 'menu', 'home', 'file-text', 'package', 'truck']

  // Auto-select logic
  const shouldAutoSelectFirm = firms.length === 1 && !user?.firmId
  const shouldAutoSelectBranch = branches.length === 1 && !user?.branchId

  useEffect(() => {
    if (shouldAutoSelectFirm && firms[0]) {
      form.setValue('firm_id', firms[0].id)
      loadBranches(firms[0].id)
    }
  }, [firms, shouldAutoSelectFirm, form])

  useEffect(() => {
    if (shouldAutoSelectBranch && branches[0]) {
      form.setValue('branch_id', branches[0].id)
    }
  }, [branches, shouldAutoSelectBranch, form])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Menu className="w-5 h-5" />
            {isEditMode ? 'Edit Menu Permission' : 'Create Menu Permission'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update menu access control settings.'
              : 'Create a new menu item with access control rules.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {menuPermission && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Settings className="w-4 h-4" />
            <div className="text-sm">
              <span className="font-medium">Menu Permission ID:</span> {menuPermission.id}
            </div>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="menu_key">Menu Key *</Label>
              <Input
                id="menu_key"
                {...form.register('menu_key')}
                placeholder="e.g., dashboard, bookings"
                disabled={loading}
              />
              {form.formState.errors.menu_key && (
                <p className="text-sm text-destructive">{form.formState.errors.menu_key.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="menu_name">Menu Name *</Label>
              <Input
                id="menu_name"
                {...form.register('menu_name')}
                placeholder="e.g., Dashboard, Bookings"
                disabled={loading}
              />
              {form.formState.errors.menu_name && (
                <p className="text-sm text-destructive">{form.formState.errors.menu_name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="match_type">Match Type *</Label>
              <Select 
                value={form.watch('match_type')} 
                onValueChange={(value) => form.setValue('match_type', value)}
              >
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
              <Label htmlFor="display_order">Display Order *</Label>
              <Input
                id="display_order"
                type="number"
                {...form.register('display_order', { valueAsNumber: true })}
                placeholder="0"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="icon">Icon</Label>
              <Select 
                value={form.watch('icon')} 
                onValueChange={(value) => form.setValue('icon', value)}
              >
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
              <Label htmlFor="status">Status *</Label>
              <Select 
                value={form.watch('status')} 
                onValueChange={(value) => form.setValue('status', value)}
              >
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
              {...form.register('route')}
              placeholder="e.g., /dashboard, /bookings"
              disabled={loading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="permission_ids">Required Permissions (Optional)</Label>
            <Input
              id="permission_ids"
              {...form.register('permission_ids')}
              placeholder="e.g., 1,2,3 (comma-separated permission IDs)"
              disabled={loading}
            />
          </div>

          {/* Firm and Branch Selection */}
          {user?.userType === 'SUPER_ADMIN' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tenant_id">Tenant (Optional)</Label>
                <Input
                  id="tenant_id"
                  type="number"
                  {...form.register('tenant_id', { valueAsNumber: true })}
                  placeholder="Leave empty for global"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firm_id">Firm</Label>
              <Select 
                value={form.watch('firm_id')?.toString() || ''} 
                onValueChange={handleFirmChange}
                disabled={loading || !!user?.firmId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select firm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No firm restriction</SelectItem>
                  {firms.map((firm) => (
                    <SelectItem key={firm.id} value={firm.id.toString()}>
                      {firm.firm_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {user?.firmId && (
                <p className="text-xs text-muted-foreground">
                  Auto-selected: {firms.find(f => f.id === user.firmId)?.firm_name}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="branch_id">Branch</Label>
              <Select 
                value={form.watch('branch_id')?.toString() || ''} 
                onValueChange={(value) => form.setValue('branch_id', parseInt(value) || undefined)}
                disabled={loading || !!user?.branchId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No branch restriction</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.branch_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {user?.branchId && (
                <p className="text-xs text-muted-foreground">
                  Auto-selected: {branches.find(b => b.id === user.branchId)?.branch_name}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={form.watch('is_active')}
              onCheckedChange={(checked) => form.setValue('is_active', checked)}
              disabled={loading}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditMode ? 'Update Menu Permission' : 'Create Menu Permission'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
