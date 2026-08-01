import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, LoadingSpinner } from '@components/common';
import { VisitForm } from '../components/VisitForm';
import { useVisit } from '../hooks/useVisit';
import { useVisitAttachments } from '../hooks/useVisitAttachments';
import { useCase } from '@features/cases/hooks/useCase';
import { updateVisit, uploadVisitAttachment, deleteVisitAttachment } from '../api/visitService';
import { useAuth } from '@features/auth/hooks/useAuth';
import { showSnackbar } from '@store/snackbarStore';
import { getVisitDetailsPath } from '@constants/routes';
import type { Case } from '@types-app/case';
import type { VisitFormValues } from '../schemas/visitSchema';

export function VisitEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { visitId } = useParams<{ visitId: string }>();
  const { user } = useAuth();
  const { data: visit, loading, error } = useVisit(visitId);
  const { data: caseData } = useCase(visit?.caseId);
  const { attachments } = useVisitAttachments(visitId);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <LoadingSpinner fullHeight />;

  if (error || !visit || !visitId) {
    return <Alert severity="error">{t('visits.messages.notFound')}</Alert>;
  }

  const initialValues: Partial<VisitFormValues> = {
    caseId: visit.caseId,
    visitDate: visit.visitDate?.toDate ? visit.visitDate.toDate().toISOString().split('T')[0] : '',
    visitType: visit.visitType,
    status: visit.status,
    priority: visit.priority,
    researcherId: visit.researcherId,
    researcherName: visit.researcherName,
    latitude: visit.latitude,
    longitude: visit.longitude,
    addressDetails: visit.address?.details ?? '',
    governorateId: visit.address?.governorateId ?? '',
    cityId: visit.address?.cityId ?? '',
    summary: visit.summary,
    livingConditions: visit.fullReport?.livingConditions,
    employmentStatus: visit.fullReport?.employmentStatus,
    incomeVerification: visit.fullReport?.incomeVerification,
    healthStatus: visit.fullReport?.healthStatus,
    childrenStatus: visit.fullReport?.childrenStatus,
    additionalNotes: visit.fullReport?.additionalNotes ?? '',
    recommendation: visit.recommendation,
    recommendationReason: visit.recommendationReason,
    suggestedAssistance: visit.suggestedAssistance ?? '',
    suggestedAmount: visit.suggestedAmount ?? 0,
    nextVisitDate: visit.nextVisitDate?.toDate
      ? visit.nextVisitDate.toDate().toISOString().split('T')[0]
      : '',
  };

  async function handleSubmit(
    values: VisitFormValues,
    _selectedCase: Case,
    filesToUpload: File[],
  ): Promise<void> {
    if (!user || !visitId || !visit) return;
    setSubmitting(true);
    try {
      const currentUser = {
        uid: user.uid,
        displayName: user.profile?.displayName ?? user.email ?? 'مستخدم',
      };
      await updateVisit(visitId, values, visit, currentUser);
      for (const file of filesToUpload) {
        await uploadVisitAttachment(visitId, file, currentUser);
      }
      showSnackbar.success(t('visits.messages.updateSuccess'));
      void navigate(getVisitDetailsPath(visitId), { replace: true });
    } catch (err) {
      console.error('Failed to update visit:', err);
      showSnackbar.error(t('visits.messages.saveError'));
      setSubmitting(false);
    }
  }

  async function handleDeleteAttachment(
    attachmentId: string,
    filePath: string,
    fileName: string,
  ): Promise<void> {
    if (!user || !visitId) return;
    try {
      await deleteVisitAttachment(visitId, attachmentId, filePath, fileName, {
        uid: user.uid,
        displayName: user.profile?.displayName ?? user.email ?? 'مستخدم',
      });
      showSnackbar.success(t('visits.attachments.deleteSuccess'));
    } catch {
      showSnackbar.error(t('visits.messages.saveError'));
    }
  }

  return (
    <Stack spacing={2}>
      <PageHeader title={t('visits.editVisit')} description={visit.visitNumber} />
      <Card variant="outlined">
        <CardContent>
          <VisitForm
            initialValues={initialValues}
            initialCase={caseData}
            existingAttachments={attachments}
            onSubmit={handleSubmit}
            onDeleteAttachment={handleDeleteAttachment}
            isSubmitting={submitting}
            isEditMode
          />
        </CardContent>
      </Card>
    </Stack>
  );
}
