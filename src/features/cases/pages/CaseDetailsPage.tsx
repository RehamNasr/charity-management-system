import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, LoadingSpinner } from '@components/common';
import { CaseStatusChip } from '../components/CaseStatusChip';
import { useCase } from '../hooks/useCase';
import { useLookupCollection } from '@hooks/useLookupCollection';
import { softDeleteCase, canEditCaseFields, canReviewCase } from '../api/caseService';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useConfirm } from '@hooks/useConfirm';
import { showSnackbar } from '@store/snackbarStore';
import { hasAnyRole } from '@utils/permissions';
import { formatCurrency, formatDateTime } from '@utils/formatters';
import { getCaseEditPath, ROUTES } from '@constants/routes';

const DELETE_ROLES = ['super_admin', 'admin'] as const;

interface DetailFieldProps {
  label: string;
  value: string;
}

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value || '—'}</Typography>
    </Stack>
  );
}

export function CaseDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  const { user, role } = useAuth();
  const confirm = useConfirm();
  const [deleting, setDeleting] = useState(false);

  const { data: caseData, loading, error } = useCase(caseId);
  const caseTypes = useLookupCollection('caseTypes');

  if (loading) return <LoadingSpinner fullHeight />;

  if (error || !caseData) {
    return (
      <Stack spacing={2} alignItems="flex-start">
        <Alert severity="error">{t('cases.messages.notFound')}</Alert>
        <Button startIcon={<ArrowForwardRoundedIcon />} onClick={() => void navigate(ROUTES.cases)}>
          {t('cases.actions.backToList')}
        </Button>
      </Stack>
    );
  }

  const canEdit =
    !!user &&
    !!role &&
    (canEditCaseFields(role, caseData, user.uid) || canReviewCase(role, caseData));
  const canDelete = hasAnyRole(role, [...DELETE_ROLES]);

  const caseTypeNames = caseData.caseTypeIds
    .map((id) => caseTypes.data?.find((c) => c.id === id)?.name)
    .filter(Boolean)
    .join('، ');

  async function handleDelete(): Promise<void> {
    if (!caseData || !user) return;
    const confirmed = await confirm({
      title: t('cases.messages.deleteConfirmTitle'),
      message: t('cases.messages.deleteConfirmMessage'),
      confirmLabel: t('cases.actions.delete'),
      destructive: true,
    });
    if (!confirmed) return;

    setDeleting(true);
    try {
      await softDeleteCase(caseData.id, user.uid);
      showSnackbar.success(t('cases.messages.deleteSuccess'));
      void navigate(ROUTES.cases, { replace: true });
    } catch {
      showSnackbar.error(t('cases.messages.deleteError'));
      setDeleting(false);
    }
  }

  return (
    <Stack spacing={2}>
      <PageHeader
        title={caseData.fullName}
        description={caseData.caseNumber}
        actions={
          <Stack direction="row" spacing={1}>
            {canEdit ? (
              <Button
                variant="outlined"
                startIcon={<EditRoundedIcon />}
                onClick={() => void navigate(getCaseEditPath(caseData.id))}
              >
                {t('cases.actions.edit')}
              </Button>
            ) : null}
            {canDelete ? (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineRoundedIcon />}
                disabled={deleting}
                onClick={() => void handleDelete()}
              >
                {t('cases.actions.delete')}
              </Button>
            ) : null}
          </Stack>
        }
      />

      <Card variant="outlined">
        <CardHeader
          title={t('cases.caseDetails')}
          action={<CaseStatusChip status={caseData.status} />}
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField label={t('cases.fields.nationalId')} value={caseData.nationalId} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField
                label={t('cases.fields.phone')}
                value={caseData.phoneNumbers.join('، ')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField label={t('cases.fields.caseType')} value={caseTypeNames} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField
                label={t('cases.fields.governorate')}
                value={caseData.address.governorateName}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField label={t('cases.fields.city')} value={caseData.address.cityName} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField
                label={t('cases.fields.addressDetails')}
                value={caseData.address.details}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField
                label={t('cases.fields.familyMembersCount')}
                value={String(caseData.familyMembersCount)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField
                label={t('cases.fields.monthlyIncome')}
                value={formatCurrency(caseData.monthlyIncome)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField
                label={t('cases.fields.monthlyExpenses')}
                value={formatCurrency(caseData.monthlyExpenses)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField
                label={t('cases.fields.assignedResearcher')}
                value={caseData.assignedResearcherName ?? '—'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField
                label={t('cases.fields.createdAt')}
                value={caseData.createdAt ? formatDateTime(caseData.createdAt.toDate()) : '—'}
              />
            </Grid>

            <Grid size={12}>
              <DetailField label={t('cases.fields.notes')} value={caseData.needReason} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
}
