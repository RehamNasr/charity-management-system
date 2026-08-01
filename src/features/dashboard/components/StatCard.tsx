import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import type { SvgIconComponent } from '@mui/icons-material';

interface StatCardProps {
  label: string;
  value?: string | number;
  icon: SvgIconComponent;
  loading?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

/** Reusable dashboard metric tile. Business modules will supply real `value`s via Firestore
 * rollup documents (docs/ARCHITECTURE.md §9); for now the shell renders with `loading` so the
 * layout/skeleton state is already correct once wired up. */
export function StatCard({
  label,
  value,
  icon: Icon,
  loading = false,
  color = 'primary',
}: StatCardProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            width={48}
            height={48}
            borderRadius={2}
            bgcolor={`${color}.main`}
            color={`${color}.contrastText`}
          >
            <Icon />
          </Box>
          <Box flex={1} minWidth={0}>
            <Typography variant="body2" color="text.secondary" noWrap>
              {label}
            </Typography>
            {loading ? (
              <Skeleton width={64} height={32} />
            ) : (
              <Typography variant="h6" fontWeight={700}>
                {value}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
