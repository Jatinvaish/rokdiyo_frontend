/**
 * MODAL FORM TEMPLATE & BOILERPLATE
 * 
 * Use this as a reference when creating new modal forms.
 * Follow the AddTenantModal pattern for consistency.
 * 
 * Key Components:
 * - React Hook Form for form state management
 * - Zod for validation schemas
 * - shadcn Dialog for modal container
 * - shadcn Form, FormField, FormItem, FormLabel, FormControl, FormMessage for form fields
 * - shadcn Select for dropdown inputs
 * - Custom inputs (PhoneInput, WebsiteInput, PasswordInput) from custom-inputs.tsx
 * - Toast notifications for feedback
 * - Loader2 icon for loading state
 */

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PhoneInput, WebsiteInput, PasswordInput } from '@/components/ui/custom-inputs';
import { Combobox } from '@/components/ui/custom/combobox';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

// ============================================================================
// 1. DEFINE VALIDATION SCHEMA using Zod
// ============================================================================
const exampleFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  category: z.enum(['type1', 'type2', 'type3']).refine(
    val => val,
    { message: 'Please select a valid category' }
  ),
  description: z.string().optional(),
});

type ExampleFormData = z.infer<typeof exampleFormSchema>;

// ============================================================================
// 2. DEFINE MODAL PROPS INTERFACE
// ============================================================================
interface ExampleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// ============================================================================
// 3. CREATE THE MODAL COMPONENT
// ============================================================================
export function ExampleModal({ open, onOpenChange, onSuccess }: ExampleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with schema
  const form = useForm<ExampleFormData>({
    resolver: zodResolver(exampleFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      category: 'type1',
      description: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: ExampleFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      // const result = await exampleApi.create(data);

      toast.success('Item created successfully');
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Create New Item</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            {/* ================================================================ */
            /* SINGLE FIELD PATTERN */
            /* ================================================================ */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} className="h-8 text-sm" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* ================================================================ */
            /* TWO COLUMN GRID PATTERN */
            /* ================================================================ */}
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} className="h-8 text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Phone</FormLabel>
                    <FormControl>
                      <PhoneInput {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* ================================================================ */
            /* SELECT DROPDOWN PATTERN (shadcn Select) */
            /* ================================================================ */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</FormLabel>
                  <FormControl>
                    <Combobox
                      options={[
                        { value: 'type1', label: 'Type 1' },
                        { value: 'type2', label: 'Type 2' },
                        { value: 'type3', label: 'Type 3' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select a category"
                      searchPlaceholder="Search category..."
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* ================================================================ */
            /* OPTIONAL FIELD PATTERN */
            /* ================================================================ */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description" {...field} className="h-8 text-sm" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* ================================================================ */
            /* ACTION BUTTONS */
            /* ================================================================ */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-8 text-xs flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-8 text-xs flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * ============================================================================
 * USAGE IN PAGE COMPONENT
 * ============================================================================
 * 
 * import { ExampleModal } from '@/components/forms/example-modal';
 * 
 * export default function ExamplePage() {
 *   const [openModal, setOpenModal] = useState(false);
 * 
 *   const handleSuccess = () => {
 *     // Refresh data, etc.
 *   };
 * 
 *   return (
 *     <>
 *       <Button onClick={() => setOpenModal(true)}>+ Add New</Button>
 *       <ExampleModal
 *         open={openModal}
 *         onOpenChange={setOpenModal}
 *         onSuccess={handleSuccess}
 *       />
 *     </>
 *   );
 * }
 */

/**
 * ============================================================================
 * AVAILABLE CUSTOM INPUTS (from custom-inputs.tsx)
 * ============================================================================
 * 
 * 1. PasswordInput
 *    - Secure password field with show/hide toggle
 *    - Usage: <PasswordInput {...field} />
 * 
 * 2. PhoneInput
 *    - Phone field with phone icon
 *    - Placeholder: +91 98765 43210
 *    - Usage: <PhoneInput {...field} />
 * 
 * 3. WebsiteInput
 *    - URL field with globe icon
 *    - Placeholder: https://example.com
 *    - Usage: <WebsiteInput {...field} />
 * 
 * 4. TimezoneSelect
 *    - Dropdown with timezone options (default: IST)
 *    - Usage: <TimezoneSelect value={field.value} onValueChange={field.onChange} />
 * 
 * 5. CurrencySelect
 *    - Dropdown with currency options (default: INR)
 *    - Usage: <CurrencySelect value={field.value} onValueChange={field.onChange} />
 */

/**
 * ============================================================================
 * COMMON PATTERNS TO FOLLOW
 * ============================================================================
 * 
 * Styling:
 * - Use h-8 text-sm for inputs to match design system
 * - Use text-xs for labels
 * - Use space-y-2 for form spacing
 * - Use max-w-lg for modal width
 * 
 * Form Fields:
 * - Always use FormField > FormItem > FormLabel + FormControl + FormMessage
 * - Always include FormMessage for error display
 * - Use placeholder text that shows example values
 * 
 * Submission:
 * - Use try-catch for error handling
 * - Always reset form after success
 * - Close modal on success
 * - Call onSuccess() callback to refresh parent data
 * - Show toast notifications for feedback
 * 
 * Grid Layouts:
 * - Use grid-cols-2 for 2-column layouts
 * - Use gap-2 for spacing between columns
 * - Good for email+phone, city+state, etc.
 */
