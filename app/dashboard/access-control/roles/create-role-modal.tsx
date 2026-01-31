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
import { AccessControlService, Role } from '@/lib/services/access-control.service'
import { authService } from '@/lib/services/auth.service'
import { toast } from 'sonner'
import { Loader2, Users, Shield, Copy } from 'lucide-react'

const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  display_name: z.string().min(1, 'Display name is required'),
  description: z.string().optional(),
  is_active: z.boolean(),
  tenant_id: z.number().optional(),
  is_system_role: z.boolean().optional(),
  is_default: z.boolean().optional(),
})

type RoleFormData = z.infer<typeof roleSchema>

interface CreateRoleModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  role?: Role | null
}

export function CreateRoleModal({ open, onClose, onSuccess, role }: CreateRoleModalProps) {
  const [loading, setLoading] = useState(false)
  const [isCloneMode, setIsCloneMode] = useState(false)
  const user = authService.getUser()
  const isEditMode = !!role?.id

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      display_name: '',
      description: '',
      is_active: true,
      tenant_id: user?.tenantId || undefined,
      is_system_role: false,
      is_default: false,
    },
  })

  useEffect(() => {
    if (open) {
      if (role) {
        if (isCloneMode) {
          // Clone mode - reset with new names
          form.reset({
            name: `${role.name}_copy`,
            display_name: `${role.display_name} (Copy)`,
            description: role.description || '',
            tenant_id: role.tenant_id ? Number(role.tenant_id) : undefined,
            is_system_role: false,
            is_default: false,
          })
        } else {
          // Edit mode - populate with existing data
          form.reset({
            name: role.name,
            display_name: role.display_name,
            description: role.description || '',
            tenant_id: role.tenant_id ? Number(role.tenant_id) : undefined,
            is_system_role: role.is_system_role,
            is_default: role.is_default,
            is_active: role.is_visible_to_all,
          })
        }
      } else {
        // Create mode
        form.reset({
          name: '',
          display_name: '',
          description: '',
          is_active: true,
          tenant_id: user?.tenantId || undefined,
          is_system_role: false,
          is_default: false,
        })
      }
    }
  }, [role, form, open, isCloneMode, user])

  const onSubmit = async (data: RoleFormData) => {
    setLoading(true)
    try {
      if (isEditMode && !isCloneMode) {
        // Update existing role
        await AccessControlService.updateRole({
          id: role!.id,
          ...data,
          tenant_id: data.tenant_id?.toString(),
          is_visible_to_all: data.is_active,
        })
        toast.success('Role updated successfully')
      } else if (isCloneMode && role) {
        // Clone role
        await AccessControlService.cloneRole({
          source_role_id: role.id,
          new_name: data.name,
          new_display_name: data.display_name,
          new_description: data.description,
        })
        toast.success('Role cloned successfully')
      } else {
        // Create new role
        await AccessControlService.createRole({
          ...data,
          tenant_id: data.tenant_id?.toString(),
          is_visible_to_all: data.is_active,
        })
        toast.success('Role created successfully')
      }
      
      onSuccess()
      onClose()
      form.reset()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save role')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setIsCloneMode(false)
      form.reset()
    }
  }

  const getDialogTitle = () => {
    if (isCloneMode) return 'Clone Role'
    if (isEditMode) return 'Edit Role'
    return 'Create New Role'
  }

  const getSubmitButtonText = () => {
    if (loading) return 'Saving...'
    if (isCloneMode) return 'Clone Role'
    if (isEditMode) return 'Update Role'
    return 'Create Role'
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCloneMode ? <Copy className="w-5 h-5" /> : <Users className="w-5 h-5" />}
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription>
            {isCloneMode 
              ? `Create a copy of role: ${role?.display_name}`
              : isEditMode
              ? 'Update role information and settings.'
              : 'Create a new role with specific permissions for your organization.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {role && !isCloneMode && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Shield className="w-4 h-4" />
            <div className="text-sm">
              <span className="font-medium">Role ID:</span> {role.id}
              {role.is_system_role && (
                <Badge variant="destructive" className="ml-2">System Role</Badge>
              )}
              {role.is_default && (
                <Badge variant="secondary" className="ml-2">Default</Badge>
              )}
            </div>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="e.g., receptionist"
                disabled={loading || (role?.is_system_role && !isCloneMode)}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                {...form.register('display_name')}
                placeholder="e.g., Hotel Receptionist"
                disabled={loading}
              />
              {form.formState.errors.display_name && (
                <p className="text-sm text-destructive">{form.formState.errors.display_name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Describe the role's responsibilities..."
                disabled={loading}
                rows={3}
              />
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

            {user?.userType === 'SUPER_ADMIN' && (
              <div className="grid gap-2">
                <Label htmlFor="tenant_id">Tenant (Optional)</Label>
                <Input
                  id="tenant_id"
                  type="number"
                  {...form.register('tenant_id', { valueAsNumber: true })}
                  placeholder="Leave empty for global role"
                  disabled={loading}
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            {role && !isEditMode && !isCloneMode && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCloneMode(true)}
                disabled={loading}
              >
                <Copy className="w-4 h-4 mr-2" />
                Clone Instead
              </Button>
            )}
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {getSubmitButtonText()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
