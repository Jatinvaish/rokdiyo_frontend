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

const bookingSchema = z.object({
  guest_id: z.number().min(1, 'Guest is required'),
  room_id: z.number().min(1, 'Room is required'),
  booking_type: z.enum(['hourly', 'daily', 'advance']),
  check_in: z.string().min(1, 'Check-in date/time is required'),
  check_out: z.string().optional(),
  hours: z.number().min(1).optional(),
  nights: z.number().min(1).optional(),
  adults: z.number().min(1, 'At least 1 adult required'),
  children: z.number().min(0).optional(),
  special_requests: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface CreateBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preselectedRoomId?: number;
  preselectedRoomNumber?: string;
  guests?: any[];
  rooms?: any[];
}

export function CreateBookingModal({
  open,
  onOpenChange,
  onSuccess,
  preselectedRoomId,
  preselectedRoomNumber,
  guests = [],
  rooms = []
}: CreateBookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingType, setBookingType] = useState<'hourly' | 'daily' | 'advance'>('hourly');

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guest_id: 0,
      room_id: preselectedRoomId || 0,
      booking_type: 'hourly',
      check_in: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      hours: 3,
      nights: 1,
      adults: 1,
      children: 0,
      special_requests: '',
    },
  });

  useEffect(() => {
    if (preselectedRoomId) {
      form.setValue('room_id', preselectedRoomId);
    }
  }, [preselectedRoomId, form]);

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      // Calculate check_out based on booking type
      const checkIn = new Date(data.check_in);
      let checkOut: Date;

      if (data.booking_type === 'hourly') {
        checkOut = new Date(checkIn.getTime() + (data.hours || 3) * 60 * 60 * 1000);
      } else {
        checkOut = new Date(checkIn.getTime() + (data.nights || 1) * 24 * 60 * 60 * 1000);
      }

      const bookingPayload = {
        guest_id: data.guest_id,
        room_id: data.room_id,
        // @ts-ignore - hotel_id is verified via rooms
        hotel_id: rooms.find(r => r.id === data.room_id)?.hotel_id || 1,
        booking_type: data.booking_type,
        check_in: data.check_in,
        check_out: checkOut.toISOString(),
        total_hours: data.booking_type === 'hourly' ? data.hours : undefined,
        total_nights: data.booking_type === 'daily' ? data.nights : undefined,
        adults: data.adults,
        children: data.children || 0,
        special_requests: data.special_requests,
        total_amount: 0 // Will be calculated backend or needs logic
      };

      await bookingService.create(bookingPayload);

      toast.success(data.booking_type === 'advance' ? 'Advance booking created!' : 'Booking created successfully!');
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const guestOptions = guests.map(guest => ({
    value: guest.id.toString(),
    label: `${guest.first_name} ${guest.last_name}`
  }));

  const roomOptions = rooms
    .filter(r => r.status === 'available')
    .map(room => ({
      value: room.id.toString(),
      label: `Room ${room.room_number} - ${room.room_type_name}`
    }));

  const bookingTypeOptions = [
    { value: 'hourly', label: 'Hourly Booking' },
    { value: 'daily', label: 'Daily Booking' },
    { value: 'advance', label: 'Advance Booking' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
            <DialogDescription>
              Book a room {preselectedRoomNumber && `(Room ${preselectedRoomNumber})`} for hourly or daily stay
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guest_id">Guest *</Label>
                <Combobox
                  options={guestOptions}
                  value={form.watch('guest_id')?.toString() || ''}
                  onChange={(val) => form.setValue('guest_id', parseInt(val) || 0)}
                  placeholder="Select guest"
                  searchPlaceholder="Search guests..."
                />
                {form.formState.errors.guest_id && (
                  <p className="text-sm text-destructive">{form.formState.errors.guest_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="room_id">Room *</Label>
                <Combobox
                  options={roomOptions}
                  value={form.watch('room_id')?.toString() || ''}
                  onChange={(val) => form.setValue('room_id', parseInt(val) || 0)}
                  placeholder="Select room"
                  searchPlaceholder="Search rooms..."
                />
                {form.formState.errors.room_id && (
                  <p className="text-sm text-destructive">{form.formState.errors.room_id.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking_type">Booking Type *</Label>
              <Combobox
                options={bookingTypeOptions}
                value={form.watch('booking_type')}
                onChange={(val: any) => {
                  form.setValue('booking_type', val);
                  setBookingType(val);
                }}
                placeholder="Select type"
                searchPlaceholder="Search type..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="check_in">Check-in Date/Time *</Label>
                <Input
                  id="check_in"
                  type="datetime-local"
                  {...form.register('check_in')}
                />
                {form.formState.errors.check_in && (
                  <p className="text-sm text-destructive">{form.formState.errors.check_in.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">
                  {bookingType === 'hourly' ? 'Hours *' : 'Nights *'}
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  {...form.register(bookingType === 'hourly' ? 'hours' : 'nights', {
                    valueAsNumber: true
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adults">Adults *</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  placeholder="1"
                  {...form.register('adults', { valueAsNumber: true })}
                />
                {form.formState.errors.adults && (
                  <p className="text-sm text-destructive">{form.formState.errors.adults.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="children">Children</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...form.register('children', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="special_requests">Special Requests</Label>
              <Textarea
                id="special_requests"
                placeholder="Any special requests or notes..."
                rows={2}
                {...form.register('special_requests')}
              />
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
              {isSubmitting ? 'Creating...' : 'Create Booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}