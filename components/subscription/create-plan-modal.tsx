'use client'

import React, { useState } from 'react'
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
import { SubscriptionService } from '@/lib/services/subscription.service'
import { toast } from 'sonner'

const planTypes = ['free', 'basic', 'standard', 'premium', 'enterprise']
const billingCycles = ['monthly', 'yearly']

interface CreatePlanModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreatePlanModal({ open, onClose, onSuccess }: CreatePlanModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    plan_name: '',
    plan_slug: '',
    plan_type: 'basic',
    price_monthly: 0,
    price_yearly: 0,
    currency: 'USD',
    trial_days: 14,
    max_staff: 5,
    max_storage_gb: 10,
    max_branches: 1,
    max_rooms: 50,
    max_bookings_per_month: 100,
    max_integrations: 3,
    features: '',
    is_active: true,
    is_free: false,
    is_default: false,
    plan_tier: 'basic',
    billing_cycle: 'monthly',
    max_file_size_mb: 5,
    max_api_calls_per_day: 1000,
    priority_support: false,
    custom_branding: false,
    white_label: false,
    sso_enabled: false
  })

  const generateSlug = () => {
    if (formData.plan_name) {
      const slug = formData.plan_name.toLowerCase().replace(/[^a-z0-9]/g, '-')
      setFormData(prev => ({ ...prev, plan_slug: slug }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await SubscriptionService.createPlan(formData)
      toast.success('Plan created successfully')
      onSuccess()
      onClose()
      // Reset form
      setFormData({
        plan_name: '',
        plan_slug: '',
        plan_type: 'basic',
        price_monthly: 0,
        price_yearly: 0,
        currency: 'USD',
        trial_days: 14,
        max_staff: 5,
        max_storage_gb: 10,
        max_branches: 1,
        max_rooms: 50,
        max_bookings_per_month: 100,
        max_integrations: 3,
        features: '',
        is_active: true,
        is_free: false,
        is_default: false,
        plan_tier: 'basic',
        billing_cycle: 'monthly',
        max_file_size_mb: 5,
        max_api_calls_per_day: 1000,
        priority_support: false,
        custom_branding: false,
        white_label: false,
        sso_enabled: false
      })
    } catch (error: any) {
      toast.error(error.message || 'Failed to create plan')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Subscription Plan</DialogTitle>
          <DialogDescription>
            Create a new subscription plan with specific features and limits.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="plan_name">Plan Name</Label>
                <Input
                  id="plan_name"
                  value={formData.plan_name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, plan_name: e.target.value }))
                    generateSlug()
                  }}
                  placeholder="e.g., Basic Plan"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plan_slug">Plan Slug</Label>
                <Input
                  id="plan_slug"
                  value={formData.plan_slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, plan_slug: e.target.value }))}
                  placeholder="e.g., basic-plan"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="plan_type">Plan Type</Label>
                <Select value={formData.plan_type} onValueChange={(value) => setFormData(prev => ({ ...prev, plan_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {planTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="billing_cycle">Billing Cycle</Label>
                <Select value={formData.billing_cycle} onValueChange={(value) => setFormData(prev => ({ ...prev, billing_cycle: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    {billingCycles.map((cycle) => (
                      <SelectItem key={cycle} value={cycle}>
                        {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price_monthly">Monthly Price ($)</Label>
                <Input
                  id="price_monthly"
                  type="number"
                  step="0.01"
                  value={formData.price_monthly}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_monthly: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price_yearly">Yearly Price ($)</Label>
                <Input
                  id="price_yearly"
                  type="number"
                  step="0.01"
                  value={formData.price_yearly}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_yearly: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="max_staff">Max Staff</Label>
                <Input
                  id="max_staff"
                  type="number"
                  value={formData.max_staff}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_staff: parseInt(e.target.value) || 0 }))}
                  placeholder="5"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max_rooms">Max Rooms</Label>
                <Input
                  id="max_rooms"
                  type="number"
                  value={formData.max_rooms}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_rooms: parseInt(e.target.value) || 0 }))}
                  placeholder="50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="trial_days">Trial Days</Label>
                <Input
                  id="trial_days"
                  type="number"
                  value={formData.trial_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, trial_days: parseInt(e.target.value) || 0 }))}
                  placeholder="14"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="features">Features</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                placeholder="List of features included in this plan..."
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_free"
                  checked={formData.is_free}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_free: checked }))}
                />
                <Label htmlFor="is_free">Free Plan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
                />
                <Label htmlFor="is_default">Default Plan</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
