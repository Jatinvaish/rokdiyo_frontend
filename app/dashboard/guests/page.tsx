'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { guestApi } from '@/lib/api/hotel';
import { Guest } from '@/lib/types/hotel';
import { Plus, User, Search, History } from 'lucide-react';

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [guestHistory, setGuestHistory] = useState<any[]>([]);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    id_type: 'passport',
    id_number: '',
    date_of_birth: '',
    nationality: '',
    address: '',
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const guest = await guestApi.create(formData);
      setGuests([...guests, guest]);
      setDialogOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        id_type: 'passport',
        id_number: '',
        date_of_birth: '',
        nationality: '',
        address: '',
      });
    } catch (error) {
      console.error('Failed to create guest:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchEmail) return;
    try {
      const results = await guestApi.search(searchEmail);
      setSearchResults(Array.isArray(results) ? results : [results]);
    } catch (error) {
      console.error('Failed to search guest:', error);
      setSearchResults([]);
    }
  };

  const handleViewHistory = async (guest: Guest) => {
    try {
      const history = await guestApi.history(guest.id);
      setGuestHistory(history);
      setSelectedGuest(guest);
      setHistoryDialogOpen(true);
    } catch (error) {
      console.error('Failed to load guest history:', error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Guests</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">Create Guest</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="firstName" className="text-xs">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="h-8 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="h-8 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-8 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-8 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="idType" className="text-xs">ID Type</Label>
                  <select
                    id="idType"
                    className="w-full h-8 px-2 border rounded text-sm"
                    value={formData.id_type}
                    onChange={(e) => setFormData({ ...formData, id_type: e.target.value })}
                  >
                    <option value="passport">Passport</option>
                    <option value="license">License</option>
                    <option value="national_id">National ID</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="idNumber" className="text-xs">ID Number</Label>
                  <Input
                    id="idNumber"
                    value={formData.id_number}
                    onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                    className="h-8 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="dob" className="text-xs">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="nationality" className="text-xs">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address" className="text-xs">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <Button type="submit" className="w-full h-8 text-sm">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
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
            Recent Guests
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {guests.length === 0 ? (
            <div className="text-center py-6">
              <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium mb-1">No guests found</p>
              <p className="text-xs text-muted-foreground mb-3">Search or create guests</p>
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
                      <div className="font-medium text-sm">${booking.total_amount}</div>
                      <Badge variant="outline" className="text-xs">{booking.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}