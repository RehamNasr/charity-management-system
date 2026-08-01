import { useTranslation } from 'react-i18next';
import { ComingSoon } from '@components/common';

/**
 * TODO (future implementation): a full, filterable audit trail across every collection
 * (create/update/soft-delete, actor, timestamp). The Dashboard's "Recent Activity" feed
 * (`RecentActivityFeed`, `computeRecentActivity` in `dashboardService.ts`) already covers a
 * lightweight last-15-items version of this for cases/visits/donations/expenses; this page is
 * the place for the complete, paginated, filterable history once it's built.
 */
export function AuditLogPage() {
  const { t } = useTranslation();
  return <ComingSoon title={t('nav.auditLog')} />;
}
