import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { BreadcrumbItem } from '@types-app/common';

interface AppBreadcrumbsProps {
  items: BreadcrumbItem[];
}

/** Generic breadcrumb trail; `DashboardLayout` derives `items` from the active route (see
 * layouts/DashboardLayout.tsx) so individual pages don't have to build this by hand. */
export function AppBreadcrumbs({ items }: AppBreadcrumbsProps) {
  const { t } = useTranslation();

  if (items.length <= 1) return null;

  return (
    <MuiBreadcrumbs separator={<NavigateNextRoundedIcon fontSize="small" />} sx={{ mb: 2 }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        if (isLast || !item.path) {
          return (
            <Typography key={item.labelKey} color="text.primary" variant="body2">
              {t(item.labelKey)}
            </Typography>
          );
        }
        return (
          <Link
            key={item.labelKey}
            component={RouterLink}
            to={item.path}
            underline="hover"
            color="inherit"
            variant="body2"
          >
            {t(item.labelKey)}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
}
