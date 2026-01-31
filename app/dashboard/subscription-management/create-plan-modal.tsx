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
    is_default: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await SubscriptionService.createPlan(formData)
      toast.success('Plan created successfully')
      onSuccess()
      onClose()
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
        is_default: false
      })
    } catch (error: any) {
      toast.error(error.message || 'Failed to create plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
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
                  onChange={(e) => setFormData(prev => ({ ...prev, plan_name: e.target.value }))}
                  placeholder="e.g., Basic Plan"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plan_type">Plan Type</Label>
                <Select value={formData.plan_type} onValueChange={(value) => setFormData(prev => ({ ...prev, plan_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
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
                  value={formData.price_yearly}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_yearly: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
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
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
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
