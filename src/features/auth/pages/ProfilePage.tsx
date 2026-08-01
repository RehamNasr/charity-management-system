import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@components/common';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS_AR } from '@constants/roles';

export function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const displayName = user?.profile?.displayName ?? user?.email ?? '';
  const roleLabel = user?.profile ? ROLE_LABELS_AR[user.profile.role] : '';

  return (
    <Stack spacing={3}>
      <PageHeader title={t('common.profile')} />
      <Card variant="outlined" sx={{ maxWidth: 480 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 24 }}>
              {displayName.charAt(0).toLocaleUpperCase()}
            </Avatar>
            <Stack spacing={0.5}>
              <Typography variant="h6" fontWeight={700}>
                {displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              {roleLabel && (
                <Chip label={roleLabel} size="small" color="primary" variant="outlined" />
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
