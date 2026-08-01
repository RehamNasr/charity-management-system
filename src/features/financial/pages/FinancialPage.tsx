import { useTranslation } from 'react-i18next';
import { ComingSoon } from '@components/common';

export function FinancialPage() {
  const { t } = useTranslation();
  return <ComingSoon title={t('nav.financial')} />;
}
