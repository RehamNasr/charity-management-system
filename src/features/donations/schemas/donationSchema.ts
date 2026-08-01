import { z } from 'zod';
import { DONATION_METHODS } from '@types-app/donation';

export const donationFormSchema = z.object({
  donorId: z.string().min(1, 'validation.required'),
  amount: z.coerce.number({ error: 'validation.invalidNumber' }).min(1, 'validation.minValue1'),
  date: z.string().min(1, 'validation.required'),
  method: z.enum(DONATION_METHODS, 'validation.required'),
  notes: z.string().max(2000, 'validation.maxLength2000').optional(),
});

export type DonationFormInput = z.input<typeof donationFormSchema>;
export type DonationFormValues = z.output<typeof donationFormSchema>;
