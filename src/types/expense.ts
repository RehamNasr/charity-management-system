import type { Timestamp } from 'firebase/firestore';

export const EXPENSE_CATEGORIES = [
  'assistance_disbursement',
  'operational',
  'administrative',
  'medical',
  'housing',
  'other',
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

/** `expenses/{expenseId}` (docs/ARCHITECTURE.md §6). */
export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: Timestamp;
  description: string;
  isDeleted: boolean;
  createdBy: string;
  createdAt: Timestamp;
  updatedBy: string;
  updatedAt: Timestamp;
}
