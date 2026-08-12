import {
  doc,
  getDocs,
  limit,
  orderBy,
  addDoc,
  serverTimestamp,
  updateDoc,
  runTransaction,
  type Timestamp,
  type OrderByDirection,
  type Query,
  type QueryConstraint,
  type WithFieldValue,
} from 'firebase/firestore';
import { db } from '@firebase-app/config';
import { collectionRef, docRef, where, withSoftDeleteFilter } from '@firebase-app/firestore';
import { uploadToCloudinary } from '@services/cloudinary.service';
import { normalizeDigits, normalizeSearchValue } from '@utils/normalize';
import type { Case, CaseAttachment, CaseAttachmentCategory, CaseStatus } from '@types-app/case';
import type { CaseFormValues } from '../schemas/caseSchema';

const CASES_COLLECTION = 'cases';
const COUNTERS_COLLECTION = 'counters';
const CASE_COUNTER_DOC_ID = 'cases';

/** Realtime list subscriptions stay bounded rather than mirroring an unbounded collection into
 * the browser — consistent with docs/ARCHITECTURE.md §2's "denormalized read models, pagination"
 * performance principle. Anything beyond this is reachable by narrowing the search/status filter. */
const CASES_LIST_LIMIT = 300;

export type CaseSortField = 'createdAt' | 'caseNumber' | 'familyMembersCount' | 'monthlyIncome';

export interface CasesQueryFilters {
  status: CaseStatus | 'all';
  searchTerm: string;
}

const EGYPT_NATIONAL_ID_LENGTH = 14;

/** Which denormalized field a given search term should be matched against — a search box that
 * covers full name, national ID, and phone number (Phase 1 requirement) without a full-text
 * search service, since Firestore range queries can only filter one field at a time. */
function resolveSearchField(term: string): 'normalizedNationalId' | 'normalizedPhone' | 'normalizedName' {
  const digitsOnly = normalizeDigits(term);
  const isNumeric = digitsOnly.length > 0 && digitsOnly === term.replace(/\s/g, '');
  if (!isNumeric) return 'normalizedName';
  if (digitsOnly.length >= EGYPT_NATIONAL_ID_LENGTH - 2) return 'normalizedNationalId';
  return 'normalizedPhone';
}

/**
 * Builds the live cases query. When a search term is present, Firestore requires the query to be
 * ordered by the range-filtered field itself, so the caller's chosen sort is intentionally
 * overridden in that case — see docs/ARCHITECTURE.md §6 design principle #6. The search field
 * itself is auto-detected (name vs. national ID vs. phone) from the shape of the input.
 */
export function buildCasesQuery(
  filters: CasesQueryFilters,
  sortField: CaseSortField,
  sortDirection: OrderByDirection,
): Query<Case> {
  const base = collectionRef<Case>(CASES_COLLECTION);
  const constraints: QueryConstraint[] = [];

  if (filters.status !== 'all') {
    constraints.push(where('status', '==', filters.status));
  }

  const rawTerm = filters.searchTerm.trim();
  if (rawTerm) {
    const searchField = resolveSearchField(rawTerm);
    const term = searchField === 'normalizedName' ? normalizeSearchValue(rawTerm) : normalizeDigits(rawTerm);
    constraints.push(where(searchField, '>=', term));
    constraints.push(where(searchField, '<=', term + ''));
    constraints.push(orderBy(searchField, 'asc'));
  } else {
    constraints.push(orderBy(sortField, sortDirection));
  }

  constraints.push(limit(CASES_LIST_LIMIT));

  return withSoftDeleteFilter(base, ...constraints);
}

export function getCaseRef(caseId: string) {
  return docRef<Case>(CASES_COLLECTION, caseId);
}

interface CurrentUserInfo {
  uid: string;
  displayName: string;
}

