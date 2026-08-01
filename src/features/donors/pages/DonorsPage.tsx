import { useTranslation } from 'react-i18next';
import { ComingSoon } from '@components/common';

export function DonorsPage() {
  const { t } = useTranslation();
  return <ComingSoon title={t('nav.donors')} />;
}
