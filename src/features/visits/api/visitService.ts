import {
  doc,
  limit,
  orderBy,
  serverTimestamp,
  updateDoc,
  runTransaction,
  addDoc,
  getDocs,
  Timestamp,
  type OrderByDirection,
  type Query,
  type QueryConstraint,
  type WithFieldValue,
} from 'firebase/firestore';
import { db } from '@firebase-app/config';
import { collectionRef, docRef, where, withSoftDeleteFilter } from '@firebase-app/firestore';
import { uploadToCloudinary } from '@services/cloudinary.service';
import { normalizeSearchValue } from '@utils/normalize';
import type {
  Visit,
  VisitStatus,
  VisitType,
  VisitRecommendation,
  VisitAttachment,
  VisitHistoryEvent,
  VisitEventType,
} from '@types-app/visit';
import type { Case } from '@types-app/case';
import type { VisitFormValues } from '../schemas/visitSchema';

export const VISITS_COLLECTION = 'caseVisits';
const COUNTERS_COLLECTION = 'counters';
const VISIT_COUNTER_DOC_ID = 'visits';
const VISITS_LIST_LIMIT = 300;

export type VisitSortField = 'createdAt' | 'visitDate' | 'visitNumber' | 'beneficiaryName';

export interface VisitsQueryFilters {
  status?: VisitStatus | 'all';
  visitType?: VisitType | 'all';
  recommendation?: VisitRecommendation | 'all';
  researcherId?: string;
  caseId?: string;
  searchTerm?: string;
}

export function buildVisitsQuery(
  filters: VisitsQueryFilters,
  sortField: VisitSortField,
  sortDirection: OrderByDirection,
): Query<Visit> {
  const base = collectionRef<Visit>(VISITS_COLLECTION);
  const constraints: QueryConstraint[] = [];

  if (filters.caseId) {
    constraints.push(where('caseId', '==', filters.caseId));
  }

  if (filters.status && filters.status !== 'all') {
    constraints.push(where('status', '==', filters.status));
  }

  if (filters.visitType && filters.visitType !== 'all') {
    constraints.push(where('visitType', '==', filters.visitType));
  }

  if (filters.recommendation && filters.recommendation !== 'all') {
    constraints.push(where('recommendation', '==', filters.recommendation));
  }

  if (filters.researcherId && filters.researcherId !== 'all') {
    constraints.push(where('researcherId', '==', filters.researcherId));
  }

  const term = normalizeSearchValue(filters.searchTerm ?? '');
  if (term) {
    constraints.push(where('normalizedBeneficiaryName', '>=', term));
    constraints.push(where('normalizedBeneficiaryName', '<=', term + ''));
    constraints.push(orderBy('normalizedBeneficiaryName', 'asc'));
  } else {
    constraints.push(orderBy(sortField, sortDirection));
  }

  constraints.push(limit(VISITS_LIST_LIMIT));

  return withSoftDeleteFilter(base, ...constraints);
}

export function getVisitRef(visitId: string) {
  return docRef<Visit>(VISITS_COLLECTION, visitId);
}

export interface CurrentUserInfo {
  uid: string;
  displayName: string;
}

export async function logVisitHistoryEvent(
  visitId: string,
  eventType: VisitEventType,
  description: string,
  currentUser: CurrentUserInfo,
  details?: Record<string, unknown>,
): Promise<void> {
  const historyRef = collectionRef<VisitHistoryEvent>(`${VISITS_COLLECTION}/${visitId}/history`);
  const newEvent: WithFieldValue<Omit<VisitHistoryEvent, 'id'>> = {
    visitId,
    eventType,
    description,
    performedBy: currentUser.uid,
    performedByName: currentUser.displayName,
    timestamp: serverTimestamp() as unknown as Timestamp,
    ...(details ? { details } : {}),
  };
  await addDoc(historyRef, newEvent as WithFieldValue<VisitHistoryEvent>);
}

