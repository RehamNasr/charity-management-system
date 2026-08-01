import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import type { SortDirection } from '@types-app/common';

/** Only primitives can be safely rendered as text without risking `[object Object]`; anything
 * else should be handled via `renderCell`/`valueGetter` instead. */
function renderPrimitiveCell(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '';
}

export interface DataTableColumn<T> {
  field: string;
  headerName: string;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
  sortable?: boolean;
  renderCell?: (row: T) => ReactNode;
  valueGetter?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  sortField?: string;
  sortDirection?: SortDirection;
  onSortChange?: (field: string) => void;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  emptyTitle?: string;
  emptyDescription?: string;
}

/**
 * Generic, reusable data table: sortable headers, optional server- or client-driven pagination,
 * loading and empty states, and row click. Every list screen composes this rather than each
 * feature hand-rolling its own MUI `<Table>`.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  loading = false,
  onRowClick,
  sortField,
  sortDirection = 'asc',
  onSortChange,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  emptyTitle,
  emptyDescription,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const paginated = page !== undefined && pageSize !== undefined;

  return (
    <Paper variant="outlined" sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 640 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.field} align={column.align} style={{ width: column.width }}>
                  {column.sortable && onSortChange ? (
                    <TableSortLabel
                      active={sortField === column.field}
                      direction={sortField === column.field ? sortDirection : 'asc'}
                      onClick={() => {
                        onSortChange(column.field);
                      }}
                    >
                      {column.headerName}
                    </TableSortLabel>
                  ) : (
                    column.headerName
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <LoadingSpinner />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <EmptyState
                    title={emptyTitle ?? t('common.noData')}
                    description={emptyDescription}
                  />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  hover={Boolean(onRowClick)}
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.field} align={column.align}>
                      {column.renderCell
                        ? column.renderCell(row)
                        : (column.valueGetter?.(row) ??
                          renderPrimitiveCell((row as Record<string, unknown>)[column.field]))}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {paginated && onPageChange && onPageSizeChange ? (
        <Box borderTop={1} borderColor="divider">
          <TablePagination
            component="div"
            count={totalCount ?? rows.length}
            page={page}
            onPageChange={(_event, newPage) => {
              onPageChange(newPage);
            }}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(event) => {
              onPageSizeChange(Number(event.target.value));
            }}
            rowsPerPageOptions={pageSizeOptions}
            labelRowsPerPage={t('common.rowsPerPage')}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} ${t('common.of')} ${count}`}
          />
        </Box>
      ) : null}
    </Paper>
  );
}
