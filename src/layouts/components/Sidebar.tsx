import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import { useTranslation } from 'react-i18next';
import { SIDEBAR_NAV_ITEMS } from '@constants/navigation';
import { DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED } from '@constants/app';
import { useSidebarStore } from '@store/sidebarStore';
import { useAuth } from '@features/auth/hooks/useAuth';
import { hasAnyRole } from '@utils/permissions';
import { SidebarNavItem } from './SidebarNavItem';

export function Sidebar() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { role } = useAuth();
  const collapsed = useSidebarStore((state) => state.collapsed);
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);
  const mobileOpen = useSidebarStore((state) => state.mobileOpen);
  const closeMobile = useSidebarStore((state) => state.closeMobile);

  const visibleItems = SIDEBAR_NAV_ITEMS.filter((item) => hasAnyRole(role, item.roles));
  const width = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  const content = (
    <Box display="flex" flexDirection="column" height="100%">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={collapsed ? 'center' : 'space-between'}
        px={2}
        py={2}
      >
        <Stack direction="row" spacing={1} alignItems="center" overflow="hidden">
          <VolunteerActivismRoundedIcon color="primary" />
          {!collapsed && (
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {t('common.appName')}
            </Typography>
          )}
        </Stack>
        {isDesktop && !collapsed && (
          <IconButton size="small" onClick={toggleCollapsed} aria-label={t('common.toggleSidebar')}>
            <ChevronRightRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
      <Divider />
      <List sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {visibleItems.map((item) => (
          <SidebarNavItem
            key={item.path}
            item={item}
            collapsed={collapsed && isDesktop}
            onNavigate={isDesktop ? undefined : closeMobile}
          />
        ))}
      </List>
      {isDesktop && collapsed && (
        <Stack alignItems="center" py={1}>
          <IconButton size="small" onClick={toggleCollapsed} aria-label={t('common.toggleSidebar')}>
            <ChevronLeftRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      )}
    </Box>
  );

  if (isDesktop) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width,
          flexShrink: 0,
          transition: (t) => t.transitions.create('width'),
          '& .MuiDrawer-paper': {
            width,
            boxSizing: 'border-box',
            transition: (t) => t.transitions.create('width'),
            overflowX: 'hidden',
          },
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={closeMobile}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
    >
      {content}
    </Drawer>
  );
}
