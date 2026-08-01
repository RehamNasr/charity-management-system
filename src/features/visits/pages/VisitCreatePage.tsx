import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@components/common';
import { VisitForm } from '../components/VisitForm';
import { useCase } from '@features/cases/hooks/useCase';
import { createVisit, uploadVisitAttachment } from '../api/visitService';
import { useAuth } from '@features/auth/hooks/useAuth';
import { showSnackbar } from '@store/snackbarStore';
import { getVisitDetailsPath } from '@constants/routes';
import type { Case } from '@types-app/case';
import type { VisitFormValues } from '../schemas/visitSchema';

export function VisitCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialCaseId = searchParams.get('caseId') ?? undefined;
  const { data: initialCase } = useCase(initialCaseId);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(
    values: VisitFormValues,
    selectedCase: Case,
    filesToUpload: File[],
  ): Promise<void> {
    if (!user) return;
    setSubmitting(true);
    try {
      const currentUser = {
        uid: user.uid,
        displayName: user.profile?.displayName ?? user.email ?? 'مستخدم',
      };
      const visitId = await createVisit(values, selectedCase, currentUser);
      for (const file of filesToUpload) {
        await uploadVisitAttachment(visitId, file, currentUser);
      }
      showSnackbar.success(t('visits.messages.createSuccess'));
      void navigate(getVisitDetailsPath(visitId), { replace: true });
    } catch (err) {
      console.error('Failed to create visit:', err);
      showSnackbar.error(t('visits.messages.saveError'));
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={2}>
      <PageHeader title={t('visits.newVisit')} />
      <Card variant="outlined">
        <CardContent>
          <VisitForm
            initialValues={initialCaseId ? { caseId: initialCaseId } : undefined}
            initialCase={initialCase}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
            isEditMode={false}
          />
        </CardContent>
      </Card>
    </Stack>
  );
}
