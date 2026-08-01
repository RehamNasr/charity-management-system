import type { Timestamp } from 'firebase/firestore';

/** `donors/{donorId}` (docs/ARCHITECTURE.md §6). */
export interface Donor {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  isDeleted: boolean;
  createdBy: string;
  createdAt: Timestamp;
  updatedBy: string;
  updatedAt: Timestamp;
}
