'use client';

import { useState } from 'react';
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
import { bookingService } from '@/lib/services/bookings.service';
import { Combobox } from '@/components/ui/custom/combobox';

const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  payment_method: z.enum(['cash', 'card', 'transfer']),
  reference_number: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface RecordPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  booking: any;
}

export function RecordPaymentModal({
  open,
  onOpenChange,
  onSuccess,
  booking
}: RecordPaymentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      payment_method: 'cash',
      reference_number: '',
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    if (!booking) return;
    setIsSubmitting(true);
    try {
      await bookingService.recordPayment(
        booking.id,
        data.amount,
        data.payment_method,
        data.reference_number
      );
      toast.success('Payment recorded successfully');
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Credit Card' },
    { value: 'transfer', label: 'Bank Transfer' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for Booking #{booking?.booking_code || booking?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...form.register('amount')}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Combobox
                options={paymentMethodOptions}
                value={form.watch('payment_method')}
                onChange={(val: any) => form.setValue('payment_method', val)}
                placeholder="Select method"
                searchPlaceholder="Search method..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference_number">Reference Number</Label>
              <Input
                id="reference_number"
                placeholder="Transaction ID (Optional)"
                {...form.register('reference_number')}
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
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
