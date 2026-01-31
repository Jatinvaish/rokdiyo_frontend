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
import { toast } from 'sonner'

interface CreateFeatureModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  planId?: number
}

export function CreateFeatureModal({ open, onClose, onSuccess, planId }: CreateFeatureModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    feature_price: 0,
    is_deleted: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!planId) {
      toast.error('Plan ID is required')
      return
    }

    setLoading(true)

    try {
      await SubscriptionService.createFeature({
        name: formData.name,
        feature_price: formData.feature_price,
        is_deleted: formData.is_deleted
      })
      toast.success('Feature created successfully')
      onSuccess()
      onClose()
      setFormData({
        name: '',
        feature_price: 0,
        is_deleted: false
      })
    } catch (error: any) {
      toast.error(error.message || 'Failed to create feature')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Feature</DialogTitle>
          <DialogDescription>
            Add a new feature to the subscription plan.
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
              <Label htmlFor="feature_price">Feature Price (₹)</Label>
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
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Feature'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
