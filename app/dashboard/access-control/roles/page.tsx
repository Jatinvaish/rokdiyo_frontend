'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCcw,
  Shield
} from 'lucide-react'
import { toast } from 'sonner'
import { CommonLoading } from '@/components/ui/common-loading'
import { AccessControlService, Role } from '@/lib/services/access-control.service'
import { PermissionGuard, usePermissions } from '@/hooks/usePermissions'
import { CreateRoleModal } from './create-role-modal'
import { AssignPermissionsModal } from './assign-permissions-modal'

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [createRoleModalOpen, setCreateRoleModalOpen] = useState(false)
  const [assignPermissionsModalOpen, setAssignPermissionsModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [loadDataTimer, setLoadDataTimer] = useState<any>(null)
  const { hasPermission } = usePermissions()

  // Create a stable debounced function using useCallback
  const debouncedLoadData = useCallback(
    (searchQuery: string) => {
      if (loadDataTimer) clearTimeout(loadDataTimer)
      const timer = setTimeout(() => {
        loadData(searchQuery)
      }, 500)
      setLoadDataTimer(timer)
    },
    [loadDataTimer]
  )

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (search.length > 0) {
      debouncedLoadData(search)
    }
    return () => {
      if (loadDataTimer) clearTimeout(loadDataTimer)
    }
  }, [search, debouncedLoadData, loadDataTimer])

  const loadData = async (searchQuery?: string) => {
    if (roles.length > 0) setRefreshing(true)
    try {
      const response = await AccessControlService.getRoles({ search: searchQuery })
      // Ensure roles is always an array
      const rolesData = Array.isArray(response) ? response : []
      setRoles(rolesData)
    } catch (error) {
      console.error('Failed to load roles:', error)
      toast.error('Failed to load roles')
      setRoles([]) // Ensure roles is always an array even on error
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getStatusConfig = (role: Role) => {
    if (role.is_system_role) {
      return {
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: <Shield className="w-3 h-3" />,
        label: 'System'
      }
    }
    if (role.is_visible_to_all) {
      return {
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <CheckCircle2 className="w-3 h-3" />,
        label: 'Active'
      }
    }
    return {
      color: 'bg-slate-50 text-slate-700 border-slate-200',
      icon: <XCircle className="w-3 h-3" />,
      label: 'Inactive'
    }
  }

  const handleCreateRole = () => {
    setSelectedRole(null)
    setCreateRoleModalOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setCreateRoleModalOpen(true)
  }

  const handleCloneRole = (role: Role) => {
    setSelectedRole(role)
    // Clone functionality will be in the modal
    setCreateRoleModalOpen(true)
  }

  const handleDeleteRole = async (role: Role) => {
    if (!confirm(`Are you sure you want to delete role "${role.display_name}"?`)) return
    
    try {
      await AccessControlService.deleteRole(role.id)
      toast.success('Role deleted successfully')
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete role')
    }
  }

  const handleAssignPermissions = (role: Role) => {
    setSelectedRole(role)
    setAssignPermissionsModalOpen(true)
  }

  if (loading && roles.length === 0) {
    return <CommonLoading message="Loading roles..." />
  }

  return (
    <PermissionGuard permission="roles.read">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold tracking-tight">Roles Management</h1>
            <p className="text-muted-foreground text-xs flex items-center gap-2">
              Manage user roles and permissions
              <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/40"></span>
              Last sync: {new Date().toLocaleTimeString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PermissionGuard permission="roles.create">
              <Button onClick={handleCreateRole} className="h-9">
                <Plus className="w-3.5 h-3.5 mr-2" />
                Create Role
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group flex-1 min-w-60">
          <InputGroup className="border-muted/30 h-9">
            <InputGroupAddon>
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search roles..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="bg-transparent text-sm"
            />
          </InputGroup>
        </div>

        {/* Roles Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Roles</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadData()}
                disabled={refreshing}
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{role.display_name}</h3>
                        <p className="text-sm text-muted-foreground">{role.description || 'No description'}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {role.name} • ID: {role.id}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusConfig(role).color}>
                      {getStatusConfig(role).icon}
                      <span className="ml-1">{getStatusConfig(role).label}</span>
                    </Badge>
                    
                    <PermissionGuard permission="roles.update">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAssignPermissions(role)}
                      >
                        <Shield className="w-3.5 h-3.5 mr-1" />
                        Permissions
                      </Button>
                    </PermissionGuard>
                    
                    <PermissionGuard permission="roles.update">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRole(role)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </PermissionGuard>
                    
                    <PermissionGuard permission="roles.create">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCloneRole(role)}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </PermissionGuard>
                    
                    <PermissionGuard permission="roles.delete">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRole(role)}
                        disabled={role.is_system_role}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </PermissionGuard>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CreateRoleModal
        open={createRoleModalOpen}
        onClose={() => setCreateRoleModalOpen(false)}
        onSuccess={() => loadData()}
        role={selectedRole}
      />

      <AssignPermissionsModal
        open={assignPermissionsModalOpen}
        onClose={() => setAssignPermissionsModalOpen(false)}
        role={selectedRole}
        onSuccess={() => loadData()}
      />
    </PermissionGuard>
  )
}
