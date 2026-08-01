import { useTranslation } from 'react-i18next';
import { ComingSoon } from '@components/common';

export function AuditLogPage() {
  const { t } = useTranslation();
  return <ComingSoon title={t('nav.auditLog')} />;
}
