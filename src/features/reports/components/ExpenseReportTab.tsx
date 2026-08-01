import { useEffect, useState } from 'react';
import { getDocs } from 'firebase/firestore';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import { useTranslation } from 'react-i18next';
import { DataTable, type DataTableColumn } from '@components/common';
import { buildExpensesInRangeQuery } from '@features/expenses/api/expenseService';
import type { EXPENSE_CATEGORIES, Expense } from '@types-app/expense';
import { exportRowsToExcel, exportRowsToPdf, type ExportColumn } from '@utils/export';
import { formatCurrency, formatDate } from '@utils/formatters';

const EXPENSE_CATEGORY_LABELS_AR: Record<(typeof EXPENSE_CATEGORIES)[number], string> = {
  assistance_disbursement: 'صرف مساعدات',
  operational: 'مصاريف تشغيلية',
  administrative: 'مصاريف إدارية',
  medical: 'علاج ومستلزمات طبية',
  housing: 'ترميم وتجهيز منازل',
  other: 'أخرى',
};

function startOfMonthStr(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function ExpenseReportTab() {
  const { t } = useTranslation();
  const [dateFrom, setDateFrom] = useState(startOfMonthStr());
  const [dateTo, setDateTo] = useState(todayStr());
  const [rows, setRows] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      const snap = await getDocs(buildExpensesInRangeQuery(new Date(dateFrom), end));
      if (!cancelled) {
        setRows(snap.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id })));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dateFrom, dateTo]);

  const total = rows.reduce((sum, r) => sum + r.amount, 0);

  const exportColumns: ExportColumn<Expense>[] = [
    { header: t('expenses.fields.category'), value: (r) => EXPENSE_CATEGORY_LABELS_AR[r.category] },
    { header: t('expenses.fields.amount'), value: (r) => r.amount },
    { header: t('expenses.fields.date'), value: (r) => (r.date?.toDate ? formatDate(r.date.toDate()) : '') },
    { header: t('expenses.fields.description'), value: (r) => r.description },
  ];

  const columns: DataTableColumn<Expense>[] = [
    {
      field: 'category',
      headerName: t('expenses.fields.category'),
      valueGetter: (r) => EXPENSE_CATEGORY_LABELS_AR[r.category],
    },
    { field: 'amount', headerName: t('expenses.fields.amount'), valueGetter: (r) => formatCurrency(r.amount) },
    {
      field: 'date',
      headerName: t('expenses.fields.date'),
      valueGetter: (r) => (r.date?.toDate ? formatDate(r.date.toDate()) : '—'),
    },
    { field: 'description', headerName: t('expenses.fields.description') },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
        <Stack direction="row" spacing={2}>
          <TextField
            type="date"
            size="small"
            label={t('visits.filters.dateFrom')}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            type="date"
            size="small"
            label={t('visits.filters.dateTo')}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<DownloadRoundedIcon />}
            onClick={() => void exportRowsToExcel(rows, exportColumns, 'expense-report')}
          >
            {t('reports.exportExcel')}
          </Button>
          <Button
            size="small"
            startIcon={<PictureAsPdfRoundedIcon />}
            onClick={() => void exportRowsToPdf(rows, exportColumns, 'expense-report', t('reports.tabs.expense'))}
          >
            {t('reports.exportPdf')}
          </Button>
        </Stack>
      </Stack>

      <Typography variant="subtitle1" fontWeight="bold">
        {t('reports.total')}: {formatCurrency(total)}
      </Typography>

      <DataTable columns={columns} rows={rows} getRowId={(r) => r.id} loading={loading} />
    </Stack>
  );
}
