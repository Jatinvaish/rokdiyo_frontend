'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AddGuestModal } from '@/components/forms/add-guest-modal';
import { guestService } from '@/lib/services/guests.service';
import { Guest } from '@/lib/types/hotel';
import { Plus, User, Search, History } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CommonLoading } from '@/components/ui/common-loading';

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [guestHistory, setGuestHistory] = useState<any[]>([]);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    try {
      const response = await guestService.list();
      setGuests(response.data || []);
    } catch (error) {
      console.error('Failed to load guests:', error);
      toast.error('Failed to load guests');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchEmail) return;
    try {
      const results = await guestService.search(searchEmail);
      setSearchResults((Array.isArray(results) ? results : [results]) as any);
    } catch (error) {
      console.error('Failed to search guest:', error);
      setSearchResults([]);
    }
  };

  const handleViewHistory = async (guest: Guest) => {
    try {
      const history = await guestService.getHistory(guest.id);
      setGuestHistory(history as any);
      setSelectedGuest(guest);
      setHistoryDialogOpen(true);
    } catch (error) {
      console.error('Failed to load guest history:', error);
      toast.error('Failed to load guest history');
    }
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingGuest(null);
    setDialogOpen(true);
  };

  if (loading) {
    return <CommonLoading message="Fetching Guests..." />;
  }

  return (
    <div className="space-y-6   animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Guests</h1>
        <Button size="sm" onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-1" />
          Add Guest
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <Search className="h-4 w-4 mr-1" />
            Search Guest
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="h-8 text-sm"
            />
            <Button onClick={handleSearch} size="sm">Search</Button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-3 space-y-2">
              {searchResults.map((guest) => (
                <div key={guest.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{guest.first_name} {guest.last_name}</p>
                      <p className="text-xs text-muted-foreground">{guest.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">{guest.id_type}</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewHistory(guest)}
                      className="h-6 text-xs"
                    >
                      <History className="h-3 w-3 mr-1" />
                      History
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <User className="h-4 w-4 mr-1" />
            All Guests ({guests.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {guests.length === 0 ? (
            <div className="text-center py-6">
              <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium mb-1">No guests found</p>
              <p className="text-xs text-muted-foreground mb-3">Add your first guest</p>
              <Button onClick={() => setDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Guest
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {guests.map((guest) => (
                <div key={guest.id} className="group flex flex-col p-4 border rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 gap-3 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-sm tracking-tight">{guest.first_name} {guest.last_name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{guest.guest_code || `#G-${guest.id}`}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold px-1.5 h-5">
                      {guest.vip_status || 'Regular'}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span className="w-16 font-semibold uppercase text-[9px]">Phone</span>
                      <span className="text-foreground">{guest.phone}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span className="w-16 font-semibold uppercase text-[9px]">Email</span>
                      <span className="text-foreground truncate max-w-[150px]">{guest.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span className="w-16 font-semibold uppercase text-[9px]">Identity</span>
                      <span className="text-foreground truncate">{guest.id_type?.replace('_', ' ') || 'NONE'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-primary/5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewHistory(guest)}
                      className="h-7 text-[10px] uppercase font-bold tracking-wider hover:text-primary"
                    >
                      <History className="h-3 w-3 mr-1.5" />
                      History
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(guest)}
                      className="h-7 text-[10px] uppercase font-bold tracking-wider hover:text-primary"
                    >
                      Edit Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guest History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">
              History - {selectedGuest?.first_name} {selectedGuest?.last_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {guestHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-6 text-sm">No booking history</p>
            ) : (
              <div className="space-y-2">
                {guestHistory.map((booking: any) => (
                  <div key={booking.id} className="flex items-center justify-between p-2 border rounded text-sm">
                    <div>
                      <p className="font-medium text-sm">{booking.hotel_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Room {booking.room_number} - {booking.room_type_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(booking.check_in_date).toLocaleDateString()} -
                        {new Date(booking.check_out_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm">₹{booking.total_amount}</div>
                      <Badge variant="outline" className="text-xs">{booking.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Guest Modal */}
      <AddGuestModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadGuests}
        initialData={editingGuest}
      />
    </div>
  );
}