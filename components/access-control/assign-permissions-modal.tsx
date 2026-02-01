'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { Role, Permission } from '@/lib/types/rbac'
import { SubscriptionService } from '@/lib/services/subscription.service'
import { toast } from 'sonner'
import { Combobox } from '@/components/ui/custom/combobox'
import {
  Shield,
  Users,
  Key,
  CheckCircle2,
  Loader2,
  Info,
  Lock,
  Settings,
  Search,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AssignPermissionsModalProps {
  open: boolean
  onClose: () => void
  role: Role | null
  onSuccess: () => void
}

export function AssignPermissionsModal({ open, onClose, role, onSuccess }: AssignPermissionsModalProps) {
  const [loading, setLoading] = useState(false)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [loadingPermissions, setLoadingPermissions] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'reservations', label: 'Reservations' },
    { value: 'property', label: 'Property Management' },
    { value: 'finance', label: 'Finance & Billing' },
    { value: 'analytics', label: 'Analytics & Reports' },
    { value: 'administration', label: 'Administration' },
    { value: 'guests', label: 'Guest Management' },
    { value: 'staff', label: 'Staff Management' }
  ]

  useEffect(() => {
    if (open && role) {
      loadPermissions()
    }
  }, [open, role])

  const loadPermissions = async () => {
    setLoadingPermissions(true)
    try {
      const [subscriptionPerms, rolePerms] = await Promise.all([
        SubscriptionService.getSubscriptionPermissions(),
        AccessControlService.getRolePermissions({
          role_id: role!.id,
          include_subscription_permissions: true
        })
      ])
      
      setPermissions(subscriptionPerms)
      
      // Set currently assigned permissions
      const currentPermissionIds = (rolePerms.data || [])
        .filter((p: any) => p.granted && p.status === 'active')
        .map((p: any) => p.id.toString())
      setSelectedPermissions(currentPermissionIds)
    } catch (error) {
      console.error('Failed to load permissions:', error)
      toast.error('Failed to load permissions')
    } finally {
      setLoadingPermissions(false)
    }
  }

  const handleSubmit = async () => {
    if (!role) return
    
    setLoading(true)
    try {
      await AccessControlService.assignRolePermissions({
        role_id: role.id,
        permission_ids: selectedPermissions
      })
      toast.success('Permissions assigned successfully')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign permissions')
    } finally {
      setLoading(false)
    }
  }

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.permission_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || permission.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    const category = permission.category || 'uncategorized'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  const handleClose = () => {
    if (!loading) {
      setSelectedPermissions([])
      onClose()
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !loading) {
      setSelectedPermissions([])
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden rounded-xl border-none shadow-2xl">
        <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Assign Permissions
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure access permissions for role: <span className="font-bold">{role?.display_name}</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 max-h-[500px] overflow-y-auto space-y-4">
          {/* Filters Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-4 w-1 bg-primary rounded-full" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/70">Filters</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Category</Label>
                <Combobox
                  options={categoryOptions}
                  value={selectedCategory}
                  onChange={(val: string) => setSelectedCategory(val)}
                  placeholder="All categories"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <input
                    type="text"
                    className="w-full h-9 pl-7 pr-3 text-sm border rounded-md bg-background"
                    placeholder="Search permissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Permissions List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 bg-primary rounded-full" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/70">Permissions</h4>
              </div>
              <Badge variant="outline" className="text-xs">
                {selectedPermissions.length} selected
              </Badge>
            </div>

            {loadingPermissions ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading permissions...</div>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        {category}
                      </h5>
                    </div>
                    <div className="space-y-1">
                      {categoryPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-start gap-3 p-2 rounded-lg border bg-muted/20 hover:bg-muted/30 transition-colors">
                          <Checkbox
                            id={`perm-${permission.id}`}
                            checked={selectedPermissions.includes(permission.id.toString())}
                            onCheckedChange={() => togglePermission(permission.id.toString())}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <Label 
                              htmlFor={`perm-${permission.id}`}
                              className="text-xs font-medium cursor-pointer leading-tight"
                            >
                              {permission.permission_key}
                            </Label>
                            <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">
                              {permission.description || `${permission.resource} - ${permission.action}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/30 border-t border-primary/5 gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={loading} className="h-9 px-4 font-bold uppercase text-[10px] tracking-widest border-muted-foreground/20">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || loadingPermissions} className="flex-1 h-9 px-4 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">
            {loading ? (
              <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Assigning</>
            ) : (
              <><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Assign ({selectedPermissions.length})</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
