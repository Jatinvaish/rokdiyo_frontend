'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { bookingApi, guestApi, roomApi, hotelApi } from '@/lib/api/hotel';
import { Booking, Guest, Room, Hotel } from '@/lib/types/hotel';
import { Plus, Calendar, User, CreditCard } from 'lucide-react';

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

  const [guestFormData, setGuestFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    id_type: 'passport',
    id_number: '',
  });

  const [bookingFormData, setBookingFormData] = useState({
    guest_id: '',
    hotel_id: '',
    room_id: '',
    check_in_date: '',
    check_out_date: '',
    total_amount: '',
    booking_type: 'daily',
    special_requests: '',
  });

  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    payment_method: 'cash',
    reference_number: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsData, roomsData, hotelsData] = await Promise.all([
        bookingApi.list(),
        roomApi.list(),
        hotelApi.list(),
      ]);
      setBookings(bookingsData);
      setRooms(roomsData);
      setHotels(hotelsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const guest = await guestApi.create(guestFormData);
      setGuests([...guests, guest]);
      setGuestDialogOpen(false);
      setGuestFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        id_type: 'passport',
        id_number: '',
      });
    } catch (error) {
      console.error('Failed to create guest:', error);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bookingApi.create({
        ...bookingFormData,
        guest_id: parseInt(bookingFormData.guest_id),
        hotel_id: parseInt(bookingFormData.hotel_id),
        room_id: parseInt(bookingFormData.room_id),
        total_amount: parseFloat(bookingFormData.total_amount),
      });
      setBookingDialogOpen(false);
      setBookingFormData({
        guest_id: '',
        hotel_id: '',
        room_id: '',
        check_in_date: '',
        check_out_date: '',
        total_amount: '',
        booking_type: 'daily',
        special_requests: '',
      });
      loadData();
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    
    try {
      await bookingApi.recordPayment({
        booking_id: selectedBooking.id,
        amount: parseFloat(paymentFormData.amount),
        payment_method: paymentFormData.payment_method,
        reference_number: paymentFormData.reference_number,
      });
      setPaymentDialogOpen(false);
      setPaymentFormData({
        amount: '',
        payment_method: 'cash',
        reference_number: '',
      });
      loadData();
    } catch (error) {
      console.error('Failed to record payment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'checked_in': return 'bg-green-100 text-green-800';
      case 'checked_out': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bookings Management</h1>
        <div className="flex space-x-2">
          <Dialog open={guestDialogOpen} onOpenChange={setGuestDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <User className="h-4 w-4 mr-2" />
                Add Guest
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Guest</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleGuestSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={guestFormData.first_name}
                      onChange={(e) => setGuestFormData({ ...guestFormData, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={guestFormData.last_name}
                      onChange={(e) => setGuestFormData({ ...guestFormData, last_name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={guestFormData.email}
                      onChange={(e) => setGuestFormData({ ...guestFormData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={guestFormData.phone}
                      onChange={(e) => setGuestFormData({ ...guestFormData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="idType">ID Type</Label>
                    <select
                      id="idType"
                      className="w-full p-2 border rounded-md"
                      value={guestFormData.id_type}
                      onChange={(e) => setGuestFormData({ ...guestFormData, id_type: e.target.value })}
                    >
                      <option value="passport">Passport</option>
                      <option value="license">Driver's License</option>
                      <option value="national_id">National ID</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input
                      id="idNumber"
                      value={guestFormData.id_number}
                      onChange={(e) => setGuestFormData({ ...guestFormData, id_number: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">Create Guest</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Booking</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hotel">Hotel</Label>
                    <select
                      id="hotel"
                      className="w-full p-2 border rounded-md"
                      value={bookingFormData.hotel_id}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, hotel_id: e.target.value })}
                      required
                    >
                      <option value="">Select hotel</option>
                      {hotels.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="room">Room</Label>
                    <select
                      id="room"
                      className="w-full p-2 border rounded-md"
                      value={bookingFormData.room_id}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, room_id: e.target.value })}
                      required
                    >
                      <option value="">Select room</option>
                      {rooms
                        .filter(room => room.status === 'available' && 
                          (!bookingFormData.hotel_id || room.hotel_id.toString() === bookingFormData.hotel_id))
                        .map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.room_number} - {room.room_type_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkIn">Check-in Date</Label>
                    <Input
                      id="checkIn"
                      type="datetime-local"
                      value={bookingFormData.check_in_date}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, check_in_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkOut">Check-out Date</Label>
                    <Input
                      id="checkOut"
                      type="datetime-local"
                      value={bookingFormData.check_out_date}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, check_out_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Total Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={bookingFormData.total_amount}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, total_amount: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bookingType">Booking Type</Label>
                    <select
                      id="bookingType"
                      className="w-full p-2 border rounded-md"
                      value={bookingFormData.booking_type}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, booking_type: e.target.value })}
                    >
                      <option value="daily">Daily</option>
                      <option value="hourly">Hourly</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="requests">Special Requests</Label>
                  <Input
                    id="requests"
                    value={bookingFormData.special_requests}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, special_requests: e.target.value })}
                    placeholder="Late checkout, extra towels, etc."
                  />
                </div>
                <Button type="submit" className="w-full">Create Booking</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Recent Bookings ({bookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-medium">
                      {booking.guest_name || `Guest #${booking.guest_id}`}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {booking.hotel_name} - Room {booking.room_number}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm">
                    <div>{new Date(booking.check_in_date).toLocaleDateString()}</div>
                    <div className="text-muted-foreground">
                      to {new Date(booking.check_out_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${booking.total_amount}</div>
                    <Badge
                      className={`text-xs ${getStatusColor(booking.status)}`}
                      variant="secondary"
                    >
                      {booking.status}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setPaymentDialogOpen(true);
                    }}
                  >
                    <CreditCard className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div>
              <Label htmlFor="paymentAmount">Amount ($)</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                value={paymentFormData.amount}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <select
                id="paymentMethod"
                className="w-full p-2 border rounded-md"
                value={paymentFormData.payment_method}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_method: e.target.value })}
              >
                <option value="cash">Cash</option>
                <option value="card">Credit Card</option>
                <option value="transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                value={paymentFormData.reference_number}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, reference_number: e.target.value })}
                placeholder="Transaction ID, receipt number, etc."
              />
            </div>
            <Button type="submit" className="w-full">Record Payment</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}