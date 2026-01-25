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
import { PhoneInput, WebsiteInput } from '@/components/ui/custom-inputs';
import { toast } from 'sonner';
import { hotelService } from '@/lib/services/hotels.service';
import { Combobox } from '@/components/ui/custom/combobox';

const hotelSchema = z.object({
  name: z.string().min(2, 'Hotel name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  zip_code: z.string().min(3, 'Zip code is required'),
  website: z.string().optional(),
  is_headquarters: z.boolean().optional(),
});

type HotelFormData = z.infer<typeof hotelSchema>;

interface AddHotelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: any;
}

export function AddHotelModal({ open, onOpenChange, onSuccess, initialData }: AddHotelModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  const form = useForm<HotelFormData>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      zip_code: '',
      website: '',
      is_headquarters: false,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        country: initialData.country || 'India',
        zip_code: initialData.zip_code || '',
        website: initialData.website || '',
        is_headquarters: initialData.is_headquarters || false,
      });
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        zip_code: '',
        website: '',
        is_headquarters: false,
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: HotelFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await hotelService.update(initialData.id, data as any);
        toast.success('Hotel updated successfully');
      } else {
        await hotelService.create(data as any);
        toast.success('Hotel created successfully');
      }
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} hotel`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const countryOptions = [
    { value: 'India', label: 'India' },
    { value: 'United States', label: 'United States' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Australia', label: 'Australia' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Hotel' : 'Add New Hotel'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update hotel information' : 'Add a new hotel property to your system'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Hotel Name *</Label>
              <Input
                id="name"
                placeholder="Grand Hotel"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hotel@example.com"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <PhoneInput {...form.register('phone')} />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="Street address"
                {...form.register('address')}
              />
              {form.formState.errors.address && (
                <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Mumbai"
                  {...form.register('city')}
                />
                {form.formState.errors.city && (
                  <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="Maharashtra"
                  {...form.register('state')}
                />
                {form.formState.errors.state && (
                  <p className="text-sm text-destructive">{form.formState.errors.state.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Combobox
                  options={countryOptions}
                  value={form.watch('country')}
                  onChange={(val) => form.setValue('country', val)}
                  placeholder="Select country"
                  searchPlaceholder="Search country..."
                />
                {form.formState.errors.country && (
                  <p className="text-sm text-destructive">{form.formState.errors.country.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip_code">Zip Code *</Label>
                <Input
                  id="zip_code"
                  placeholder="400001"
                  {...form.register('zip_code')}
                />
                {form.formState.errors.zip_code && (
                  <p className="text-sm text-destructive">{form.formState.errors.zip_code.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <WebsiteInput {...form.register('website')} />
              {form.formState.errors.website && (
                <p className="text-sm text-destructive">{form.formState.errors.website.message}</p>
              )}
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
              {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Hotel' : 'Add Hotel')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
