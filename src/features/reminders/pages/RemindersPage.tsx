import { useTranslation } from 'react-i18next';
import { ComingSoon } from '@components/common';

export function RemindersPage() {
  const { t } = useTranslation();
  return <ComingSoon title={t('nav.reminders')} />;
}
