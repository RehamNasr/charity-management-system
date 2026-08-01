import type { Timestamp } from 'firebase/firestore';

export const VISIT_STATUSES = ['scheduled', 'completed', 'cancelled', 'missed'] as const;
export type VisitStatus = (typeof VISIT_STATUSES)[number];

export const VISIT_TYPES = [
  'initial_visit',
  'follow_up',
  'emergency',
  'verification',
  'monthly_review',
  'other',
] as const;
export type VisitType = (typeof VISIT_TYPES)[number];

export const VISIT_RECOMMENDATIONS = [
  'approve',
  'reject',
  'need_more_documents',
  'need_another_visit',
  'increase_assistance',
  'reduce_assistance',
  'suspend_case',
  'close_case',
] as const;
export type VisitRecommendation = (typeof VISIT_RECOMMENDATIONS)[number];

export const VISIT_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export type VisitPriority = (typeof VISIT_PRIORITIES)[number];

export interface VisitAddress {
  governorateId?: string;
  governorateName?: string;
  cityId?: string;
  cityName?: string;
  details?: string;
}

export interface VisitReportFindings {
  livingConditions: string;
  employmentStatus: string;
  incomeVerification: string;
  healthStatus: string;
  childrenStatus: string;
  additionalNotes?: string;
}

export interface Visit {
  id: string;
  caseId: string;
  visitNumber: string;
  visitDate: Timestamp;
  researcherId: string;
  researcherName: string;
  visitType: VisitType;
  status: VisitStatus;
  priority: VisitPriority;
  summary: string;
  fullReport: VisitReportFindings;
  recommendation: VisitRecommendation;
  recommendationReason: string;
  suggestedAssistance?: string;
  suggestedAmount?: number;
  nextVisitDate: Timestamp | null;
  latitude: number | null;
  longitude: number | null;
  address: VisitAddress;
  // Denormalized case info for performant display and search
  beneficiaryName: string;
  caseNumber: string;
  caseStatus?: string;
  familyMembersCount?: number;
  currentAssistanceSummary?: string;
  // Normalized fields for search
  normalizedBeneficiaryName: string;
  normalizedCaseNumber: string;
  normalizedResearcherName: string;

  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
  isDeleted: boolean;
  deletedAt: Timestamp | null;
  deletedBy: string | null;
}

export interface VisitAttachment {
  id: string;
  visitId: string;
  fileName: string;
  fileUrl: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  createdAt: Timestamp;
  createdBy: string;
}

export type VisitEventType =
  | 'visit_created'
  | 'report_updated'
  | 'recommendation_changed'
  | 'attachment_uploaded'
  | 'attachment_deleted'
  | 'status_changed';

export interface VisitHistoryEvent {
  id: string;
  visitId: string;
  eventType: VisitEventType;
  description: string;
  performedBy: string;
  performedByName: string;
  timestamp: Timestamp;
  details?: Record<string, unknown>;
}
