import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';
import { fetchAvailableCasesForVisit } from '../api/visitService';
import type { Case } from '@types-app/case';
import { LoadingSpinner } from '@components/common';

interface CaseSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (selectedCase: Case) => void;
}

export function CaseSelectModal({ open, onClose, onSelect }: CaseSelectModalProps) {
  const { t } = useTranslation();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open) {
      void (async () => {
        setLoading(true);
        try {
          const list = await fetchAvailableCasesForVisit();
          setCases(list);
        } catch {
          // handled gracefully
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [open]);

  const filteredCases = cases.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.nationalId.includes(search),
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('visits.selectCase')}</DialogTitle>
      <DialogContent dividers>
        <TextField
          autoFocus
          fullWidth
          size="small"
          placeholder={t('visits.selectCasePlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Box py={4}>
            <LoadingSpinner />
          </Box>
        ) : filteredCases.length === 0 ? (
          <Typography color="text.secondary" align="center" py={4}>
            {t('common.noData')}
          </Typography>
        ) : (
          <List disablePadding sx={{ maxHeight: 360, overflowY: 'auto' }}>
            {filteredCases.map((c) => (
              <ListItemButton
                key={c.id}
                onClick={() => {
                  onSelect(c);
                  onClose();
                }}
                divider
              >
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">{c.fullName}</Typography>
                      <Chip label={c.caseNumber} size="small" variant="outlined" />
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary" component="span">
                      الرقم القومي: {c.nationalId} | المحافظة: {c.address?.governorateName ?? '-'} | عدد الأفراد: {c.familyMembersCount}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {t('common.cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
