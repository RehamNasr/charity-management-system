import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useTranslation } from 'react-i18next';
import { CASE_STATUS_OPTIONS } from '@constants/caseStatus';
import type { CaseStatus } from '@types-app/case';

interface CasesToolbarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  statusFilter: CaseStatus | 'all';
  onStatusFilterChange: (value: CaseStatus | 'all') => void;
}

export function CasesToolbar({
  searchInput,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: CasesToolbarProps) {
  const { t } = useTranslation();

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
      <TextField
        value={searchInput}
        onChange={(event) => {
          onSearchChange(event.target.value);
        }}
        placeholder={t('cases.filters.searchPlaceholder')}
        size="small"
        sx={{ flex: 1, maxWidth: { sm: 320 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <TextField
        select
        value={statusFilter}
        onChange={(event) => {
          onStatusFilterChange(event.target.value as CaseStatus | 'all');
        }}
        label={t('cases.filters.statusFilterLabel')}
        size="small"
        sx={{ minWidth: 200 }}
      >
        <MenuItem value="all">{t('cases.filters.allStatuses')}</MenuItem>
        {CASE_STATUS_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
