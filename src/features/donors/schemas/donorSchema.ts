import { z } from 'zod';

const EGYPT_PHONE_PATTERN = /^01[0125][0-9]{8}$/;

export const donorFormSchema = z.object({
  name: z.string().min(3, 'validation.minLength3').max(120, 'validation.maxLength120'),
  phone: z.string().regex(EGYPT_PHONE_PATTERN, 'validation.invalidPhone'),
  email: z.string().email('validation.invalidEmail').optional().or(z.literal('')),
  notes: z.string().max(2000, 'validation.maxLength2000').optional(),
});

export type DonorFormValues = z.infer<typeof donorFormSchema>;
