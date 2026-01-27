'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddRoomModal } from '@/components/forms/add-room-modal';
import { AddRoomTypeModal } from '@/components/forms/add-room-type-modal';
import { roomService } from '@/lib/services/rooms.service';
import { hotelService } from '@/lib/services/hotels.service';
import { Room, RoomType, Hotel } from '@/lib/types/hotel';
import { Settings, Bed } from 'lucide-react';
import { toast } from 'sonner';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [roomsData, typesData, hotelsData] = await Promise.all([
        roomService.list({}),
        roomService.listTypes(),
        hotelService.list(),
      ]);
      setRooms((roomsData as any).data || []);
      setRoomTypes(typesData as any);
      setHotels(hotelsData as any);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load rooms data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'cleaning':
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'advance': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Rooms</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setTypeDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-1" />
            Room Type
          </Button>
          <Button size="sm" onClick={() => setRoomDialogOpen(true)}>
            <Bed className="h-4 w-4 mr-1" />
            Add Room
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Room Types</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {roomTypes.map((type) => (
              <div key={type.id} className="p-2 border rounded text-sm">
                <p className="font-medium text-sm mb-1">{type.type_name || type.name}</p>
                <p className="text-xs text-muted-foreground mb-1">{type.description}</p>
                <div className="flex justify-between text-xs">
                  <span>₹{type.base_rate_hourly}/hr</span>
                  <span>₹{type.base_rate_daily}/day</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Max {type.max_occupancy} guests
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            All Rooms ({rooms.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="p-2 border rounded text-center cursor-pointer hover:shadow-sm transition-shadow"
              >
                <div className="font-medium text-xs">{room.room_number}</div>
                <div className="text-xs text-muted-foreground mb-1 truncate">
                  {room.hotel_name}
                </div>
                <Badge
                  className={`text-xs ${getStatusColor(room.status)}`}
                  variant="secondary"
                >
                  {room.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddRoomTypeModal
        open={typeDialogOpen}
        onOpenChange={setTypeDialogOpen}
        onSuccess={loadData}
      />
      <AddRoomModal
        hotelId={hotels[0]?.id || 1}
        roomTypes={roomTypes}
        open={roomDialogOpen}
        onOpenChange={setRoomDialogOpen}
        onSuccess={loadData}
      />
    </div>
  );
}