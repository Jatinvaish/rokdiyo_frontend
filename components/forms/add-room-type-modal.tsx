'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { roomService } from '@/lib/services/rooms.service';

const createRoomTypeSchema = z.object({
  name: z.string().min(2, 'Room type name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  base_rate_hourly: z.coerce.number().min(0, 'Hourly rate must be at least 0'),
  base_rate_daily: z.coerce.number().min(0, 'Daily rate must be at least 0'),
  max_occupancy: z.coerce.number().min(1, 'Max occupancy must be at least 1'),
  amenities: z.string().optional(),
});

type CreateRoomTypeFormData = z.infer<typeof createRoomTypeSchema>;

interface AddRoomTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddRoomTypeModal({ open, onOpenChange, onSuccess }: AddRoomTypeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateRoomTypeFormData>({
    resolver: zodResolver(createRoomTypeSchema),
    defaultValues: {
      name: '',
      description: '',
      base_rate_hourly: 0,
      base_rate_daily: 0,
      max_occupancy: 2,
      amenities: '',
    },
  });

  const onSubmit = async (data: CreateRoomTypeFormData) => {
    setIsSubmitting(true);
    try {
      await roomService.createType(data);
      toast.success('Room type created successfully');
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create room type');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Create New Room Type</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            {/* Row 1: Name, Description, Max Occupancy (3 columns) */}
            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Room Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Deluxe" {...field} className="h-8 text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Room description" {...field} className="h-8 text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_occupancy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Max Occupancy</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2" {...field} className="h-8 text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 2: Hourly Rate, Daily Rate, Amenities (3 columns) */}
            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="base_rate_hourly"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Hourly Rate</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="500" {...field} className="h-8 text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="base_rate_daily"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Daily Rate</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2000" {...field} className="h-8 text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amenities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Amenities</FormLabel>
                    <FormControl>
                      <Input placeholder="WiFi, AC, TV" {...field} className="h-8 text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Room Type
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
