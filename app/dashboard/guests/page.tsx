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

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [guestHistory, setGuestHistory] = useState<any[]>([]);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    try {
      const data = await guestService.list();
      setGuests(data as any);
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

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Guests</h1>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
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
            <div className="space-y-2">
              {guests.map((guest) => (
                <div key={guest.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{guest.first_name} {guest.last_name}</p>
                      <p className="text-xs text-muted-foreground">{guest.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">{guest.id_type}: {guest.id_number}</Badge>
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
      />
    </div>
  );
}