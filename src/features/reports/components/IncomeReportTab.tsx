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
import { exportRowsToExcel, exportRowsToPdf, type ExportColumn } from '@utils/export';
import { formatCurrency, formatDate } from '@utils/formatters';
import type { Donation } from '@types-app/donation';

function startOfMonthStr(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function IncomeReportTab() {
  const { t } = useTranslation();
  const [dateFrom, setDateFrom] = useState(startOfMonthStr());
  const [dateTo, setDateTo] = useState(todayStr());
  const [rows, setRows] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        if (!dateFrom || !dateTo) {
          setRows([]);
          return;
        }
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        const snap = await getDocs(buildDonationsInRangeQuery(new Date(dateFrom), end));
        if (!cancelled) {
          setRows(snap.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id })));
        }
      } catch (err) {
        console.error('Error fetching income report:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dateFrom, dateTo]);

  const total = rows.reduce((sum, r) => sum + r.amount, 0);

  const exportColumns: ExportColumn<Donation>[] = [
    { header: t('donations.fields.donorName'), value: (r) => r.donorName },
    { header: t('donations.fields.amount'), value: (r) => r.amount },
    { header: t('donations.fields.date'), value: (r) => (r.date?.toDate ? formatDate(r.date.toDate()) : '') },
  ];

  const columns: DataTableColumn<Donation>[] = [
    { field: 'donorName', headerName: t('donations.fields.donorName') },
    { field: 'amount', headerName: t('donations.fields.amount'), valueGetter: (r) => formatCurrency(r.amount) },
    {
      field: 'date',
      headerName: t('donations.fields.date'),
      valueGetter: (r) => (r.date?.toDate ? formatDate(r.date.toDate()) : '—'),
    },
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
            onClick={() => void exportRowsToExcel(rows, exportColumns, 'income-report')}
          >
            {t('reports.exportExcel')}
          </Button>
          <Button
            size="small"
            startIcon={<PictureAsPdfRoundedIcon />}
            onClick={() => void exportRowsToPdf(rows, exportColumns, 'income-report', t('reports.tabs.income'))}
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
