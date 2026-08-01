import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import {
  VISIT_STATUSES,
  VISIT_TYPES,
  VISIT_RECOMMENDATIONS,
  type VisitStatus,
  type VisitType,
  type VisitRecommendation,
} from '@types-app/visit';
import type { VisitFilterState } from '../hooks/useVisitsList';

interface VisitsFilterToolbarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  filters: VisitFilterState;
  onFilterChange: (newFilters: Partial<VisitFilterState>) => void;
  onResetFilters: () => void;
  selectedCount: number;
  onExport: (selectedOnly: boolean) => void;
}

export function VisitsFilterToolbar({
  searchInput,
  onSearchChange,
  filters,
  onFilterChange,
  onResetFilters,
  selectedCount,
  onExport,
}: VisitsFilterToolbarProps) {
  const { t } = useTranslation();

  return (
    <Box sx={{ mb: 3 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder={t('visits.filters.searchPlaceholder')}
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Stack direction="row" spacing={1} width={{ xs: '100%', md: 'auto' }} justifyContent="flex-end">
            {selectedCount > 0 ? (
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => onExport(true)}
              >
                {t('visits.filters.exportSelected')} ({selectedCount})
              </Button>
            ) : null}

            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => onExport(false)}
            >
              {t('visits.filters.exportAll')}
            </Button>

            <Button
              variant="text"
              color="inherit"
              size="small"
              startIcon={<FilterAltOffIcon />}
              onClick={onResetFilters}
            >
              {t('visits.filters.resetFilters')}
            </Button>
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
          <TextField
            select
            size="small"
            label={t('visits.filters.status')}
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value as VisitStatus | 'all' })}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">{t('visits.filters.allStatuses')}</MenuItem>
            {VISIT_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {t(`visits.statuses.${status}`)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label={t('visits.filters.visitType')}
            value={filters.visitType}
            onChange={(e) => onFilterChange({ visitType: e.target.value as VisitType | 'all' })}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">{t('visits.filters.allTypes')}</MenuItem>
            {VISIT_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {t(`visits.types.${type}`)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label={t('visits.filters.recommendation')}
            value={filters.recommendation}
            onChange={(e) =>
              onFilterChange({ recommendation: e.target.value as VisitRecommendation | 'all' })
            }
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">{t('visits.filters.allRecommendations')}</MenuItem>
            {VISIT_RECOMMENDATIONS.map((rec) => (
              <MenuItem key={rec} value={rec}>
                {t(`visits.recommendations.${rec}`)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            type="date"
            size="small"
            label={t('visits.filters.dateFrom')}
            value={filters.dateFrom ?? ''}
            onChange={(e) => onFilterChange({ dateFrom: e.target.value || undefined })}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />

          <TextField
            type="date"
            size="small"
            label={t('visits.filters.dateTo')}
            value={filters.dateTo ?? ''}
            onChange={(e) => onFilterChange({ dateTo: e.target.value || undefined })}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
        </Stack>
      </Stack>
    </Box>
  );
}
