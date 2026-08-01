import { useTranslation } from 'react-i18next';
import { ComingSoon } from '@components/common';

/**
 * TODO (future implementation): full financial statements/ledger view. `donations` and
 * `expenses` already exist as real Firestore collections (`src/features/donations`,
 * `src/features/expenses`) and already power the Dashboard's Total Donations/Total
 * Expenses/Current Balance KPIs and the Monthly Trend chart — this page is for a more detailed
 * financial breakdown (per-donor/per-category ledgers, running balance over time, etc.) on top
 * of that same data.
 */
export function FinancialPage() {
  const { t } = useTranslation();
  return <ComingSoon title={t('nav.financial')} />;
}
