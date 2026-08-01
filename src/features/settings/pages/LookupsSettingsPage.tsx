import { useTranslation } from 'react-i18next';
import { ComingSoon } from '@components/common';

/** TODO (future implementation): admin CRUD screen over the lookup collections
 * (`governorates`, `cities`, `villages`, `caseTypes` — see `src/services/lookup.service.ts` and
 * `src/constants/defaultLookups.ts`). Those collections are already live and read by every
 * dependent dropdown; this page is only missing the admin-facing editor for them. */
export function LookupsSettingsPage() {
  const { t } = useTranslation();
  return <ComingSoon title={t('settings.lookupsTitle')} />;
}
