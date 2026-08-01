import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { PageHeader, DataTable, type DataTableColumn } from '@components/common';
import { CaseStatusChip } from '../components/CaseStatusChip';
import { CasePriorityChip } from '../components/CasePriorityChip';
import { CasesToolbar } from '../components/CasesToolbar';
import { useCasesList } from '../hooks/useCasesList';
import { softDeleteCase } from '../api/caseService';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useConfirm } from '@hooks/useConfirm';
import { showSnackbar } from '@store/snackbarStore';
import { formatCurrency, formatDate } from '@utils/formatters';
import { getCaseDetailsPath, getCaseEditPath, ROUTES } from '@constants/routes';
import type { Case } from '@types-app/case';

export function CasesListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const confirm = useConfirm();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    rows,
    totalCount,
    loading,
    error,
    searchInput,
    setSearchInput,
    statusFilter,
    setStatusFilter,
    sortField,
    sortDirection,
    onSortChange,
    page,
    setPage,
    pageSize,
    setPageSize,
  } = useCasesList();

  const isFiltered = searchInput.trim().length > 0 || statusFilter !== 'all';

  async function handleDelete(row: Case): Promise<void> {
    const confirmed = await confirm({
      title: t('cases.messages.deleteConfirmTitle'),
      message: t('cases.messages.deleteConfirmMessage'),
      confirmLabel: t('cases.actions.delete'),
      destructive: true,
    });
    if (!confirmed || !user) return;

    setDeletingId(row.id);
    try {
      await softDeleteCase(row.id, user.uid);
      showSnackbar.success(t('cases.messages.deleteSuccess'));
    } catch {
      showSnackbar.error(t('cases.messages.deleteError'));
    } finally {
      setDeletingId(null);
    }
  }

  const columns: DataTableColumn<Case>[] = [
    {
      field: 'caseNumber',
      headerName: t('cases.fields.caseNumber'),
      sortable: true,
      valueGetter: (row) => row.caseNumber,
    },
    {
      field: 'fullName',
      headerName: t('cases.fields.fullName'),
      valueGetter: (row) => row.fullName,
    },
    {
      field: 'phone',
      headerName: t('cases.fields.phone'),
      valueGetter: (row) => row.phoneNumbers[0] ?? '—',
    },
    {
      field: 'governorate',
      headerName: t('cases.fields.governorate'),
      valueGetter: (row) => row.address.governorateName,
    },
    {
      field: 'familyMembersCount',
      headerName: t('cases.table.familyMembersShort'),
      sortable: true,
      align: 'center',
      valueGetter: (row) => row.familyMembersCount,
    },
    {
      field: 'monthlyIncome',
      headerName: t('cases.fields.monthlyIncome'),
      sortable: true,
      valueGetter: (row) => formatCurrency(row.monthlyIncome),
    },
    {
      field: 'status',
      headerName: t('cases.fields.status'),
      renderCell: (row) => <CaseStatusChip status={row.status} />,
    },
    {
      field: 'priorityLevel',
      headerName: t('cases.fields.priority'),
      renderCell: (row) => <CasePriorityChip priority={row.priorityLevel} />,
    },
    {
      field: 'createdAt',
      headerName: t('cases.fields.createdAt'),
      sortable: true,
      valueGetter: (row) => (row.createdAt ? formatDate(row.createdAt.toDate()) : '—'),
    },
    {
      field: 'actions',
      headerName: '',
      align: 'right',
      renderCell: (row) => (
        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="flex-end"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title={t('cases.actions.viewDetails')}>
            <IconButton size="small" component={RouterLink} to={getCaseDetailsPath(row.id)}>
              <VisibilityRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('cases.actions.edit')}>
            <IconButton size="small" component={RouterLink} to={getCaseEditPath(row.id)}>
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('cases.actions.delete')}>
            <IconButton
              size="small"
              color="error"
              disabled={deletingId === row.id}
              onClick={() => void handleDelete(row)}
            >
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <PageHeader
        title={t('cases.listTitle')}
        description={t('cases.listDescription')}
        actions={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            component={RouterLink}
            to={ROUTES.caseNew}
          >
            {t('cases.newCase')}
          </Button>
        }
      />

      <CasesToolbar
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {error ? <Alert severity="error">{error}</Alert> : null}

      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        loading={loading}
        onRowClick={(row) => void navigate(getCaseDetailsPath(row.id))}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={onSortChange}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        emptyTitle={isFiltered ? t('cases.empty.noResultsTitle') : t('cases.empty.title')}
        emptyDescription={
          isFiltered ? t('cases.empty.noResultsDescription') : t('cases.empty.description')
        }
      />
    </Stack>
  );
}
