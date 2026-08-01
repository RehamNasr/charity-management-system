import { useMemo, useState } from 'react';
import { useCollection } from '@hooks/useCollection';
import { useDebounce } from '@hooks/useDebounce';
import { buildVisitsQuery, type VisitSortField } from '../api/visitService';
import type { Visit, VisitStatus, VisitType, VisitRecommendation } from '@types-app/visit';
import type { SortDirection } from '@types-app/common';

const DEFAULT_PAGE_SIZE = 10;

export interface VisitFilterState {
  status: VisitStatus | 'all';
  visitType: VisitType | 'all';
  recommendation: VisitRecommendation | 'all';
  researcherId: string;
  caseId?: string;
  governorateId?: string;
  cityId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useVisitsList(initialCaseId?: string) {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 350);

  const [filters, setFilters] = useState<VisitFilterState>({
    status: 'all',
    visitType: 'all',
    recommendation: 'all',
    researcherId: 'all',
    caseId: initialCaseId,
  });

  const [sortField, setSortField] = useState<VisitSortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isSearching = debouncedSearch.trim().length > 0;
  const effectiveSortField = isSearching ? 'beneficiaryName' : sortField;
  const effectiveSortDirection = isSearching ? 'asc' : sortDirection;

  const queryKey = `visits:${filters.caseId ?? 'all'}:${filters.status}:${filters.visitType}:${filters.recommendation}:${filters.researcherId}:${debouncedSearch.trim()}:${effectiveSortField}:${effectiveSortDirection}`;

  const visitsQuery = useMemo(
    () =>
      buildVisitsQuery(
        {
          caseId: filters.caseId,
          status: filters.status,
          visitType: filters.visitType,
          recommendation: filters.recommendation,
          researcherId: filters.researcherId,
          searchTerm: debouncedSearch,
        },
        sortField,
        sortDirection,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryKey],
  );

  const { data, loading, error } = useCollection<Visit>(visitsQuery, queryKey);

  // Additional client-side filtering for date range & location if provided
  const filteredData = useMemo(() => {
    let result = data ?? [];

    if (filters.governorateId && filters.governorateId !== 'all') {
      result = result.filter((v) => v.address?.governorateId === filters.governorateId);
    }
    if (filters.cityId && filters.cityId !== 'all') {
      result = result.filter((v) => v.address?.cityId === filters.cityId);
    }
    if (filters.dateFrom) {
      const fromTime = new Date(filters.dateFrom).getTime();
      result = result.filter((v) => {
        const vTime = v.visitDate?.toDate ? v.visitDate.toDate().getTime() : 0;
        return vTime >= fromTime;
      });
    }
    if (filters.dateTo) {
      const toTime = new Date(filters.dateTo).getTime() + 86400000;
      result = result.filter((v) => {
        const vTime = v.visitDate?.toDate ? v.visitDate.toDate().getTime() : 0;
        return vTime <= toTime;
      });
    }

    return result;
  }, [data, filters.governorateId, filters.cityId, filters.dateFrom, filters.dateTo]);

  const pagedRows = useMemo(() => {
    const start = page * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  function handleSortChange(field: string): void {
    if (isSearching) return;
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field as VisitSortField);
      setSortDirection('asc');
    }
    setPage(0);
  }

  function handleFilterChange(newFilters: Partial<VisitFilterState>): void {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(0);
  }

  function handleResetFilters(): void {
    setFilters({
      status: 'all',
      visitType: 'all',
      recommendation: 'all',
      researcherId: 'all',
      caseId: initialCaseId,
    });
    setSearchInput('');
    setPage(0);
  }

  function toggleSelectAll(checked: boolean): void {
    if (checked) {
      setSelectedIds(filteredData.map((v) => v.id));
    } else {
      setSelectedIds([]);
    }
  }

  function toggleSelectRow(id: string): void {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function exportToCSV(selectedOnly = false): void {
    const rowsToExport = selectedOnly
      ? filteredData.filter((v) => selectedIds.includes(v.id))
      : filteredData;

    if (rowsToExport.length === 0) return;

    const headers = [
      'رقم الزيارة',
      'اسم المستفيد',
      'رقم الحالة',
      'الباحث الاجتماعي',
      'نوع الزيارة',
      'تاريخ الزيارة',
      'الحالة',
      'التوصية',
      'الم مساعدة المقترحة',
      'تاريخ الزيارة القادمة',
    ];

    const csvRows = rowsToExport.map((v) => [
      v.visitNumber,
      `"${v.beneficiaryName || ''}"`,
      v.caseNumber,
      `"${v.researcherName || ''}"`,
      v.visitType,
      v.visitDate?.toDate ? v.visitDate.toDate().toISOString().split('T')[0] : '',
      v.status,
      v.recommendation,
      v.suggestedAmount ?? 0,
      v.nextVisitDate?.toDate ? v.nextVisitDate.toDate().toISOString().split('T')[0] : '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `visits_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return {
    rows: pagedRows,
    allFilteredRows: filteredData,
    totalCount: filteredData.length,
    loading,
    error,
    searchInput,
    setSearchInput: (val: string) => {
      setSearchInput(val);
      setPage(0);
    },
    filters,
    handleFilterChange,
    handleResetFilters,
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
    selectedIds,
    toggleSelectAll,
    toggleSelectRow,
    exportToCSV,
  };
}
