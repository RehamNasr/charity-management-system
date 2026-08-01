import { useTranslation } from 'react-i18next';
import { ComingSoon } from '@components/common';

/** TODO (future implementation): reminders list. `Visit.nextVisitDate` (see
 * `src/types/visit.ts`) already records a researcher's requested follow-up date per visit and is
 * the natural first data source — a query on `caseVisits` where `nextVisitDate` falls in an
 * upcoming window would drive this page. */
export function RemindersPage() {
  const { t } = useTranslation();
  return <ComingSoon title={t('nav.reminders')} />;
}
