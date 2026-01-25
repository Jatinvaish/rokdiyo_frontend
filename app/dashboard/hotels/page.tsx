'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddHotelModal } from '@/components/forms/add-hotel-modal';
import { hotelService } from '@/lib/services/hotels.service';
import { Hotel } from '@/lib/types/hotel';
import { Plus, Building2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      const data = await hotelService.list();
      setHotels(data as any);
    } catch (error) {
      console.error('Failed to load hotels:', error);
      toast.error('Failed to load hotels');
    } finally {
      setLoading(false);
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
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Hotel
        </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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

      {/* Add Hotel Modal */}
      <AddHotelModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadHotels}
      />
    </div>
  );
}