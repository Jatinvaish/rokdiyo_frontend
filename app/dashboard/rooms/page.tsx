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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Settings,
  Bed,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCcw,
  Plus,
  ArrowRight,
  TrendingUp,
  Calendar,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import DynamicSummaryCards, { SummaryCardData } from '@/components/dynamicSummaryCard';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);
  const [loadDataTimer, setLoadDataTimer] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (search.length > 0 || rooms.length > 0) {
      if (loadDataTimer) clearTimeout(loadDataTimer);
      const timer = setTimeout(() => {
        loadData(search);
      }, 500);
      setLoadDataTimer(timer);
      return () => clearTimeout(timer);
    }
  }, [search]);

  const loadData = async (searchQuery?: string) => {
    if (rooms.length > 0) setRefreshing(true);
    try {
      const [roomsData, typesData, hotelsData] = await Promise.all([
        roomService.list({ search: searchQuery }),
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
      setRefreshing(false);
    }
  };

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => ['maintenance', 'cleaning'].includes(r.status)).length,
  };

  const summaryCards: SummaryCardData[] = [
    {
      title: "Total Rooms",
      value: stats.total,
      changeValue: 0,
      icon: "calendar",
      bgColor: "indigo",
      changeLabel: "Live inventory"
    },
    {
      title: "Available",
      value: stats.available,
      changeValue: Math.round((stats.available / stats.total) * 100) || 0,
      icon: "checkCircle",
      bgColor: "green",
      suffix: "",
      changeLabel: "% of total"
    },
    {
      title: "Occupied",
      value: stats.occupied,
      changeValue: Math.round((stats.occupied / stats.total) * 100) || 0,
      icon: "trendingUp",
      bgColor: "red",
      changeLabel: "% occupancy rate"
    },
    {
      title: "Maintenance",
      value: stats.maintenance,
      changeValue: 0,
      icon: "clock",
      bgColor: "yellow",
      changeLabel: "In service"
    }
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'available':
        return {
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle2 className="w-3 h-3" />,
          label: 'Available'
        };
      case 'occupied':
        return {
          color: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <XCircle className="w-3 h-3" />,
          label: 'Occupied'
        };
      case 'cleaning':
      case 'maintenance':
        return {
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <AlertCircle className="w-3 h-3" />,
          label: status.charAt(0).toUpperCase() + status.slice(1)
        };
      case 'advance':
        return {
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: <Clock className="w-3 h-3" />,
          label: 'Reserved'
        };
      default:
        return {
          color: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: <AlertCircle className="w-3 h-3" />,
          label: status
        };
    }
  };

  if (loading && rooms.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
        </div>
        <p className="text-muted-foreground animate-pulse font-medium text-xs">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="  space-y-4 w-full animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold tracking-tight">Room Management</h1>
          <p className="text-muted-foreground text-xs flex items-center gap-2">
            Real-time accommodation status
            <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/40"></span>
            Last sync: {new Date().toLocaleTimeString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative group flex-1 min-w-[240px]">
            <InputGroup className="border-muted/30 h-9">
              <InputGroupAddon>
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Find room..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="bg-transparent text-sm"
              />
            </InputGroup>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => loadData(search)}
              disabled={refreshing}
              className={`h-9 w-9 ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCcw className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setSelectedRoomType(null); setTypeDialogOpen(true); }} className="h-9 gap-2">
              <Settings className="h-3.5 w-3.5" />
              Types
            </Button>
            <Button size="sm" onClick={() => { setSelectedRoom(null); setRoomDialogOpen(true); }} className="h-9 gap-2">
              <Plus className="h-3.5 w-3.5" />
              Add Room
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <DynamicSummaryCards cards={summaryCards} />

      <Tabs defaultValue="rooms" className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger
              value="rooms"
              className="text-xs font-semibold"
            >
              All Rooms
            </TabsTrigger>
            <TabsTrigger
              value="types"
              className="text-xs font-semibold"
            >
              Room Types
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="rooms" className="m-0 focus-visible:outline-none">
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2">
            {rooms.length > 0 ? (
              rooms.map((room) => {
                const config = getStatusConfig(room.status);
                return (
                  <div
                    key={room.id}
                    className="group border rounded bg-card p-2 flex flex-col items-center justify-between min-h-[90px] cursor-pointer"
                    onClick={() => { setSelectedRoom(room); setRoomDialogOpen(true); }}
                  >
                    <div className="text-xs font-bold text-muted-foreground/60 uppercase tracking-tighter">Room</div>
                    <div className="text-lg font-black tracking-tighter tabular-nums">
                      {room.room_number}
                    </div>
                    <div className={`mt-1.5 w-full py-0.5 rounded-sm border flex items-center justify-center gap-1 ${config.color} text-[9px] font-bold uppercase`}>
                      {config.icon}
                      {config.label}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed rounded bg-muted/20">
                <Search className="w-6 h-6 text-muted-foreground mx-auto mb-2 opacity-20" />
                <h3 className="text-sm font-semibold opacity-60">No rooms matched</h3>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="types" className="m-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {roomTypes.map((type) => (
              <div key={type.id} className="border rounded bg-card flex flex-col overflow-hidden">
                <div className="h-1 bg-primary/20"></div>
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-tight">{type.type_name}</h3>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">
                        {type.description || 'No description'}
                      </p>
                    </div>
                    <div className="p-1.5 rounded-sm bg-muted">
                      <Bed className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-muted/30 p-2 rounded border border-muted/20">
                      <div className="text-[8px] uppercase font-bold text-muted-foreground mb-0.5 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> Hourly
                      </div>
                      <div className="text-sm font-black">₹{type.base_rate_hourly}</div>
                    </div>
                    <div className="bg-muted/30 p-2 rounded border border-muted/20">
                      <div className="text-[8px] uppercase font-bold text-muted-foreground mb-0.5 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" /> Daily
                      </div>
                      <div className="text-sm font-black">₹{type.base_rate_daily}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] border-t border-muted/30 pt-2">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Users className="w-3 h-3" /> {type.max_occupancy} Guests
                    </span>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-[10px] uppercase font-black text-primary"
                      onClick={() => { setSelectedRoomType(type); setTypeDialogOpen(true); }}
                    >
                      Edit <ArrowRight className="ml-1 w-2.5 h-2.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddRoomTypeModal
        open={typeDialogOpen}
        onOpenChange={(open) => {
          setTypeDialogOpen(open);
          if (!open) setSelectedRoomType(null);
        }}
        onSuccess={loadData}
        initialData={selectedRoomType}
      />
      <AddRoomModal
        roomTypes={roomTypes}
        open={roomDialogOpen}
        onOpenChange={(open) => {
          setRoomDialogOpen(open);
          if (!open) setSelectedRoom(null);
        }}
        onSuccess={loadData}
        initialData={selectedRoom}
      />
    </div>
  );
}