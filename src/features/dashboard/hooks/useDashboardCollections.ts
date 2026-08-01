import { useCollection } from '@hooks/useCollection';
import {
  activeCasesQuery,
  activeDonationsQuery,
  activeExpensesQuery,
  recentVisitsQuery,
} from '../api/dashboardService';
import type { Case } from '@types-app/case';
import type { Donation } from '@types-app/donation';
import type { Expense } from '@types-app/expense';
import type { Visit } from '@types-app/visit';

export interface DashboardCollections {
  cases: Case[];
  donations: Donation[];
  expenses: Expense[];
  recentVisits: Visit[];
  loading: boolean;
  error: string | null;
}

/**
 * The single set of realtime listeners the whole dashboard is built from — every KPI card, chart,
 * and (non-visit) activity feed entry is a pure derivation over these four synced arrays (see
 * `dashboardService.ts`), so no card/chart triggers its own Firestore reads.
 */
export function useDashboardCollections(): DashboardCollections {
  const cases = useCollection<Case>(activeCasesQuery(), 'dashboard-cases');
  const donations = useCollection<Donation>(activeDonationsQuery(), 'dashboard-donations');
  const expenses = useCollection<Expense>(activeExpensesQuery(), 'dashboard-expenses');
  const recentVisits = useCollection<Visit>(recentVisitsQuery(10), 'dashboard-recent-visits');

  return {
    cases: cases.data ?? [],
    donations: donations.data ?? [],
    expenses: expenses.data ?? [],
    recentVisits: recentVisits.data ?? [],
    loading: cases.loading || donations.loading || expenses.loading || recentVisits.loading,
    error: cases.error ?? donations.error ?? expenses.error ?? recentVisits.error,
  };
}
