import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, type DataTableColumn } from '@components/common';
import { useVisitsList } from '../hooks/useVisitsList';
import { VisitsFilterToolbar } from '../components/VisitsFilterToolbar';
import { VisitStatusBadge, VisitTypeBadge, RecommendationBadge } from '../components/VisitBadges';
import { softDeleteVisit } from '../api/visitService';
import type { Visit } from '@types-app/visit';
import { useAuthStore } from '@store/authStore';
import { useConfirm } from '@hooks/useConfirm';
import { showSnackbar } from '@store/snackbarStore';
import { getVisitDetailsPath, getVisitEditPath, getVisitNewPath } from '@constants/routes';

export function VisitsListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const currentUser = useAuthStore((state) => state.user);

  const {
    rows,
    totalCount,
    loading,
    searchInput,
    setSearchInput,
    filters,
    handleFilterChange,
    handleResetFilters,
    sortField,
    sortDirection,
    onSortChange,
    page,
    setPage,
    pageSize,
    setPageSize,
    selectedIds,
    toggleSelectRow,
    exportToCSV,
  } = useVisitsList();

  const handleDeleteVisit = async (visit: Visit) => {
    if (!currentUser) return;
    const isConfirmed = await confirm({
      title: t('visits.messages.deleteConfirmTitle'),
      message: t('visits.messages.deleteConfirmMessage'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });

    if (isConfirmed) {
      try {
        await softDeleteVisit(visit.id, {
          uid: currentUser.uid,
          displayName: currentUser.profile?.displayName ?? 'مستخدم',
        });
        showSnackbar.success(t('visits.messages.deleteSuccess'));
      } catch {
        showSnackbar.error(t('visits.messages.deleteError'));
      }
    }
  };

  const columns: DataTableColumn<Visit>[] = [
    {
      field: 'select',
      headerName: '',
      width: 50,
      renderCell: (row) => (
        <Checkbox
          size="small"
          checked={selectedIds.includes(row.id)}
          onChange={() => toggleSelectRow(row.id)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      field: 'visitNumber',
      headerName: t('visits.fields.visitNumber'),
      sortable: true,
      renderCell: (row) => (
        <Button
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            void navigate(getVisitDetailsPath(row.id));
          }}
          sx={{ fontWeight: 'bold' }}
        >
          {row.visitNumber}
        </Button>
      ),
    },
    {
      field: 'beneficiaryName',
      headerName: t('visits.fields.beneficiaryName'),
      sortable: true,
    },
    {
      field: 'caseNumber',
      headerName: t('visits.fields.caseNumber'),
      sortable: true,
    },
    {
      field: 'researcherName',
      headerName: t('visits.fields.researcher'),
    },
    {
      field: 'visitType',
      headerName: t('visits.fields.visitType'),
      renderCell: (row) => <VisitTypeBadge type={row.visitType} />,
    },
    {
      field: 'visitDate',
      headerName: t('visits.fields.visitDate'),
      sortable: true,
      renderCell: (row) =>
        row.visitDate?.toDate ? row.visitDate.toDate().toLocaleDateString('ar-EG') : '-',
    },
    {
      field: 'status',
      headerName: t('visits.fields.status'),
      renderCell: (row) => <VisitStatusBadge status={row.status} />,
    },
    {
      field: 'recommendation',
      headerName: t('visits.fields.recommendation'),
      renderCell: (row) => <RecommendationBadge recommendation={row.recommendation} />,
    },
    {
      field: 'actions',
      headerName: '',
      align: 'right',
      renderCell: (row) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title={t('visits.actions.viewDetails')}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                void navigate(getVisitDetailsPath(row.id));
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={t('common.edit')}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                void navigate(getVisitEditPath(row.id));
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={t('common.delete')}>
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                void handleDeleteVisit(row);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title={t('visits.listTitle')}
        description={t('visits.listDescription')}
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(getVisitNewPath())}
          >
            {t('visits.newVisit')}
          </Button>
        }
      />

      <VisitsFilterToolbar
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        selectedCount={selectedIds.length}
        onExport={exportToCSV}
      />

      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        loading={loading}
        onRowClick={(row) => navigate(getVisitDetailsPath(row.id))}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={onSortChange}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        emptyTitle={t('visits.empty.title')}
        emptyDescription={t('visits.empty.description')}
      />
    </Box>
  );
}
