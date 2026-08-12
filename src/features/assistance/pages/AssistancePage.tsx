import { useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import PeopleIcon from '@mui/icons-material/People';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PaymentsIcon from '@mui/icons-material/Payments';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, type DataTableColumn } from '@components/common';
import { useCollection } from '@hooks/useCollection';
import { activeCasesQuery } from '@features/dashboard/api/dashboardService';
import { recordAssistance } from '../api/assistanceService';
import {
  MARITAL_STATUS_LABELS_AR,
  ASSISTANCE_TYPE_LABELS_AR,
  ASSISTANCE_TYPE_OPTIONS,
} from '@constants/caseStatus';
import { formatCurrency, formatDate } from '@utils/formatters';
import { showSnackbar } from '@store/snackbarStore';
import { useAuth } from '@features/auth/hooks/useAuth';
import type { Case } from '@types-app/case';

export function AssistancePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: cases, loading } = useCollection<Case>(activeCasesQuery(), 'cases');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCaseForDialog, setSelectedCaseForDialog] = useState<Case | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields for record assistance modal
  const [assistanceType, setAssistanceType] = useState('food');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const monthStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);

  // Stats calculations
  const totalBeneficiaries = cases?.length ?? 0;

  const assistedThisMonth = useMemo(() => {
    if (!cases) return 0;
    return cases.filter(
      (c) => c.lastAssistanceDate?.toDate && c.lastAssistanceDate.toDate() >= monthStart,
    ).length;
  }, [cases, monthStart]);

  const totalAssistanceDistributed = useMemo(() => {
    if (!cases) return 0;
    return cases.reduce((sum, c) => sum + (c.totalAssistanceReceived ?? 0), 0);
  }, [cases]);

  // Filtered rows
  const filteredCases = useMemo(() => {
    const all = cases ?? [];
    if (!searchTerm.trim()) return all;
    const term = searchTerm.trim().toLowerCase();
    return all.filter(
      (c) =>
        c.fullName.toLowerCase().includes(term) ||
        c.caseNumber.toLowerCase().includes(term) ||
        c.nationalId.includes(term),
    );
  }, [cases, searchTerm]);

  function handleOpenRecordModal(targetCase?: Case) {
    if (targetCase) {
      setSelectedCaseForDialog(targetCase);
      if (targetCase.assistanceType) {
        setAssistanceType(targetCase.assistanceType);
      }
    } else if (cases && cases.length > 0) {
      setSelectedCaseForDialog(cases[0]);
    }
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setDialogOpen(true);
  }

  async function handleSubmitAssistance() {
    if (!selectedCaseForDialog) {
      showSnackbar.error('يرجى اختيار حالة المستفيد');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      showSnackbar.error('يرجى إدخال مبلغ أو قيمة المساعدة بشكل صحيح');
      return;
    }
    if (!user) {
      showSnackbar.error('غير مصرح بالعملية');
      return;
    }

    try {
      setSubmitting(true);
      await recordAssistance(
        selectedCaseForDialog,
        assistanceType,
        Number(amount),
        new Date(date),
        notes,
        { uid: user.uid },
      );
      showSnackbar.success('تم تسجيل المساعدة وتحديث بيانات المستفيد بنجاح');
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      showSnackbar.error('حدث خطأ أثناء تسجيل المساعدة');
    } finally {
      setSubmitting(false);
    }
  }

  const columns: DataTableColumn<Case>[] = [
    { field: 'caseNumber', headerName: t('cases.fields.caseNumber') },
    { field: 'fullName', headerName: t('cases.fields.fullName') },
    { field: 'nationalId', headerName: t('cases.fields.nationalId') },
    {
      field: 'phone',
      headerName: t('cases.fields.phone'),
      valueGetter: (r) => r.phoneNumbers[0] ?? '—',
    },
    {
      field: 'maritalStatus',
      headerName: 'الحالة الاجتماعية',
      valueGetter: (r) => (r.maritalStatus ? MARITAL_STATUS_LABELS_AR[r.maritalStatus] ?? r.maritalStatus : '—'),
    },
    {
      field: 'assistanceType',
      headerName: 'نوع المساعدة',
      valueGetter: (r) => (r.assistanceType ? ASSISTANCE_TYPE_LABELS_AR[r.assistanceType] ?? r.assistanceType : 'إطعام'),
    },
    {
      field: 'lastAssistanceDate',
      headerName: 'آخر تاريخ مساعدة',
      valueGetter: (r) => (r.lastAssistanceDate?.toDate ? formatDate(r.lastAssistanceDate.toDate()) : 'لم تستلم بعد'),
    },
    {
      field: 'totalAssistanceReceived',
      headerName: 'إجمالي المساعدات',
      valueGetter: (r) => formatCurrency(r.totalAssistanceReceived ?? 0),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      align: 'center',
      renderCell: (row) => (
        <Button
          size="small"
          variant="outlined"
          color="primary"
          startIcon={<VolunteerActivismIcon fontSize="small" />}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenRecordModal(row);
          }}
        >
          تقديم مساعدة
        </Button>
      ),
    },
  ];

  return (
    <Stack spacing={3}>
      <PageHeader
        title={t('nav.assistance')}
        description="إدارة ومتابعة تقديم المساعدات للمستفيدين المسجلين"
        action={
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => handleOpenRecordModal()}
          >
            تسجيل مساعدة جديدة
          </Button>
        }
      />

      {/* KPI Overview Cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
              <Stack>
                <Typography variant="body2" color="text.secondary">
                  إجمالي المستفيدين المسجلين
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {totalBeneficiaries}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <EventAvailableIcon color="success" sx={{ fontSize: 40 }} />
              <Stack>
                <Typography variant="body2" color="text.secondary">
                  مستفيدون تمت مساعدتهم هذا الشهر
                </Typography>
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  {assistedThisMonth}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PaymentsIcon color="warning" sx={{ fontSize: 40 }} />
              <Stack>
                <Typography variant="body2" color="text.secondary">
                  إجمالي المساعدات المقدمة
                </Typography>
                <Typography variant="h5" color="warning.main" fontWeight="bold">
                  {formatCurrency(totalAssistanceDistributed)}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Filter */}
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          size="small"
          placeholder="بحث باسم المستفيد، رقم الحالة، أو الرقم القومي..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ maxWidth: 400 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </Stack>

      {/* Beneficiaries / Assistance Table */}
      <DataTable
        columns={columns}
        rows={filteredCases}
        getRowId={(r) => r.id}
        loading={loading}
      />

      {/* Record Assistance Modal */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          تسجيل مساعدة للمستفيد
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} pt={1}>
            <TextField
              select
              label="اختر المستفيد"
              value={selectedCaseForDialog?.id ?? ''}
              onChange={(e) => {
                const found = (cases ?? []).find((c) => c.id === e.target.value);
                if (found) setSelectedCaseForDialog(found);
              }}
              fullWidth
              required
            >
              {(cases ?? []).map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.fullName} — رقم الحالة: {c.caseNumber} ({c.nationalId})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="نوع المساعدة"
              value={assistanceType}
              onChange={(e) => setAssistanceType(e.target.value)}
              fullWidth
              required
            >
              {ASSISTANCE_TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="number"
              label="قيمة / مبلغ المساعدة (ج.م)"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              fullWidth
              required
              slotProps={{
                input: {
                  endAdornment: <InputAdornment position="end">ج.م</InputAdornment>,
                },
                htmlInput: { min: 1 },
              }}
            />

            <TextField
              type="date"
              label="تاريخ تقديم المساعدة"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              label="ملاحظات وتفاصيل إضافية"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting} color="inherit">
            إلغاء
          </Button>
          <Button
            onClick={() => void handleSubmitAssistance()}
            variant="contained"
            disabled={submitting}
          >
            تسجيل المساعدة
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
