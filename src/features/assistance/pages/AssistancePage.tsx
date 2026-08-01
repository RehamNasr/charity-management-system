import { useTranslation } from 'react-i18next';
import { ComingSoon } from '@components/common';

/**
 * TODO (future implementation): Assistance disbursement records — a Firestore-backed
 * `assistance` collection (amount, type, date, caseId, createdBy) mirroring the
 * Donor/Donation/Expense pattern (see `src/features/donations`). Once built:
 *  - Every disbursement should update the owning case's `Case.lastAssistanceDate`, which the
 *    Dashboard's "Beneficiaries Assisted This Month" KPI already reads from (currently 0 for
 *    every charity until this module writes to it — see `dashboardService.computeDashboardStats`).
 *  - Add an `assistance_distributed` entry to `ACTIVITY_KINDS` (src/types/dashboard.ts) and wire
 *    it into `computeRecentActivity` the same way cases/visits/donations/expenses are today.
 */
export function AssistancePage() {
  const { t } = useTranslation();
  return <ComingSoon title={t('nav.assistance')} />;
}
