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
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, LoadingSpinner, DataTable, type DataTableColumn } from '@components/common';
import { CaseStatusChip } from '../components/CaseStatusChip';
import { CasePriorityChip } from '../components/CasePriorityChip';
import { SocialResearchStatusChip } from '../components/SocialResearchStatusChip';
import { CaseAttachmentsSection } from '../components/CaseAttachmentsSection';
import { useCase } from '../hooks/useCase';
import { useLookupCollection } from '@hooks/useLookupCollection';
import { softDeleteCase } from '../api/caseService';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useConfirm } from '@hooks/useConfirm';
import { showSnackbar } from '@store/snackbarStore';
import { formatCurrency, formatDateTime } from '@utils/formatters';
import { getCaseEditPath, getVisitDetailsPath, getVisitNewPath, ROUTES } from '@constants/routes';
import { useVisitsList } from '@features/visits/hooks/useVisitsList';
import { VisitStatusBadge, RecommendationBadge } from '@features/visits/components/VisitBadges';
import type { Visit } from '@types-app/visit';

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
  const { user } = useAuth();
  const confirm = useConfirm();
  const [deleting, setDeleting] = useState(false);

  const { data: caseData, loading, error } = useCase(caseId);
  const caseTypes = useLookupCollection('caseTypes');
  const { rows: visitRows, loading: visitsLoading } = useVisitsList(caseId);

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

  const visitColumns: DataTableColumn<Visit>[] = [
    { field: 'visitNumber', headerName: t('visits.fields.visitNumber') },
    {
      field: 'visitDate',
      headerName: t('visits.fields.visitDate'),
      valueGetter: (row) => (row.visitDate?.toDate ? row.visitDate.toDate().toLocaleDateString('ar-EG') : '-'),
    },
    {
      field: 'status',
      headerName: t('visits.fields.status'),
      renderCell: (row) => <VisitStatusBadge status={row.status} />,
    },
    {
      field: 'recommendation',
      headerName: t('visits.fields.recommendation'),
      renderCell: (row) => <RecommendationBadge recommendation={row.recommendation} />,
    },
  ];

  return (
    <Stack spacing={2}>
      <PageHeader
        title={caseData.fullName}
        description={caseData.caseNumber}
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<EditRoundedIcon />}
              onClick={() => void navigate(getCaseEditPath(caseData.id))}
            >
              {t('cases.actions.edit')}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineRoundedIcon />}
              disabled={deleting}
              onClick={() => void handleDelete()}
            >
              {t('cases.actions.delete')}
            </Button>
          </Stack>
        }
      />

      <Card variant="outlined">
        <CardHeader
          title={t('cases.caseDetails')}
          action={
            <Stack direction="row" spacing={1}>
              <CaseStatusChip status={caseData.status} />
              <CasePriorityChip priority={caseData.priorityLevel} />
              <SocialResearchStatusChip status={caseData.socialResearchStatus} />
            </Stack>
          }
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

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DetailField
                label={t('cases.fields.governorate')}
                value={caseData.address.governorateName}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DetailField label={t('cases.fields.city')} value={caseData.address.cityName} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DetailField label={t('cases.fields.village')} value={caseData.address.villageName} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

      <Card variant="outlined">
        <CardHeader
          title={t('cases.visits.title')}
          action={
            <Button
              size="small"
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => void navigate(getVisitNewPath(caseData.id))}
            >
              {t('visits.newVisit')}
            </Button>
          }
        />
        <Divider />
        <CardContent>
          <DataTable
            columns={visitColumns}
            rows={visitRows}
            getRowId={(row) => row.id}
            loading={visitsLoading}
            onRowClick={(row) => navigate(getVisitDetailsPath(row.id))}
            emptyTitle={t('cases.visits.empty')}
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
