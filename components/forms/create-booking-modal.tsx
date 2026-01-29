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
import {
  Calendar, Clock, User, Bed, Users, MessageSquare, CheckCircle2,
  Loader2, Info, Star, BookmarkPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  special_requests: z.string().optional().or(z.literal('')),
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
    resolver: zodResolver(bookingSchema) as any,
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
    } as any,
  });

  useEffect(() => {
    if (open) {
      if (preselectedRoomId) {
        form.setValue('room_id', preselectedRoomId);
      }
    }
  }, [preselectedRoomId, form, open]);

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
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
        hotel_id: rooms.find(r => r.id === data.room_id)?.hotel_id || 1,
        booking_type: data.booking_type,
        check_in: data.check_in,
        check_out: checkOut.toISOString(),
        total_hours: data.booking_type === 'hourly' ? data.hours : undefined,
        total_nights: data.booking_type === 'daily' ? data.nights : undefined,
        adults: data.adults,
        children: data.children || 0,
        special_requests: data.special_requests,
        total_amount: 0
      };

      await bookingService.create(bookingPayload);
      toast.success(data.booking_type === 'advance' ? 'Advance booking created!' : 'Booking created successfully!');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const guestOptions = guests.map(guest => ({
    value: guest.id.toString(),
    label: `${guest.first_name} ${guest.last_name} (${guest.phone || 'No phone'})`
  }));

  const roomOptions = rooms
    .filter(r => r.status === 'available' || r.id === preselectedRoomId)
    .map(room => ({
      value: room.id.toString(),
      label: `Room ${room.room_number} - ${room.room_type_name || room.type_name}`
    }));

  const bookingTypeOptions = [
    { value: 'hourly', label: 'Hourly Stay' },
    { value: 'daily', label: 'Overnight Stay' },
    { value: 'advance', label: 'Future Booking' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden rounded-xl border-none shadow-2xl">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">New Hotel Booking</DialogTitle>
              <DialogDescription className="text-xs">Quick reservation system for guests</DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 max-h-[550px] overflow-y-auto space-y-5">
            {/* Core Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-4 w-1 bg-primary rounded-full" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/70">Core Reservation</h4>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Guest Selection *</Label>
                <Combobox
                  options={guestOptions}
                  value={form.watch('guest_id')?.toString()}
                  onChange={(val) => form.setValue('guest_id', parseInt(val))}
                  placeholder="Search/Select guest..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Assign Room *</Label>
                <Combobox
                  options={roomOptions}
                  value={form.watch('room_id')?.toString()}
                  onChange={(val) => form.setValue('room_id', parseInt(val))}
                  placeholder="Select available room..."
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Reservation Mode</Label>
                <div className="grid grid-cols-3 gap-2">
                  {bookingTypeOptions.map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={form.watch('booking_type') === opt.value ? 'default' : 'outline'}
                      className="h-9 text-[10px] font-bold uppercase px-0"
                      onClick={() => {
                        form.setValue('booking_type', opt.value as any);
                        setBookingType(opt.value as any);
                      }}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-4 w-1 bg-primary rounded-full" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/70">Schedule & Occupancy</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Check-In Time *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input type="datetime-local" className="h-9 pl-7 text-[11px]" {...form.register('check_in')} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">
                    Duration ({bookingType === 'hourly' ? 'Hrs' : 'Nights'})
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                      type="number"
                      className="h-9 pl-7"
                      {...form.register(bookingType === 'hourly' ? 'hours' : 'nights', { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 p-3 rounded-lg border bg-muted/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> Adults
                    </span>
                    <Input type="number" className="w-14 h-6 text-xs text-center font-bold" {...form.register('adults', { valueAsNumber: true })} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3" /> Children
                    </span>
                    <Input type="number" className="w-14 h-6 text-xs text-center font-bold" {...form.register('children', { valueAsNumber: true })} />
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center p-3 rounded-lg border bg-primary/5 border-primary/10">
                  <p className="text-[9px] uppercase font-bold text-primary/60 mb-0.5">Est. Total</p>
                  <p className="text-xs font-black text-primary uppercase">TBD</p>
                  <div className="h-[1px] w-full bg-primary/10 my-1.5" />
                  <p className="text-[9px] text-center text-muted-foreground italic leading-tight">Calc. at Checkout</p>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Notes & Special Requests</Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-3 w-3 text-muted-foreground" />
                <Textarea
                  className="min-h-[80px] pl-7 py-2 resize-none text-xs"
                  placeholder="e.g. Late check-in, Extra pillows..."
                  {...form.register('special_requests')}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-muted/30 border-t border-primary/5 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-9 px-4 font-bold uppercase text-[10px] tracking-widest border-muted-foreground/20">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="flex-1 h-9 px-4 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">
              {isSubmitting ? (
                <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> booking</>
              ) : (
                <><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Complete Booking</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}