function buildAddress(
  values: CaseFormValues,
  governorateName: string,
  cityName: string,
  villageName: string,
): Case['address'] {
  return {
    governorateId: values.governorateId,
    governorateName,
    cityId: values.cityId,
    cityName,
    villageId: values.villageId,
    villageName,
    details: values.addressDetails.trim(),
  };
}

/**
 * Duplicate-registration guard (Phase 1 requirement): looks up an active (non-deleted) case by
 * national ID. Must be called — and its result checked — before `createCase`, since Firestore
 * itself has no unique-constraint mechanism; this is the enforcement point.
 */
export async function findCaseByNationalId(
  nationalId: string,
  excludeCaseId?: string,
): Promise<Case | null> {
  const normalized = normalizeDigits(nationalId);
  const q = withSoftDeleteFilter(
    collectionRef<Case>(CASES_COLLECTION),
    where('normalizedNationalId', '==', normalized),
    limit(5),
  );
  const snap = await getDocs(q);
  const match = snap.docs.find((docSnap) => docSnap.id !== excludeCaseId);
  return match ? { ...match.data(), id: match.id } : null;
}

/**
 * Creates a case. The case number is generated inside a Firestore transaction against a shared
 * counter document (docs/ARCHITECTURE.md §6 — "Firestore counter document, not client
 * `Date.now()`"), atomically with the case document write itself, so two concurrent creates can
 * never collide on the same number and a failed create never burns a number.
 *
 * Callers must run `findCaseByNationalId` first and block the submit on a match — this function
 * does not re-check, since the caller already owns the user-facing error message/UX for that.
 */
export async function createCase(
  values: CaseFormValues,
  governorateName: string,
  cityName: string,
  villageName: string,
  currentUser: CurrentUserInfo,
): Promise<string> {
  const newCaseRef = doc(collectionRef<Case>(CASES_COLLECTION));
  const counterRef = docRef<{ year: number; seq: number }>(
    COUNTERS_COLLECTION,
    CASE_COUNTER_DOC_ID,
  );

  await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef);
    const currentYear = new Date().getFullYear();
    const previous = counterSnap.exists() ? counterSnap.data() : null;
    const nextSeq = previous?.year === currentYear ? previous.seq + 1 : 1;
    const caseNumber = `CASE-${currentYear}-${String(nextSeq).padStart(6, '0')}`;

    transaction.set(counterRef, { year: currentYear, seq: nextSeq });

    const newCaseData: WithFieldValue<Omit<Case, 'id'>> = {
      caseNumber,
      fullName: values.fullName.trim(),
      nationalId: values.nationalId,
      phoneNumbers: [values.phone],
      address: buildAddress(values, governorateName, cityName, villageName),
      familyMembersCount: values.familyMembersCount,
      monthlyIncome: values.monthlyIncome,
      monthlyExpenses: values.monthlyExpenses,
      needReason: values.notes?.trim() ?? '',
      caseTypeIds: values.caseTypeIds,
      priorityLevel: values.priorityLevel,
      status: values.status,
      socialResearchStatus: values.socialResearchStatus,
      maritalStatus: (values.maritalStatus as Case['maritalStatus']) ?? 'married',
      assistanceType: (values.assistanceType as Case['assistanceType']) ?? 'food',
      assignedResearcherId: currentUser.uid,
      assignedResearcherName: currentUser.displayName,
      assignedReviewerId: null,
      totalAssistanceReceived: 0,
      lastAssistanceDate: null,
      normalizedName: normalizeSearchValue(values.fullName),
      normalizedNationalId: normalizeDigits(values.nationalId),
      normalizedPhone: normalizeDigits(values.phone),
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedBy: currentUser.uid,
      updatedAt: serverTimestamp(),
    };

    transaction.set(newCaseRef, newCaseData);
  });

  return newCaseRef.id;
}

