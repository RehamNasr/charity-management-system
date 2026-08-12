import {
  addDoc,
  doc,
  runTransaction,
  serverTimestamp,
  Timestamp,
  type Query,
} from 'firebase/firestore';
import { db } from '@firebase-app/config';
import { collectionRef, docRef, where, withSoftDeleteFilter } from '@firebase-app/firestore';
import type { Case } from '@types-app/case';

const ASSISTANCE_COLLECTION = 'assistance';
const CASES_COLLECTION = 'cases';

export interface AssistanceRecord {
  id: string;
  caseId: string;
  caseNumber: string;
  beneficiaryName: string;
  assistanceType: string;
  amount: number;
  date: Timestamp;
  notes: string;
  isDeleted: boolean;
  createdBy: string;
  createdAt: Timestamp;
}

export function buildAssistanceQuery(): Query<AssistanceRecord> {
  const base = collectionRef<AssistanceRecord>(ASSISTANCE_COLLECTION);
  return withSoftDeleteFilter(base);
}

interface CurrentUserInfo {
  uid: string;
}

export async function recordAssistance(
  targetCase: Case,
  assistanceType: string,
  amount: number,
  date: Date,
  notes: string,
  currentUser: CurrentUserInfo,
): Promise<string> {
  const assistanceTimestamp = Timestamp.fromDate(date);

  const recordData = {
    caseId: targetCase.id,
    caseNumber: targetCase.caseNumber ?? '',
    beneficiaryName: targetCase.fullName ?? '',
    assistanceType: assistanceType ?? 'food',
    amount: amount,
    date: assistanceTimestamp,
    notes: notes.trim(),
    isDeleted: false,
    createdBy: currentUser.uid ?? '',
    createdAt: serverTimestamp(),
  };

  const docRefResult = await addDoc(
    collectionRef<AssistanceRecord>(ASSISTANCE_COLLECTION),
    recordData as unknown as WithFieldValue<AssistanceRecord>,
  );

  const caseDocRef = docRef<Case>(CASES_COLLECTION, targetCase.id);
  const currentTotal = targetCase.totalAssistanceReceived ?? 0;

  await updateDoc(caseDocRef, {
    totalAssistanceReceived: currentTotal + amount,
    lastAssistanceDate: assistanceTimestamp,
    status: 'receiving_assistance',
    updatedBy: currentUser.uid ?? '',
    updatedAt: serverTimestamp(),
  });

  return docRefResult.id;
}
