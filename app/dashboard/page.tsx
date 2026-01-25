'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DynamicSummaryCard, { SummaryCardData } from '@/components/dynamicSummaryCard';
import { CreateBookingModal } from '@/components/forms/create-booking-modal';
import { CreateAdvancedBookingModal } from '@/components/forms/create-advanced-booking-modal';
import { AddGuestModal } from '@/components/forms/add-guest-modal';
import { roomService } from '@/lib/services/rooms.service';
import { guestService } from '@/lib/services/guests.service';
import { hotelService } from '@/lib/services/hotels.service';
import { bookingService } from '@/lib/services/bookings.service';
import { CustomDateRangePicker } from '@/components/custom-date-range-picker';
import { DateRange } from 'react-day-picker';
import { subDays, format } from 'date-fns';
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
  Sparkles,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState<SummaryCardData[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Date Range State
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Modal states
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [advBookingOpen, setAdvBookingOpen] = useState(false);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | undefined>();
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string | undefined>();

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const fromDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined;
      const toDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined;

      // Passing filters to list APIs if supported
      // Use higher limit for dashboard to show all rooms/guests in dropdowns
      const [roomsData, guestsData, hotelsData, rangeBookingsData] = await Promise.all([
        roomService.list({ limit: 1000 }),
        guestService.list({ limit: 1000 }),
        hotelService.list(),
        bookingService.list({ fromDate, toDate, limit: 1000 })
      ]);

      setRooms(roomsData?.data || []);
      setGuests(guestsData?.data || []);
      setHotels(hotelsData as any);

      // Calculate comprehensive stats
      const totalRooms = roomsData?.data?.length || 0;
      const availableRooms = roomsData?.data?.filter((r: any) => r.status === 'available').length || 0;
      const occupiedRooms = roomsData?.data?.filter((r: any) => r.status === 'occupied').length || 0;

      const rangeRevenue = rangeBookingsData?.data?.reduce((sum: number, b: any) => sum + (Number(b.total_amount) || 0), 0) || 0;
      const rangeBookings = rangeBookingsData?.meta?.total || 0;

      setStats([
        {
          title: 'Available',
          value: availableRooms,
          changeValue: 0,
          icon: 'checkCircle',
          bgColor: 'green',
          suffix: ' rooms',
          changeLabel: 'Current Status',
        },
        {
          title: 'Occupied',
          value: occupiedRooms,
          changeValue: 0,
          icon: 'users',
          bgColor: 'red',
          suffix: ' rooms',
          changeLabel: 'Current Status',
        },
        {
          title: 'Revenue',
          value: rangeRevenue,
          changeValue: 0,
          icon: 'trendingUp',
          bgColor: 'blue',
          prefix: '$',
          changeLabel: 'Selected Range',
        },
        {
          title: 'Total Bookings',
          value: rangeBookings,
          changeValue: 0,
          icon: 'calendar',
          bgColor: 'yellow',
          suffix: ' bookings',
          changeLabel: 'Selected Range',
        },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (roomId: number, action: 'checkin' | 'checkout' | 'book' | 'advance' | 'clean') => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    try {
      if (action === 'book' || action === 'advance') {
        setSelectedRoomId(roomId);
        setSelectedRoomNumber(room.room_number);
        setBookingModalOpen(true);
      } else if (action === 'checkin') {
        // Now opens booking modal to enforce guest selection
        setSelectedRoomId(roomId);
        setSelectedRoomNumber(room.room_number);
        setBookingModalOpen(true);
        toast.info("Please select a guest for check-in");
      } else if (action === 'checkout') {
        await roomService.updateStatus(roomId, 'cleaning');
        toast.success(`Room ${room.room_number} checked out!`);
        loadData();
      } else if (action === 'clean') {
        await roomService.updateStatus(roomId, 'available');
        toast.success(`Room ${room.room_number} is now Ready!`);
        loadData();
      }
    } catch (error: any) {
      toast.error(error.message || 'Action failed');
    }
  };

  const getRoomStatusConfig = (status: string) => {
    // Solid, minimal colors without hover scales
    switch (status) {
      case 'available':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/20',
          border: 'border-emerald-200 dark:border-emerald-900',
          text: 'text-emerald-700 dark:text-emerald-400',
          icon: CheckCircle2,
          label: 'Available'
        };
      case 'occupied':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/20',
          border: 'border-rose-200 dark:border-rose-900',
          text: 'text-rose-700 dark:text-rose-400',
          icon: User,
          label: 'Occupied'
        };
      case 'cleaning':
      case 'maintenance':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/20',
          border: 'border-amber-200 dark:border-amber-900',
          text: 'text-amber-700 dark:text-amber-400',
          icon: Clock,
          label: 'Cleaning'
        };
      case 'advance':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/20',
          border: 'border-blue-200 dark:border-blue-900',
          text: 'text-blue-700 dark:text-blue-400',
          icon: Calendar,
          label: 'Advance'
        };
      default:
        return {
          bg: 'bg-slate-50 dark:bg-slate-900',
          border: 'border-slate-200 dark:border-slate-800',
          text: 'text-slate-700 dark:text-slate-400',
          icon: XCircle,
          label: 'Unknown'
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Property Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Real-time operations overview
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:items-center">
          <CustomDateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
          />
          <Button size="sm" variant="secondary" onClick={() => setAdvBookingOpen(true)}>
            <MoreHorizontal className="h-4 w-4 mr-1" />
            Advanced Booking
          </Button>
          <Button size="sm" onClick={() => setBookingModalOpen(true)}>
            <CalendarPlus className="h-4 w-4 mr-1" />
            Quick Book
          </Button>
          <Button size="sm" variant="outline" onClick={() => setGuestModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-1" />
            Add Guest
          </Button>
        </div>
      </div>

      {/* Stats Cards - Dense */}
      <DynamicSummaryCard cards={stats} />

      {/* Rooms Grid - Minimal Dense */}
      <CardContent className="p-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Hotel className="h-5 w-5 mr-2 text-primary" />
            Room Status
            <Badge variant="secondary" className="ml-2 text-xs font-normal">
              {rooms.length} Rooms
            </Badge>
          </h2>
          <Button variant="ghost" size="sm" onClick={loadData} className="h-8 text-xs">
            Refresh Data
          </Button>
        </div>

        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {rooms.map((room: any) => {
            const config = getRoomStatusConfig(room.status);
            const StatusIcon = config.icon;

            return (
              <div
                key={room.id}
                className={cn(
                  "flex flex-col justify-between p-2 rounded-lg border transition-colors min-h-[90px]",
                  config.bg,
                  config.border
                )}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-sm">{room.room_number}</span>
                  <StatusIcon className={cn("h-3 w-3", config.text)} />
                </div>

                <div className="text-[10px] text-muted-foreground truncate my-1">
                  {room.room_type_name}
                </div>

                <div className="mt-auto">
                  {room.status === 'available' ? (
                    <Button
                      size="sm"
                      variant="default"
                      className="w-full h-6 text-[10px] p-0 bg-primary/90 hover:bg-primary"
                      onClick={() => handleQuickAction(room.id, 'checkin')}
                    >
                      Book
                    </Button>
                  ) : room.status === 'occupied' ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full h-6 text-[10px] p-0"
                      onClick={() => handleQuickAction(room.id, 'checkout')}
                    >
                      Check-out
                    </Button>
                  ) : (room.status === 'cleaning' || room.status === 'maintenance') ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-6 text-[10px] p-0 border-amber-200 hover:bg-amber-100 hover:text-amber-800 dark:hover:bg-amber-900/30"
                      onClick={() => handleQuickAction(room.id, 'clean')}
                    >
                      Mark Ready
                    </Button>
                  ) : (
                    <Badge variant="outline" className="w-full justify-center text-[10px] h-6 border-primary/20">
                      {config.label}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No rooms configured.</p>
          </div>
        )}
      </CardContent>

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
      <CreateAdvancedBookingModal
        open={advBookingOpen}
        onOpenChange={setAdvBookingOpen}
        onSuccess={loadData}
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