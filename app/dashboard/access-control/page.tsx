'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  Users, 
  Shield, 
  Menu, 
  Search, 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Download,
  RefreshCcw,
  ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'
import DynamicSummaryCards, { SummaryCardData } from '@/components/dynamicSummaryCard'
import { CommonLoading } from '@/components/ui/common-loading'
import { SubscriptionService } from '@/lib/services/subscription.service'
import { PermissionGuard, usePermissions } from '@/hooks/usePermissions'
import { CreateRoleModal } from '@/components/access-control/create-role-modal'
import { AssignPermissionsModal } from '@/components/access-control/assign-permissions-modal'
import { CreatePermissionModal } from '@/components/access-control/create-permission-modal'
import { MenuPermissionModal } from '@/components/access-control/menu-permission-modal'
import { AccessControlService } from '@/lib/services/access-control.service'
import { Role, Permission } from '@/lib/types/rbac'

export default function AccessControlPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [createRoleModalOpen, setCreateRoleModalOpen] = useState(false)
  const [createPermissionModalOpen, setCreatePermissionModalOpen] = useState(false)
  const [menuPermissionModalOpen, setMenuPermissionModalOpen] = useState(false)
  const [assignPermissionsModalOpen, setAssignPermissionsModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [loadDataTimer, setLoadDataTimer] = useState<any>(null)
  const { hasPermission } = usePermissions()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (search.length > 0) {
      if (loadDataTimer) clearTimeout(loadDataTimer)
      const timer = setTimeout(() => {
        loadData(search)
      }, 500)
      setLoadDataTimer(timer)
      return () => clearTimeout(timer)
    } else {
      loadData()
    }
  }, [search])

  const loadData = async (searchQuery?: string) => {
    if (!loading) setRefreshing(true)
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        AccessControlService.getRoles({ search: searchQuery }),
        SubscriptionService.getSubscriptionPermissions()
      ])
      setRoles(rolesResponse.data || [])
      setPermissions(Array.isArray(permissionsResponse) ? permissionsResponse : [])
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load access control data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const stats = {
    totalRoles: roles.length,
    activeRoles: roles.filter(r => r.is_visible_to_all).length,
    systemRoles: roles.filter(r => r.is_system_role).length,
    totalPermissions: permissions.length
  }

  const summaryCards: SummaryCardData[] = [
    {
      title: "Total Roles",
      value: stats.totalRoles,
      changeValue: 0,
      icon: "users",
      bgColor: "indigo",
      changeLabel: "Active roles"
    },
    {
      title: "Active Roles",
      value: stats.activeRoles,
      changeValue: Math.round((stats.activeRoles / stats.totalRoles) * 100) || 0,
      icon: "checkCircle",
      bgColor: "green",
      suffix: "",
      changeLabel: "% of total"
    },
    {
      title: "System Roles",
      value: stats.systemRoles,
      changeValue: 0,
      icon: "trendingUp",
      bgColor: "red",
      changeLabel: "Protected"
    },
    {
      title: "Permissions",
      value: stats.totalPermissions,
      changeValue: 0,
      icon: "clock",
      bgColor: "yellow",
      changeLabel: "Available"
    }
  ]

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
    setCreateRoleModalOpen(true)
  }

  const handleCreatePermission = () => {
    setCreatePermissionModalOpen(true)
  }

  const handleMenuPermission = () => {
    setMenuPermissionModalOpen(true)
  }

  const handleAssignPermissions = (role: Role) => {
    setSelectedRole(role)
    setAssignPermissionsModalOpen(true)
  }

  const handleEditRole = (role: Role) => {
    // Implement edit role functionality
    console.log('Edit role:', role)
  }

  const handleCloneRole = (role: Role) => {
    // Implement clone role functionality
    console.log('Clone role:', role)
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

  if (loading && roles.length === 0) {
    return <CommonLoading message="Loading access control..." />
  }

  return (
    <PermissionGuard permission="roles.read">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold tracking-tight">Access Control</h1>
            <p className="text-muted-foreground text-xs flex items-center gap-2">
              Manage roles, permissions, and access control
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
            <PermissionGuard permission="permissions.create">
              <Button onClick={handleCreatePermission} variant="outline" className="h-9">
                <Shield className="w-3.5 h-3.5 mr-2" />
                Add Permission
              </Button>
            </PermissionGuard>
            <PermissionGuard permission="menu_permissions.create">
              <Button onClick={handleMenuPermission} variant="outline" className="h-9">
                <Menu className="w-3.5 h-3.5 mr-2" />
                Menu Access
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Summary Cards */}
        <DynamicSummaryCards cards={summaryCards} />

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

        {/* Main Content */}
        <Tabs defaultValue="roles" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <Menu className="w-4 h-4" />
              Menu Access
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Roles Management</CardTitle>
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
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <h3 className="font-medium">{role.display_name}</h3>
                            <p className="text-sm text-muted-foreground">{role.description || 'No description'}</p>
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
                            <Shield className="w-3.5 h-3.5" />
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
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Permissions Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium font-mono text-sm">{permission.permission_key}</h3>
                          <p className="text-sm text-muted-foreground">
                            {permission.resource} - {permission.action}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{permission.category}</Badge>
                        {permission.is_system_permission && (
                          <Badge variant="secondary">System</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Menu Access Control</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Menu className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Menu access control features coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <CreateRoleModal
        open={createRoleModalOpen}
        onClose={() => setCreateRoleModalOpen(false)}
        onSuccess={() => loadData()}
      />

      <CreatePermissionModal
        open={createPermissionModalOpen}
        onClose={() => setCreatePermissionModalOpen(false)}
        onSuccess={() => loadData()}
      />

      <MenuPermissionModal
        open={menuPermissionModalOpen}
        onClose={() => setMenuPermissionModalOpen(false)}
        onSuccess={() => loadData()}
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
