import {
  CASE_STATUSES,
  CASE_PRIORITIES,
  SOCIAL_RESEARCH_STATUSES,
  type CaseStatus,
  type CasePriority,
  type SocialResearchStatus,
} from '@types-app/case';
import type { SelectOption } from '@types-app/common';

export const CASE_STATUS_LABELS_AR: Record<CaseStatus, string> = {
  draft: 'مسودة',
  under_research: 'قيد البحث الاجتماعي',
  pending_review: 'بانتظار المراجعة',
  approved: 'معتمدة',
  rejected: 'مرفوضة',
  receiving_assistance: 'تستقبل مساعدات',
  suspended: 'موقوفة',
  closed: 'مغلقة',
};

export const CASE_STATUS_COLORS: Record<
  CaseStatus,
  'default' | 'info' | 'warning' | 'success' | 'error' | 'primary'
> = {
  draft: 'default',
  under_research: 'info',
  pending_review: 'warning',
  approved: 'success',
  rejected: 'error',
  receiving_assistance: 'primary',
  suspended: 'warning',
  closed: 'default',
};

/** Statuses a brand-new case may start in — the rest of the lifecycle is reached through
 * transitions, not picked freely at creation time (docs/ARCHITECTURE.md §5). */
export const CREATABLE_CASE_STATUSES: CaseStatus[] = ['draft', 'under_research'];

/** Every authenticated user may set a case to any status — there are no role-based transition
 * restrictions (docs/ARCHITECTURE.md §3). */
export const CASE_STATUS_OPTIONS: SelectOption<CaseStatus>[] = CASE_STATUSES.map((status) => ({
  value: status,
  label: CASE_STATUS_LABELS_AR[status],
}));

export const CASE_PRIORITY_LABELS_AR: Record<CasePriority, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
  critical: 'حرجة',
};

export const CASE_PRIORITY_COLORS: Record<
  CasePriority,
  'default' | 'info' | 'warning' | 'error'
> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  critical: 'error',
};

export const CASE_PRIORITY_OPTIONS: SelectOption<CasePriority>[] = CASE_PRIORITIES.map(
  (priority) => ({ value: priority, label: CASE_PRIORITY_LABELS_AR[priority] }),
);

export const SOCIAL_RESEARCH_STATUS_LABELS_AR: Record<SocialResearchStatus, string> = {
  not_started: 'لم تبدأ',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتملة',
};

export const SOCIAL_RESEARCH_STATUS_COLORS: Record<
  SocialResearchStatus,
  'default' | 'info' | 'success'
> = {
  not_started: 'default',
  in_progress: 'info',
  completed: 'success',
};

export const SOCIAL_RESEARCH_STATUS_OPTIONS: SelectOption<SocialResearchStatus>[] =
  SOCIAL_RESEARCH_STATUSES.map((status) => ({
    value: status,
    label: SOCIAL_RESEARCH_STATUS_LABELS_AR[status],
  }));
