import { useTranslation } from 'react-i18next';
import { ComingSoon } from '@components/common';

/**
 * TODO (future implementation): user management (list/invite/deactivate) over the existing
 * `users/{uid}` profile documents (`src/services/user.service.ts` already reads a single
 * profile; this page needs a list view over the collection).
 */
export function UsersPage() {
  const { t } = useTranslation();
  return <ComingSoon title={t('nav.users')} />;
}
