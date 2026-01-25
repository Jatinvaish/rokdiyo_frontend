'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DynamicSummaryCard, { SummaryCardData } from '@/components/dynamicSummaryCard';
import { CreateBookingModal } from '@/components/forms/create-booking-modal';
import { AddGuestModal } from '@/components/forms/add-guest-modal';
import { roomService } from '@/lib/services/rooms.service';
import { guestService } from '@/lib/services/guests.service';
import { hotelService } from '@/lib/services/hotels.service';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  Hotel,
  UserPlus,
  CalendarPlus,
  LogIn,
  LogOut,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState<SummaryCardData[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | undefined>();
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string | undefined>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsData, guestsData, hotelsData] = await Promise.all([
        roomService.list(),
        guestService.list(),
        hotelService.list(),
      ]);

      setRooms(roomsData as any);
      setGuests(guestsData as any);
      setHotels(hotelsData as any);

      // Calculate comprehensive stats
      const totalRooms = (roomsData as any)?.length || 0;
      const availableRooms = (roomsData as any)?.filter((r: any) => r.status === 'available').length || 0;
      const occupiedRooms = (roomsData as any)?.filter((r: any) => r.status === 'occupied').length || 0;
      const cleaningRooms = (roomsData as any)?.filter((r: any) => r.status === 'cleaning' || r.status === 'maintenance').length || 0;
      const advanceRooms = (roomsData as any)?.filter((r: any) => r.status === 'advance').length || 0;

      setStats([
        {
          title: 'Available',
          value: availableRooms,
          changeValue: totalRooms > 0 ? Math.round((availableRooms / totalRooms) * 100) : 0,
          icon: 'checkCircle',
          bgColor: 'green',
          suffix: ' rooms',
          changeLabel: '% of total',
        },
        {
          title: 'Occupied',
          value: occupiedRooms,
          changeValue: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
          icon: 'users',
          bgColor: 'red',
          suffix: ' rooms',
          changeLabel: '% occupancy',
        },
        {
          title: 'Cleaning',
          value: cleaningRooms,
          changeValue: totalRooms > 0 ? Math.round((cleaningRooms / totalRooms) * 100) : 0,
          icon: 'clock',
          bgColor: 'yellow',
          suffix: ' rooms',
          changeLabel: '% in service',
        },
        {
          title: 'Advance Bookings',
          value: advanceRooms,
          changeValue: totalRooms > 0 ? Math.round((advanceRooms / totalRooms) * 100) : 0,
          icon: 'calendar',
          bgColor: 'blue',
          suffix: ' bookings',
          changeLabel: '% pre-booked',
        },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (roomId: number, action: 'checkin' | 'checkout' | 'book' | 'advance') => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    try {
      if (action === 'book' || action === 'advance') {
        // Open booking modal
        setSelectedRoomId(roomId);
        setSelectedRoomNumber(room.room_number);
        setBookingModalOpen(true);
      } else if (action === 'checkin') {
        // Change status from available/advance to occupied
        await roomService.updateStatus(roomId, 'occupied');
        toast.success(`Room ${room.room_number} checked in!`);
        loadData();
      } else if (action === 'checkout') {
        // Change status from occupied to cleaning
        await roomService.updateStatus(roomId, 'cleaning');
        toast.success(`Room ${room.room_number} checked out!`);
        loadData();
      }
    } catch (error: any) {
      toast.error(error.message || 'Action failed');
    }
  };

  const getRoomStatusConfig = (status: string) => {
    switch (status) {
      case 'available':
        return {
          color: 'border-green-400 bg-green-50 dark:bg-green-950/20',
          badgeColor: 'bg-green-500 text-white',
          icon: CheckCircle2,
          iconColor: 'text-green-600',
          label: 'Available',
        };
      case 'occupied':
        return {
          color: 'border-red-400 bg-red-50 dark:bg-red-950/20',
          badgeColor: 'bg-red-500 text-white',
          icon: User,
          iconColor: 'text-red-600',
          label: 'Occupied',
        };
      case 'cleaning':
      case 'maintenance':
        return {
          color: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20',
          badgeColor: 'bg-yellow-500 text-white',
          icon: Clock,
          iconColor: 'text-yellow-600',
          label: 'Cleaning',
        };
      case 'advance':
        return {
          color: 'border-blue-400 bg-blue-50 dark:bg-blue-950/20',
          badgeColor: 'bg-blue-500 text-white',
          icon: Calendar,
          iconColor: 'text-blue-600',
          label: 'Advance',
        };
      default:
        return {
          color: 'border-gray-300 bg-gray-50 dark:bg-gray-950/20',
          badgeColor: 'bg-gray-500 text-white',
          icon: XCircle,
          iconColor: 'text-gray-600',
          label: 'Unknown',
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <Sparkles className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Property Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Real-time room management & bookings
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Button size="sm" variant="outline" onClick={() => setGuestModalOpen(true)} className="w-full sm:w-auto">
            <UserPlus className="h-4 w-4 mr-1" />
            Add Guest
          </Button>
          <Button size="sm" onClick={() => setBookingModalOpen(true)} className="w-full sm:w-auto">
            <CalendarPlus className="h-4 w-4 mr-1" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <DynamicSummaryCard cards={stats} />

      {/* Rooms Grid - POS Style */}
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Hotel className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Live Room Status</h2>
              <Badge variant="outline" className="ml-2">{rooms.length} Total</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={loadData}>
              Refresh
            </Button>
          </div>

          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {rooms.map((room: any) => {
              const config = getRoomStatusConfig(room.status);
              const StatusIcon = config.icon;

              return (
                <Card
                  key={room.id}
                  className={cn(
                    "relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105 border-2",
                    config.color
                  )}
                >
                  <CardContent className="p-3 space-y-2">
                    {/* Room Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {room.room_number}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {room.room_type_name}
                        </div>
                      </div>
                      <StatusIcon className={cn("h-5 w-5", config.iconColor)} />
                    </div>

                    {/* Status Badge */}
                    <Badge className={cn("w-full justify-center text-xs", config.badgeColor)}>
                      {config.label}
                    </Badge>

                    {/* Room Info */}
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Floor:</span>
                        <span className="font-medium text-foreground">{room.floor}</span>
                      </div>
                      <div className="truncate">
                        <span className="text-xs">{room.hotel_name}</span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="pt-2 space-y-1">
                      {room.status === 'available' && (
                        <>
                          <Button
                            size="sm"
                            className="w-full h-7 text-xs"
                            onClick={() => handleQuickAction(room.id, 'checkin')}
                          >
                            <LogIn className="h-3 w-3 mr-1" />
                            Quick Check-in
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full h-7 text-xs"
                            onClick={() => handleQuickAction(room.id, 'book')}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Book Now
                          </Button>
                        </>
                      )}

                      {room.status === 'occupied' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full h-7 text-xs"
                          onClick={() => handleQuickAction(room.id, 'checkout')}
                        >
                          <LogOut className="h-3 w-3 mr-1" />
                          Check-out
                        </Button>
                      )}

                      {(room.status === 'cleaning' || room.status === 'maintenance') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-7 text-xs"
                          onClick={() => roomService.updateStatus(room.id, 'available').then(loadData)}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Mark Available
                        </Button>
                      )}

                      {room.status === 'advance' && (
                        <Button
                          size="sm"
                          className="w-full h-7 text-xs"
                          onClick={() => handleQuickAction(room.id, 'checkin')}
                        >
                          <LogIn className="h-3 w-3 mr-1" />
                          Check-in Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {rooms.length === 0 && (
            <div className="text-center py-12">
              <Hotel className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">No rooms found</p>
              <p className="text-xs text-muted-foreground">Add rooms to start managing bookings</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateBookingModal
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        onSuccess={loadData}
        preselectedRoomId={selectedRoomId}
        preselectedRoomNumber={selectedRoomNumber}
        guests={guests}
        rooms={rooms}
      />
      <AddGuestModal
        open={guestModalOpen}
        onOpenChange={setGuestModalOpen}
        onSuccess={loadData}
      />
    </div>
  );
}