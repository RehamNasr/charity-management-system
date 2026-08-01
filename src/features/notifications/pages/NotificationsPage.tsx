import { useTranslation } from 'react-i18next';
import { ComingSoon } from '@components/common';

/** TODO (future implementation): full notifications inbox. `useNotificationsUiStore` (unread
 * badge in `Topbar`) already exists for the UI shell; this page needs the actual
 * `notifications/{id}` Firestore collection and list view behind it. */
export function NotificationsPage() {
  const { t } = useTranslation();
  return <ComingSoon title={t('common.notifications')} />;
}
