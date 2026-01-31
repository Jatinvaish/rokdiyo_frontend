'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Badge } from '@/components/ui/badge'
import { AccessControlService, Permission } from '@/lib/services/access-control.service'
import { toast } from 'sonner'
import { Loader2, Shield, Settings } from 'lucide-react'

const permissionSchema = z.object({
  permission_key: z.string().min(1, 'Permission key is required'),
  resource: z.string().min(1, 'Resource is required'),
  action: z.string().min(1, 'Action is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  scope: z.string().optional(),
  fields: z.string().optional(),
  is_system_permission: z.boolean().optional(),
})

type PermissionFormData = z.infer<typeof permissionSchema>

interface CreatePermissionModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  permission?: Permission | null
}

export function CreatePermissionModal({ open, onClose, onSuccess, permission }: CreatePermissionModalProps) {
  const [loading, setLoading] = useState(false)
  const isEditMode = !!permission?.id

  const form = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      permission_key: '',
      resource: '',
      action: '',
      description: '',
      category: '',
      scope: 'all',
      fields: '',
      is_system_permission: false,
    },
  })

  useEffect(() => {
    if (open) {
      if (permission) {
        form.reset({
          permission_key: permission.permission_key,
          resource: permission.resource,
          action: permission.action,
          description: permission.description || '',
          category: permission.category,
          scope: permission.scope || 'all',
          fields: permission.fields || '',
          is_system_permission: permission.is_system_permission,
        })
      } else {
        form.reset({
          permission_key: '',
          resource: '',
          action: '',
          description: '',
          category: '',
          scope: 'all',
          fields: '',
          is_system_permission: false,
        })
      }
    }
  }, [permission, form, open])

  const generatePermissionKey = () => {
    const resource = form.watch('resource')
    const action = form.watch('action')
    if (resource && action) {
      const key = `${resource}.${action}`
      form.setValue('permission_key', key)
    }
  }

  const onSubmit = async (data: PermissionFormData) => {
    setLoading(true)
    try {
      if (isEditMode) {
        await AccessControlService.updatePermission({
          id: permission!.id,
          ...data,
        })
        toast.success('Permission updated successfully')
      } else {
        await AccessControlService.createPermission(data)
        toast.success('Permission created successfully')
      }
      
      onSuccess()
      onClose()
      form.reset()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save permission')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      form.reset()
    }
  }

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
    'communications',
    'access_control',
    'subscription_management'
  ]

  const actions = ['create', 'read', 'update', 'delete', 'export', 'manage', 'approve', 'reject', 'list', 'assign']
  const scopes = ['all', 'own', 'team', 'branch', 'firm']

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {isEditMode ? 'Edit Permission' : 'Create New Permission'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Update permission settings and configuration.'
              : 'Create a new system permission for access control.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {permission && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Shield className="w-4 h-4" />
            <div className="text-sm">
              <span className="font-medium">Permission ID:</span> {permission.id}
              {permission.is_system_permission && (
                <Badge variant="destructive" className="ml-2">System Permission</Badge>
              )}
            </div>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="resource">Resource *</Label>
              <Select 
                value={form.watch('resource')} 
                onValueChange={(value) => {
                  form.setValue('resource', value)
                  generatePermissionKey()
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select resource" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.resource && (
                <p className="text-sm text-destructive">{form.formState.errors.resource.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="action">Action *</Label>
              <Select 
                value={form.watch('action')} 
                onValueChange={(value) => {
                  form.setValue('action', value)
                  generatePermissionKey()
                }}
              >
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
              {form.formState.errors.action && (
                <p className="text-sm text-destructive">{form.formState.errors.action.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="permission_key">Permission Key *</Label>
            <Input
              id="permission_key"
              {...form.register('permission_key')}
              placeholder="e.g., bookings.create"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Auto-generated from resource.action combination
            </p>
            {form.formState.errors.permission_key && (
              <p className="text-sm text-destructive">{form.formState.errors.permission_key.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={form.watch('category')} 
                onValueChange={(value) => form.setValue('category', value)}
              >
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
              {form.formState.errors.category && (
                <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="scope">Scope</Label>
              <Select 
                value={form.watch('scope')} 
                onValueChange={(value) => form.setValue('scope', value)}
              >
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
              {...form.register('description')}
              placeholder="Describe what this permission allows..."
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fields">Fields (Optional)</Label>
            <Input
              id="fields"
              {...form.register('fields')}
              placeholder="e.g., id,name,email (comma-separated)"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Specify which fields this permission applies to
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditMode ? 'Update Permission' : 'Create Permission'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
