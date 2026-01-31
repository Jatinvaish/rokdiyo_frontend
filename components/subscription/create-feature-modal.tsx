'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SubscriptionService } from '@/lib/services/subscription.service'
import { SubscriptionPlan } from '@/lib/services/subscription.service'
import { toast } from 'sonner'

interface CreateFeatureModalProps {
  open: boolean
  onClose: () => void
  plan: SubscriptionPlan | null
  onSuccess: () => void
}

export function CreateFeatureModal({ open, onClose, plan, onSuccess }: CreateFeatureModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    subscription_id: plan?.id || 0,
    name: '',
    feature_price: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await SubscriptionService.createFeature(formData)
      toast.success('Feature created successfully')
      onSuccess()
      onClose()
      setFormData({ subscription_id: plan?.id || 0, name: '', feature_price: 0 })
    } catch (error: any) {
      toast.error(error.message || 'Failed to create feature')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setFormData({ subscription_id: plan?.id || 0, name: '', feature_price: 0 })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Feature</DialogTitle>
          <DialogDescription>
            Add a new feature to plan: <strong>{plan?.plan_name}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Feature Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Advanced Analytics"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="feature_price">Feature Price ($)</Label>
              <Input
                id="feature_price"
                type="number"
                step="0.01"
                value={formData.feature_price}
                onChange={(e) => setFormData(prev => ({ ...prev, feature_price: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Feature'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
