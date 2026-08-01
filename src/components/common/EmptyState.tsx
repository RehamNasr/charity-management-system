import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1.5}
      py={6}
      px={2}
      textAlign="center"
    >
      <Box color="text.disabled" fontSize={48} display="flex">
        {icon ?? <InboxRoundedIcon fontSize="inherit" />}
      </Box>
      <Typography variant="subtitle1" fontWeight={600}>
        {title ?? t('common.noData')}
      </Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary" maxWidth={360}>
          {description}
        </Typography>
      ) : null}
      {action}
    </Stack>
  );
}
