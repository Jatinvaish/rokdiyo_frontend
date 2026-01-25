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
import { PhoneInput } from '@/components/ui/custom-inputs';
import { toast } from 'sonner';
import { guestService } from '@/lib/services/guests.service';
import { Combobox } from '@/components/ui/custom/combobox';

const guestSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  id_type: z.string().min(2, 'ID type is required'),
  id_number: z.string().min(3, 'ID number is required'),
});

type GuestFormData = z.infer<typeof guestSchema>;

interface AddGuestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: any; // For edit mode
}

export function AddGuestModal({ open, onOpenChange, onSuccess, initialData }: AddGuestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      id_type: 'passport',
      id_number: '',
    },
  });

  // Pre-populate form in edit mode
  useEffect(() => {
    if (initialData) {
      form.reset({
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        id_type: initialData.id_type || 'passport',
        id_number: initialData.id_number || '',
      });
    } else {
      form.reset({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        id_type: 'passport',
        id_number: '',
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: GuestFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await guestService.update(initialData.id, data);
        toast.success('Guest updated successfully');
      } else {
        await guestService.create(data);
        toast.success('Guest created successfully');
      }
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} guest`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const idTypeOptions = [
    { value: 'passport', label: 'Passport' },
    { value: 'driving_license', label: 'Driving License' },
    { value: 'national_id', label: 'National ID' },
    { value: 'visa', label: 'Visa' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Guest' : 'Create New Guest'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update guest information' : 'Add a new guest to the system'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  placeholder="John"
                  {...form.register('first_name')}
                />
                {form.formState.errors.first_name && (
                  <p className="text-sm text-destructive">{form.formState.errors.first_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  placeholder="Doe"
                  {...form.register('last_name')}
                />
                {form.formState.errors.last_name && (
                  <p className="text-sm text-destructive">{form.formState.errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_type">ID Type *</Label>
                <Combobox
                  options={idTypeOptions}
                  value={form.watch('id_type')}
                  onChange={(val) => form.setValue('id_type', val)}
                  placeholder="Select ID type"
                  searchPlaceholder="Search type..."
                />
                {form.formState.errors.id_type && (
                  <p className="text-sm text-destructive">{form.formState.errors.id_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_number">ID Number *</Label>
                <Input
                  id="id_number"
                  placeholder="ID123456"
                  {...form.register('id_number')}
                />
                {form.formState.errors.id_number && (
                  <p className="text-sm text-destructive">{form.formState.errors.id_number.message}</p>
                )}
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
              {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Guest' : 'Create Guest')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
