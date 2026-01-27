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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Hash, Layers, Building, FileText, CheckCircle, Info, Accessibility } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

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
    resolver: zodResolver(roomSchema),
    defaultValues: {
      room_number: '',
      room_type_id: 0,
      floor_number: 1,
      status: 'available',
      condition: 'good',
      block_name: '',
      is_accessible: false,
      notes: '',
    },
  });

  useEffect(() => {
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
  }, [initialData, roomTypes, form]);

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
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background border rounded-none shadow-none">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="flex flex-col h-full">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-2xl font-bold">
                {isEditMode ? 'Edit Room' : 'Add New Room'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground/80">
                {isEditMode ? 'Update room details and configuration' : 'Enter the essential details for the new room.'}
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 pb-2">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="basic">Basic Information</TabsTrigger>
                  <TabsTrigger value="details">Advanced Details</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-5 animate-in fade-in-50 duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="room_number"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground/80">Room Number *</FormLabel>
                          <FormControl>
                            <InputGroup>
                              <InputGroupAddon>
                                <Hash className="w-3.5 h-3.5" />
                              </InputGroupAddon>
                              <InputGroupInput placeholder="101" {...field} />
                            </InputGroup>
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="floor_number"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground/80">Floor *</FormLabel>
                          <FormControl>
                            <InputGroup>
                              <InputGroupAddon>
                                <Layers className="w-3.5 h-3.5" />
                              </InputGroupAddon>
                              <InputGroupInput
                                type="number"
                                placeholder="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </InputGroup>
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control as any}
                    name="room_type_id"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground/80">Room Type *</FormLabel>
                        <FormControl>
                          <Combobox
                            options={roomTypeOptions}
                            value={field.value?.toString() || ''}
                            onChange={(val) => field.onChange(parseInt(val) || 0)}
                            placeholder="Select room type"
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground/80">Status</FormLabel>
                          <FormControl>
                            <Combobox
                              options={statusOptions}
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select status"
                            />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="block_name"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground/80">Block/Building</FormLabel>
                          <FormControl>
                            <InputGroup>
                              <InputGroupAddon>
                                <Building className="w-3.5 h-3.5" />
                              </InputGroupAddon>
                              <InputGroupInput placeholder="Main Wing" {...field} />
                            </InputGroup>
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-5 animate-in fade-in-50 duration-300">
                  <FormField
                    control={form.control as any}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Condition</FormLabel>
                        <FormControl>
                          <InputGroup>
                            <InputGroupAddon>
                              <Info className="w-4 h-4" />
                            </InputGroupAddon>
                            <InputGroupInput placeholder="Good, Excellent, etc." {...field} />
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="is_accessible"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm hover:bg-muted/50 transition-colors">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center gap-2 cursor-pointer">
                            <Accessibility className="w-4 h-4 text-primary" />
                            Wheelchair Accessible
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            This room is equipped for guests with disabilities.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <InputGroup>
                            <InputGroupAddon className="align-block-start">
                              <FileText className="w-4 h-4 mt-2" />
                            </InputGroupAddon>
                            <InputGroupInput
                              placeholder="Extra bed available, near elevator..."
                              {...field}
                            />
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter className="p-6 pt-4 border-t bg-muted/10">
              <div className="flex w-full items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="flex-1 transition-none"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] shadow-none transition-none"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : (
                    isEditMode ? 'Save Changes' : 'Create Room'
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


