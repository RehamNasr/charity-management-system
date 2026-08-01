import { useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import { useTranslation } from 'react-i18next';
import { DataTable, type DataTableColumn } from '@components/common';
import { useCollection } from '@hooks/useCollection';
import { buildDonationsQuery } from '@features/donations/api/donationService';
import { buildDonorsQuery } from '@features/donors/api/donorService';
import { exportRowsToExcel, exportRowsToPdf, type ExportColumn } from '@utils/export';
import { formatCurrency, formatDate } from '@utils/formatters';
import type { Donation } from '@types-app/donation';
import type { Donor } from '@types-app/donor';

export function DonorStatementTab() {
  const { t } = useTranslation();
  const [donorId, setDonorId] = useState('all');

  const { data: donations, loading } = useCollection<Donation>(buildDonationsQuery(), 'donations');
  const { data: donors } = useCollection<Donor>(buildDonorsQuery(), 'donors');

  const rows = useMemo(() => {
    const all = donations ?? [];
    return donorId === 'all' ? all : all.filter((d) => d.donorId === donorId);
  }, [donations, donorId]);

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
        <TextField
          select
          size="small"
          label={t('donations.fields.donorName')}
          value={donorId}
          onChange={(e) => setDonorId(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="all">{t('reports.allDonors')}</MenuItem>
          {(donors ?? []).map((d) => (
            <MenuItem key={d.id} value={d.id}>
              {d.name}
            </MenuItem>
          ))}
        </TextField>

        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<DownloadRoundedIcon />}
            onClick={() => void exportRowsToExcel(rows, exportColumns, 'donor-statement')}
          >
            {t('reports.exportExcel')}
          </Button>
          <Button
            size="small"
            startIcon={<PictureAsPdfRoundedIcon />}
            onClick={() => void exportRowsToPdf(rows, exportColumns, 'donor-statement', t('reports.tabs.donorStatement'))}
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
