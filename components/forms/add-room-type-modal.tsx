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
import {
  Tag, FileText, Users, Baby, Plus, UserPlus, Clock,
  Calendar, Cigarette, Dog, Bed as BedIcon, Eye, CheckCircle2, IndianRupee, Info, ChevronLeft, ChevronRight, Loader2, Home
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { MultiFileUploader } from '@/components/ui/file-uploader';
import { cn } from '@/lib/utils';

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
  image_urls: z.array(z.string()).optional().default([]),
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
  const [currentStep, setCurrentStep] = useState(0);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const isEditMode = !!initialData;

  const steps = [
    { title: 'Setup', icon: Home },
    { title: 'Capacity', icon: Users },
    { title: 'Amenities', icon: BedIcon },
    { title: 'Gallery', icon: Tag },
  ];

  const form = useForm<RoomTypeFormData>({
    resolver: zodResolver(roomTypeSchema) as any,
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
      bed_type: 'King Bed',
      view_type: 'City View',
      image_urls: [],
    } as any,
  });

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      if (initialData) {
        let images = [];
        try {
          images = initialData.images ? JSON.parse(initialData.images) : [];
          if (!Array.isArray(images)) images = initialData.images ? [initialData.images] : [];
        } catch (e) {
          images = initialData.images ? [initialData.images] : [];
        }

        form.reset({
          ...initialData,
          image_urls: images,
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
          bed_type: 'King Bed',
          view_type: 'City View',
          image_urls: [],
        });
      }
      setNewFiles([]);
    }
  }, [initialData, form, open]);

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 0 ? ['type_name', 'base_rate_daily'] : [];
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

  const onSubmit = async (data: RoomTypeFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Add existing URLs
      data.image_urls?.forEach(url => {
        formData.append('image_urls[]', url);
      });

      // Add new files
      newFiles.forEach(file => {
        formData.append('files', file);
      });

      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'image_urls' && value !== undefined && value !== null && value !== '') {
          formData.append(key, value as string);
        }
      });

      if (isEditMode) {
        formData.append('id', initialData.id.toString());
        await roomService.updateType(initialData.id, formData as any);
        toast.success('Room type updated');
      } else {
        await roomService.createType(formData as any);
        toast.success('Room type created');
      }
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-xl border-none shadow-2xl">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">{isEditMode ? 'Edit Room Category' : 'New Room Category'}</DialogTitle>
              <DialogDescription className="text-xs">Define premium room types for your property</DialogDescription>
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

          <div className="px-6 py-5 max-h-[460px] overflow-y-auto">
            {currentStep === 0 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Category Name *</Label>
                  <Input className="h-9" placeholder="Deluxe Suite" {...form.register('type_name')} />
                  {form.formState.errors.type_name && <p className="text-[10px] text-destructive font-medium">{form.formState.errors.type_name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Daily Rate (Base) *</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input
                        type="number"
                        className="h-9 pl-7"
                        placeholder="2500"
                        {...form.register('base_rate_daily', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Hourly Rate</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input
                        type="number"
                        className="h-9 pl-7"
                        placeholder="500"
                        {...form.register('base_rate_hourly', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Description</Label>
                  <Textarea
                    className="min-h-[80px] resize-none text-sm p-3"
                    placeholder="Briefly describe the room category features..."
                    {...form.register('description')}
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 p-3 rounded-lg border bg-muted/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-primary/60" />
                      <Label className="text-xs font-bold uppercase tracking-tight">Main Capacity</Label>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Adults</span>
                        <Input
                          type="number"
                          className="w-16 h-7 text-center font-bold"
                          {...form.register('max_adults', { valueAsNumber: true })}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Children</span>
                        <Input
                          type="number"
                          className="w-16 h-7 text-center font-bold"
                          {...form.register('max_children', { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-lg border bg-muted/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Plus className="w-4 h-4 text-primary/60" />
                      <Label className="text-xs font-bold uppercase tracking-tight">Additional</Label>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Extra Beds</span>
                        <Input
                          type="number"
                          className="w-16 h-7 text-center font-bold"
                          {...form.register('max_extra_beds', { valueAsNumber: true })}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Occ.</span>
                        <Input
                          type="number"
                          className="w-16 h-7 text-center font-bold"
                          {...form.register('max_occupancy', { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic bg-primary/5 p-2 rounded border border-primary/10">
                  <Info className="w-3 h-3 inline mr-1" />
                  Total occupancy should include adults, children and potential extra beds.
                </p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Bed Configuration</Label>
                    <div className="relative">
                      <BedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input className="h-9 pl-7" placeholder="e.g. King Bed" {...form.register('bed_type')} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Room View</Label>
                    <div className="relative">
                      <Eye className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input className="h-9 pl-7" placeholder="e.g. City View" {...form.register('view_type')} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Cigarette className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Smoking Allowed</p>
                        <p className="text-[9px] text-muted-foreground">Enable if smoking is permitted</p>
                      </div>
                    </div>
                    <Switch
                      checked={form.watch('smoking_allowed')}
                      onCheckedChange={(val) => form.setValue('smoking_allowed', val)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Dog className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Pet Friendly</p>
                        <p className="text-[9px] text-muted-foreground">Accommodation for guests with pets</p>
                      </div>
                    </div>
                    <Switch
                      checked={form.watch('pet_friendly')}
                      onCheckedChange={(val) => form.setValue('pet_friendly', val)}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <MultiFileUploader
                  label="Room Category Photos"
                  files={newFiles}
                  onFilesChange={setNewFiles}
                  existingUrls={form.watch('image_urls')}
                  onExistingRemove={(url) => {
                    const current = form.getValues('image_urls') || [];
                    form.setValue('image_urls', current.filter(u => u !== url));
                  }}
                  maxFiles={10}
                />
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
                    <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Saving</>
                  ) : (
                    <><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> {isEditMode ? 'Update Category' : 'Create Category'}</>
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
