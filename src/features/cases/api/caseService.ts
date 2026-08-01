import {
  doc,
  limit,
  orderBy,
  serverTimestamp,
  updateDoc,
  runTransaction,
  type OrderByDirection,
  type Query,
  type QueryConstraint,
  type WithFieldValue,
} from 'firebase/firestore';
import { db } from '@firebase-app/config';
import { collectionRef, docRef, where, withSoftDeleteFilter } from '@firebase-app/firestore';
import { normalizeDigits, normalizeSearchValue } from '@utils/normalize';
import type { Case, CaseStatus } from '@types-app/case';
import type { CaseFormValues } from '../schemas/caseSchema';
import type { Role } from '@types-app/user';

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

/**
 * Builds the live cases query. When a search term is present, Firestore requires the query to be
 * ordered by the range-filtered field itself (`normalizedName`), so the caller's chosen sort is
 * intentionally overridden in that case — see docs/ARCHITECTURE.md §6 design principle #6.
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

  const term = normalizeSearchValue(filters.searchTerm);
  if (term) {
    constraints.push(where('normalizedName', '>=', term));
    constraints.push(where('normalizedName', '<=', term + ''));
    constraints.push(orderBy('normalizedName', 'asc'));
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
  role: Role;
}

function buildAddress(
  values: CaseFormValues,
  governorateName: string,
  cityName: string,
): Case['address'] {
  return {
    governorateId: values.governorateId,
    governorateName,
    cityId: values.cityId,
    cityName,
    details: values.addressDetails.trim(),
  };
}

/**
 * Creates a case. The case number is generated inside a Firestore transaction against a shared
 * counter document (docs/ARCHITECTURE.md §6 — "Firestore counter document, not client
 * `Date.now()`"), atomically with the case document write itself, so two concurrent creates can
 * never collide on the same number and a failed create never burns a number.
 */
export async function createCase(
  values: CaseFormValues,
  governorateName: string,
  cityName: string,
  currentUser: CurrentUserInfo,
): Promise<string> {
  const newCaseRef = doc(collectionRef<Case>(CASES_COLLECTION));
  const counterRef = docRef<{ year: number; seq: number }>(
    COUNTERS_COLLECTION,
    CASE_COUNTER_DOC_ID,
  );
  const isResearcher = currentUser.role === 'social_researcher';

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
      address: buildAddress(values, governorateName, cityName),
      familyMembersCount: values.familyMembersCount,
      monthlyIncome: values.monthlyIncome,
      monthlyExpenses: values.monthlyExpenses,
      needReason: values.notes?.trim() ?? '',
      caseTypeIds: values.caseTypeIds,
      priorityLevel: 'medium',
      status: values.status,
      assignedResearcherId: isResearcher ? currentUser.uid : null,
      assignedResearcherName: isResearcher ? currentUser.displayName : null,
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
 * Full field update for the roles allowed to edit raw case data (super_admin/admin always;
 * social_researcher/data_entry within their own restricted window — see firestore.rules). Never
 * touches `isDeleted` — that's a distinct action (`softDeleteCase`) so the two can't be conflated
 * in a single accidental payload.
 */
export async function updateCase(
  caseId: string,
  values: CaseFormValues,
  governorateName: string,
  cityName: string,
  currentUserUid: string,
): Promise<void> {
  await updateDoc(getCaseRef(caseId), {
    fullName: values.fullName.trim(),
    nationalId: values.nationalId,
    phoneNumbers: [values.phone],
    address: buildAddress(values, governorateName, cityName),
    familyMembersCount: values.familyMembersCount,
    monthlyIncome: values.monthlyIncome,
    monthlyExpenses: values.monthlyExpenses,
    needReason: values.notes?.trim() ?? '',
    caseTypeIds: values.caseTypeIds,
    status: values.status,
    normalizedName: normalizeSearchValue(values.fullName),
    normalizedNationalId: normalizeDigits(values.nationalId),
    normalizedPhone: normalizeDigits(values.phone),
    updatedBy: currentUserUid,
    updatedAt: serverTimestamp(),
  });
}

/**
 * The `case_reviewer` approve/reject action — a minimal, separate write touching only the fields
 * firestore.rules allow that role to change, matching §3 "approve/reject status transitions...
 * cannot edit raw case data" precisely rather than reusing the general `updateCase` payload.
 */
export async function reviewCase(
  caseId: string,
  decision: Extract<CaseStatus, 'approved' | 'rejected'>,
  reviewerUid: string,
): Promise<void> {
  await updateDoc(getCaseRef(caseId), {
    status: decision,
    assignedReviewerId: reviewerUid,
    updatedBy: reviewerUid,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Client-side mirror of the raw-field-edit branch of firestore.rules' `cases` update rule — used
 * to decide whether to render the edit form (or a "not editable" notice) before the user attempts
 * a write the server would reject anyway. The Security Rules remain the actual enforcement.
 */
export function canEditCaseFields(role: Role, targetCase: Case, uid: string): boolean {
  if (role === 'super_admin' || role === 'admin') return true;
  if (role === 'social_researcher') {
    return (
      targetCase.assignedResearcherId === uid &&
      (targetCase.status === 'draft' || targetCase.status === 'under_research')
    );
  }
  if (role === 'data_entry') {
    return targetCase.createdBy === uid && targetCase.status === 'draft';
  }
  return false;
}

/** Client-side mirror of the case_reviewer branch of the same rule. */
export function canReviewCase(role: Role, targetCase: Case): boolean {
  return role === 'case_reviewer' && targetCase.status === 'pending_review';
}

/** Soft delete (docs/ARCHITECTURE.md §6 design principle #7) — restricted to super_admin/admin by
 * firestore.rules. Deleted cases are excluded from every normal query via `withSoftDeleteFilter`. */
export async function softDeleteCase(caseId: string, deletedByUid: string): Promise<void> {
  await updateDoc(getCaseRef(caseId), {
    isDeleted: true,
    deletedAt: serverTimestamp(),
    deletedBy: deletedByUid,
    updatedBy: deletedByUid,
    updatedAt: serverTimestamp(),
  });
}
