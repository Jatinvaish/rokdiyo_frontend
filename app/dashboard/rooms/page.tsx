'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { roomApi, hotelApi } from '@/lib/api/hotel';
import { Room, RoomType, Hotel } from '@/lib/types/hotel';
import { Plus, Bed, Settings } from 'lucide-react';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  
  const [typeFormData, setTypeFormData] = useState({
    name: '',
    description: '',
    base_rate_hourly: '',
    base_rate_daily: '',
    max_occupancy: '2',
    amenities: '',
  });

  const [roomFormData, setRoomFormData] = useState({
    hotel_id: '',
    room_type_id: '',
    room_number_prefix: '',
    start_number: '',
    end_number: '',
    floor: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [roomsData, typesData, hotelsData] = await Promise.all([
        roomApi.list(),
        roomApi.listTypes(),
        hotelApi.list(),
      ]);
      setRooms(roomsData);
      setRoomTypes(typesData);
      setHotels(hotelsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await roomApi.createType({
        ...typeFormData,
        base_rate_hourly: parseFloat(typeFormData.base_rate_hourly),
        base_rate_daily: parseFloat(typeFormData.base_rate_daily),
        max_occupancy: parseInt(typeFormData.max_occupancy),
        amenities: typeFormData.amenities.split(',').map(a => a.trim()),
      });
      setTypeDialogOpen(false);
      setTypeFormData({
        name: '',
        description: '',
        base_rate_hourly: '',
        base_rate_daily: '',
        max_occupancy: '2',
        amenities: '',
      });
      loadData();
    } catch (error) {
      console.error('Failed to create room type:', error);
    }
  };

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await roomApi.bulkCreate({
        hotel_id: parseInt(roomFormData.hotel_id),
        room_type_id: parseInt(roomFormData.room_type_id),
        room_number_prefix: roomFormData.room_number_prefix,
        start_number: parseInt(roomFormData.start_number),
        end_number: parseInt(roomFormData.end_number),
        floor: roomFormData.floor,
      });
      setRoomDialogOpen(false);
      setRoomFormData({
        hotel_id: '',
        room_type_id: '',
        room_number_prefix: '',
        start_number: '',
        end_number: '',
        floor: '',
      });
      loadData();
    } catch (error) {
      console.error('Failed to create rooms:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'dirty': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
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
          <Dialog open={typeDialogOpen} onOpenChange={setTypeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Type
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base">Room Type</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleTypeSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-xs">Name</Label>
                  <Input
                    id="name"
                    value={typeFormData.name}
                    onChange={(e) => setTypeFormData({ ...typeFormData, name: e.target.value })}
                    className="h-8 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-xs">Description</Label>
                  <Input
                    id="description"
                    value={typeFormData.description}
                    onChange={(e) => setTypeFormData({ ...typeFormData, description: e.target.value })}
                    className="h-8 text-sm"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="hourly" className="text-xs">Hourly ($)</Label>
                    <Input
                      id="hourly"
                      type="number"
                      step="0.01"
                      value={typeFormData.base_rate_hourly}
                      onChange={(e) => setTypeFormData({ ...typeFormData, base_rate_hourly: e.target.value })}
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="daily" className="text-xs">Daily ($)</Label>
                    <Input
                      id="daily"
                      type="number"
                      step="0.01"
                      value={typeFormData.base_rate_daily}
                      onChange={(e) => setTypeFormData({ ...typeFormData, base_rate_daily: e.target.value })}
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="occupancy" className="text-xs">Max Occupancy</Label>
                  <Input
                    id="occupancy"
                    type="number"
                    value={typeFormData.max_occupancy}
                    onChange={(e) => setTypeFormData({ ...typeFormData, max_occupancy: e.target.value })}
                    className="h-8 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amenities" className="text-xs">Amenities</Label>
                  <Input
                    id="amenities"
                    value={typeFormData.amenities}
                    onChange={(e) => setTypeFormData({ ...typeFormData, amenities: e.target.value })}
                    placeholder="WiFi, TV, AC"
                    className="h-8 text-sm"
                  />
                </div>
                <Button type="submit" className="w-full h-8 text-sm">Create</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Rooms
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base">Bulk Create Rooms</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRoomSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="hotel" className="text-xs">Hotel</Label>
                  <select
                    id="hotel"
                    className="w-full h-8 px-2 border rounded text-sm"
                    value={roomFormData.hotel_id}
                    onChange={(e) => setRoomFormData({ ...roomFormData, hotel_id: e.target.value })}
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
                  <Label htmlFor="roomType" className="text-xs">Room Type</Label>
                  <select
                    id="roomType"
                    className="w-full h-8 px-2 border rounded text-sm"
                    value={roomFormData.room_type_id}
                    onChange={(e) => setRoomFormData({ ...roomFormData, room_type_id: e.target.value })}
                    required
                  >
                    <option value="">Select type</option>
                    {roomTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="prefix" className="text-xs">Prefix</Label>
                    <Input
                      id="prefix"
                      value={roomFormData.room_number_prefix}
                      onChange={(e) => setRoomFormData({ ...roomFormData, room_number_prefix: e.target.value })}
                      placeholder="1"
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="start" className="text-xs">Start</Label>
                    <Input
                      id="start"
                      type="number"
                      value={roomFormData.start_number}
                      onChange={(e) => setRoomFormData({ ...roomFormData, start_number: e.target.value })}
                      placeholder="101"
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end" className="text-xs">End</Label>
                    <Input
                      id="end"
                      type="number"
                      value={roomFormData.end_number}
                      onChange={(e) => setRoomFormData({ ...roomFormData, end_number: e.target.value })}
                      placeholder="120"
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="floor" className="text-xs">Floor</Label>
                  <Input
                    id="floor"
                    value={roomFormData.floor}
                    onChange={(e) => setRoomFormData({ ...roomFormData, floor: e.target.value })}
                    placeholder="1"
                    className="h-8 text-sm"
                  />
                </div>
                <Button type="submit" className="w-full h-8 text-sm">Create</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Room Types</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {roomTypes.map((type) => (
              <div key={type.id} className="p-2 border rounded text-sm">
                <p className="font-medium text-sm mb-1">{type.name}</p>
                <p className="text-xs text-muted-foreground mb-1">{type.description}</p>
                <div className="flex justify-between text-xs">
                  <span>${type.base_rate_hourly}/hr</span>
                  <span>${type.base_rate_daily}/day</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Max {type.max_occupancy}
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
            Rooms ({rooms.length})
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
    </div>
  );
}