'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { PasswordInput, PhoneInput, WebsiteInput, TimezoneSelect, CurrencySelect } from '@/components/ui/custom-inputs';
import { createTenantSchema, CreateTenantFormData } from '@/lib/types/tenant';
import { tenantService } from '@/lib/services/tenant.service';
import { toast } from 'sonner';

interface AddTenantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: any;
}

export function AddTenantModal({ open, onOpenChange, onSuccess, initialData }: AddTenantModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  const form = useForm<CreateTenantFormData>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: 'Ahmedabad',
      country: 'India',
      timezone: 'IST (Asia/Kolkata)',
      currency: 'INR',
      website: '',
      admin_name: '',
      admin_email: '',
      admin_password: '',
      confirm_password: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      // In edit mode, admin fields are optional/disabled
      form.reset({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        city: initialData.city || 'Ahmedabad',
        country: initialData.country || 'India',
        timezone: initialData.timezone || 'IST (Asia/Kolkata)',
        currency: initialData.currency || 'INR',
        website: initialData.website || '',
        admin_name: '',
        admin_email: '',
        admin_password: '',
        confirm_password: '',
      });
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: 'Ahmedabad',
        country: 'India',
        timezone: 'IST (Asia/Kolkata)',
        currency: 'INR',
        website: '',
        admin_name: '',
        admin_email: '',
        admin_password: '',
        confirm_password: '',
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: CreateTenantFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        // For edit mode, only update tenant info without admin fields
        const { admin_name, admin_email, admin_password, confirm_password, ...tenantData } = data;
        await tenantService.updateTenant(initialData.id, tenantData);
        toast.success('Tenant updated successfully');
      } else {
        await tenantService.createTenant(data);
        toast.success('Tenant created successfully');
      }
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} tenant`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Tenant' : 'Create New Tenant'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update tenant information' : 'Create a new tenant with admin account'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Hotel/Company Name *</Label>
              <Input
                id="name"
                placeholder="Grand Hotel"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message as string}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hotel@email.com"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message as string}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <PhoneInput {...form.register('phone')} />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive">{form.formState.errors.phone.message as string}</p>
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
                <p className="text-sm text-destructive">{form.formState.errors.address.message as string}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Ahmedabad"
                  {...form.register('city')}
                />
                {form.formState.errors.city && (
                  <p className="text-sm text-destructive">{form.formState.errors.city.message as string}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  placeholder="India"
                  {...form.register('country')}
                />
                {form.formState.errors.country && (
                  <p className="text-sm text-destructive">{form.formState.errors.country.message as string}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone *</Label>
                <TimezoneSelect
                  value={form.watch('timezone')}
                  onValueChange={(value) => form.setValue('timezone', value)}
                />
                {form.formState.errors.timezone && (
                  <p className="text-sm text-destructive">{form.formState.errors.timezone.message as string}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <CurrencySelect
                  value={form.watch('currency')}
                  onValueChange={(value) => form.setValue('currency', value)}
                />
                {form.formState.errors.currency && (
                  <p className="text-sm text-destructive">{form.formState.errors.currency.message as string}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <WebsiteInput {...form.register('website')} />
            </div>

            {!isEditMode && (
              <>
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium mb-3">Admin Account</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin_name">Admin Name *</Label>
                      <Input
                        id="admin_name"
                        placeholder="Admin name"
                        {...form.register('admin_name')}
                      />
                      {form.formState.errors.admin_name && (
                        <p className="text-sm text-destructive">{form.formState.errors.admin_name.message as string}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin_email">Admin Email *</Label>
                      <Input
                        id="admin_email"
                        type="email"
                        placeholder="admin@hotel.com"
                        {...form.register('admin_email')}
                      />
                      {form.formState.errors.admin_email && (
                        <p className="text-sm text-destructive">{form.formState.errors.admin_email.message as string}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin_password">Password *</Label>
                        <PasswordInput {...form.register('admin_password')} />
                        {form.formState.errors.admin_password && (
                          <p className="text-sm text-destructive">{form.formState.errors.admin_password.message as string}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm_password">Confirm Password *</Label>
                        <PasswordInput {...form.register('confirm_password')} />
                        {form.formState.errors.confirm_password && (
                          <p className="text-sm text-destructive">{form.formState.errors.confirm_password.message as string}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
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
              {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Tenant' : 'Create Tenant')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
