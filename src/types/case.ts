import type { Timestamp } from 'firebase/firestore';

/** Case lifecycle state machine (docs/ARCHITECTURE.md §5). */
export const CASE_STATUSES = [
  'draft',
  'under_research',
  'pending_review',
  'approved',
  'rejected',
  'receiving_assistance',
  'suspended',
  'closed',
] as const;

export type CaseStatus = (typeof CASE_STATUSES)[number];

export const CASE_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export type CasePriority = (typeof CASE_PRIORITIES)[number];

/** Whether the social researcher's field visit(s) for this case have happened yet — distinct
 * from the case's overall lifecycle `status` below. */
export const SOCIAL_RESEARCH_STATUSES = ['not_started', 'in_progress', 'completed'] as const;
export type SocialResearchStatus = (typeof SOCIAL_RESEARCH_STATUSES)[number];

export interface CaseAddress {
  governorateId: string;
  /** Denormalized at write-time so list/detail views don't need a lookup join to render an
   * address (docs/ARCHITECTURE.md §6 design principle #3). */
  governorateName: string;
  cityId: string;
  cityName: string;
  villageId: string;
  villageName: string;
  details: string;
}

/**
 * `cases/{caseId}` (docs/ARCHITECTURE.md §6). `monthlyExpenses` is a deliberate, additive field
 * beyond the documented schema (tracked alongside `monthlyIncome` for need-assessment purposes);
 * it doesn't conflict with or replace anything the architecture defines.
 */
export interface Case {
  id: string;
  caseNumber: string;
  fullName: string;
  nationalId: string;
  phoneNumbers: string[];
  address: CaseAddress;
  familyMembersCount: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  needReason: string;
  /** FK into the `caseTypes` lookup collection (docs/ARCHITECTURE.md §6.5); an array per the
   * documented `caseType[]` field — a case can fall under more than one type. */
  caseTypeIds: string[];
  priorityLevel: CasePriority;
  status: CaseStatus;
  socialResearchStatus: SocialResearchStatus;
  assignedResearcherId: string | null;
  assignedResearcherName: string | null;
  assignedReviewerId: string | null;
  totalAssistanceReceived: number;
  lastAssistanceDate: Timestamp | null;
  normalizedName: string;
  normalizedNationalId: string;
  normalizedPhone: string;
  isDeleted: boolean;
  deletedAt: Timestamp | null;
  deletedBy: string | null;
  createdBy: string;
  createdAt: Timestamp;
  updatedBy: string;
  updatedAt: Timestamp;
}

/** `cases/{caseId}/attachments/{attachmentId}` — ID card images and supporting documents. */
export const CASE_ATTACHMENT_CATEGORIES = ['id_card', 'supporting_document'] as const;
export type CaseAttachmentCategory = (typeof CASE_ATTACHMENT_CATEGORIES)[number];

export interface CaseAttachment {
  id: string;
  caseId: string;
  category: CaseAttachmentCategory;
  fileName: string;
  fileUrl: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  isDeleted: boolean;
  createdAt: Timestamp;
  createdBy: string;
}
