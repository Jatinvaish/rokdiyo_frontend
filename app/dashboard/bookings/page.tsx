'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { bookingService } from '@/lib/services/bookings.service';
import { roomService } from '@/lib/services/rooms.service';
import { guestService } from '@/lib/services/guests.service';
import { hotelService } from '@/lib/services/hotels.service';
import { Booking, Guest, Room, Hotel } from '@/lib/types/hotel';
import { Plus, Calendar, User, CreditCard, RefreshCw } from 'lucide-react';
import { AddGuestModal } from '@/components/forms/add-guest-modal';
import { CreateBookingModal } from '@/components/forms/create-booking-modal';
import { RecordPaymentModal } from '@/components/forms/record-payment-modal';
import { CommonLoading } from '@/components/ui/common-loading';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsData, roomsData, hotelsData, guestsData] = await Promise.all([
        bookingService.list(),
        roomService.list(),
        hotelService.list(),
        guestService.list()
      ]);
      setBookings(bookingsData?.data || []);
      setRooms(roomsData?.data || []);
      setHotels(hotelsData as any);
      setGuests(guestsData?.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'checked_in': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'checked_out': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && bookings.length === 0) {
    return <CommonLoading message="Fetching reservations..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage reservations and payments</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={loadData} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="secondary" onClick={() => setGuestDialogOpen(true)} size="sm">
            <User className="h-4 w-4 mr-2" />
            Add Guest
          </Button>
          <Button onClick={() => setBookingDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Bookings List */}
      <Card className="border shadow-none rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Recent Bookings <Badge variant="secondary" className="ml-2">{bookings.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No bookings found.</div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-2.5 rounded-full mt-1">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">
                        {booking.guest_name || `Guest #${booking.guest_id}`}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground mt-0.5">
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{booking.booking_code}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{booking.hotel_name || 'Main Hotel'}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="font-medium text-foreground">Room {booking.room_number || booking.assigned_to}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 min-w-[200px] justify-end">
                    <div className="text-left sm:text-right text-sm">
                      <div className="font-medium">
                        {new Date(booking.check_in).toLocaleDateString()}
                        <span className="text-muted-foreground mx-1">→</span>
                        {new Date(booking.check_out).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {booking.total_hours ? `${booking.total_hours} Hours` : `${booking.total_nights} Nights`}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 min-w-[140px]">
                      <div className="text-right">
                        <div className="font-bold">${booking.total_amount}</div>
                        <Badge className={`${getStatusColor(booking.booking_status)} text-[10px] h-5 px-1.5 mt-0.5 border-0`}>
                          {booking.booking_status}
                        </Badge>
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-full"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setPaymentDialogOpen(true);
                        }}
                        title="Record Payment"
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddGuestModal
        open={guestDialogOpen}
        onOpenChange={setGuestDialogOpen}
        onSuccess={loadData}
      />

      <CreateBookingModal
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        onSuccess={loadData}
        guests={guests}
        rooms={rooms} // Pass rooms for selection logic
      />

      <RecordPaymentModal
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onSuccess={loadData}
        booking={selectedBooking}
      />
    </div>
  );
}