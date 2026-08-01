import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import { useTranslation } from 'react-i18next';
import { PageHeader } from './PageHeader';

interface ComingSoonProps {
  title: string;
}

/**
 * Generic placeholder used by every not-yet-implemented business module route (cases, visits,
 * assistance, donors, donations, expenses, financial, reports, users, settings, audit log —
 * docs/ARCHITECTURE.md §10/§12). One component parameterized by title avoids duplicating the
 * same "coming soon" markup per module.
 */
export function ComingSoon({ title }: ComingSoonProps) {
  const { t } = useTranslation();

  return (
    <Box>
      <PageHeader title={title} />
      <Stack alignItems="center" justifyContent="center" spacing={2} py={10} textAlign="center">
        <ConstructionRoundedIcon sx={{ fontSize: 56 }} color="disabled" />
        <Typography variant="h6">{t('common.comingSoon')}</Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={420}>
          {t('common.comingSoonDescription')}
        </Typography>
      </Stack>
    </Box>
  );
}
