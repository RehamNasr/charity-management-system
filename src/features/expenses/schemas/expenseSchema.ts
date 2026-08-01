import { z } from 'zod';
import { EXPENSE_CATEGORIES } from '@types-app/expense';

export const expenseFormSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES, 'validation.required'),
  amount: z.coerce.number({ error: 'validation.invalidNumber' }).min(1, 'validation.minValue1'),
  date: z.string().min(1, 'validation.required'),
  description: z.string().min(3, 'validation.minLength3').max(2000, 'validation.maxLength2000'),
});

export type ExpenseFormInput = z.input<typeof expenseFormSchema>;
export type ExpenseFormValues = z.output<typeof expenseFormSchema>;
