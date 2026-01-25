# Frontend Form & Modal Standardization - Complete Guide

## What Was Created

Your frontend now has a **standardized form and modal system** with all components following the same pattern as `AddTenantModal`.

## Directory Structure

```
components/
├── forms/
│   ├── index.ts                    ← Import all forms from here
│   ├── README.md                   ← Complete guide (READ THIS!)
│   ├── MODAL_TEMPLATE.tsx          ← Template for creating new forms
│   ├── add-hotel-modal.tsx         ← Add hotels
│   ├── add-room-modal.tsx          ← Add rooms
│   └── set-pricing-modal.tsx       ← Set room pricing
├── tenant/
│   └── add-tenant-modal.tsx        ← Add tenants (already existed)
└── ui/
    └── custom-inputs.tsx           ← All custom input components
```

## Available Modal Forms

### 1. **AddTenantModal** ✅
- Creates new tenant with admin user
- Hotel details, location, timezone, currency
- `components/tenant/add-tenant-modal.tsx`

### 2. **AddHotelModal** ✨ NEW
- Adds hotels/properties
- Hotel info, contact, location, website
- `components/forms/add-hotel-modal.tsx`

### 3. **AddRoomModal** ✨ NEW
- Adds rooms to hotels
- Room type, floor, capacity, description
- `components/forms/add-room-modal.tsx`

### 4. **SetPricingModal** ✨ NEW
- Sets room pricing by type
- Base, weekend, holiday prices + seasonal multiplier
- `components/forms/set-pricing-modal.tsx`

## Key Features

✅ **React Hook Form** - Robust form state management
✅ **Zod Validation** - Type-safe schema validation
✅ **shadcn Components** - All forms use shadcn Dialog, Form, Select
✅ **Custom Inputs** - PhoneInput, PasswordInput, WebsiteInput, etc.
✅ **Toast Notifications** - User feedback with Sonner
✅ **Error Handling** - Proper validation and error messages
✅ **Loading States** - Spinner + disabled button during submission
✅ **Consistent Styling** - All forms match design system

## Form Components Used (All shadcn)

- **Dialog** - Modal container
- **Form** - React Hook Form wrapper
- **FormField** - Individual field wrapper
- **FormItem** - Field container
- **FormLabel** - Field label
- **FormControl** - Input wrapper
- **FormMessage** - Error message display
- **Input** - Text input
- **Select** - Dropdown select
- **Button** - Action buttons

## Custom Inputs (All With Icons)

1. **PhoneInput**
   - Phone icon prefix
   - Placeholder: +91 98765 43210

2. **PasswordInput**
   - Eye icon toggle for show/hide
   - Secure password field

3. **WebsiteInput**
   - Globe icon prefix
   - URL validation

4. **TimezoneSelect**
   - 12+ timezone options
   - Default: IST (India)
   - Clock icon

5. **CurrencySelect**
   - 8+ currency options
   - Default: INR (₹)

## Quick Start

### Using Existing Modals

```tsx
'use client';

import { AddHotelModal } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function HotelsPage() {
  const [openModal, setOpenModal] = useState(false);

  const handleSuccess = () => {
    // Refresh hotels list
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

### Creating New Modal

1. **Copy the template**: `MODAL_TEMPLATE.tsx`
2. **Follow the 3-step pattern**:
   - Define Zod schema
   - Create component with form
   - Add to `index.ts`
3. **Reference**: `README.md` for all patterns

## All Modals Follow Same Pattern

```
┌─ Dialog (Modal Container)
│  ├─ Header (Title)
│  └─ Form
│     ├─ FormField (repeats for each field)
│     │  ├─ Label
│     │  ├─ Input/Select/CustomInput
│     │  └─ Error Message
│     └─ Action Buttons (Cancel, Submit)
```

## Styling Convention

- **Input height**: `h-8`
- **Font size**: `text-sm` (inputs), `text-xs` (labels)
- **Form spacing**: `space-y-2`
- **Modal width**: `max-w-lg`
- **Button size**: `h-8 text-xs`
- **Grid columns**: `grid-cols-2`
- **Grid gap**: `gap-2`

## Validation Examples

```tsx
// Required text
name: z.string().min(2, 'Name must be at least 2 characters')

