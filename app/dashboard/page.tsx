'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DynamicSummaryCard, { SummaryCardData } from '@/components/dynamicSummaryCard';
import { AddHotelModal } from '@/components/forms/add-hotel-modal';
import { AddGuestModal } from '@/components/forms/add-guest-modal';
import { AddRoomTypeModal } from '@/components/forms/add-room-type-modal';
import { hotelService } from '@/lib/services/hotels.service';
import { roomService } from '@/lib/services/rooms.service';
import { Plus, Hotel, Users, DoorOpen } from 'lucide-react';
import { Room, Hotel as HotelType } from '@/lib/types/hotel';

export default function DashboardPage() {
  const [stats, setStats] = useState<SummaryCardData[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [hotelModalOpen, setHotelModalOpen] = useState(false);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [roomTypeModalOpen, setRoomTypeModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsData] = await Promise.all([
        roomService.list(),
      ]);
      
      setRooms(roomsData as any);
      
      // Calculate stats
      const totalRooms = (roomsData as any)?.length || 0;
      const occupiedRooms = (roomsData as any)?.filter((r: any) => r.status === 'occupied').length || 0;
      const availableRooms = (roomsData as any)?.filter((r: any) => r.status === 'available').length || 0;
      const cleaningRooms = (roomsData as any)?.filter((r: any) => r.status === 'dirty' || r.status === 'maintenance').length || 0;
      
      setStats([
        {
          title: 'Total Rooms',
          value: totalRooms,
          changeValue: 0,
          icon: 'shoppingCart',
          bgColor: 'blue',
          suffix: ' rooms',
        },
        {
          title: 'Occupied',
          value: occupiedRooms,
          changeValue: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
          icon: 'checkCircle',
          bgColor: 'green',
          suffix: ' rooms',
        },
        {
          title: 'Available',
          value: availableRooms,
          changeValue: totalRooms > 0 ? Math.round((availableRooms / totalRooms) * 100) : 0,
          icon: 'alertCircle',
          bgColor: 'orange',
          suffix: ' rooms',
        },
        {
          title: 'Cleaning',
          value: cleaningRooms,
          changeValue: totalRooms > 0 ? Math.round((cleaningRooms / totalRooms) * 100) : 0,
          icon: 'clock',
          bgColor: 'purple',
          suffix: ' rooms',
        },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'dirty':
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'booked':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Top Bar with Add Buttons */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setHotelModalOpen(true)}>
            <Hotel className="h-4 w-4 mr-2" />
            Add Hotel
          </Button>
          <Button size="sm" onClick={() => setGuestModalOpen(true)}>
            <Users className="h-4 w-4 mr-2" />
            Add Guest
          </Button>
          <Button size="sm" onClick={() => setRoomTypeModalOpen(true)}>
            <DoorOpen className="h-4 w-4 mr-2" />
            Add Room Type
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <DynamicSummaryCard cards={stats} />

      {/* Room Status Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Room Status Overview</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rooms.map((room) => (
            <Card key={room.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    Room {room.room_number}
                  </CardTitle>
                  <Badge className={getStatusColor(room.status)}>
                    {room.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{room.room_type_name}</p>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Hotel</p>
                  <p className="font-medium text-xs">{room.hotel_name}</p>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Floor</p>
                  <p className="font-medium">{room.floor}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AddHotelModal 
        open={hotelModalOpen} 
        onOpenChange={setHotelModalOpen}
        onSuccess={loadData}
      />
      <AddGuestModal 
        open={guestModalOpen} 
        onOpenChange={setGuestModalOpen}
        onSuccess={loadData}
      />
      <AddRoomTypeModal 
        open={roomTypeModalOpen} 
        onOpenChange={setRoomTypeModalOpen}
        onSuccess={loadData}
      />
    </div>
  );
}