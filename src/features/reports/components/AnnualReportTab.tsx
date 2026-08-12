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
import { buildDonationsInRangeQuery } from '@features/donations/api/donationService';
import { buildExpensesInRangeQuery } from '@features/expenses/api/expenseService';
import { exportRowsToExcel, exportRowsToPdf, type ExportColumn } from '@utils/export';
import { formatCurrency } from '@utils/formatters';

interface MonthRow {
  monthIndex: number;
  monthLabel: string;
  income: number;
  expenses: number;
  balance: number;
}

const MONTH_LABELS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

async function fetchAnnualBreakdown(year: number): Promise<MonthRow[]> {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

  const [donationsSnap, expensesSnap] = await Promise.all([
    getDocs(buildDonationsInRangeQuery(yearStart, yearEnd)),
    getDocs(buildExpensesInRangeQuery(yearStart, yearEnd)),
  ]);

  const rows: MonthRow[] = MONTH_LABELS_AR.map((label, index) => ({
    monthIndex: index,
    monthLabel: label,
    income: 0,
    expenses: 0,
    balance: 0,
  }));

  for (const docSnap of donationsSnap.docs) {
    const data = docSnap.data();
    const monthIndex = data.date.toDate().getMonth();
    rows[monthIndex].income += data.amount ?? 0;
  }
  for (const docSnap of expensesSnap.docs) {
    const data = docSnap.data();
    const monthIndex = data.date.toDate().getMonth();
    rows[monthIndex].expenses += data.amount ?? 0;
  }
  for (const row of rows) {
    row.balance = row.income - row.expenses;
  }

  return rows;
}

function currentYear(): number {
  return new Date().getFullYear();
}

export function AnnualReportTab() {
  const { t } = useTranslation();
  const [year, setYear] = useState(currentYear());
  const [rows, setRows] = useState<MonthRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        if (!year || isNaN(year)) return;
        const result = await fetchAnnualBreakdown(year);
        if (!cancelled) {
          setRows(result);
        }
      } catch (err) {
        console.error('Error fetching annual breakdown:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [year]);

  const totalIncome = rows.reduce((sum, r) => sum + r.income, 0);
  const totalExpenses = rows.reduce((sum, r) => sum + r.expenses, 0);

  const exportColumns: ExportColumn<MonthRow>[] = [
    { header: t('reports.month'), value: (r) => r.monthLabel },
    { header: t('reports.income'), value: (r) => r.income },
    { header: t('reports.expense'), value: (r) => r.expenses },
    { header: t('reports.balance'), value: (r) => r.balance },
  ];

  const columns: DataTableColumn<MonthRow>[] = [
    { field: 'monthLabel', headerName: t('reports.month') },
    { field: 'income', headerName: t('reports.income'), valueGetter: (r) => formatCurrency(r.income) },
    { field: 'expenses', headerName: t('reports.expense'), valueGetter: (r) => formatCurrency(r.expenses) },
    { field: 'balance', headerName: t('reports.balance'), valueGetter: (r) => formatCurrency(r.balance) },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
        <TextField
          type="number"
          size="small"
          label={t('reports.selectYear')}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          slotProps={{ htmlInput: { min: 2000, max: 2100 } }}
          sx={{ maxWidth: 160 }}
        />
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<DownloadRoundedIcon />}
            onClick={() => void exportRowsToExcel(rows, exportColumns, `annual-report-${year}`)}
          >
            {t('reports.exportExcel')}
          </Button>
          <Button
            size="small"
            startIcon={<PictureAsPdfRoundedIcon />}
            onClick={() => void exportRowsToPdf(rows, exportColumns, `annual-report-${year}`, t('reports.tabs.annual'))}
          >
            {t('reports.exportPdf')}
          </Button>
        </Stack>
      </Stack>

      <Typography variant="subtitle1" fontWeight="bold">
        {t('reports.income')}: {formatCurrency(totalIncome)} — {t('reports.expense')}: {formatCurrency(totalExpenses)} —{' '}
        {t('reports.balance')}: {formatCurrency(totalIncome - totalExpenses)}
      </Typography>

      <DataTable columns={columns} rows={rows} getRowId={(r) => String(r.monthIndex)} loading={loading} />
    </Stack>
  );
}
