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
import { FormTextField } from '@components/form';
import { useCollection } from '@hooks/useCollection';
import { useConfirm } from '@hooks/useConfirm';
import { useAuth } from '@features/auth/hooks/useAuth';
import { showSnackbar } from '@store/snackbarStore';
import { buildDonorsQuery, createDonor, softDeleteDonor } from '../api/donorService';
import { donorFormSchema, type DonorFormValues } from '../schemas/donorSchema';
import { formatDate } from '@utils/formatters';
import type { Donor } from '@types-app/donor';

const DEFAULT_VALUES: DonorFormValues = { name: '', phone: '', email: '', notes: '' };

export function DonorsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const confirm = useConfirm();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, loading } = useCollection<Donor>(buildDonorsQuery(), 'donors');
  const rows = data ?? [];

  const { control, handleSubmit, reset } = useForm<DonorFormValues>({
    resolver: zodResolver(donorFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  async function onSubmit(values: DonorFormValues): Promise<void> {
    if (!user) return;
    setSubmitting(true);
    try {
      await createDonor(values, { uid: user.uid });
      showSnackbar.success(t('donors.messages.createSuccess'));
      reset(DEFAULT_VALUES);
      setDialogOpen(false);
    } catch {
      showSnackbar.error(t('donors.messages.saveError'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(donor: Donor): Promise<void> {
    if (!user) return;
    const confirmed = await confirm({
      title: t('donors.messages.deleteConfirmTitle'),
      message: t('donors.messages.deleteConfirmMessage'),
      confirmLabel: t('common.delete'),
      destructive: true,
    });
    if (!confirmed) return;

    setDeletingId(donor.id);
    try {
      await softDeleteDonor(donor.id, user.uid);
      showSnackbar.success(t('donors.messages.deleteSuccess'));
    } catch {
      showSnackbar.error(t('donors.messages.deleteError'));
    } finally {
      setDeletingId(null);
    }
  }

  const columns: DataTableColumn<Donor>[] = [
    { field: 'name', headerName: t('donors.fields.name') },
    { field: 'phone', headerName: t('donors.fields.phone') },
    { field: 'email', headerName: t('donors.fields.email'), valueGetter: (row) => row.email || '—' },
    {
      field: 'createdAt',
      headerName: t('donors.fields.createdAt'),
      valueGetter: (row) => (row.createdAt ? formatDate(row.createdAt.toDate()) : '—'),
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
        title={t('donors.listTitle')}
        description={t('donors.listDescription')}
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogOpen(true)}>
            {t('donors.newDonor')}
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        loading={loading}
        emptyTitle={t('donors.empty.title')}
        emptyDescription={t('donors.empty.description')}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('donors.newDonor')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2.5} mt={0.5}>
            <Grid size={12}>
              <FormTextField name="name" control={control} label={t('donors.fields.name')} disabled={submitting} />
            </Grid>
            <Grid size={12}>
              <FormTextField
                name="phone"
                control={control}
                label={t('donors.fields.phone')}
                disabled={submitting}
                slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 11 } }}
              />
            </Grid>
            <Grid size={12}>
              <FormTextField name="email" control={control} label={t('donors.fields.email')} disabled={submitting} />
            </Grid>
            <Grid size={12}>
              <FormTextField
                name="notes"
                control={control}
                label={t('donors.fields.notes')}
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
