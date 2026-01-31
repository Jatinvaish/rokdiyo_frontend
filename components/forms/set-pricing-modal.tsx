'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Combobox } from '@/components/ui/custom/combobox';

const pricingSchema = z.object({
  room_type: z.enum(['single', 'double', 'suite', 'deluxe', 'penthouse']),
  base_price: z.number().min(1, 'Base price is required'),
  weekend_price: z.number().optional(),
  holiday_price: z.number().optional(),
  seasonal_multiplier: z.number().optional(),
});

type PricingFormData = z.infer<typeof pricingSchema>;

interface SetPricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: any;
}

const ROOM_TYPES = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'suite', label: 'Suite' },
  { value: 'deluxe', label: 'Deluxe' },
  { value: 'penthouse', label: 'Penthouse' },
];

export function SetPricingModal({ open, onOpenChange, onSuccess, initialData }: SetPricingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  const form = useForm<PricingFormData>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      room_type: 'double',
      base_price: 5000,
      weekend_price: 6500,
      holiday_price: 7500,
      seasonal_multiplier: 1,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        room_type: initialData.room_type || 'double',
        base_price: initialData.base_price || 5000,
        weekend_price: initialData.weekend_price || 6500,
        holiday_price: initialData.holiday_price || 7500,
        seasonal_multiplier: initialData.seasonal_multiplier || 1,
      });
    } else {
      form.reset({
        room_type: 'double',
        base_price: 5000,
        weekend_price: 6500,
        holiday_price: 7500,
        seasonal_multiplier: 1,
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: PricingFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      // if (isEditMode) {
      //   await pricingApi.update(initialData.id, data);
      // } else {
      //   await pricingApi.create(data);
      // }
      toast.success(`Pricing ${isEditMode ? 'updated' : 'set'} successfully`);
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'set'} pricing`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Room Pricing' : 'Set Room Pricing'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update pricing configuration' : 'Configure pricing rates for different periods'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="room_type">Room Type *</Label>
              <Combobox
                options={ROOM_TYPES}
                value={form.watch('room_type')}
                onChange={(val: any) => form.setValue('room_type', val)}
                placeholder="Select room type"
                searchPlaceholder="Search type..."
              />
              {form.formState.errors.room_type && (
                <p className="text-sm text-destructive">{form.formState.errors.room_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_price">Base Price (₹) *</Label>
              <Input
                id="base_price"
                type="number"
                step="100"
                placeholder="5000"
                {...form.register('base_price')}
              />
              {form.formState.errors.base_price && (
                <p className="text-sm text-destructive">{form.formState.errors.base_price.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weekend_price">Weekend Price (₹)</Label>
                <Input
                  id="weekend_price"
                  type="number"
                  step="100"
                  placeholder="6500"
                  {...form.register('weekend_price')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="holiday_price">Holiday Price (₹)</Label>
                <Input
                  id="holiday_price"
                  type="number"
                  step="100"
                  placeholder="7500"
                  {...form.register('holiday_price')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seasonal_multiplier">Seasonal Multiplier</Label>
              <Input
                id="seasonal_multiplier"
                type="number"
                step="0.1"
                min="0.5"
                max="3"
                placeholder="1.2"
                {...form.register('seasonal_multiplier')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Pricing' : 'Save Pricing')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
