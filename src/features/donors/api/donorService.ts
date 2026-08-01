import {
  addDoc,
  orderBy,
  serverTimestamp,
  updateDoc,
  type Query,
  type WithFieldValue,
} from 'firebase/firestore';
import { collectionRef, docRef, withSoftDeleteFilter } from '@firebase-app/firestore';
import type { Donor } from '@types-app/donor';
import type { DonorFormValues } from '../schemas/donorSchema';

const DONORS_COLLECTION = 'donors';

export function buildDonorsQuery(): Query<Donor> {
  const base = collectionRef<Donor>(DONORS_COLLECTION);
  return withSoftDeleteFilter(base, orderBy('createdAt', 'desc'));
}

export function getDonorRef(donorId: string) {
  return docRef<Donor>(DONORS_COLLECTION, donorId);
}

interface CurrentUserInfo {
  uid: string;
}

export async function createDonor(
  values: DonorFormValues,
  currentUser: CurrentUserInfo,
): Promise<string> {
  const newDonor: WithFieldValue<Omit<Donor, 'id'>> = {
    name: values.name.trim(),
    phone: values.phone,
    email: values.email?.trim() ?? '',
    notes: values.notes?.trim() ?? '',
    isDeleted: false,
    createdBy: currentUser.uid,
    createdAt: serverTimestamp(),
    updatedBy: currentUser.uid,
    updatedAt: serverTimestamp(),
  };
  const donorDoc = await addDoc(
    collectionRef<Donor>(DONORS_COLLECTION),
    newDonor as WithFieldValue<Donor>,
  );
  return donorDoc.id;
}

export async function softDeleteDonor(donorId: string, deletedByUid: string): Promise<void> {
  await updateDoc(getDonorRef(donorId), {
    isDeleted: true,
    updatedBy: deletedByUid,
    updatedAt: serverTimestamp(),
  });
}
