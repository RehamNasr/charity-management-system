import { CASE_STATUSES, type CaseStatus, type CasePriority } from '@types-app/case';
import type { Role } from '@types-app/user';
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

/**
 * Allowed next states from each status, mirroring the state-machine diagram in
 * docs/ARCHITECTURE.md §5. The current status is always offered too (see `getSelectableStatuses`)
 * so an edit that doesn't touch status is a no-op rather than a forced transition.
 */
const CASE_STATUS_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  draft: ['under_research'],
  under_research: ['pending_review'],
  pending_review: ['approved', 'rejected'],
  approved: ['receiving_assistance', 'suspended', 'closed'],
  rejected: ['closed'],
  receiving_assistance: ['suspended', 'closed'],
  suspended: ['receiving_assistance', 'closed'],
  closed: [],
};

export function getSelectableStatuses(currentStatus: CaseStatus): CaseStatus[] {
  return [currentStatus, ...CASE_STATUS_TRANSITIONS[currentStatus]];
}

export const CASE_STATUS_OPTIONS: SelectOption<CaseStatus>[] = CASE_STATUSES.map((status) => ({
  value: status,
  label: CASE_STATUS_LABELS_AR[status],
}));

function toOptions(statuses: CaseStatus[]): SelectOption<CaseStatus>[] {
  return statuses.map((status) => ({ value: status, label: CASE_STATUS_LABELS_AR[status] }));
}

/**
 * The status choices to offer on the Edit form for a given role/current-status combination,
 * mirroring firestore.rules' `cases` update rule exactly (docs/ARCHITECTURE.md §3/§5):
 *  - super_admin/admin: unrestricted — every status is a valid target.
 *  - social_researcher/case_reviewer: only the documented forward transitions from the current
 *    status (the rule allows no others).
 *  - data_entry: status can never change server-side, so the only "choice" is the current one.
 */
export function getEditableStatusOptions(
  role: Role,
  currentStatus: CaseStatus,
): SelectOption<CaseStatus>[] {
  if (role === 'super_admin' || role === 'admin') return CASE_STATUS_OPTIONS;
  if (role === 'data_entry') return toOptions([currentStatus]);
  return toOptions(getSelectableStatuses(currentStatus));
}

export const CASE_PRIORITY_LABELS_AR: Record<CasePriority, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
  critical: 'حرجة',
};
