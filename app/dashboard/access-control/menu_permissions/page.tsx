'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { 
  Menu, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCcw,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'
import { CommonLoading } from '@/components/ui/common-loading'
import { AccessControlService } from '@/lib/services/access-control.service'
import { PermissionGuard, usePermissions } from '@/hooks/usePermissions'
import { CreateMenuPermissionModal } from './create-menu-permission-modal'

export default function MenuPermissionsPage() {
  const [menuPermissions, setMenuPermissions] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [createMenuPermissionModalOpen, setCreateMenuPermissionModalOpen] = useState(false)
  const [selectedMenuPermission, setSelectedMenuPermission] = useState<any>(null)
  const [loadDataTimer, setLoadDataTimer] = useState<any>(null)
  const { hasPermission } = usePermissions()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (search.length > 0 || menuPermissions.length > 0) {
      if (loadDataTimer) clearTimeout(loadDataTimer)
      const timer = setTimeout(() => {
        loadData(search)
      }, 500)
      setLoadDataTimer(timer)
      return () => clearTimeout(timer)
    }
  }, [search])

  const loadData = async (searchQuery?: string) => {
    if (menuPermissions.length > 0) setRefreshing(true)
    try {
      const response = await AccessControlService.getMenuPermissions({ 
        search: searchQuery,
        include_inactive: true 
      })
      setMenuPermissions(response.data || [])
    } catch (error) {
      console.error('Failed to load menu permissions:', error)
      toast.error('Failed to load menu permissions')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getStatusConfig = (menuPermission: any) => {
    if (menuPermission.status === 'active' && menuPermission.is_active) {
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

  const handleCreateMenuPermission = () => {
    setSelectedMenuPermission(null)
    setCreateMenuPermissionModalOpen(true)
  }

  const handleEditMenuPermission = (menuPermission: any) => {
    setSelectedMenuPermission(menuPermission)
    setCreateMenuPermissionModalOpen(true)
  }

  const handleDeleteMenuPermission = async (menuPermission: any) => {
    if (!confirm(`Are you sure you want to delete menu permission "${menuPermission.menu_name}"?`)) return
    
    try {
      await AccessControlService.deleteMenuPermission(menuPermission.id)
      toast.success('Menu permission deleted successfully')
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete menu permission')
    }
  }

  const filteredMenuPermissions = menuPermissions.filter(menuPermission => {
    const matchesSearch = !search || 
      menuPermission.menu_key.toLowerCase().includes(search.toLowerCase()) ||
      menuPermission.menu_name.toLowerCase().includes(search.toLowerCase()) ||
      menuPermission.route?.toLowerCase().includes(search.toLowerCase())
    
    return matchesSearch
  })

  if (loading && menuPermissions.length === 0) {
    return <CommonLoading message="Loading menu permissions..." />
  }

  return (
    <PermissionGuard permission="menu_permissions.read">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold tracking-tight">Menu Permissions Management</h1>
            <p className="text-muted-foreground text-xs flex items-center gap-2">
              Manage menu access control and navigation permissions
              <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/40"></span>
              Last sync: {new Date().toLocaleTimeString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PermissionGuard permission="menu_permissions.create">
              <Button onClick={handleCreateMenuPermission} className="h-9">
                <Plus className="w-3.5 h-3.5 mr-2" />
                Create Menu Permission
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
              placeholder="Search menu permissions..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="bg-transparent text-sm"
            />
          </InputGroup>
        </div>

        {/* Menu Permissions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Menu Permissions</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {filteredMenuPermissions.length} of {menuPermissions.length}
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
              {filteredMenuPermissions.map((menuPermission) => (
                <div
                  key={menuPermission.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-linear-to-br from-green-500 to-teal-600 flex items-center justify-center">
                        <Menu className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{menuPermission.menu_name}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{menuPermission.menu_key}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {menuPermission.route && (
                            <Badge variant="outline" className="text-xs">
                              {menuPermission.route}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {menuPermission.match_type}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            Order: {menuPermission.display_order}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusConfig(menuPermission).color}>
                      {getStatusConfig(menuPermission).icon}
                      <span className="ml-1">{getStatusConfig(menuPermission).label}</span>
                    </Badge>
                    
                    <PermissionGuard permission="menu_permissions.update">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditMenuPermission(menuPermission)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </PermissionGuard>
                    
                    <PermissionGuard permission="menu_permissions.delete">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMenuPermission(menuPermission)}
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
      <CreateMenuPermissionModal
        open={createMenuPermissionModalOpen}
        onClose={() => setCreateMenuPermissionModalOpen(false)}
        onSuccess={() => loadData()}
        menuPermission={selectedMenuPermission}
      />
    </PermissionGuard>
  )
}
