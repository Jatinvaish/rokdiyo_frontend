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
  ChevronRight, ChevronLeft, Loader2, Info, Star, BookmarkPlus
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
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingType, setBookingType] = useState<'hourly' | 'daily' | 'advance'>('hourly');

  const steps = [
    { title: 'Core', icon: BookmarkPlus },
    { title: 'Schedule', icon: Calendar },
    { title: 'Details', icon: Star },
  ];

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
      setCurrentStep(0);
      if (preselectedRoomId) {
        form.setValue('room_id', preselectedRoomId);
      }
    }
  }, [preselectedRoomId, form, open]);

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 0 ? ['guest_id', 'room_id'] :
      currentStep === 1 ? ['check_in', 'adults'] : [];
    const isValid = fieldsToValidate.length > 0
      ? await form.trigger(fieldsToValidate as any)
      : true;

    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

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
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-xl border-none shadow-2xl">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">New Hotel Booking</DialogTitle>
              <DialogDescription className="text-xs">Quick reservation system for guests</DialogDescription>
            </DialogHeader>

            {/* Stepper Indicator */}
            <div className="flex items-center justify-between mt-4 px-2">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;
                return (
                  <div key={idx} className="flex items-center flex-1 last:flex-none">
                    <div className={cn(
                      "flex flex-col items-center gap-1 transition-all duration-300",
                      isActive ? "scale-110" : "opacity-60"
                    )}>
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                        isActive ? "bg-primary text-primary-foreground border-primary" :
                          isCompleted ? "bg-primary/20 text-primary border-primary/20" : "bg-muted text-muted-foreground border-muted"
                      )}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold">{step.title}</span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={cn(
                        "h-[2px] flex-1 mx-2 rounded-full transition-colors duration-500",
                        idx < currentStep ? "bg-primary" : "bg-muted"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-6 py-5 max-h-[400px] overflow-y-auto">
            {currentStep === 0 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Guest Selection *</Label>
                  <Combobox
                    options={guestOptions}
                    value={form.watch('guest_id')?.toString()}
                    onChange={(val) => form.setValue('guest_id', parseInt(val))}
                    placeholder="Search/Select guest..."
                  />
                  {form.formState.errors.guest_id && <p className="text-[10px] text-destructive font-medium">{form.formState.errors.guest_id.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Assign Room *</Label>
                  <Combobox
                    options={roomOptions}
                    value={form.watch('room_id')?.toString()}
                    onChange={(val) => form.setValue('room_id', parseInt(val))}
                    placeholder="Select available room..."
                  />
                </div>

                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Reservation Mode</Label>
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
            )}

            {currentStep === 1 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Check-In Time *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input type="datetime-local" className="h-9 pl-7 text-xs" {...form.register('check_in')} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">
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
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-primary/60" />
                      <Label className="text-xs font-bold uppercase tracking-tight">Occupancy</Label>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Adults</span>
                        <Input type="number" className="w-14 h-6 text-xs text-center font-bold" {...form.register('adults', { valueAsNumber: true })} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Children</span>
                        <Input type="number" className="w-14 h-6 text-xs text-center font-bold" {...form.register('children', { valueAsNumber: true })} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center items-center p-3 rounded-lg border bg-primary/5 border-primary/10">
                    <p className="text-[10px] uppercase font-bold text-primary mb-1">Room Status</p>
                    <p className="text-xs font-black text-primary uppercase animate-pulse">Available</p>
                    <div className="h-[1px] w-full bg-primary/10 my-2" />
                    <p className="text-[9px] text-center text-muted-foreground">Standard rates apply for this selection</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Notes & Special Requests</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-3 w-3 text-muted-foreground" />
                    <Textarea
                      className="min-h-[100px] pl-7 py-2 resize-none text-xs"
                      placeholder="e.g. Late check-in, Balcony preferred, Airport pickup..."
                      {...form.register('special_requests')}
                    />
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-2">
                  <p className="text-[10px] font-bold uppercase text-primary/70 tracking-widest">Booking Summary</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Room</span>
                      <span className="font-bold"># {preselectedRoomNumber || 'Selected'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Stay</span>
                      <span className="font-bold uppercase">{bookingType}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t border-primary/10">
                      <span className="text-primary font-bold uppercase tracking-tighter">Est. Total</span>
                      <span className="text-primary font-black uppercase">Calculated at Billing</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-4 bg-muted/30 border-t border-primary/5 flex items-center justify-between sm:justify-between gap-2">
            <div>
              {currentStep > 0 && (
                <Button type="button" variant="ghost" size="sm" onClick={prevStep} className="h-9 px-4 font-bold uppercase text-[10px] tracking-widest hover:bg-primary/5">
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-9 px-4 font-bold uppercase text-[10px] tracking-widest border-muted-foreground/20">
                Cancel
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button type="button" size="sm" onClick={nextStep} className="h-9 px-4 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">
                  Continue <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              ) : (
                <Button type="submit" size="sm" disabled={isSubmitting} className="h-9 px-4 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">
                  {isSubmitting ? (
                    <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> booking</>
                  ) : (
                    <><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Book Now</>
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}