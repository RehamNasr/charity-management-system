import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, LoadingSpinner } from '@components/common';
import { CaseForm } from '../components/CaseForm';
import { CaseAttachmentsSection } from '../components/CaseAttachmentsSection';
import { useCase } from '../hooks/useCase';
import { updateCase, findCaseByNationalId } from '../api/caseService';
import { useAuth } from '@features/auth/hooks/useAuth';
import { showSnackbar } from '@store/snackbarStore';
import { CASE_STATUS_OPTIONS } from '@constants/caseStatus';
import { getCaseDetailsPath, ROUTES } from '@constants/routes';
import type { CaseFormInput, CaseFormValues } from '../schemas/caseSchema';

export function CaseEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  const { user } = useAuth();
  const { data: caseData, loading, error } = useCase(caseId);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <LoadingSpinner fullHeight />;

  if (error || !caseData) {
    return <Alert severity="error">{t('cases.messages.notFound')}</Alert>;
  }

  if (!user) return <LoadingSpinner fullHeight />;

  const defaultValues: CaseFormInput = {
    fullName: caseData.fullName,
    nationalId: caseData.nationalId,
    phone: caseData.phoneNumbers[0] ?? '',
    governorateId: caseData.address.governorateId,
    cityId: caseData.address.cityId,
    villageId: caseData.address.villageId,
    addressDetails: caseData.address.details,
    caseTypeIds: caseData.caseTypeIds,
    familyMembersCount: caseData.familyMembersCount,
    monthlyIncome: caseData.monthlyIncome,
    monthlyExpenses: caseData.monthlyExpenses,
    priorityLevel: caseData.priorityLevel,
    status: caseData.status,
    socialResearchStatus: caseData.socialResearchStatus,
    notes: caseData.needReason,
  };
  const originalNationalId = caseData.nationalId;

  async function handleSubmit(
    values: CaseFormValues,
    governorateName: string,
    cityName: string,
    villageName: string,
  ): Promise<void> {
    if (!user || !caseId) return;
    setSubmitting(true);
    try {
      if (values.nationalId !== originalNationalId) {
        const duplicate = await findCaseByNationalId(values.nationalId, caseId);
        if (duplicate) {
          showSnackbar.error(t('cases.messages.duplicateNationalId'));
          setSubmitting(false);
          return;
        }
      }

      await updateCase(caseId, values, governorateName, cityName, villageName, user.uid);
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
            statusOptions={CASE_STATUS_OPTIONS}
            onSubmit={handleSubmit}
            submitLabel={t('cases.actions.save')}
            submitting={submitting}
            onCancel={() => void navigate(caseId ? getCaseDetailsPath(caseId) : ROUTES.cases)}
          />
        </CardContent>
      </Card>

      <CaseAttachmentsSection
        caseId={caseData.id}
        category="id_card"
        title={t('cases.attachments.idCardTitle')}
      />
      <CaseAttachmentsSection
        caseId={caseData.id}
        category="supporting_document"
        title={t('cases.attachments.supportingDocumentsTitle')}
      />
    </Stack>
  );
}
