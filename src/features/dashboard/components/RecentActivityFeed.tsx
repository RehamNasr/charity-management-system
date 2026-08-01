import type { ReactElement } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@components/common';
import { useUserDisplayNames } from '../hooks/useUserDisplayNames';
import { formatRelativeTime } from '@utils/formatters';
import type { ActivityItem, ActivityKind } from '@types-app/dashboard';

const ACTIVITY_ICONS: Record<ActivityKind, ReactElement> = {
  case_added: <PersonAddAltRoundedIcon fontSize="small" />,
  visit_added: <EventNoteRoundedIcon fontSize="small" />,
  donation_received: <VolunteerActivismRoundedIcon fontSize="small" />,
  expense_recorded: <ReceiptLongRoundedIcon fontSize="small" />,
};

const ACTIVITY_COLORS: Record<ActivityKind, string> = {
  case_added: 'primary.main',
  visit_added: 'info.main',
  donation_received: 'success.main',
  expense_recorded: 'warning.main',
};

interface RecentActivityFeedProps {
  items: ActivityItem[];
  loading: boolean;
}

export function RecentActivityFeed({ items, loading }: RecentActivityFeedProps) {
  const { t } = useTranslation();
  const names = useUserDisplayNames(items.map((item) => item.performedByUid));

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardHeader title={t('dashboard.recentActivity.title')} />
      <CardContent>
        {loading ? (
          <Stack spacing={2}>
            {[1, 2, 3, 4].map((i) => (
              <Stack key={i} direction="row" spacing={2} alignItems="center">
                <Skeleton variant="circular" width={40} height={40} />
                <Stack flex={1} spacing={0.5}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="40%" />
                </Stack>
              </Stack>
            ))}
          </Stack>
        ) : items.length === 0 ? (
          <EmptyState description={t('dashboard.recentActivity.empty')} />
        ) : (
          <List disablePadding>
            {items.map((item) => (
              <ListItem key={item.id} disableGutters alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: ACTIVITY_COLORS[item.kind], width: 36, height: 36 }}>
                    {ACTIVITY_ICONS[item.kind]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={item.description}
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {names[item.performedByUid] ?? t('common.loading')} ·{' '}
                      {formatRelativeTime(new Date(item.timestampMs))}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
