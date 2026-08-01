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
import { buildExpensesQuery, createExpense, softDeleteExpense } from '../api/expenseService';
import {
  expenseFormSchema,
  type ExpenseFormInput,
  type ExpenseFormValues,
} from '../schemas/expenseSchema';
import { EXPENSE_CATEGORIES, type Expense } from '@types-app/expense';
import { formatCurrency, formatDate } from '@utils/formatters';

const EXPENSE_CATEGORY_LABELS_AR: Record<(typeof EXPENSE_CATEGORIES)[number], string> = {
  assistance_disbursement: 'صرف مساعدات',
  operational: 'مصاريف تشغيلية',
  administrative: 'مصاريف إدارية',
  medical: 'علاج ومستلزمات طبية',
  housing: 'ترميم وتجهيز منازل',
  other: 'أخرى',
};

const CATEGORY_OPTIONS = EXPENSE_CATEGORIES.map((category) => ({
  value: category,
  label: EXPENSE_CATEGORY_LABELS_AR[category],
}));

const DEFAULT_VALUES: ExpenseFormInput = {
  category: 'operational',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  description: '',
};

export function ExpensesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const confirm = useConfirm();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, loading } = useCollection<Expense>(buildExpensesQuery(), 'expenses');
  const rows = data ?? [];

  const { control, handleSubmit, reset } = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  async function onSubmit(values: ExpenseFormValues): Promise<void> {
    if (!user) return;
    setSubmitting(true);
    try {
      await createExpense(values, { uid: user.uid });
      showSnackbar.success(t('expenses.messages.createSuccess'));
      reset(DEFAULT_VALUES);
      setDialogOpen(false);
    } catch {
      showSnackbar.error(t('expenses.messages.saveError'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(expense: Expense): Promise<void> {
    if (!user) return;
    const confirmed = await confirm({
      title: t('expenses.messages.deleteConfirmTitle'),
      message: t('expenses.messages.deleteConfirmMessage'),
      confirmLabel: t('common.delete'),
      destructive: true,
    });
    if (!confirmed) return;

    setDeletingId(expense.id);
    try {
      await softDeleteExpense(expense.id, user.uid);
      showSnackbar.success(t('expenses.messages.deleteSuccess'));
    } catch {
      showSnackbar.error(t('expenses.messages.deleteError'));
    } finally {
      setDeletingId(null);
    }
  }

  const columns: DataTableColumn<Expense>[] = [
    {
      field: 'category',
      headerName: t('expenses.fields.category'),
      valueGetter: (row) => EXPENSE_CATEGORY_LABELS_AR[row.category],
    },
    {
      field: 'amount',
      headerName: t('expenses.fields.amount'),
      valueGetter: (row) => formatCurrency(row.amount),
    },
    {
      field: 'date',
      headerName: t('expenses.fields.date'),
      valueGetter: (row) => (row.date?.toDate ? formatDate(row.date.toDate()) : '—'),
    },
    { field: 'description', headerName: t('expenses.fields.description') },
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
        title={t('expenses.listTitle')}
        description={t('expenses.listDescription')}
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogOpen(true)}>
            {t('expenses.newExpense')}
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        loading={loading}
        emptyTitle={t('expenses.empty.title')}
        emptyDescription={t('expenses.empty.description')}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('expenses.newExpense')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2.5} mt={0.5}>
            <Grid size={12}>
              <FormSelect
                name="category"
                control={control}
                label={t('expenses.fields.category')}
                options={CATEGORY_OPTIONS}
                disabled={submitting}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField
                name="amount"
                control={control}
                label={t('expenses.fields.amount')}
                type="number"
                disabled={submitting}
                slotProps={{ htmlInput: { min: 1, step: '0.01' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField
                name="date"
                control={control}
                label={t('expenses.fields.date')}
                type="date"
                disabled={submitting}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={12}>
              <FormTextField
                name="description"
                control={control}
                label={t('expenses.fields.description')}
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
