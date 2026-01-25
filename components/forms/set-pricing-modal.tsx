'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

const setPricingSchema = z.object({
  room_type: z.enum(['single', 'double', 'suite', 'deluxe', 'penthouse']).refine(
    val => val,
    { message: 'Please select a room type' }
  ),
  base_price: z.string().min(1, 'Base price is required'),
  weekend_price: z.string().optional(),
  holiday_price: z.string().optional(),
  seasonal_multiplier: z.string().optional(),
});

type SetPricingFormData = z.infer<typeof setPricingSchema>;

interface SetPricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ROOM_TYPES = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'suite', label: 'Suite' },
  { value: 'deluxe', label: 'Deluxe' },
  { value: 'penthouse', label: 'Penthouse' },
];

export function SetPricingModal({ open, onOpenChange, onSuccess }: SetPricingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SetPricingFormData>({
    resolver: zodResolver(setPricingSchema),
    defaultValues: {
      room_type: 'double',
      base_price: '5000',
      weekend_price: '6500',
      holiday_price: '7500',
      seasonal_multiplier: '1',
    },
  });

  const onSubmit = async (data: SetPricingFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      // await pricingApi.set(data);
      toast.success('Pricing set successfully');
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to set pricing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Set Room Pricing</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            {/* Room Type, Base Price, Weekend, Holiday (4 columns) */}
            <div className="grid grid-cols-4 gap-2">
              <FormField
                control={form.control}
                name="room_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Room Type</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROOM_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="base_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Base (₹)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="5000"
                        type="number"
                        step="100"
                        {...field}
                        className="h-8 text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weekend_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Weekend (₹)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="6500"
                        type="number"
                        step="100"
                        {...field}
                        className="h-8 text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="holiday_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Holiday (₹)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="7500"
                        type="number"
                        step="100"
                        {...field}
                        className="h-8 text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Seasonal Multiplier (4 columns - 1 used) */}
            <div className="grid grid-cols-4 gap-2">
              <FormField
                control={form.control}
                name="seasonal_multiplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Multiplier</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1.2"
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="3"
                        {...field}
                        className="h-8 text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-8 text-xs flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-8 text-xs flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Pricing'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
