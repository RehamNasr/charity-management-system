import type { CaseStatus } from './case';

export interface DashboardStats {
  totalCases: number;
  newCasesThisMonth: number;
  totalDonations: number;
  totalExpenses: number;
  currentBalance: number;
  beneficiariesAssistedThisMonth: number;
}

/** One point in the "last 12 months" trend charts — `monthKey` is `YYYY-MM` (stable sort key),
 * `label` is the Arabic month name shown on the chart axis. */
export interface MonthlyPoint {
  monthKey: string;
  label: string;
  income: number;
  expenses: number;
  newCases: number;
}

export interface CasesByStatusPoint {
  status: CaseStatus;
  label: string;
  count: number;
}

export interface CasesByTypePoint {
  caseTypeId: string;
  label: string;
  count: number;
}

export const ACTIVITY_KINDS = [
  'case_added',
  'visit_added',
  'donation_received',
  'expense_recorded',
] as const;
export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  description: string;
  performedByUid: string;
  timestampMs: number;
}
