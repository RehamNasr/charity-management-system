import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid2';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, type DataTableColumn } from '@components/common';
import { FormTextField, FormSelect } from '@components/form';
import { useCollection } from '@hooks/useCollection';
import { useConfirm } from '@hooks/useConfirm';
import { useAuth } from '@features/auth/hooks/useAuth';
import { showSnackbar } from '@store/snackbarStore';
import { buildDonorsQuery } from '@features/donors/api/donorService';
import {
  buildDonationsQuery,
  createDonation,
  softDeleteDonation,
} from '../api/donationService';
import {
  donationFormSchema,
  type DonationFormInput,
  type DonationFormValues,
} from '../schemas/donationSchema';
import { DONATION_METHODS, type Donation } from '@types-app/donation';
import type { Donor } from '@types-app/donor';
import { formatCurrency, formatDate } from '@utils/formatters';

const DONATION_METHOD_LABELS_AR: Record<(typeof DONATION_METHODS)[number], string> = {
  cash: 'نقدًا',
  bank_transfer: 'تحويل بنكي',
  other: 'أخرى',
};

const METHOD_OPTIONS = DONATION_METHODS.map((method) => ({
  value: method,
  label: DONATION_METHOD_LABELS_AR[method],
}));

const DEFAULT_VALUES: DonationFormInput = {
  donorId: '',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  method: 'cash',
  notes: '',
};

export function DonationsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const confirm = useConfirm();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, loading } = useCollection<Donation>(buildDonationsQuery(), 'donations');
  const rows = data ?? [];
  const { data: donors } = useCollection<Donor>(buildDonorsQuery(), 'donors');

  const { control, handleSubmit, reset } = useForm<DonationFormInput, unknown, DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  async function onSubmit(values: DonationFormValues): Promise<void> {
    if (!user) return;
    setSubmitting(true);
    try {
      const donorName = donors?.find((d) => d.id === values.donorId)?.name ?? '';
      await createDonation(values, donorName, { uid: user.uid });
      showSnackbar.success(t('donations.messages.createSuccess'));
      reset(DEFAULT_VALUES);
      setDialogOpen(false);
    } catch {
      showSnackbar.error(t('donations.messages.saveError'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(donation: Donation): Promise<void> {
    if (!user) return;
    const confirmed = await confirm({
      title: t('donations.messages.deleteConfirmTitle'),
      message: t('donations.messages.deleteConfirmMessage'),
      confirmLabel: t('common.delete'),
      destructive: true,
    });
    if (!confirmed) return;

    setDeletingId(donation.id);
    try {
      await softDeleteDonation(donation.id, user.uid);
      showSnackbar.success(t('donations.messages.deleteSuccess'));
    } catch {
      showSnackbar.error(t('donations.messages.deleteError'));
    } finally {
      setDeletingId(null);
    }
  }

  const columns: DataTableColumn<Donation>[] = [
    { field: 'donorName', headerName: t('donations.fields.donorName') },
    {
      field: 'amount',
      headerName: t('donations.fields.amount'),
      valueGetter: (row) => formatCurrency(row.amount),
    },
    {
      field: 'date',
      headerName: t('donations.fields.date'),
      valueGetter: (row) => (row.date?.toDate ? formatDate(row.date.toDate()) : '—'),
    },
    {
      field: 'method',
      headerName: t('donations.fields.method'),
      valueGetter: (row) => DONATION_METHOD_LABELS_AR[row.method],
    },
    {
      field: 'actions',
      headerName: '',
      align: 'right',
      renderCell: (row) => (
        <Tooltip title={t('common.delete')}>
          <IconButton
            size="small"
            color="error"
            disabled={deletingId === row.id}
            onClick={() => void handleDelete(row)}
          >
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <PageHeader
        title={t('donations.listTitle')}
        description={t('donations.listDescription')}
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogOpen(true)}>
            {t('donations.newDonation')}
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        loading={loading}
        emptyTitle={t('donations.empty.title')}
        emptyDescription={t('donations.empty.description')}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('donations.newDonation')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2.5} mt={0.5}>
            <Grid size={12}>
              <FormSelect
                name="donorId"
                control={control}
                label={t('donations.fields.donorName')}
                options={(donors ?? []).map((d) => ({ value: d.id, label: d.name }))}
                disabled={submitting}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField
                name="amount"
                control={control}
                label={t('donations.fields.amount')}
                type="number"
                disabled={submitting}
                slotProps={{ htmlInput: { min: 1, step: '0.01' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField
                name="date"
                control={control}
                label={t('donations.fields.date')}
                type="date"
                disabled={submitting}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={12}>
              <FormSelect
                name="method"
                control={control}
                label={t('donations.fields.method')}
                options={METHOD_OPTIONS}
                disabled={submitting}
              />
            </Grid>
            <Grid size={12}>
              <FormTextField
                name="notes"
                control={control}
                label={t('donations.fields.notes')}
                disabled={submitting}
                multiline
                minRows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit" disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button variant="contained" disabled={submitting} onClick={() => void handleSubmit(onSubmit)()}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
