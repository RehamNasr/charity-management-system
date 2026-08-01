import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, LoadingSpinner } from '@components/common';
import { useVisit } from '../hooks/useVisit';
import { VisitOverviewTab } from '../components/VisitOverviewTab';
import { VisitReportTab } from '../components/VisitReportTab';
import { VisitAttachmentsTab } from '../components/VisitAttachmentsTab';
import { VisitHistoryTab } from '../components/VisitHistoryTab';
import { softDeleteVisit } from '../api/visitService';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useConfirm } from '@hooks/useConfirm';
import { showSnackbar } from '@store/snackbarStore';
import { getVisitEditPath, ROUTES } from '@constants/routes';

type TabKey = 'overview' | 'report' | 'attachments' | 'history';

export function VisitDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { visitId } = useParams<{ visitId: string }>();
  const { user } = useAuth();
  const confirm = useConfirm();
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const { data: visit, loading, error } = useVisit(visitId);

  if (loading) return <LoadingSpinner fullHeight />;

  if (error || !visit || !visitId) {
    return (
      <Stack spacing={2} alignItems="flex-start">
        <Alert severity="error">{t('visits.messages.notFound')}</Alert>
        <Button
          startIcon={<ArrowForwardRoundedIcon />}
          onClick={() => void navigate(ROUTES.visits)}
        >
          {t('visits.actions.backToList')}
        </Button>
      </Stack>
    );
  }

  async function handleDelete(): Promise<void> {
    if (!user || !visitId) return;
    const confirmed = await confirm({
      title: t('visits.messages.deleteConfirmTitle'),
      message: t('visits.messages.deleteConfirmMessage'),
      confirmLabel: t('visits.actions.delete'),
      destructive: true,
    });
    if (!confirmed) return;

    setDeleting(true);
    try {
      await softDeleteVisit(visitId, {
        uid: user.uid,
        displayName: user.profile?.displayName ?? user.email ?? 'مستخدم',
      });
      showSnackbar.success(t('visits.messages.deleteSuccess'));
      void navigate(ROUTES.visits, { replace: true });
    } catch {
      showSnackbar.error(t('visits.messages.deleteError'));
      setDeleting(false);
    }
  }

  return (
    <Stack spacing={2}>
      <PageHeader
        title={visit.visitNumber}
        description={visit.beneficiaryName}
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<EditRoundedIcon />}
              onClick={() => void navigate(getVisitEditPath(visit.id))}
            >
              {t('common.edit')}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineRoundedIcon />}
              disabled={deleting}
              onClick={() => void handleDelete()}
            >
              {t('common.delete')}
            </Button>
          </Stack>
        }
      />

      <Box borderBottom={1} borderColor="divider">
        <Tabs value={activeTab} onChange={(_e, value: TabKey) => setActiveTab(value)}>
          <Tab label={t('visits.tabs.overview')} value="overview" />
          <Tab label={t('visits.tabs.report')} value="report" />
          <Tab label={t('visits.tabs.attachments')} value="attachments" />
          <Tab label={t('visits.tabs.history')} value="history" />
        </Tabs>
      </Box>

      {activeTab === 'overview' && <VisitOverviewTab visit={visit} />}
      {activeTab === 'report' && <VisitReportTab visit={visit} />}
      {activeTab === 'attachments' && (
        <VisitAttachmentsTab visitId={visit.id} />
      )}
      {activeTab === 'history' && <VisitHistoryTab visitId={visit.id} />}
    </Stack>
  );
}
