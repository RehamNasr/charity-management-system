import type { Timestamp } from 'firebase/firestore';

export const DONATION_METHODS = ['cash', 'bank_transfer', 'other'] as const;
export type DonationMethod = (typeof DONATION_METHODS)[number];

/** `donations/{donationId}` (docs/ARCHITECTURE.md §6) — `donorName` is denormalized at write-time
 * so the Donations list/reports don't need a lookup join per row. */
export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  amount: number;
  date: Timestamp;
  method: DonationMethod;
  notes: string;
  isDeleted: boolean;
  createdBy: string;
  createdAt: Timestamp;
  updatedBy: string;
  updatedAt: Timestamp;
}
