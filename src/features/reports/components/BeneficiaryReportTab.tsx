import { useEffect, useState } from 'react';
import { getDocs } from 'firebase/firestore';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import { useTranslation } from 'react-i18next';
import { DataTable, type DataTableColumn } from '@components/common';
import { buildCasesQuery } from '@features/cases/api/caseService';
import { CASE_STATUS_LABELS_AR, CASE_PRIORITY_LABELS_AR } from '@constants/caseStatus';
import { exportRowsToExcel, exportRowsToPdf, type ExportColumn } from '@utils/export';
import { formatCurrency, formatDate } from '@utils/formatters';
import type { Case } from '@types-app/case';

export function BeneficiaryReportTab() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const snap = await getDocs(buildCasesQuery({ status: 'all', searchTerm: '' }, 'createdAt', 'desc'));
        if (!cancelled) {
          setRows(snap.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id })));
        }
      } catch (err) {
        console.error('Error fetching beneficiary report:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const exportColumns: ExportColumn<Case>[] = [
    { header: t('cases.fields.caseNumber'), value: (r) => r.caseNumber },
    { header: t('cases.fields.fullName'), value: (r) => r.fullName },
    { header: t('cases.fields.nationalId'), value: (r) => r.nationalId },
    { header: t('cases.fields.phone'), value: (r) => r.phoneNumbers[0] ?? '' },
    { header: t('cases.fields.status'), value: (r) => CASE_STATUS_LABELS_AR[r.status] },
    { header: t('cases.fields.priority'), value: (r) => CASE_PRIORITY_LABELS_AR[r.priorityLevel] },
    { header: t('cases.fields.monthlyIncome'), value: (r) => r.monthlyIncome },
    {
      header: t('cases.fields.createdAt'),
      value: (r) => (r.createdAt ? formatDate(r.createdAt.toDate()) : ''),
    },
  ];

  const columns: DataTableColumn<Case>[] = [
    { field: 'caseNumber', headerName: t('cases.fields.caseNumber') },
    { field: 'fullName', headerName: t('cases.fields.fullName') },
    { field: 'nationalId', headerName: t('cases.fields.nationalId') },
    { field: 'phone', headerName: t('cases.fields.phone'), valueGetter: (r) => r.phoneNumbers[0] ?? '—' },
    { field: 'status', headerName: t('cases.fields.status'), valueGetter: (r) => CASE_STATUS_LABELS_AR[r.status] },
    {
      field: 'monthlyIncome',
      headerName: t('cases.fields.monthlyIncome'),
      valueGetter: (r) => formatCurrency(r.monthlyIncome),
    },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button
          size="small"
          startIcon={<DownloadRoundedIcon />}
          onClick={() => void exportRowsToExcel(rows, exportColumns, 'beneficiary-report')}
        >
          {t('reports.exportExcel')}
        </Button>
        <Button
          size="small"
          startIcon={<PictureAsPdfRoundedIcon />}
          onClick={() => void exportRowsToPdf(rows, exportColumns, 'beneficiary-report', t('reports.tabs.beneficiary'))}
        >
          {t('reports.exportPdf')}
        </Button>
      </Stack>
      <DataTable columns={columns} rows={rows} getRowId={(r) => r.id} loading={loading} />
    </Stack>
  );
}
