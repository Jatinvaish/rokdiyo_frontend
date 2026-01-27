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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { roomService } from '@/lib/services/rooms.service';
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
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tag, FileText, Users, Baby, Plus, UserPlus, Clock,
  Calendar, Cigarette, Dog, Bed as BedIcon, Eye, CheckCircle, IndianRupee, Info
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

const roomTypeSchema = z.object({
  type_name: z.string().min(2, 'Room type name must be at least 2 characters'),
  description: z.string().optional().or(z.literal('')),
  max_adults: z.number().min(1, 'At least 1 adult required'),
  max_children: z.number().min(0),
  max_occupancy: z.number().min(1, 'Max occupancy must be at least 1'),
  max_extra_beds: z.number().min(0),
  base_rate_hourly: z.number().min(0),
  base_rate_daily: z.number().min(0, 'Daily rate must be at least 0'),
  smoking_allowed: z.boolean(),
  pet_friendly: z.boolean(),
  bed_type: z.string().optional().or(z.literal('')),
  view_type: z.string().optional().or(z.literal('')),
});

type RoomTypeFormData = z.infer<typeof roomTypeSchema>;

interface AddRoomTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: any;
}

export function AddRoomTypeModal({ open, onOpenChange, onSuccess, initialData }: AddRoomTypeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  const form = useForm<RoomTypeFormData>({
    resolver: zodResolver(roomTypeSchema),
    defaultValues: {
      type_name: '',
      description: '',
      max_adults: 2,
      max_children: 0,
      max_occupancy: 2,
      max_extra_beds: 0,
      base_rate_hourly: 0,
      base_rate_daily: 0,
      smoking_allowed: false,
      pet_friendly: false,
      bed_type: '',
      view_type: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        type_name: initialData.type_name || '',
        description: initialData.description || '',
        max_adults: initialData.max_adults || 2,
        max_children: initialData.max_children || 0,
        max_occupancy: initialData.max_occupancy || 2,
        max_extra_beds: initialData.max_extra_beds || 0,
        base_rate_hourly: initialData.base_rate_hourly || 0,
        base_rate_daily: initialData.base_rate_daily || 0,
        smoking_allowed: !!initialData.smoking_allowed,
        pet_friendly: !!initialData.pet_friendly,
        bed_type: initialData.bed_type || '',
        view_type: initialData.view_type || '',
      });
    } else {
      form.reset({
        type_name: '',
        description: '',
        max_adults: 2,
        max_children: 0,
        max_occupancy: 2,
        max_extra_beds: 0,
        base_rate_hourly: 0,
        base_rate_daily: 0,
        smoking_allowed: false,
        pet_friendly: false,
        bed_type: '',
        view_type: '',
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: RoomTypeFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await roomService.updateType(initialData.id, data as any);
        toast.success('Room type updated successfully');
      } else {
        await roomService.createType(data as any);
        toast.success('Room type created successfully');
      }
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} room type`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background border rounded-none shadow-none">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="flex flex-col h-full">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-2xl font-bold">
                {isEditMode ? 'Edit Room Type' : 'Create Room Type'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground/80">
                {isEditMode ? 'Update pricing and configuration' : 'Define a new room category for your property.'}
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 pb-2">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="capacity">Capacity</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-3 animate-in fade-in-50 duration-300">
                  <FormField
                    control={form.control}
                    name="type_name"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground/80">Type Name *</FormLabel>
                        <FormControl>
                          <InputGroup>
                            <InputGroupAddon>
                              <Tag className="w-3.5 h-3.5" />
                            </InputGroupAddon>
                            <InputGroupInput placeholder="Deluxe Suite" {...field} />
                          </InputGroup>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground/80">Description</FormLabel>
                        <FormControl>
                          <InputGroup>
                            <InputGroupAddon className="align-block-start">
                              <FileText className="w-3.5 h-3.5 mt-2" />
                            </InputGroupAddon>
                            <InputGroupTextarea
                              placeholder="Details..."
                              {...field}
                              className="h-20"
                            />
                          </InputGroup>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="capacity" className="space-y-3 animate-in fade-in-50 duration-300">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control as any}
                      name="max_adults"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground/80">Adults</FormLabel>
                          <FormControl>
                            <InputGroup className="h-9 border-muted/40 ring-0 shadow-none">
                              <InputGroupAddon>
                                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                              </InputGroupAddon>
                              <InputGroupInput
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                className="text-sm"
                              />
                            </InputGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="max_children"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground/80">Children</FormLabel>
                          <FormControl>
                            <InputGroup className="h-9 border-muted/40 ring-0 shadow-none">
                              <InputGroupAddon>
                                <Baby className="w-4 h-4 text-muted-foreground" />
                              </InputGroupAddon>
                              <InputGroupInput
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                className="text-sm"
                              />
                            </InputGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control as any}
                      name="max_occupancy"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground/80">Occupancy</FormLabel>
                          <FormControl>
                            <InputGroup className="h-9 border-muted/40 ring-0 shadow-none">
                              <InputGroupAddon>
                                <UserPlus className="w-3.5 h-3.5 text-muted-foreground" />
                              </InputGroupAddon>
                              <InputGroupInput
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                className="text-sm"
                              />
                            </InputGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="max_extra_beds"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground/80">Extra Beds</FormLabel>
                          <FormControl>
                            <InputGroup className="h-9 border-muted/40 ring-0 shadow-none">
                              <InputGroupAddon>
                                <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                              </InputGroupAddon>
                              <InputGroupInput
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                className="text-sm"
                              />
                            </InputGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-5 animate-in fade-in-50 duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="base_rate_hourly"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate *</FormLabel>
                          <FormControl>
                            <InputGroup>
                              <InputGroupAddon>
                                <Clock className="w-4 h-4" />
                              </InputGroupAddon>
                              <InputGroupInput
                                type="number"
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                              <InputGroupAddon align="inline-end">₹</InputGroupAddon>
                            </InputGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="base_rate_daily"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daily Rate *</FormLabel>
                          <FormControl>
                            <InputGroup>
                              <InputGroupAddon>
                                <Calendar className="w-4 h-4" />
                              </InputGroupAddon>
                              <InputGroupInput
                                type="number"
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                              <InputGroupAddon align="inline-end">₹</InputGroupAddon>
                            </InputGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-md border border-primary/10">
                    <Info className="w-3 h-3 inline-block mr-1 mb-0.5" />
                    Standard rates applied when no dynamic pricing is active.
                  </p>
                </TabsContent>

                <TabsContent value="features" className="space-y-4 animate-in fade-in-50 duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="bed_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bed Configuration</FormLabel>
                          <FormControl>
                            <InputGroup>
                              <InputGroupAddon>
                                <BedIcon className="w-4 h-4" />
                              </InputGroupAddon>
                              <InputGroupInput placeholder="King, Twin, etc." {...field} />
                            </InputGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="view_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>View</FormLabel>
                          <FormControl>
                            <InputGroup>
                              <InputGroupAddon>
                                <Eye className="w-4 h-4" />
                              </InputGroupAddon>
                              <InputGroupInput placeholder="Garden, Sea, City" {...field} />
                            </InputGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <FormField
                      control={form.control as any}
                      name="smoking_allowed"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-md border p-3 shadow-xs hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <Cigarette className="w-4 h-4 text-muted-foreground" />
                            <div className="space-y-0.5">
                              <FormLabel className="cursor-pointer">Smoking Allowed</FormLabel>
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pet_friendly"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-md border p-3 shadow-xs hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <Dog className="w-4 h-4 text-muted-foreground" />
                            <div className="space-y-0.5">
                              <FormLabel className="cursor-pointer">Pet Friendly</FormLabel>
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
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
                      Processing...
                    </span>
                  ) : (
                    isEditMode ? 'Update Room Type' : 'Create Room Type'
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

