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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { roomService } from '@/lib/services/rooms.service';

const roomTypeSchema = z.object({
  name: z.string().min(2, 'Room type name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  base_rate_hourly: z.coerce.number().min(0, 'Hourly rate must be at least 0'),
  base_rate_daily: z.coerce.number().min(0, 'Daily rate must be at least 0'),
  max_occupancy: z.coerce.number().min(1, 'Max occupancy must be at least 1'),
  amenities: z.string().optional(),
});

type RoomTypeFormData = z.infer<typeof roomTypeSchema>;

interface AddRoomTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: any;
}

export function AddRoomTypeModal({ open, onOpenChange, onSuccess, initialData }: AddRoomTypeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  const form = useForm<RoomTypeFormData>({
    resolver: zodResolver(roomTypeSchema),
    defaultValues: {
      name: '',
      description: '',
      base_rate_hourly: 0,
      base_rate_daily: 0,
      max_occupancy: 2,
      amenities: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        description: initialData.description || '',
        base_rate_hourly: initialData.base_rate_hourly || 0,
        base_rate_daily: initialData.base_rate_daily || 0,
        max_occupancy: initialData.max_occupancy || 2,
        amenities: initialData.amenities || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
        base_rate_hourly: 0,
        base_rate_daily: 0,
        max_occupancy: 2,
        amenities: '',
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: RoomTypeFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await roomService.updateType(initialData.id, data);
        toast.success('Room type updated successfully');
      } else {
        await roomService.createType(data);
        toast.success('Room type created successfully');
      }
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} room type`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Room Type' : 'Create New Room Type'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update room type details' : 'Define a new room type with pricing and amenities'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Room Type Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Deluxe, Suite, Standard"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the room type features"
                rows={3}
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_rate_hourly">Hourly Rate (₹) *</Label>
                <Input
                  id="base_rate_hourly"
                  type="number"
                  placeholder="500"
                  {...form.register('base_rate_hourly')}
                />
                {form.formState.errors.base_rate_hourly && (
                  <p className="text-sm text-destructive">{form.formState.errors.base_rate_hourly.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="base_rate_daily">Daily Rate (₹) *</Label>
                <Input
                  id="base_rate_daily"
                  type="number"
                  placeholder="2000"
                  {...form.register('base_rate_daily')}
                />
                {form.formState.errors.base_rate_daily && (
                  <p className="text-sm text-destructive">{form.formState.errors.base_rate_daily.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_occupancy">Max Occupancy *</Label>
                <Input
                  id="max_occupancy"
                  type="number"
                  placeholder="2"
                  {...form.register('max_occupancy')}
                />
                {form.formState.errors.max_occupancy && (
                  <p className="text-sm text-destructive">{form.formState.errors.max_occupancy.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities</Label>
                <Input
                  id="amenities"
                  placeholder="e.g., WiFi, AC, TV"
                  {...form.register('amenities')}
                />
              </div>
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
              {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Room Type' : 'Create Room Type')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
