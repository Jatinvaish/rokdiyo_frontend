'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { hotelService } from '@/lib/services/hotels.service';
import { Hotel } from '@/lib/types/hotel';
import { Plus, Building2, MapPin } from 'lucide-react';

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
    website: '',
    is_headquarters: false,
  });

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      const data = await hotelService.list();
      setHotels(data as any);
    } catch (error) {
      console.error('Failed to load hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await hotelService.create(formData);
      setDialogOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zip_code: '',
        website: '',
        is_headquarters: false,
      });
      loadHotels();
    } catch (error) {
      console.error('Failed to create hotel:', error);
    }
  };

  const headquarters = hotels.filter(h => h.is_headquarters);
  const branches = hotels.filter(h => !h.is_headquarters);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Hotels</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">Create Hotel</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="name" className="text-xs">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-8 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-xs">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="h-8 text-sm"
                    required
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
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
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
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="headquarters"
                  checked={formData.is_headquarters}
                  onChange={(e) => setFormData({ ...formData, is_headquarters: e.target.checked })}
                  className="h-3 w-3"
                />
                <Label htmlFor="headquarters" className="text-xs">Headquarters</Label>
              </div>
              <Button type="submit" className="w-full h-8 text-sm">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {headquarters.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Building2 className="h-4 w-4 mr-1" />
              Headquarters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {headquarters.map((hotel) => (
                <div key={hotel.id} className="p-2 border rounded text-sm">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-sm">{hotel.name}</p>
                    <Badge variant="secondary" className="text-xs">HQ</Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {hotel.city}
                    </div>
                    <div>{hotel.phone}</div>
                    {hotel.branch_count && (
                      <div className="text-xs font-medium text-primary">
                        {hotel.branch_count} branches
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {branches.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Building2 className="h-4 w-4 mr-1" />
              Branches
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {branches.map((hotel) => (
                <div key={hotel.id} className="p-2 border rounded text-sm">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-sm">{hotel.name}</p>
                    <Badge variant="outline" className="text-xs">Branch</Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {hotel.city}
                    </div>
                    <div>{hotel.phone}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {hotels.length === 0 && (
        <Card>
          <CardContent className="text-center py-6">
            <Building2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium mb-1">No hotels found</p>
            <p className="text-xs text-muted-foreground mb-3">Create your first hotel</p>
            <Button onClick={() => setDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Hotel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}