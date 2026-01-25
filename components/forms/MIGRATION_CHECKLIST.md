# Migration Checklist - Converting Old Forms to New Modal Pattern

## Pages That Need Migration

### Dashboard Pages to Update

- [ ] **Hotels Page** (`app/dashboard/hotels/page.tsx`)
  - Replace inline form with AddHotelModal
  - Use AddHotelModal component
  - Update button to trigger modal
  - Remove old form code

- [ ] **Rooms Page** (`app/dashboard/rooms/page.tsx`)
  - Replace inline form with AddRoomModal
  - Pass hotel_id prop
  - Update success callback

- [ ] **Pricing Page** (if exists)
  - Replace inline form with SetPricingModal
  - Update data refresh logic

- [ ] **Guests Page** (`app/dashboard/guests/page.tsx`)
  - Create AddGuestModal (use template)
  - Implement guest creation form

- [ ] **Bookings Page** (`app/dashboard/bookings/page.tsx`)
  - Create AddBookingModal (use template)
  - Implement booking creation form

- [ ] **Admin Tenants Page** (`app/dashboard/admin/tenants/page.tsx`)
  - Already uses AddTenantModal ✅

## Step-by-Step Migration Guide

### For Each Page:

#### 1. Remove Old Form Code
```tsx
// REMOVE THIS:
const [formData, setFormData] = useState({ ... });
const handleInputChange = (e) => { ... };
const handleSubmit = async (e) => { ... };
const [dialogOpen, setDialogOpen] = useState(false);
// ... old form JSX code
```

#### 2. Import New Modal
```tsx
// ADD THIS:
'use client';
import { AddHotelModal } from '@/components/forms';
import { useState } from 'react';
```

#### 3. Add Modal State & Handler
```tsx
const [openModal, setOpenModal] = useState(false);

const handleSuccess = () => {
  // Refresh data
  loadHotels();
};
```

#### 4. Add Modal Component
```tsx
<AddHotelModal
  open={openModal}
  onOpenChange={setOpenModal}
  onSuccess={handleSuccess}
/>
```

#### 5. Update Add Button
```tsx
// BEFORE:
<Button onClick={() => setDialogOpen(true)}>Add</Button>

// AFTER:
<Button onClick={() => setOpenModal(true)}>+ Add Hotel</Button>
```

#### 6. Test Everything
- [ ] Modal opens on button click
- [ ] Form validates correctly
- [ ] Submission works
- [ ] Success toast appears
- [ ] Modal closes
- [ ] Data refreshes

## Example: Converting Hotels Page

### Before (Old Pattern)
```tsx
export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    // ... more fields
  });

  const handleInputChange = (e) => {
    // ... handle change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await hotelApi.create(formData);
      setDialogOpen(false);
      // ...
    } catch (error) {
      // ...
    }
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          {/* Old form JSX with lots of input handling code */}
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### After (New Pattern)
```tsx
'use client';

import { useState, useEffect } from 'react';
import { AddHotelModal } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { hotelApi } from '@/lib/api/hotel';

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      const data = await hotelApi.list();
      setHotels(data);
    } catch (error) {
      console.error('Failed to load hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpenModal(true)}>+ Add Hotel</Button>
      
      <AddHotelModal
        open={openModal}
        onOpenChange={setOpenModal}
        onSuccess={loadHotels}
      />

      {/* Render hotels list */}
    </>
  );
}
```

## Creating Missing Modals

These modals don't exist yet. Create them using the template:

### AddGuestModal
**Path:** `components/forms/add-guest-modal.tsx`

```tsx
// Use MODAL_TEMPLATE.tsx as base
// Fields:
// - Name
// - Email
// - Phone
// - Address
// - City
// - Country
// - ID/Passport
// - Check-in date
// - Check-out date
```

### AddBookingModal
**Path:** `components/forms/add-booking-modal.tsx`

```tsx
// Use MODAL_TEMPLATE.tsx as base
// Fields:
// - Guest (Select)
// - Room (Select)
// - Hotel (Select)
// - Check-in (Date)
// - Check-out (Date)
// - Guests Count
// - Status (Select)
// - Notes (Optional)
```

### CreateUserModal
**Path:** `components/forms/create-user-modal.tsx`

```tsx
// Use MODAL_TEMPLATE.tsx as base
// Fields:
// - Name
// - Email
// - Phone
// - Role (Select)
// - Permissions (Multi-select)
// - Status (Active/Inactive)
```

## Progress Tracking

### Pages Migrated
- [ ] Hotels
- [ ] Rooms
- [ ] Pricing
- [ ] Guests
- [ ] Bookings
- [ ] Users

### Modals Created
- [x] AddTenantModal
- [x] AddHotelModal
- [x] AddRoomModal
- [x] SetPricingModal
- [ ] AddGuestModal
- [ ] AddBookingModal
- [ ] CreateUserModal

### Testing Checklist
For each migrated page:
- [ ] Modal opens/closes correctly
- [ ] Form validation works
- [ ] Submit button shows loading state
- [ ] API call executes
- [ ] Success toast appears
- [ ] Modal closes on success
- [ ] Data refreshes in list
- [ ] Error handling works
- [ ] Form resets for next entry

## Common Issues & Solutions

### Issue: Modal doesn't open
**Solution:** Ensure state is managed with useState, button calls setOpenModal(true)

### Issue: Form doesn't validate
**Solution:** Check Zod schema matches form data structure, ensure field names match

### Issue: API not called
**Solution:** Replace TODO comment with actual API call, check API endpoint

### Issue: Data doesn't refresh
**Solution:** Ensure onSuccess handler calls data refresh function (e.g., loadHotels())

### Issue: Old form code still showing
**Solution:** Remove all old state and JSX related to form

## Files to Reference

1. **MODAL_TEMPLATE.tsx** - Copy for new modals
2. **add-hotel-modal.tsx** - Simple modal example
3. **add-room-modal.tsx** - Modal with select fields
4. **set-pricing-modal.tsx** - Modal with numbers
5. **README.md** - Complete documentation

## Quick Command

After migration, run this to verify no errors:
```bash
npm run build
# or
yarn build
```

## Timeline Estimate

- AddHotelModal: 15 minutes
- AddRoomModal: 15 minutes
- SetPricingModal: 15 minutes
- Others (create new): 20 minutes each

**Total: ~3-4 hours for full migration**

## Notes

- All new modals should be exported from `components/forms/index.ts`
- Follow exact styling convention for consistency
- Always include proper validation
- Test each page after migration
- Keep backup of old code temporarily

---

**Once migration is complete, your codebase will be:**
✅ Cleaner (less code duplication)
✅ Consistent (all modals follow same pattern)
✅ Maintainable (easy to update forms)
✅ Scalable (easy to create new modals)
