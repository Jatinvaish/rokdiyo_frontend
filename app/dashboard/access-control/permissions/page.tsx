'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { 
  Shield, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCcw,
  Settings,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { CommonLoading } from '@/components/ui/common-loading'
import { AccessControlService, Permission } from '@/lib/services/access-control.service'
import { PermissionGuard, usePermissions } from '@/hooks/usePermissions'
import { CreatePermissionModal } from './create-permission-modal'
import { useAuthStore } from '@/lib/store/auth.store'
import Link from 'next/link'

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [createPermissionModalOpen, setCreatePermissionModalOpen] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)
  const [loadDataTimer, setLoadDataTimer] = useState<any>(null)
  const { hasPermission } = usePermissions()
  const { user } = useAuthStore()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (search.length > 0 || selectedCategory) {
      if (loadDataTimer) clearTimeout(loadDataTimer)
      const timer = setTimeout(() => {
        loadData(search, selectedCategory)
      }, 500)
      setLoadDataTimer(timer)
      return () => clearTimeout(timer)
    } else {
      loadData()
    }
  }, [search, selectedCategory])

  const loadData = async (searchQuery?: string, category?: string) => {
    if (permissions.length > 0) setRefreshing(true)
    try {
      const response = await AccessControlService.getPermissions({ 
        search: searchQuery, 
        category,
        include_system_permissions: true 
      })
      setPermissions(response.data || [])
    } catch (error) {
      console.error('Failed to load permissions:', error)
      toast.error('Failed to load permissions')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getStatusConfig = (permission: Permission) => {
    if (permission.is_system_permission) {
      return {
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: <Shield className="w-3 h-3" />,
        label: 'System'
      }
    }
    return {
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: 'Custom'
    }
  }

  const handleCreatePermission = () => {
    setSelectedPermission(null)
    setCreatePermissionModalOpen(true)
  }

  const handleEditPermission = (permission: Permission) => {
    setSelectedPermission(permission)
    setCreatePermissionModalOpen(true)
  }

  const handleDeletePermission = async (permission: Permission) => {
    if (!confirm(`Are you sure you want to delete permission "${permission.permission_key}"?`)) return
    
    try {
      await AccessControlService.deletePermission(permission.id)
      toast.success('Permission deleted successfully')
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete permission')
    }
  }

  const categories = Array.from(new Set(permissions.map(p => p.category))).filter(Boolean)

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = !search || 
      permission.permission_key.toLowerCase().includes(search.toLowerCase()) ||
      permission.resource.toLowerCase().includes(search.toLowerCase()) ||
      permission.action.toLowerCase().includes(search.toLowerCase())
    
    const matchesCategory = !selectedCategory || permission.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return <CommonLoading message="Loading permissions..." />
  }

  // Only allow super_admin to access this page
  if (user?.userType !== 'SUPER_ADMIN') {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Only Super Admin can access permission management.</p>
          <Link href="/dashboard/access-control">
            <Button className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Access Control
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <PermissionGuard permission="permissions.read">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold tracking-tight">Permissions Management</h1>
            <p className="text-muted-foreground text-xs flex items-center gap-2">
              Manage system permissions and access controls
              <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/40"></span>
              Last sync: {new Date().toLocaleTimeString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PermissionGuard permission="permissions.create">
              <Button onClick={handleCreatePermission} className="h-9">
                <Plus className="w-3.5 h-3.5 mr-2" />
                Create Permission
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group flex-1 min-w-60">
            <InputGroup className="border-muted/30 h-9">
              <InputGroupAddon>
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search permissions..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="bg-transparent text-sm"
              />
            </InputGroup>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Permissions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Permissions</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {filteredPermissions.length} of {permissions.length}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadData()}
                  disabled={refreshing}
                >
                  <RefreshCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredPermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold font-mono text-sm">{permission.permission_key}</h3>
                        <p className="text-sm text-muted-foreground">
                          {permission.resource} • {permission.action}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {permission.category}
                          </Badge>
                          {permission.scope && (
                            <Badge variant="secondary" className="text-xs">
                              {permission.scope}
                            </Badge>
                          )}
                          <p className="text-xs text-muted-foreground">
                            ID: {permission.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusConfig(permission).color}>
                      {getStatusConfig(permission).icon}
                      <span className="ml-1">{getStatusConfig(permission).label}</span>
                    </Badge>
                    
                    <PermissionGuard permission="permissions.update">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPermission(permission)}
                        disabled={permission.is_system_permission}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </PermissionGuard>
                    
                    <PermissionGuard permission="permissions.delete">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePermission(permission)}
                        disabled={permission.is_system_permission}
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

      {/* Modal */}
      <CreatePermissionModal
        open={createPermissionModalOpen}
        onClose={() => setCreatePermissionModalOpen(false)}
        onSuccess={() => loadData()}
        permission={selectedPermission}
      />
    </PermissionGuard>
  )
}
