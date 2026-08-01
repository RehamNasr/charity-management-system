import { orderBy, limit as fsLimit, query, type Query } from 'firebase/firestore';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { collectionRef, withSoftDeleteFilter } from '@firebase-app/firestore';
import { formatCurrency } from '@utils/formatters';
import { CASE_STATUSES } from '@types-app/case';
import { CASE_STATUS_LABELS_AR } from '@constants/caseStatus';
import type { Case } from '@types-app/case';
import type { Donation } from '@types-app/donation';
import type { Expense } from '@types-app/expense';
import type { Visit } from '@types-app/visit';
import type { LookupItem } from '@types-app/lookup';
import type {
  ActivityItem,
  CasesByStatusPoint,
  CasesByTypePoint,
  DashboardStats,
  MonthlyPoint,
} from '@types-app/dashboard';

const CASES_COLLECTION = 'cases';
const DONATIONS_COLLECTION = 'donations';
const EXPENSES_COLLECTION = 'expenses';
const VISITS_COLLECTION = 'caseVisits';

// ---------------------------------------------------------------------------
// Realtime query builders
// ---------------------------------------------------------------------------

/**
 * Every active (non-deleted) case/donation/expense, listened to live. This app has no Cloud
 * Functions to maintain a running-totals document (docs/ARCHITECTURE.md §6 design principle #4
 * describes that as the ideal at scale), and Firestore's aggregate count/sum queries
 * (`getCountFromServer`/`getAggregateFromServer`) cannot be listened to in realtime — only plain
 * document queries support `onSnapshot`. So a live, instantly-updating dashboard with correct
 * *total* figures (not just "this page") necessarily means listening to the full collections and
 * deriving every KPI/chart from them client-side (see `computeDashboardStats` etc. below). Each
 * query is a single equality filter only (`isDeleted == false`), so it needs no composite index
 * and stays cheap to keep alive; if this charity's history grows into the tens of thousands of
 * records, the standard next step is a Cloud Function-maintained aggregate doc, same as the
 * architecture doc already anticipates.
 */
export function activeCasesQuery(): Query<Case> {
  return withSoftDeleteFilter(collectionRef<Case>(CASES_COLLECTION));
}

export function activeDonationsQuery(): Query<Donation> {
  return withSoftDeleteFilter(collectionRef<Donation>(DONATIONS_COLLECTION));
}

export function activeExpensesQuery(): Query<Expense> {
  return withSoftDeleteFilter(collectionRef<Expense>(EXPENSES_COLLECTION));
}

/** Bounded on purpose — recent activity only ever needs the last few items, so unlike the
 * collections above this is a real `limit()`ed query rather than a full-collection listener. */
export function recentVisitsQuery(count = 10): Query<Visit> {
  return query(
    withSoftDeleteFilter(collectionRef<Visit>(VISITS_COLLECTION)),
    orderBy('createdAt', 'desc'),
    fsLimit(count),
  );
}

// ---------------------------------------------------------------------------
// Pure derivations — every function below is a plain, memoizable computation over already-synced
// arrays (see `useDashboardCollections`); nothing here performs a Firestore read itself.
// ---------------------------------------------------------------------------

function startOfMonth(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function computeDashboardStats(
  cases: Case[],
  donations: Donation[],
  expenses: Expense[],
): DashboardStats {
  const monthStart = startOfMonth();

  const newCasesThisMonth = cases.filter(
    (c) => c.createdAt?.toDate && c.createdAt.toDate() >= monthStart,
  ).length;

  // Relies on `Case.lastAssistanceDate`, which is only ever set once an Assistance record is
  // recorded against a case — that module doesn't exist yet (still a placeholder page), so this
  // will genuinely read 0 until it ships. That's a real, honestly-computed count, not a fake one.
  const beneficiariesAssistedThisMonth = cases.filter(
    (c) => c.lastAssistanceDate?.toDate && c.lastAssistanceDate.toDate() >= monthStart,
  ).length;

  const totalDonations = donations.reduce((total, d) => total + d.amount, 0);
  const totalExpenses = expenses.reduce((total, e) => total + e.amount, 0);

  return {
    totalCases: cases.length,
    newCasesThisMonth,
    totalDonations,
    totalExpenses,
    currentBalance: totalDonations - totalExpenses,
    beneficiariesAssistedThisMonth,
  };
}

const MONTHS_BACK_DEFAULT = 12;

/** The last `monthsBack` calendar months (oldest first, current month last), as a stable
 * `YYYY-MM` key plus an Arabic display label — shared scaffold for every "last 12 months" chart. */
function buildMonthBuckets(monthsBack: number): { monthKey: string; label: string; start: Date; end: Date }[] {
  const now = new Date();
  const buckets = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    buckets.push({
      monthKey: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
      label: format(start, 'MMM yyyy', { locale: ar }),
      start,
      end,
    });
  }
  return buckets;
}

