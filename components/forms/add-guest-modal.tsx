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
import { PhoneInput } from '@/components/ui/custom-inputs';
import { toast } from 'sonner';
import { guestService } from '@/lib/services/guests.service';
import { Combobox } from '@/components/ui/custom/combobox';
import { FileUp, X, Loader2, CheckCircle2, ChevronRight, ChevronLeft, User, IdCard, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MultiFileUploader } from '@/components/ui/file-uploader';

const guestSchema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Valid phone number is required'),
  phone_secondary: z.string().optional(),
  id_type: z.string().optional().or(z.literal('')),
  id_number: z.string().optional().or(z.literal('')),
  id_document_urls: z.array(z.string()).optional().default([]),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  company_name: z.string().optional(),
  gst_number: z.string().optional(),
  vip_status: z.string().optional(),
  notes: z.string().optional(),
});

type GuestFormData = z.infer<typeof guestSchema>;

interface AddGuestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: any;
}

export function AddGuestModal({ open, onOpenChange, onSuccess, initialData }: AddGuestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const isEditMode = !!initialData;

  const steps = [
    { title: 'Primary', icon: User },
    { title: 'Identity', icon: IdCard },
    { title: 'Other', icon: Building2 },
  ];

  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema) as any,
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      phone_secondary: '',
      id_type: 'aadhar_card',
      id_number: '',
      id_document_urls: [],
      date_of_birth: '',
      gender: '',
      nationality: 'Indian',
      address: '',
      company_name: '',
      gst_number: '',
      vip_status: 'regular',
      notes: '',
    } as any,
  });

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      if (initialData) {
        let docUrls = [];
        try {
          docUrls = initialData.id_proof_url ? JSON.parse(initialData.id_proof_url) : [];
          if (!Array.isArray(docUrls)) docUrls = [initialData.id_proof_url];
        } catch (e) {
          docUrls = initialData.id_proof_url ? [initialData.id_proof_url] : [];
        }

        form.reset({
          ...initialData,
          id_document_urls: docUrls,
          date_of_birth: initialData.date_of_birth ? new Date(initialData.date_of_birth).toISOString().split('T')[0] : '',
        });
      } else {
        form.reset({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          phone_secondary: '',
          id_type: 'aadhar_card',
          id_number: '',
          id_document_urls: [],
          date_of_birth: '',
          gender: '',
          nationality: 'Indian',
          address: '',
          company_name: '',
          gst_number: '',
          vip_status: 'regular',
          notes: '',
        });
      }
      setNewFiles([]);
    }
  }, [initialData, form, open]);

  // Removed handleFileUpload as we use MultiFileUploader now

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 0 ? ['first_name', 'phone'] : [];
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

  const onSubmit = async (data: GuestFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Add existing URLs
      data.id_document_urls?.forEach(url => {
        formData.append('id_document_urls[]', url);
      });

      // Add new files
      newFiles.forEach(file => {
        formData.append('files', file);
      });

      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'id_document_urls' && value !== undefined && value !== null && value !== '') {
          formData.append(key, value as string);
        }
      });

      if (isEditMode) {
        formData.append('id', initialData.id.toString());
        await guestService.update(initialData.id, formData as any);
        toast.success('Guest details updated');
      } else {
        await guestService.create(formData as any);
        toast.success('Guest added successfully');
      }
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const idTypeOptions = [
    { value: 'aadhar_card', label: 'Aadhar Card (UID)' },
    { value: 'pan_card', label: 'PAN Card' },
    { value: 'driving_license', label: 'Driving License' },
    { value: 'voter_id', label: 'Voter ID' },
    { value: 'passport', label: 'Passport' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-xl border-none shadow-2xl">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">{isEditMode ? 'Edit Guest Profile' : 'New Guest Registration'}</DialogTitle>
              <DialogDescription className="text-xs">Precision guest data management for Indian Hotels</DialogDescription>
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">First Name *</Label>
                    <Input className="h-9" placeholder="Enter first name" {...form.register('first_name')} />
                    {form.formState.errors.first_name && <p className="text-[10px] text-destructive font-medium">{form.formState.errors.first_name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Last Name</Label>
                    <Input className="h-9" placeholder="Enter last name" {...form.register('last_name')} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Primary Contact *</Label>
                  <PhoneInput {...form.register('phone')} />
                  {form.formState.errors.phone && <p className="text-[10px] text-destructive font-medium">{form.formState.errors.phone.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Email Address</Label>
                    <Input className="h-9" type="email" placeholder="Optional" {...form.register('email')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Gender</Label>
                    <Combobox
                      options={[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' }
                      ]}
                      value={form.watch('gender')}
                      onChange={(val: string) => form.setValue('gender', val)}
                      placeholder="Select"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Permanent Address</Label>
                  <Input className="h-9" placeholder="Full address" {...form.register('address')} />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Identity Type</Label>
                    <Combobox
                      options={idTypeOptions}
                      value={form.watch('id_type')}
                      onChange={(val: string) => form.setValue('id_type', val)}
                      placeholder="Select document"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">ID Number</Label>
                    <Input className="h-9 font-mono" placeholder="Enter number" {...form.register('id_number')} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <MultiFileUploader
                    label="Identity Documents (Multiple)"
                    files={newFiles}
                    onFilesChange={setNewFiles}
                    existingUrls={form.watch('id_document_urls')}
                    onExistingRemove={(url) => {
                      const current = form.getValues('id_document_urls') || [];
                      form.setValue('id_document_urls', current.filter(u => u !== url));
                    }}
                    maxFiles={5}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Date of Birth</Label>
                    <Input className="h-9" type="date" {...form.register('date_of_birth')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Nationality</Label>
                    <Input className="h-9" {...form.register('nationality')} />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Corporate Name</Label>
                    <Input className="h-9" placeholder="Optional" {...form.register('company_name')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-tight opacity-70">GST Number</Label>
                    <Input className="h-9 font-mono" placeholder="15 digits" {...form.register('gst_number')} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Guest Category / VIP</Label>
                  <Combobox
                    options={[
                      { value: 'regular', label: 'Regular' },
                      { value: 'gold', label: 'Gold Member' },
                      { value: 'platinum', label: 'Platinum VIP' },
                      { value: 'corporate', label: 'Corporate' }
                    ]}
                    value={form.watch('vip_status')}
                    onChange={(val: string) => form.setValue('vip_status', val)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Special Preferences</Label>
                  <Input className="h-9" placeholder="Dietary, room loc, etc." {...form.register('notes')} />
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
                    <><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Complete Profile</>
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
