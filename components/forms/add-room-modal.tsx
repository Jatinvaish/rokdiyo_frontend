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
  Hash, Layers, Building, FileText, CheckCircle2, ChevronRight, ChevronLeft, Loader2, Info, Accessibility, LayoutGrid, Settings2, PlusCircle
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
  const [currentStep, setCurrentStep] = useState(0);
  const isEditMode = !!initialData;
  const user = authService.getUser();

  const steps = [
    { title: 'Location', icon: LayoutGrid },
    { title: 'Type & Status', icon: Settings2 },
    { title: 'Details', icon: Info },
  ];

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
      setCurrentStep(0);
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

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 0 ? ['room_number', 'floor_number'] :
      currentStep === 1 ? ['room_type_id', 'status'] : [];
    const isValid = fieldsToValidate.length > 0
      ? await form.trigger(fieldsToValidate as any)
      : true;

    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

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

            {/* Stepper Indicator */}
            <div className="flex items-center justify-between mt-4 px-2">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;
                return (
                  <div key={idx} className="flex items-center flex-1 last:flex-none">
                    <div className={cn(
                      "flex flex-col items-center gap-1 transition-all duration-300",
                      isActive ? "scale-110" : "opacity-60"
                    )}>
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                        isActive ? "bg-primary text-primary-foreground border-primary" :
                          isCompleted ? "bg-primary/20 text-primary border-primary/20" : "bg-muted text-muted-foreground border-muted"
                      )}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold">{step.title}</span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={cn(
                        "h-[2px] flex-1 mx-2 rounded-full transition-colors duration-500",
                        idx < currentStep ? "bg-primary" : "bg-muted"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-6 py-5 max-h-[400px] overflow-y-auto">
            {currentStep === 0 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Room Number *</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input className="h-9 pl-7 font-mono" placeholder="101" {...form.register('room_number')} />
                    </div>
                    {form.formState.errors.room_number && <p className="text-[10px] text-destructive font-medium">{form.formState.errors.room_number.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Floor *</Label>
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
                  <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Block / Building Name</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input className="h-9 pl-7" placeholder="Main Wing, East Block, etc." {...form.register('block_name')} />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Room Type *</Label>
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
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Initial Status</Label>
                    <Combobox
                      options={statusOptions}
                      value={form.watch('status')}
                      onChange={(val: string) => form.setValue('status', val as any)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Condition</Label>
                    <Input className="h-9" placeholder="Good" {...form.register('condition')} />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-3 rounded-lg border bg-muted/5 space-y-3">
                  <div className="flex items-center justify-between">
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
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Internal Notes</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-3 w-3 text-muted-foreground" />
                    <Input className="h-9 pl-7" placeholder="e.g. Near elevator, balcony..." {...form.register('notes')} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-4 bg-muted/30 border-t border-primary/5 flex items-center justify-between sm:justify-between gap-2">
            <div>
              {currentStep > 0 && (
                <Button type="button" variant="ghost" size="sm" onClick={prevStep} className="h-9 px-4 font-bold uppercase text-[10px] tracking-widest hover:bg-primary/5">
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-9 px-4 font-bold uppercase text-[10px] tracking-widest border-muted-foreground/20">
                Cancel
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button type="button" size="sm" onClick={nextStep} className="h-9 px-4 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">
                  Continue <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              ) : (
                <Button type="submit" size="sm" disabled={isSubmitting} className="h-9 px-4 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">
                  {isSubmitting ? (
                    <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Finalizing</>
                  ) : (
                    <><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> {isEditMode ? 'Update Room' : 'Add Room'}</>
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