// Email
email: z.string().email('Invalid email address')

// Phone
phone: z.string().min(10, 'Phone must be at least 10 digits')

// Select/Enum
role: z.enum(['admin', 'user'], { errorMap: () => ({ message: 'Select valid role' }) })

// Optional
description: z.string().optional()

// URL
website: z.string().url('Invalid URL').optional().or(z.literal(''))

// Number
price: z.string().transform(Number)
```

## Common Form Patterns

### Single Field
```tsx
<FormField control={form.control} name="fieldName" render={({ field }) => (
  <FormItem>
    <FormLabel className="text-xs">Label</FormLabel>
    <FormControl>
      <Input placeholder="..." {...field} className="h-8 text-sm" />
    </FormControl>
    <FormMessage className="text-xs" />
  </FormItem>
)} />
```

### Two-Column Grid
```tsx
<div className="grid grid-cols-2 gap-2">
  <FormField ... /> {/* Col 1 */}
  <FormField ... /> {/* Col 2 */}
</div>
```

### Dropdown Select
```tsx
<FormField control={form.control} name="fieldName" render={({ field }) => (
  <FormItem>
    <FormLabel className="text-xs">Label</FormLabel>
    <FormControl>
      <Select value={field.value} onValueChange={field.onChange}>
        <SelectTrigger className="h-8 text-sm">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="opt1">Option 1</SelectItem>
          <SelectItem value="opt2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    </FormControl>
    <FormMessage className="text-xs" />
  </FormItem>
)} />
```

### Custom Inputs
```tsx
// Phone
<PhoneInput {...field} />

// Password
<PasswordInput {...field} />

// Website
<WebsiteInput {...field} />

// Timezone
<TimezoneSelect value={field.value} onValueChange={field.onChange} />

// Currency
<CurrencySelect value={field.value} onValueChange={field.onChange} />
```

## Form Submission Flow

```
1. User fills form
2. Click submit
3. Form validation (Zod)
4. Show validation errors if any
5. If valid, disable button + show loading spinner
6. API call in try-catch
7. On success:
   - Reset form
   - Close modal
   - Call onSuccess()
   - Show success toast
8. On error:
   - Show error toast
   - Keep modal open
9. Finally:
   - Enable button
   - Hide loading spinner
```

## Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `components/forms/add-hotel-modal.tsx` | Add hotel form | ✨ NEW |
| `components/forms/add-room-modal.tsx` | Add room form | ✨ NEW |
| `components/forms/set-pricing-modal.tsx` | Set pricing form | ✨ NEW |
| `components/forms/MODAL_TEMPLATE.tsx` | Template for new forms | ✨ NEW |
| `components/forms/README.md` | Detailed documentation | ✨ NEW |
| `components/forms/index.ts` | Central export point | ✨ NEW |
| `components/ui/custom-inputs.tsx` | Custom input components | ✅ UPDATED |
| `components/tenant/add-tenant-modal.tsx` | Add tenant form | ✅ EXISTING |

## What's Next

1. **Update pages** to use new modals
   - Hotels page → use AddHotelModal
   - Rooms page → use AddRoomModal
   - Pricing page → use SetPricingModal

2. **Create more modals** as needed using the template

3. **Replace all old forms** with new modal pattern

4. **Backend integration** - Replace TODO comments with actual API calls

## Tips

✅ Always import from `@/components/forms` for convenience
✅ Follow the exact spacing/styling convention for consistency
✅ Use custom inputs for special fields (phone, password, etc.)
✅ Add proper Zod validation for all fields
✅ Show loading state during API calls
✅ Handle errors gracefully with try-catch
✅ Use toast notifications for user feedback
✅ Test form validation before submitting to API

## Need Help?

1. **Creating a new modal?** → Copy `MODAL_TEMPLATE.tsx`
2. **Need field examples?** → See `README.md` in forms folder
3. **Custom input question?** → Check `custom-inputs.tsx`
4. **Styling help?** → Look at existing modals for reference

---

**Everything is now standardized and ready to scale!** 🎉
