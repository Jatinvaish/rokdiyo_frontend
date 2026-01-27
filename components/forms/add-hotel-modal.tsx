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
import { PhoneInput, WebsiteInput } from '@/components/ui/custom-inputs';
import { toast } from 'sonner';
import { hotelService } from '@/lib/services/hotels.service';
import { Combobox } from '@/components/ui/custom/combobox';
import { Building2, Mail, Phone, Globe, MapPin, Navigation, Send, CheckCircle2, ChevronRight, ChevronLeft, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

const hotelSchema = z.object({
  name: z.string().min(2, 'Hotel name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  zip_code: z.string().min(3, 'Zip code is required'),
  website: z.string().optional().or(z.literal('')),
  is_headquarters: z.boolean().optional(),
});

type HotelFormData = z.infer<typeof hotelSchema>;

interface AddHotelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: any;
}

export function AddHotelModal({ open, onOpenChange, onSuccess, initialData }: AddHotelModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const isEditMode = !!initialData;

  const steps = [
    { title: 'Profile', icon: Building2 },
    { title: 'Address', icon: MapPin },
  ];

  const form = useForm<HotelFormData>({
    resolver: zodResolver(hotelSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      zip_code: '',
      website: '',
      is_headquarters: false,
    } as any,
  });

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      if (initialData) {
        form.reset({
          name: initialData.name || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          address: initialData.address || '',
          city: initialData.city || '',
          state: initialData.state || '',
          country: initialData.country || 'India',
          zip_code: initialData.zip_code || '',
          website: initialData.website || '',
          is_headquarters: initialData.is_headquarters || false,
        });
      } else {
        form.reset({
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          country: 'India',
          zip_code: '',
          website: '',
          is_headquarters: false,
        });
      }
    }
  }, [initialData, form, open]);

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 0 ? ['name', 'email', 'phone'] : [];
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

  const onSubmit = async (data: HotelFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await hotelService.update(initialData.id, data as any);
        toast.success('Hotel updated');
      } else {
        await hotelService.create(data as any);
        toast.success('Hotel created successfully');
      }
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const countryOptions = [
    { value: 'India', label: 'India' },
    { value: 'United States', label: 'United States' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Australia', label: 'Australia' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-xl border-none shadow-2xl">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">{isEditMode ? 'Edit Hotel' : 'New Hotel Property'}</DialogTitle>
              <DialogDescription className="text-xs">Manage your brand's physical locations</DialogDescription>
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
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Hotel Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input className="h-9 pl-7" placeholder="Grand Hotel Mumbai" {...form.register('name')} />
                  </div>
                  {form.formState.errors.name && <p className="text-[10px] text-destructive font-medium">{form.formState.errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Official Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input type="email" className="h-9 pl-7" placeholder="contact@hotel.com" {...form.register('email')} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Phone Number *</Label>
                    <PhoneInput {...form.register('phone')} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Website URL</Label>
                  <WebsiteInput {...form.register('website')} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/5 mt-2">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-primary" />
                    <div className="leading-none">
                      <p className="text-xs font-bold">Headquarters</p>
                      <p className="text-[9px] text-muted-foreground">Is this the primary business location?</p>
                    </div>
                  </div>
                  <Switch
                    checked={form.watch('is_headquarters')}
                    onCheckedChange={(val) => form.setValue('is_headquarters', val)}
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Street Address *</Label>
                  <Input className="h-9" placeholder="Building, Street, Landmark" {...form.register('address')} />
                  {form.formState.errors.address && <p className="text-[10px] text-destructive font-medium">{form.formState.errors.address.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">City *</Label>
                    <Input className="h-9" placeholder="Mumbai" {...form.register('city')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">State / Region *</Label>
                    <Input className="h-9" placeholder="Maharashtra" {...form.register('state')} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Country *</Label>
                    <Combobox
                      options={countryOptions}
                      value={form.watch('country')}
                      onChange={(val: string) => form.setValue('country', val)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">ZIP / PIN Code *</Label>
                    <Input className="h-9 font-mono" placeholder="400001" {...form.register('zip_code')} />
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
                    <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> saving</>
                  ) : (
                    <><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> {isEditMode ? 'Update Hotel' : 'Register Hotel'}</>
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
