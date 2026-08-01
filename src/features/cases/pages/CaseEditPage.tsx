import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, LoadingSpinner } from '@components/common';
import { CaseForm } from '../components/CaseForm';
import { useCase } from '../hooks/useCase';
import { updateCase, reviewCase, canEditCaseFields, canReviewCase } from '../api/caseService';
import { useAuth } from '@features/auth/hooks/useAuth';
import { showSnackbar } from '@store/snackbarStore';
import { getEditableStatusOptions } from '@constants/caseStatus';
import { getCaseDetailsPath, ROUTES } from '@constants/routes';
import type { CaseFormInput, CaseFormValues } from '../schemas/caseSchema';
import type { CaseStatus } from '@types-app/case';

export function CaseEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  const { user, role } = useAuth();
  const { data: caseData, loading, error } = useCase(caseId);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <LoadingSpinner fullHeight />;

  if (error || !caseData) {
    return <Alert severity="error">{t('cases.messages.notFound')}</Alert>;
  }

  if (!user || !role) return <LoadingSpinner fullHeight />;

  const isReviewOnly = canReviewCase(role, caseData);
  const canEdit = canEditCaseFields(role, caseData, user.uid) || isReviewOnly;

  if (!canEdit) {
    return (
      <Stack spacing={2} alignItems="flex-start">
        <Alert severity="warning">{t('errors.unauthorizedDescription')}</Alert>
        <Button onClick={() => void navigate(getCaseDetailsPath(caseData.id))}>
          {t('cases.actions.backToList')}
        </Button>
      </Stack>
    );
  }

  const defaultValues: CaseFormInput = {
    fullName: caseData.fullName,
    nationalId: caseData.nationalId,
    phone: caseData.phoneNumbers[0] ?? '',
    governorateId: caseData.address.governorateId,
    cityId: caseData.address.cityId,
    addressDetails: caseData.address.details,
    caseTypeIds: caseData.caseTypeIds,
    familyMembersCount: caseData.familyMembersCount,
    monthlyIncome: caseData.monthlyIncome,
    monthlyExpenses: caseData.monthlyExpenses,
    status: caseData.status,
    notes: caseData.needReason,
  };

  const statusOptions = getEditableStatusOptions(role, caseData.status);

  async function handleSubmit(
    values: CaseFormValues,
    governorateName: string,
    cityName: string,
  ): Promise<void> {
    if (!user || !caseId) return;
    setSubmitting(true);
    try {
      if (isReviewOnly) {
        await reviewCase(
          caseId,
          values.status as Extract<CaseStatus, 'approved' | 'rejected'>,
          user.uid,
        );
      } else {
        await updateCase(caseId, values, governorateName, cityName, user.uid);
      }
      showSnackbar.success(t('cases.messages.updateSuccess'));
      void navigate(getCaseDetailsPath(caseId), { replace: true });
    } catch {
      showSnackbar.error(t('cases.messages.saveError'));
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={2}>
      <PageHeader title={t('cases.editCase')} description={caseData.caseNumber} />
      <Card variant="outlined">
        <CardContent>
          <CaseForm
            defaultValues={defaultValues}
            statusOptions={statusOptions}
            onSubmit={handleSubmit}
            submitLabel={t('cases.actions.save')}
            submitting={submitting}
            readOnlyExceptStatus={isReviewOnly}
            onCancel={() => void navigate(caseId ? getCaseDetailsPath(caseId) : ROUTES.cases)}
          />
        </CardContent>
      </Card>
    </Stack>
  );
}
