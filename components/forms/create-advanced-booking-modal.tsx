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
import { format } from 'date-fns';
import { bookingService } from '@/lib/services/bookings.service';
import { Combobox } from '@/components/ui/custom/combobox';

const advancedBookingSchema = z.object({
  // Guest Details
  guest_type: z.enum(['existing', 'new']),
  guest_id: z.number().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  id_type: z.string().optional(),
  id_number: z.string().optional(),

  // Booking Details
  room_id: z.number().min(1, 'Room is required'),
  booking_type: z.enum(['hourly', 'daily', 'advance']),
  check_in: z.string().min(1, 'Check-in date/time is required'),
  check_out: z.string().optional(),
  hours: z.number().min(1).optional(),
  nights: z.number().min(1).optional(),

  // Occupancy & Billing
  adults: z.number().min(1, 'At least 1 adult required'),
  children: z.number().min(0).optional(),
  total_amount: z.number().min(0).optional(),
  advance_amount: z.number().min(0).optional(),

  // Other
  booking_source: z.string().optional(),
  special_requests: z.string().optional(),
});

type BookingFormData = z.infer<typeof advancedBookingSchema>;

interface CreateAdvancedBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  guests?: any[];
  rooms?: any[];
}

export function CreateAdvancedBookingModal({
  open,
  onOpenChange,
  onSuccess,
  guests = [],
  rooms = []
}: CreateAdvancedBookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingType, setBookingType] = useState<'hourly' | 'daily' | 'advance'>('daily');
  const [guestType, setGuestType] = useState<'existing' | 'new'>('new');

  const form = useForm<BookingFormData>({
    resolver: zodResolver(advancedBookingSchema),
    defaultValues: {
      guest_type: 'new',
      booking_type: 'daily',
      check_in: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      hours: 24,
      nights: 1,
      adults: 1,
      children: 0,
      total_amount: 0,
      id_type: 'passport'
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      // Validation based on guest type
      if (data.guest_type === 'new' && (!data.first_name || !data.phone)) {
        toast.error('Name and Phone are required for new guests');
        setIsSubmitting(false);
        return;
      }
      if (data.guest_type === 'existing' && !data.guest_id) {
        toast.error('Please select an existing guest');
        setIsSubmitting(false);
        return;
      }

      const checkIn = new Date(data.check_in);
      let checkOut: Date;

      if (data.booking_type === 'hourly') {
        checkOut = new Date(checkIn.getTime() + (data.hours || 3) * 60 * 60 * 1000);
      } else {
        checkOut = new Date(checkIn.getTime() + (data.nights || 1) * 24 * 60 * 60 * 1000);
      }

      const payload: any = {
        room_id: data.room_id,
        // Assuming single hotel context for now, or get from room
        hotel_id: rooms.find(r => r.id === data.room_id)?.hotel_id || 1,
        booking_type: data.booking_type,
        check_in: data.check_in,
        check_out: checkOut.toISOString(),
        total_hours: data.booking_type === 'hourly' ? data.hours : null,
        total_nights: data.booking_type === 'daily' ? data.nights : null,
        adults: data.adults,
        children: data.children || 0,
        special_requests: data.special_requests,
        total_amount: data.total_amount,
        booking_source: data.booking_source || 'walk_in'
      };

      if (data.guest_type === 'existing') {
        payload.guest_id = data.guest_id;
      } else {
        payload.guest = {
          first_name: data.first_name,
          last_name: data.last_name || '',
          email: data.email || `guest${Date.now()}@temp.com`,
          phone: data.phone,
          id_type: data.id_type,
          id_number: data.id_number || 'N/A'
        };
      }


      await bookingService.create(payload);

      toast.success('Advanced booking created successfully!');
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRoomPrice = () => {
    const roomId = form.watch('room_id');
    const room = rooms.find(r => r.id === roomId);
    if (!room) return 0;

    if (bookingType === 'hourly') {
      return (room.base_rate_hourly || 0) * (form.watch('hours') || 0);
    }
    return (room.base_rate_daily || 0) * (form.watch('nights') || 0);
  };

  // Auto-calculate amount when relevant fields change
  useEffect(() => {
    const price = selectedRoomPrice();
    if (price > 0 && !form.getFieldState('total_amount').isDirty) {
      form.setValue('total_amount', price);
    }
  }, [form.watch('room_id'), form.watch('hours'), form.watch('nights'), bookingType]);

  const guestOptions = guests.map((g: any) => ({
    value: g.id.toString(),
    label: `${g.first_name} ${g.last_name} (${g.phone})`
  }));

  const roomOptions = rooms
    .filter(r => r.status === 'available')
    .map((r: any) => ({
      value: r.id.toString(),
      label: `${r.room_number} - ${r.room_type_name}`
    }));

  const bookingTypeOptions = [
    { value: 'daily', label: 'Daily (Nightly)' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'advance', label: 'Advance' }
  ];

  const idTypeOptions = [
    { value: 'passport', label: 'Passport' },
    { value: 'national_id', label: 'National ID' },
    { value: 'driving_license', label: 'Driving License' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Advanced Booking</DialogTitle>
            <DialogDescription>
              Create a detailed booking with guest registration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 1. Guest Information */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Guest Details</h3>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="new_guest"
                    value="new"
                    checked={guestType === 'new'}
                    onChange={() => { setGuestType('new'); form.setValue('guest_type', 'new'); }}
                    className="accent-primary"
                  />
                  <Label htmlFor="new_guest">New Guest</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="existing_guest"
                    value="existing"
                    checked={guestType === 'existing'}
                    onChange={() => { setGuestType('existing'); form.setValue('guest_type', 'existing'); }}
                    className="accent-primary"
                  />
                  <Label htmlFor="existing_guest">Existing Guest</Label>
                </div>
              </div>

              {guestType === 'existing' ? (
                <div className="space-y-2">
                  <Label>Select Guest *</Label>
                  <Combobox
                    options={guestOptions}
                    value={form.watch('guest_id')?.toString() || ''}
                    onChange={(val) => form.setValue('guest_id', parseInt(val, 10))}
                    placeholder="Search guest..."
                    searchPlaceholder="Search guest..."
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input {...form.register('first_name')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input {...form.register('last_name')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input {...form.register('phone')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input {...form.register('email')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="id_type">ID Type</Label>
                    <Combobox
                      options={idTypeOptions}
                      value={form.watch('id_type')}
                      onChange={(val) => form.setValue('id_type', val)}
                      placeholder="Select ID type"
                      searchPlaceholder="Search type..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="id_number">ID Number</Label>
                    <Input {...form.register('id_number')} />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Room & Booking Details */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Booking Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room_id">Select Room *</Label>
                  <Combobox
                    options={roomOptions}
                    value={form.watch('room_id')?.toString() || ''}
                    onChange={(val) => form.setValue('room_id', parseInt(val, 10))}
                    placeholder="Select available room"
                    searchPlaceholder="Search room..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="booking_type">Type</Label>
                  <Combobox
                    options={bookingTypeOptions}
                    value={bookingType}
                    onChange={(val: any) => { setBookingType(val); form.setValue('booking_type', val); }}
                    placeholder="Select type"
                    searchPlaceholder="Search type..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="check_in">Check In *</Label>
                  <Input type="datetime-local" {...form.register('check_in')} />
                </div>

                <div className="space-y-2">
                  <Label>{bookingType === 'hourly' ? 'Hours' : 'Nights'}</Label>
                  <Input
                    type="number"
                    min="1"
                    {...form.register(bookingType === 'hourly' ? 'hours' : 'nights', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            {/* 3. Occupancy & Billing */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Adults</Label>
                <Input type="number" min="1" {...form.register('adults', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Children</Label>
                <Input type="number" min="0" {...form.register('children', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Total Amount</Label>
                <Input type="number" min="0" {...form.register('total_amount', { valueAsNumber: true })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Special Requests / Notes</Label>
              <Textarea {...form.register('special_requests')} />
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
              {isSubmitting ? 'Processing...' : 'Confirm Advanced Booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
