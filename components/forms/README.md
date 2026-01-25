# Form & Modal Components Guide

## Overview
All forms in this project follow a standardized pattern using:
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **shadcn Components** - UI components (Dialog, Form, Select, etc.)
- **Sonner** - Toast notifications

## Available Modal Forms

### 1. AddTenantModal
**Path:** `components/tenant/add-tenant-modal.tsx`
- Creates a new tenant with admin user
- Includes hotel details, location, timezone, currency
- Admin credentials setup

### 2. AddHotelModal
**Path:** `components/forms/add-hotel-modal.tsx`
- Adds a new hotel/property
- Hotel details: name, address, contact, location
- Optional website

### 3. AddRoomModal
**Path:** `components/forms/add-room-modal.tsx`
- Adds rooms to a hotel
- Room type selection (Single, Double, Suite, etc.)
- Floor, capacity, and description

### 4. SetPricingModal
**Path:** `components/forms/set-pricing-modal.tsx`
- Sets room pricing by type
- Base price, weekend price, holiday price
- Seasonal multiplier support

## Using Forms in Your Pages

### Basic Usage

```tsx
import { AddHotelModal } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function HotelsPage() {
  const [openModal, setOpenModal] = useState(false);

  const handleSuccess = () => {
    // Refresh your data here
    loadHotels();
  };

  return (
    <>
      <Button onClick={() => setOpenModal(true)}>+ Add Hotel</Button>
      
      <AddHotelModal
        open={openModal}
        onOpenChange={setOpenModal}
        onSuccess={handleSuccess}
      />
    </>
  );
}
```

## Creating New Modal Forms

Use `MODAL_TEMPLATE.tsx` as a reference. Follow these steps:

### Step 1: Define Validation Schema
```tsx
import { z } from 'zod';

const createItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  category: z.enum(['type1', 'type2']),
});

type CreateItemFormData = z.infer<typeof createItemSchema>;
```

### Step 2: Create Modal Component
```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreateItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateItemModal({ open, onOpenChange, onSuccess }: CreateItemModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateItemFormData>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      name: '',
      email: '',
      category: 'type1',
    },
  });

  const onSubmit = async (data: CreateItemFormData) => {
    setIsSubmitting(true);
    try {
      // API call here
      await api.create(data);
      
      toast.success('Item created successfully');
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Create New Item</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            {/* Add FormFields here */}
            
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
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

## Form Field Patterns

### Single Field
```tsx
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-xs">Name</FormLabel>
      <FormControl>
        <Input placeholder="Enter name" {...field} className="h-8 text-sm" />
      </FormControl>
      <FormMessage className="text-xs" />
    </FormItem>
  )}
/>
```

### Two-Column Grid
```tsx
<div className="grid grid-cols-2 gap-2">
  <FormField control={form.control} name="email" {...} />
  <FormField control={form.control} name="phone" {...} />
</div>
```

### Select Dropdown
```tsx
<FormField
  control={form.control}
  name="category"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-xs">Category</FormLabel>
      <FormControl>
        <Select value={field.value} onValueChange={field.onChange}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage className="text-xs" />
    </FormItem>
  )}
/>
```

## Custom Input Components

### PhoneInput
```tsx
import { PhoneInput } from '@/components/ui/custom-inputs';

<FormField control={form.control} name="phone" render={({ field }) => (
  <FormItem>
    <FormLabel className="text-xs">Phone</FormLabel>
    <FormControl>
      <PhoneInput {...field} />
    </FormControl>
    <FormMessage className="text-xs" />
  </FormItem>
)} />
```

### PasswordInput
```tsx
import { PasswordInput } from '@/components/ui/custom-inputs';

<FormField control={form.control} name="password" render={({ field }) => (
  <FormItem>
    <FormLabel className="text-xs">Password</FormLabel>
    <FormControl>
      <PasswordInput {...field} />
    </FormControl>
    <FormMessage className="text-xs" />
  </FormItem>
)} />
```

### WebsiteInput
```tsx
import { WebsiteInput } from '@/components/ui/custom-inputs';

<FormField control={form.control} name="website" render={({ field }) => (
  <FormItem>
    <FormLabel className="text-xs">Website</FormLabel>
    <FormControl>
      <WebsiteInput {...field} />
    </FormControl>
    <FormMessage className="text-xs" />
  </FormItem>
)} />
```

### TimezoneSelect
```tsx
import { TimezoneSelect } from '@/components/ui/custom-inputs';

<FormField
  control={form.control}
  name="timezone"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-xs">Timezone</FormLabel>
      <FormControl>
        <TimezoneSelect value={field.value} onValueChange={field.onChange} />
      </FormControl>
      <FormMessage className="text-xs" />
    </FormItem>
  )}
/>
```

### CurrencySelect
```tsx
import { CurrencySelect } from '@/components/ui/custom-inputs';

<FormField
  control={form.control}
  name="currency"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-xs">Currency</FormLabel>
      <FormControl>
        <CurrencySelect value={field.value} onValueChange={field.onChange} />
      </FormControl>
      <FormMessage className="text-xs" />
    </FormItem>
  )}
/>
```

## Styling Guidelines

- **Input height**: `h-8` for compact forms
- **Font size**: `text-sm` for inputs, `text-xs` for labels
- **Form spacing**: `space-y-2` for vertical spacing
- **Modal width**: `max-w-lg` (32rem)
- **Modal height**: `max-h-[90vh]` with `overflow-y-auto`
- **Button size**: `h-8 text-xs` for consistency
- **Grid gaps**: `gap-2` for columns

## Form Validation Examples

### Email Validation
```tsx
email: z.string().email('Invalid email address')
```

### Phone Validation
```tsx
phone: z.string().min(10, 'Phone must be at least 10 digits')
```

### Required vs Optional
```tsx
// Required
name: z.string().min(1, 'Name is required')

// Optional
description: z.string().optional()

// Optional with transformation
website: z.string().url().optional().or(z.literal(''))
```

### Enum/Select Validation
```tsx
category: z.enum(['single', 'double', 'suite'], {
  errorMap: () => ({ message: 'Please select a valid type' }),
})
```

## Tips & Best Practices

1. **Always reset form after success**: `form.reset()`
2. **Always close modal on success**: `onOpenChange(false)`
3. **Always call onSuccess callback**: `onSuccess()`
4. **Use toast for feedback**: `toast.success()` / `toast.error()`
5. **Show loading state**: `disabled={isSubmitting}` with spinner
6. **Validate with Zod**: Define schemas for all forms
7. **Use custom inputs**: For phone, password, website, timezone, currency
8. **Use shadcn Select**: For all dropdown fields
9. **Group related fields**: Use 2-column grids for related fields
10. **Add placeholder text**: Show example values to guide users

## Common Issues & Solutions

### Issue: Form not submitting
- Ensure validation schema matches form data structure
- Check field names match schema keys
- Verify `form.handleSubmit()` is properly called

### Issue: Validation errors not showing
- Ensure `<FormMessage />` is included
- Check Zod schema error messages

### Issue: API call failing
- Wrap in try-catch
- Handle both sync and async errors
- Always call `setIsSubmitting(false)` in finally block

### Issue: Modal not closing after submit
- Call `onOpenChange(false)` in success handler
- Ensure toast notification doesn't prevent close

## Exporting Modals

Add new modals to `components/forms/index.ts`:
```tsx
export { CreateItemModal } from './create-item-modal';
```

Then import from anywhere:
```tsx
import { CreateItemModal } from '@/components/forms';
```