/** Monthly donations-vs-expenses (and new-case counts, so `MonthlyNewCasesChart` reuses the same
 * bucket pass) for the last `monthsBack` months — all three charts computed from data already in
 * memory, no extra Firestore reads. */
export function computeMonthlyTrend(
  cases: Case[],
  donations: Donation[],
  expenses: Expense[],
  monthsBack: number = MONTHS_BACK_DEFAULT,
): MonthlyPoint[] {
  const buckets = buildMonthBuckets(monthsBack);

  return buckets.map(({ monthKey, label, start, end }) => {
    const income = donations
      .filter((d) => d.date?.toDate && d.date.toDate() >= start && d.date.toDate() <= end)
      .reduce((total, d) => total + d.amount, 0);
    const expenseTotal = expenses
      .filter((e) => e.date?.toDate && e.date.toDate() >= start && e.date.toDate() <= end)
      .reduce((total, e) => total + e.amount, 0);
    const newCases = cases.filter(
      (c) => c.createdAt?.toDate && c.createdAt.toDate() >= start && c.createdAt.toDate() <= end,
    ).length;

    return { monthKey, label, income, expenses: expenseTotal, newCases };
  });
}

/** Every status is always represented (even at 0) so the chart's category axis doesn't jump
 * around as data changes. */
export function computeCasesByStatus(cases: Case[]): CasesByStatusPoint[] {
  const counts = new Map<string, number>();
  for (const c of cases) {
    counts.set(c.status, (counts.get(c.status) ?? 0) + 1);
  }
  return CASE_STATUSES.map((status) => ({
    status,
    label: CASE_STATUS_LABELS_AR[status],
    count: counts.get(status) ?? 0,
  }));
}

/** A case can carry more than one case type, so this tallies each type independently rather than
 * treating `caseTypeIds` as a single category — matches how the field is actually modeled. */
export function computeCasesByType(
  cases: Case[],
  caseTypes: (LookupItem & { id: string })[],
): CasesByTypePoint[] {
  const counts = new Map<string, number>();
  for (const c of cases) {
    for (const typeId of c.caseTypeIds) {
      counts.set(typeId, (counts.get(typeId) ?? 0) + 1);
    }
  }

  return caseTypes
    .map((type) => ({ caseTypeId: type.id, label: type.name, count: counts.get(type.id) ?? 0 }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Merges the four real activity sources this app currently has into one feed sorted by recency.
 * "Assistance Distributed" isn't included — there's no Assistance records module yet (still a
 * placeholder page, see `AssistancePage`); once it exists, add an `assistance_distributed` source
 * here the same way the other four are wired.
 */
export function computeRecentActivity(
  cases: Case[],
  visits: Visit[],
  donations: Donation[],
  expenses: Expense[],
  count = 15,
): ActivityItem[] {
  const caseItems: ActivityItem[] = cases.map((c) => ({
    id: `case-${c.id}`,
    kind: 'case_added',
    description: `تمت إضافة حالة مستفيد جديدة: ${c.fullName}`,
    performedByUid: c.createdBy,
    timestampMs: c.createdAt?.toMillis ? c.createdAt.toMillis() : 0,
  }));

  const visitItems: ActivityItem[] = visits.map((v) => ({
    id: `visit-${v.id}`,
    kind: 'visit_added',
    description: `تمت إضافة زيارة بحث اجتماعي للحالة: ${v.beneficiaryName}`,
    performedByUid: v.createdBy,
    timestampMs: v.createdAt?.toMillis ? v.createdAt.toMillis() : 0,
  }));

  const donationItems: ActivityItem[] = donations.map((d) => ({
    id: `donation-${d.id}`,
    kind: 'donation_received',
    description: `تم استلام تبرع من ${d.donorName} بقيمة ${formatCurrency(d.amount)}`,
    performedByUid: d.createdBy,
    timestampMs: d.createdAt?.toMillis ? d.createdAt.toMillis() : 0,
  }));

  const expenseItems: ActivityItem[] = expenses.map((e) => ({
    id: `expense-${e.id}`,
    kind: 'expense_recorded',
    description: `تم تسجيل مصروف بقيمة ${formatCurrency(e.amount)}: ${e.description}`,
    performedByUid: e.createdBy,
    timestampMs: e.createdAt?.toMillis ? e.createdAt.toMillis() : 0,
  }));

  return [...caseItems, ...visitItems, ...donationItems, ...expenseItems]
    .sort((a, b) => b.timestampMs - a.timestampMs)
    .slice(0, count);
}
