'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { 
  CreditCard, 
  Settings, 
  Users, 
  Shield, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Download,
  RefreshCcw,
  ArrowRight,
  Zap,
  Crown,
  Building,
  BookOpen
} from 'lucide-react'
import { toast } from 'sonner'
import DynamicSummaryCards, { SummaryCardData } from '@/components/dynamicSummaryCard'
import { CommonLoading } from '@/components/ui/common-loading'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SubscriptionService, SubscriptionPlan } from '@/lib/services/subscription.service'
import { PermissionGuard, usePermissions } from '@/hooks/usePermissions'
import { CreatePlanModal } from './create-plan-modal'
import { CreateFeatureModal } from './create-feature-modal'
import { AssignFeaturePermissionsModal } from './assign-feature-permissions-modal'

export default function SubscriptionManagementPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [createPlanModalOpen, setCreatePlanModalOpen] = useState(false)
  const [createFeatureModalOpen, setCreateFeatureModalOpen] = useState(false)
  const [assignPermissionsModalOpen, setAssignPermissionsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [loadDataTimer, setLoadDataTimer] = useState<any>(null)
  const { hasPermission } = usePermissions()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (search.length > 0 || plans.length > 0) {
      if (loadDataTimer) clearTimeout(loadDataTimer)
      const timer = setTimeout(() => {
        loadData(search)
      }, 500)
      setLoadDataTimer(timer)
      return () => clearTimeout(timer)
    }
  }, [search])

  const loadData = async (searchQuery?: string) => {
    if (plans.length > 0) setRefreshing(true)
    try {
      const plansData = await SubscriptionService.getPlans()
      setPlans(plansData || [])
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load subscription data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const stats = {
    totalPlans: plans.length,
    activePlans: plans.filter(p => p.is_active).length,
    freePlans: plans.filter(p => p.is_free).length,
    paidPlans: plans.filter(p => !p.is_free).length
  }

  const summaryCards: SummaryCardData[] = [
    {
      title: "Total Plans",
      value: stats.totalPlans,
      changeValue: 0,
      icon: "creditCard",
      bgColor: "indigo",
      changeLabel: "Available plans"
    },
    {
      title: "Active Plans",
      value: stats.activePlans,
      changeValue: Math.round((stats.activePlans / stats.totalPlans) * 100) || 0,
      icon: "checkCircle",
      bgColor: "green",
      suffix: "",
      changeLabel: "% of total"
    },
    {
      title: "Free Plans",
      value: stats.freePlans,
      changeValue: 0,
      icon: "trendingUp",
      bgColor: "yellow",
      changeLabel: "No cost"
    },
    {
      title: "Paid Plans",
      value: stats.paidPlans,
      changeValue: 0,
      icon: "calendar",
      bgColor: "purple",
      changeLabel: "Premium"
    }
  ]

  const getPlanConfig = (plan: SubscriptionPlan) => {
    if (plan.is_free) {
      return {
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <Zap className="w-3 h-3" />,
        label: 'Free'
      }
    }
    if (plan.is_default) {
      return {
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: <Crown className="w-3 h-3" />,
        label: 'Default'
      }
    }
    if (plan.is_active) {
      return {
        color: 'bg-purple-50 text-purple-700 border-purple-200',
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

  const handleCreatePlan = () => {
    setCreatePlanModalOpen(true)
  }

  const handleCreateFeature = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setCreateFeatureModalOpen(true)
  }

  const handleAssignPermissions = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setAssignPermissionsModalOpen(true)
  }

  const handleEditPlan = (plan: SubscriptionPlan) => {
    // Implement edit plan functionality
    console.log('Edit plan:', plan)
  }

  const handleDeletePlan = async (plan: SubscriptionPlan) => {
    if (!confirm(`Are you sure you want to delete plan "${plan.plan_name}"?`)) return
    
    try {
      await SubscriptionService.deletePlan(plan.id)
      toast.success('Plan deleted successfully')
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete plan')
    }
  }

  if (loading && plans.length === 0) {
    return <CommonLoading message="Loading subscription management..." />
  }

  return (
    <PermissionGuard permission="subscription_plans.read">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold tracking-tight">Subscription Management</h1>
            <p className="text-muted-foreground text-xs flex items-center gap-2">
              Manage subscription plans and feature permissions
              <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/40"></span>
              Last sync: {new Date().toLocaleTimeString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PermissionGuard permission="subscription_plans.create">
              <Button onClick={handleCreatePlan} className="h-9">
                <Plus className="w-3.5 h-3.5 mr-2" />
                Create Plan
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
              placeholder="Search plans..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="bg-transparent text-sm"
            />
          </InputGroup>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="plans" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Plans
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Permissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Subscription Plans</CardTitle>
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
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{plan.plan_name}</h3>
                            <p className="text-sm text-muted-foreground">{plan.plan_type}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-medium">
                                ${plan.price_monthly}/mo
                              </span>
                              {plan.price_yearly && (
                                <span className="text-xs text-muted-foreground">
                                  or ${plan.price_yearly}/yr
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getPlanConfig(plan).color}>
                          {getPlanConfig(plan).icon}
                          <span className="ml-1">{getPlanConfig(plan).label}</span>
                        </Badge>
                        
                        <div className="text-sm text-muted-foreground">
                          {plan.max_staff} staff • {plan.max_rooms} rooms
                        </div>
                        
                        <PermissionGuard permission="subscription_features.create">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCreateFeature(plan)}
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Feature
                          </Button>
                        </PermissionGuard>
                        
                        <PermissionGuard permission="subscription_features.update">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAssignPermissions(plan)}
                          >
                            <Shield className="w-3.5 h-3.5 mr-1" />
                            Permissions
                          </Button>
                        </PermissionGuard>
                        
                        <PermissionGuard permission="subscription_plans.update">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPlan(plan)}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </PermissionGuard>
                        
                        <PermissionGuard permission="subscription_plans.delete">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePlan(plan)}
                            disabled={plan.is_default}
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

          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feature Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a plan to manage its features...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feature Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a plan to manage its permissions...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <CreatePlanModal
        open={createPlanModalOpen}
        onClose={() => setCreatePlanModalOpen(false)}
        onSuccess={() => loadData()}
      />

      <CreateFeatureModal
        open={createFeatureModalOpen}
        onClose={() => setCreateFeatureModalOpen(false)}
        planId={selectedPlan?.id}
        onSuccess={() => loadData()}
      />

      <AssignFeaturePermissionsModal
        open={assignPermissionsModalOpen}
        onClose={() => setAssignPermissionsModalOpen(false)}
        planId={selectedPlan?.id}
        onSuccess={() => loadData()}
      />
    </PermissionGuard>
  )
}
