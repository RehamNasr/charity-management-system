import {
  addDoc,
  orderBy,
  serverTimestamp,
  updateDoc,
  Timestamp,
  type Query,
  type WithFieldValue,
} from 'firebase/firestore';
import { collectionRef, docRef, where, withSoftDeleteFilter } from '@firebase-app/firestore';
import type { Expense } from '@types-app/expense';
import type { ExpenseFormValues } from '../schemas/expenseSchema';

const EXPENSES_COLLECTION = 'expenses';

export function buildExpensesQuery(): Query<Expense> {
  const base = collectionRef<Expense>(EXPENSES_COLLECTION);
  return withSoftDeleteFilter(base, orderBy('date', 'desc'));
}

/** Expenses within `[start, end]`, inclusive — used by the Expense/Monthly/Annual reports. */
export function buildExpensesInRangeQuery(start: Date, end: Date): Query<Expense> {
  const base = collectionRef<Expense>(EXPENSES_COLLECTION);
  return withSoftDeleteFilter(
    base,
    where('date', '>=', Timestamp.fromDate(start)),
    where('date', '<=', Timestamp.fromDate(end)),
    orderBy('date', 'asc'),
  );
}

export function getExpenseRef(expenseId: string) {
  return docRef<Expense>(EXPENSES_COLLECTION, expenseId);
}

interface CurrentUserInfo {
  uid: string;
}

export async function createExpense(
  values: ExpenseFormValues,
  currentUser: CurrentUserInfo,
): Promise<string> {
  const newExpense: WithFieldValue<Omit<Expense, 'id'>> = {
    category: values.category,
    amount: values.amount,
    date: Timestamp.fromDate(new Date(values.date)),
    description: values.description.trim(),
    isDeleted: false,
    createdBy: currentUser.uid,
    createdAt: serverTimestamp(),
    updatedBy: currentUser.uid,
    updatedAt: serverTimestamp(),
  };
  const expenseDoc = await addDoc(
    collectionRef<Expense>(EXPENSES_COLLECTION),
    newExpense as WithFieldValue<Expense>,
  );
  return expenseDoc.id;
}

export async function softDeleteExpense(expenseId: string, deletedByUid: string): Promise<void> {
  await updateDoc(getExpenseRef(expenseId), {
    isDeleted: true,
    updatedBy: deletedByUid,
    updatedAt: serverTimestamp(),
  });
}