/**
 * Full field update, available to any authenticated user (docs/ARCHITECTURE.md §3 — no
 * role-based restrictions). Never touches `isDeleted` — that's a distinct action
 * (`softDeleteCase`) so the two can't be conflated in a single accidental payload.
 *
 * Like `createCase`, callers must run `findCaseByNationalId(nationalId, caseId)` first when the
 * national ID field changed, so an edit can't silently create a second case for the same person.
 */
export async function updateCase(
  caseId: string,
  values: CaseFormValues,
  governorateName: string,
  cityName: string,
  villageName: string,
  currentUserUid: string,
): Promise<void> {
  await updateDoc(getCaseRef(caseId), {
    fullName: values.fullName.trim(),
    nationalId: values.nationalId,
    phoneNumbers: [values.phone],
    address: buildAddress(values, governorateName, cityName, villageName),
    familyMembersCount: values.familyMembersCount,
    monthlyIncome: values.monthlyIncome,
    monthlyExpenses: values.monthlyExpenses,
    needReason: values.notes?.trim() ?? '',
    caseTypeIds: values.caseTypeIds,
    priorityLevel: values.priorityLevel,
    status: values.status,
    socialResearchStatus: values.socialResearchStatus,
    maritalStatus: (values.maritalStatus as Case['maritalStatus']) ?? 'married',
    assistanceType: (values.assistanceType as Case['assistanceType']) ?? 'food',
    normalizedName: normalizeSearchValue(values.fullName),
    normalizedNationalId: normalizeDigits(values.nationalId),
    normalizedPhone: normalizeDigits(values.phone),
    updatedBy: currentUserUid,
    updatedAt: serverTimestamp(),
  });
}

/** Soft delete (docs/ARCHITECTURE.md §6 design principle #7) — available to any authenticated
 * user. Deleted cases are excluded from every normal query via `withSoftDeleteFilter`. */
export async function softDeleteCase(caseId: string, deletedByUid: string): Promise<void> {
  await updateDoc(getCaseRef(caseId), {
    isDeleted: true,
    deletedAt: serverTimestamp(),
    deletedBy: deletedByUid,
    updatedBy: deletedByUid,
    updatedAt: serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// Attachments (ID card images + supporting documents)
// ---------------------------------------------------------------------------

function caseAttachmentsRef(caseId: string) {
  return collectionRef<CaseAttachment>(`${CASES_COLLECTION}/${caseId}/attachments`);
}

/** Uploads an ID card image or supporting document to Cloudinary (same unsigned-upload service
 * the Visits module uses — see `cloudinary.service.ts`) and records it under the case. */
export async function uploadCaseAttachment(
  caseId: string,
  file: File,
  category: CaseAttachmentCategory,
  currentUser: CurrentUserInfo,
): Promise<string> {
  const { url: fileUrl, publicId } = await uploadToCloudinary(file, `cases/${caseId}/attachments`);

  const newAttachment: WithFieldValue<Omit<CaseAttachment, 'id'>> = {
    caseId,
    category,
    fileName: file.name,
    fileUrl,
    filePath: publicId,
    fileType: file.type,
    fileSize: file.size,
    isDeleted: false,
    createdAt: serverTimestamp() as unknown as Timestamp,
    createdBy: currentUser.uid,
  };
  const attachmentDoc = await addDoc(
    caseAttachmentsRef(caseId),
    newAttachment as WithFieldValue<CaseAttachment>,
  );
  return attachmentDoc.id;
}

/** Soft-deletes an attachment record. As with visit attachments, deleting the underlying
 * Cloudinary asset needs a signed (secret-bearing) request this client-only app can't safely
 * make, so the Cloudinary file itself is left in place. */
export async function deleteCaseAttachment(caseId: string, attachmentId: string): Promise<void> {
  const attachmentDocRef = docRef<CaseAttachment>(
    `${CASES_COLLECTION}/${caseId}/attachments`,
    attachmentId,
  );
  await updateDoc(attachmentDocRef, { isDeleted: true } as unknown as Record<string, unknown>);
}
