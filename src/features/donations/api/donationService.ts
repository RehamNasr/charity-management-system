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
import type { Donation } from '@types-app/donation';
import type { DonationFormValues } from '../schemas/donationSchema';

const DONATIONS_COLLECTION = 'donations';

export function buildDonationsQuery(): Query<Donation> {
  const base = collectionRef<Donation>(DONATIONS_COLLECTION);
  return withSoftDeleteFilter(base, orderBy('date', 'desc'));
}

/** Donations within `[start, end]`, inclusive — used by the Income/Monthly/Annual reports. */
export function buildDonationsInRangeQuery(start: Date, end: Date): Query<Donation> {
  const base = collectionRef<Donation>(DONATIONS_COLLECTION);
  return withSoftDeleteFilter(
    base,
    where('date', '>=', Timestamp.fromDate(start)),
    where('date', '<=', Timestamp.fromDate(end)),
    orderBy('date', 'asc'),
  );
}

export function getDonationRef(donationId: string) {
  return docRef<Donation>(DONATIONS_COLLECTION, donationId);
}

interface CurrentUserInfo {
  uid: string;
}

export async function createDonation(
  values: DonationFormValues,
  donorName: string,
  currentUser: CurrentUserInfo,
): Promise<string> {
  const newDonation: WithFieldValue<Omit<Donation, 'id'>> = {
    donorId: values.donorId,
    donorName,
    amount: values.amount,
    date: Timestamp.fromDate(new Date(values.date)),
    method: values.method,
    notes: values.notes?.trim() ?? '',
    isDeleted: false,
    createdBy: currentUser.uid,
    createdAt: serverTimestamp(),
    updatedBy: currentUser.uid,
    updatedAt: serverTimestamp(),
  };
  const donationDoc = await addDoc(
    collectionRef<Donation>(DONATIONS_COLLECTION),
    newDonation as WithFieldValue<Donation>,
  );
  return donationDoc.id;
}

export async function softDeleteDonation(donationId: string, deletedByUid: string): Promise<void> {
  await updateDoc(getDonationRef(donationId), {
    isDeleted: true,
    updatedBy: deletedByUid,
    updatedAt: serverTimestamp(),
  });
}
