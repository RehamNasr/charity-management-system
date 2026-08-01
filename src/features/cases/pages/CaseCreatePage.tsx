import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@components/common';
import { CaseForm } from '../components/CaseForm';
import { createCase, findCaseByNationalId } from '../api/caseService';
import { useAuth } from '@features/auth/hooks/useAuth';
import { showSnackbar } from '@store/snackbarStore';
import { CREATABLE_CASE_STATUSES, CASE_STATUS_LABELS_AR } from '@constants/caseStatus';
import { getCaseDetailsPath, ROUTES } from '@constants/routes';
import type { CaseFormInput, CaseFormValues } from '../schemas/caseSchema';
import type { CaseStatus } from '@types-app/case';
import type { SelectOption } from '@types-app/common';

const DEFAULT_VALUES: CaseFormInput = {
  fullName: '',
  nationalId: '',
  phone: '',
  governorateId: '',
  cityId: '',
  villageId: '',
  addressDetails: '',
  caseTypeIds: [],
  familyMembersCount: 1,
  monthlyIncome: 0,
  monthlyExpenses: 0,
  priorityLevel: 'medium',
  status: 'draft',
  socialResearchStatus: 'not_started',
  notes: '',
};

const STATUS_OPTIONS: SelectOption<CaseStatus>[] = CREATABLE_CASE_STATUSES.map((status) => ({
  value: status,
  label: CASE_STATUS_LABELS_AR[status],
}));

export function CaseCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(
    values: CaseFormValues,
    governorateName: string,
    cityName: string,
    villageName: string,
  ): Promise<void> {
    if (!user) return;
    setSubmitting(true);
    try {
      const duplicate = await findCaseByNationalId(values.nationalId);
      if (duplicate) {
        showSnackbar.error(t('cases.messages.duplicateNationalId'));
        setSubmitting(false);
        return;
      }

      const caseId = await createCase(values, governorateName, cityName, villageName, {
        uid: user.uid,
        displayName: user?.profile?.displayName ?? user.email ?? 'مستخدم',
      });
      showSnackbar.success(t('cases.messages.createSuccess'));
      void navigate(getCaseDetailsPath(caseId), { replace: true });
    } catch (err) {
      console.error('Failed to create case:', err);
      showSnackbar.error(t('cases.messages.saveError'));
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={2}>
      <PageHeader title={t('cases.newCase')} />
      <Card variant="outlined">
        <CardContent>
          <CaseForm
            defaultValues={DEFAULT_VALUES}
            statusOptions={STATUS_OPTIONS}
            onSubmit={handleSubmit}
            submitLabel={t('cases.actions.create')}
            submitting={submitting}
            onCancel={() => void navigate(ROUTES.cases)}
          />
        </CardContent>
      </Card>
    </Stack>
  );
}
