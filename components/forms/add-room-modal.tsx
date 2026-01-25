'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { roomService } from '@/lib/services/rooms.service';

const roomSchema = z.object({
  room_number: z.string().min(1, 'Room number is required'),
  room_type_id: z.coerce.number().min(1, 'Room type is required'),
  floor: z.coerce.number().min(0, 'Floor is required'),
  status: z.enum(['available', 'occupied', 'cleaning', 'maintenance', 'advance']).default('available'),
  description: z.string().optional(),
});

type RoomFormData = z.infer<typeof roomSchema>;

interface AddRoomModalProps {
  hotelId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: any;
  roomTypes?: any[];
}

export function AddRoomModal({ hotelId, open, onOpenChange, onSuccess, initialData, roomTypes = [] }: AddRoomModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      room_number: '',
      room_type_id: 0,
      floor: 1,
      status: 'available',
      description: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        room_number: initialData.room_number || '',
        room_type_id: initialData.room_type_id || 0,
        floor: initialData.floor || 1,
        status: initialData.status || 'available',
        description: initialData.description || '',
      });
    } else {
      form.reset({
        room_number: '',
        room_type_id: roomTypes[0]?.id || 0,
        floor: 1,
        status: 'available',
        description: '',
      });
    }
  }, [initialData, roomTypes, form]);

  const onSubmit = async (data: RoomFormData) => {
    setIsSubmitting(true);
    try {
      const roomData = {
        ...data,
        hotel_id: hotelId,
      };

      if (isEditMode) {
        await roomService.update(initialData.id, roomData);
        toast.success('Room updated successfully');
      } else {
        await roomService.create(roomData);
        toast.success('Room created successfully');
      }
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} room`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Room' : 'Add New Room'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update room details' : 'Add a new room to your hotel'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room_number">Room Number *</Label>
                <Input
                  id="room_number"
                  placeholder="101"
                  {...form.register('room_number')}
                />
                {form.formState.errors.room_number && (
                  <p className="text-sm text-destructive">{form.formState.errors.room_number.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">Floor *</Label>
                <Input
                  id="floor"
                  type="number"
                  placeholder="1"
                  {...form.register('floor')}
                />
                {form.formState.errors.floor && (
                  <p className="text-sm text-destructive">{form.formState.errors.floor.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room_type_id">Room Type *</Label>
              <Select
                value={form.watch('room_type_id')?.toString()}
                onValueChange={(value) => form.setValue('room_type_id', parseInt(value))}
                disabled={!roomTypes || roomTypes.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={roomTypes && roomTypes.length > 0 ? "Select room type" : "No room types found"} />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes && roomTypes.length > 0 ? (
                    roomTypes.map((type: any) => (
                      <SelectItem key={type.id?.toString() || Math.random().toString()} value={type.id?.toString() || "0"}>
                        {type.type_name || type.name || 'Unknown Type'}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="0" disabled>No room types available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.room_type_id && (
                <p className="text-sm text-destructive">{form.formState.errors.room_type_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(value: any) => form.setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="advance">Advance Booking</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-destructive">{form.formState.errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Sea view, AC, WiFi"
                {...form.register('description')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Room' : 'Add Room')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
