import { useTranslation } from 'react-i18next';
import { ComingSoon } from '@components/common';

export function NotificationsPage() {
  const { t } = useTranslation();
  return <ComingSoon title={t('common.notifications')} />;
}
