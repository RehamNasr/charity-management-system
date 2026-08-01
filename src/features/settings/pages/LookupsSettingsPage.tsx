import { useTranslation } from 'react-i18next';
import { ComingSoon } from '@components/common';

export function LookupsSettingsPage() {
  const { t } = useTranslation();
  return <ComingSoon title={t('settings.lookupsTitle')} />;
}
