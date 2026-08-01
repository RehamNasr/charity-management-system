import { useMemo, useState } from 'react';
import { useCollection } from '@hooks/useCollection';
import { useDebounce } from '@hooks/useDebounce';
import { buildCasesQuery, type CaseSortField } from '../api/caseService';
import type { Case, CaseStatus } from '@types-app/case';
import type { SortDirection } from '@types-app/common';

const DEFAULT_PAGE_SIZE = 10;

/**
 * Drives the Cases list page: search + status filter + sort state, a bounded realtime Firestore
 * subscription (docs/ARCHITECTURE.md §6 — search via `normalizedName` range query, soft-delete
 * filter applied by `buildCasesQuery`), and client-side pagination over that live result set.
 *
 * Firestore doesn't support cheap offset-based pagination combined with a live listener, so —
 * consistent with the "read-heavy dashboards, bounded lists" trade-off documented alongside
 * `buildCasesQuery` — this subscribes to a capped, sorted window and paginates over it in memory
 * rather than doing cursor-based server pagination, which would have to give up realtime updates.
 */
export function useCasesList() {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 350);
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [sortField, setSortField] = useState<CaseSortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const isSearching = debouncedSearch.trim().length > 0;
  const effectiveSortField = isSearching ? 'normalizedName' : sortField;
  const effectiveSortDirection = isSearching ? 'asc' : sortDirection;

  const queryKey = `cases:${statusFilter}:${debouncedSearch.trim()}:${effectiveSortField}:${effectiveSortDirection}`;
  const casesQuery = useMemo(
    () =>
      buildCasesQuery(
        { status: statusFilter, searchTerm: debouncedSearch },
        sortField,
        sortDirection,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- queryKey captures every real input
    [queryKey],
  );

  const { data, loading, error } = useCollection<Case>(casesQuery, queryKey);
  const rows = data ?? [];

  const pagedRows = useMemo(() => {
    const start = page * pageSize;
    return (data ?? []).slice(start, start + pageSize);
  }, [data, page, pageSize]);

  function handleSortChange(field: string): void {
    if (isSearching) return; // sort is forced to normalizedName while searching
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field as CaseSortField);
      setSortDirection('asc');
    }
    setPage(0);
  }

  function handleSearchChange(value: string): void {
    setSearchInput(value);
    setPage(0);
  }

  function handleStatusFilterChange(value: CaseStatus | 'all'): void {
    setStatusFilter(value);
    setPage(0);
  }

  return {
    rows: pagedRows,
    totalCount: rows.length,
    loading,
    error,
    searchInput,
    setSearchInput: handleSearchChange,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    sortField: effectiveSortField,
    sortDirection: effectiveSortDirection,
    onSortChange: handleSortChange,
    page,
    setPage,
    pageSize,
    setPageSize: (size: number) => {
      setPageSize(size);
      setPage(0);
    },
  };
}
