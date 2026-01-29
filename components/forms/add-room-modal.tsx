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
import { toast } from 'sonner';
import { authService } from '@/lib/services/auth.service';
import { roomService } from '@/lib/services/rooms.service';
import { Combobox } from '@/components/ui/custom/combobox';
import {
  Hash, Layers, Building, FileText, CheckCircle2, Loader2, Info, Accessibility, Settings2, PlusCircle
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const roomSchema = z.object({
  room_number: z.string().min(1, 'Room number is required'),
  room_type_id: z.number().min(1, 'Room type is required'),
  floor_number: z.number().min(0, 'Floor is required'),
  status: z.enum(['available', 'occupied', 'cleaning', 'maintenance', 'advance']),
  condition: z.string(),
  block_name: z.string().optional().or(z.literal('')),
  is_accessible: z.boolean(),
  notes: z.string().optional().or(z.literal('')),
});

type RoomFormData = z.infer<typeof roomSchema>;

interface AddRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: any;
  roomTypes?: any[];
}

export function AddRoomModal({ open, onOpenChange, onSuccess, initialData, roomTypes = [] }: AddRoomModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;
  const user = authService.getUser();

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema) as any,
    defaultValues: {
      room_number: '',
      room_type_id: 0,
      floor_number: 1,
      status: 'available',
      condition: 'good',
      block_name: '',
      is_accessible: false,
      notes: '',
    } as any,
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          room_number: initialData.room_number || '',
          room_type_id: initialData.room_type_id || 0,
          floor_number: initialData.floor_number || 1,
          status: initialData.status as any || 'available',
          condition: initialData.condition || 'good',
          block_name: initialData.block_name || '',
          is_accessible: !!initialData.is_accessible,
          notes: initialData.notes || '',
        });
      } else {
        form.reset({
          room_number: '',
          room_type_id: roomTypes[0]?.id || 0,
          floor_number: 1,
          status: 'available',
          condition: 'good',
          block_name: '',
          is_accessible: false,
          notes: '',
        });
      }
    }
  }, [initialData, roomTypes, form, open]);

  const onSubmit = async (data: RoomFormData) => {
    setIsSubmitting(true);
    try {
      const roomData = {
        ...data,
        firm_id: user?.firmId,
        branch_id: user?.branchId,
      };

      if (isEditMode) {
        await roomService.update(initialData.id, roomData);
        toast.success('Room updated');
      } else {
        await roomService.create(roomData);
        toast.success('Room created successfully');
      }
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roomTypeOptions = roomTypes.map((type: any) => ({
    value: type.id?.toString() || "0",
    label: type.type_name || type.name || 'Unknown Type'
  }));

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'advance', label: 'Advance Booking' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-xl border-none shadow-2xl">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">{isEditMode ? 'Edit Room' : 'Add New Room'}</DialogTitle>
              <DialogDescription className="text-xs">Inventory management for individual room units</DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 max-h-[500px] overflow-y-auto space-y-4">
            {/* Location Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-4 w-1 bg-primary rounded-full" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/70">Location Details</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Room Number *</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input className="h-9 pl-7 font-mono" placeholder="101" {...form.register('room_number')} />
                  </div>
                  {form.formState.errors.room_number && <p className="text-[10px] text-destructive font-medium">{form.formState.errors.room_number.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Floor *</Label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                      type="number"
                      className="h-9 pl-7"
                      {...form.register('floor_number', { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Block / Building Name</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input className="h-9 pl-7" placeholder="Main Wing, East Block, etc." {...form.register('block_name')} />
                </div>
              </div>
            </div>

            {/* Type & Status Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-4 w-1 bg-primary rounded-full" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/70">Configuration</h4>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Room Type *</Label>
                <Combobox
                  options={roomTypeOptions}
                  value={form.watch('room_type_id')?.toString()}
                  onChange={(val: string) => form.setValue('room_type_id', parseInt(val))}
                  placeholder="Select room type"
                />
                {form.formState.errors.room_type_id && <p className="text-[10px] text-destructive font-medium">{form.formState.errors.room_type_id.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Initial Status</Label>
                  <Combobox
                    options={statusOptions}
                    value={form.watch('status')}
                    onChange={(val: string) => form.setValue('status', val as any)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Condition</Label>
                  <Input className="h-9" placeholder="Good" {...form.register('condition')} />
                </div>
              </div>
            </div>

            {/* Extra Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/5">
                <div className="flex items-center gap-2">
                  <Accessibility className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs font-bold">Wheelchair Accessible</p>
                    <p className="text-[9px] text-muted-foreground">Is this room disabled-friendly?</p>
                  </div>
                </div>
                <Checkbox
                  checked={form.watch('is_accessible')}
                  onCheckedChange={(val) => form.setValue('is_accessible', !!val)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-tight opacity-70">Internal Notes</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-3 w-3 text-muted-foreground" />
                  <Input className="h-9 pl-7" placeholder="e.g. Near elevator, balcony..." {...form.register('notes')} />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-muted/30 border-t border-primary/5 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-9 px-4 font-bold uppercase text-[10px] tracking-widest border-muted-foreground/20">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="flex-1 h-9 px-4 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">
              {isSubmitting ? (
                <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Finalizing</>
              ) : (
                <><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> {isEditMode ? 'Update Room' : 'Add Room'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