export async function createVisit(
  values: VisitFormValues,
  selectedCase: Case,
  currentUser: CurrentUserInfo,
): Promise<string> {
  const newVisitRef = doc(collectionRef<Visit>(VISITS_COLLECTION));
  const counterRef = docRef<{ year: number; seq: number }>(
    COUNTERS_COLLECTION,
    VISIT_COUNTER_DOC_ID,
  );

  let generatedVisitNumber = '';

  await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef);
    const currentYear = new Date().getFullYear();
    const previous = counterSnap.exists() ? counterSnap.data() : null;
    const nextSeq = previous?.year === currentYear ? previous.seq + 1 : 1;
    generatedVisitNumber = `VISIT-${currentYear}-${String(nextSeq).padStart(6, '0')}`;

    transaction.set(counterRef, { year: currentYear, seq: nextSeq });

    const nextVisitDate = values.nextVisitDate
      ? Timestamp.fromDate(new Date(values.nextVisitDate))
      : null;
    const visitDate = Timestamp.fromDate(new Date(values.visitDate));

    const newVisitData: WithFieldValue<Omit<Visit, 'id'>> = {
      caseId: selectedCase.id,
      visitNumber: generatedVisitNumber,
      visitDate: visitDate,
      researcherId: values.researcherId || currentUser.uid,
      researcherName: values.researcherName || currentUser.displayName,
      visitType: values.visitType,
      status: values.status,
      priority: values.priority,
      summary: values.summary?.trim() ?? '',
      fullReport: {
        livingConditions: values.livingConditions?.trim() ?? '',
        employmentStatus: values.employmentStatus?.trim() ?? '',
        incomeVerification: values.incomeVerification?.trim() ?? '',
        healthStatus: values.healthStatus?.trim() ?? '',
        childrenStatus: values.childrenStatus?.trim() ?? '',
        additionalNotes: values.additionalNotes?.trim() ?? '',
      },
      recommendation: values.recommendation,
      recommendationReason: values.recommendationReason.trim(),
      suggestedAssistance: values.suggestedAssistance?.trim() ?? '',
      suggestedAmount: values.suggestedAmount ?? 0,
      nextVisitDate: nextVisitDate as unknown as Timestamp,
      latitude: values.latitude ?? null,
      longitude: values.longitude ?? null,
      address: {
        governorateId: values.governorateId,
        cityId: values.cityId,
        details: values.addressDetails?.trim() ?? '',
      },
      beneficiaryName: selectedCase.fullName,
      caseNumber: selectedCase.caseNumber,
      caseStatus: selectedCase.status,
      familyMembersCount: selectedCase.familyMembersCount,
      normalizedBeneficiaryName: normalizeSearchValue(selectedCase.fullName),
      normalizedCaseNumber: normalizeSearchValue(selectedCase.caseNumber),
      normalizedResearcherName: normalizeSearchValue(
        values.researcherName || currentUser.displayName,
      ),
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp() as unknown as Timestamp,
      updatedBy: currentUser.uid,
      updatedAt: serverTimestamp() as unknown as Timestamp,
    };

    transaction.set(newVisitRef, newVisitData);
  });

  await logVisitHistoryEvent(
    newVisitRef.id,
    'visit_created',
    `تم تسجيل الزيارة رقم ${generatedVisitNumber}`,
    currentUser,
  );

  return newVisitRef.id;
}

export async function updateVisit(
  visitId: string,
  values: VisitFormValues,
  currentVisit: Visit,
  currentUser: CurrentUserInfo,
): Promise<void> {
  const visitRef = getVisitRef(visitId);
  const nextVisitDate = values.nextVisitDate
    ? Timestamp.fromDate(new Date(values.nextVisitDate))
    : null;
  const visitDate = Timestamp.fromDate(new Date(values.visitDate));

  await updateDoc(visitRef, {
    visitDate: visitDate,
    visitType: values.visitType,
    status: values.status,
    priority: values.priority,
    researcherId: values.researcherId,
    researcherName: values.researcherName,
    summary: values.summary?.trim() ?? '',
    fullReport: {
      livingConditions: values.livingConditions?.trim() ?? '',
      employmentStatus: values.employmentStatus?.trim() ?? '',
      incomeVerification: values.incomeVerification?.trim() ?? '',
      healthStatus: values.healthStatus?.trim() ?? '',
      childrenStatus: values.childrenStatus?.trim() ?? '',
      additionalNotes: values.additionalNotes?.trim() ?? '',
    },
    recommendation: values.recommendation,
    recommendationReason: values.recommendationReason.trim(),
    suggestedAssistance: values.suggestedAssistance?.trim() ?? '',
    suggestedAmount: values.suggestedAmount ?? 0,
    nextVisitDate: nextVisitDate,
    latitude: values.latitude ?? null,
    longitude: values.longitude ?? null,
    address: {
      governorateId: values.governorateId,
      cityId: values.cityId,
      details: values.addressDetails?.trim() ?? '',
    },
    normalizedResearcherName: normalizeSearchValue(values.researcherName),
    updatedBy: currentUser.uid,
    updatedAt: serverTimestamp(),
  });

  if (currentVisit.status !== values.status) {
    await logVisitHistoryEvent(
      visitId,
      'status_changed',
      `تم تغيير حالة الزيارة من (${currentVisit.status}) إلى (${values.status})`,
      currentUser,
      { oldStatus: currentVisit.status, newStatus: values.status },
    );
  }

  if (currentVisit.recommendation !== values.recommendation) {
    await logVisitHistoryEvent(
      visitId,
      'recommendation_changed',
      `تم تحديث التوصية إلى (${values.recommendation})`,
      currentUser,
      { oldRecommendation: currentVisit.recommendation, newRecommendation: values.recommendation },
    );
  }

  await logVisitHistoryEvent(
    visitId,
    'report_updated',
    'تم تحديث بيانات الزيارة والتقرير التفصيلي',
    currentUser,
  );
}

export async function softDeleteVisit(
  visitId: string,
  currentUser: CurrentUserInfo,
): Promise<void> {
  await updateDoc(getVisitRef(visitId), {
    isDeleted: true,
    deletedAt: serverTimestamp(),
    deletedBy: currentUser.uid,
    updatedBy: currentUser.uid,
    updatedAt: serverTimestamp(),
  });
}

export async function uploadVisitAttachment(
  visitId: string,
  file: File,
  currentUser: CurrentUserInfo,
): Promise<string> {
  const { url: fileUrl, publicId } = await uploadToCloudinary(
    file,
    `caseVisits/${visitId}/attachments`,
  );

  const attachmentsRef = collectionRef<VisitAttachment>(
    `${VISITS_COLLECTION}/${visitId}/attachments`,
  );
  const newAttachment: WithFieldValue<Omit<VisitAttachment, 'id'>> = {
    visitId,
    fileName: file.name,
    fileUrl,
    filePath: publicId,
    fileType: file.type,
    fileSize: file.size,
    createdAt: serverTimestamp() as unknown as Timestamp,
    createdBy: currentUser.uid,
  };
  const attachmentDoc = await addDoc(
    attachmentsRef,
    newAttachment as WithFieldValue<VisitAttachment>,
  );

  await logVisitHistoryEvent(
    visitId,
    'attachment_uploaded',
    `تم رفع المرفق (${file.name})`,
    currentUser,
    { fileName: file.name, fileUrl, publicId },
  );

  return attachmentDoc.id;
}

/**
 * Deleting the underlying Cloudinary asset requires a signed (secret-bearing) request, and this
 * client-only app has nowhere safe to hold that secret — so this only soft-deletes the Firestore
 * record (`filePath` — the asset's Cloudinary public_id — is kept for a future backend-driven
 * cleanup job, but the asset itself is left in place in Cloudinary).
 */
export async function deleteVisitAttachment(
  visitId: string,
  attachmentId: string,
  _filePath: string,
  fileName: string,
  currentUser: CurrentUserInfo,
): Promise<void> {
  const attachmentDocRef = docRef<VisitAttachment>(
    `${VISITS_COLLECTION}/${visitId}/attachments`,
    attachmentId,
  );
  await updateDoc(attachmentDocRef, {
    isDeleted: true,
  } as unknown as Record<string, unknown>);

  await logVisitHistoryEvent(
    visitId,
    'attachment_deleted',
    `تم حذف المرفق (${fileName})`,
    currentUser,
    { fileName, attachmentId },
  );
}

export async function fetchAvailableCasesForVisit(): Promise<Case[]> {
  const casesRef = collectionRef<Case>('cases');
  const q = withSoftDeleteFilter(casesRef, limit(100));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id }));
}
