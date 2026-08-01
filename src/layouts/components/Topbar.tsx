import { useState, type MouseEvent } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TOPBAR_HEIGHT } from '@constants/app';
import { ROUTES } from '@constants/routes';
import { useSidebarStore } from '@store/sidebarStore';
import { useThemeStore } from '@store/themeStore';
import { useNotificationsUiStore } from '@store/notificationsUiStore';
import { useAuth } from '@features/auth/hooks/useAuth';
import { logout } from '@features/auth/api/authService';
import { ROLE_LABELS_AR } from '@constants/roles';

export function Topbar() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();

  const openMobileSidebar = useSidebarStore((state) => state.openMobile);
  const mode = useThemeStore((state) => state.mode);
  const toggleMode = useThemeStore((state) => state.toggleMode);
  const unreadCount = useNotificationsUiStore((state) => state.unreadCount);
  const { user } = useAuth();

  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<HTMLElement | null>(null);

  const handleLogout = async (): Promise<void> => {
    setUserMenuAnchor(null);
    await logout();
    void navigate(ROUTES.login, { replace: true });
  };

  const displayName = user?.profile?.displayName ?? user?.email ?? '';
  const roleLabel = user?.profile ? ROLE_LABELS_AR[user.profile.role] : '';

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        height: TOPBAR_HEIGHT,
        justifyContent: 'center',
      }}
    >
      <Toolbar>
        {!isDesktop && (
          <IconButton edge="start" onClick={openMobileSidebar} sx={{ me: 1 }} aria-label="menu">
            <MenuRoundedIcon />
          </IconButton>
        )}

        <Box flex={1} />

        <Stack direction="row" spacing={0.5} alignItems="center">
          <IconButton
            onClick={toggleMode}
            aria-label={mode === 'light' ? t('common.darkMode') : t('common.lightMode')}
          >
            {mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
          </IconButton>

          <IconButton
            onClick={(event: MouseEvent<HTMLElement>) => {
              setNotificationsAnchor(event.currentTarget);
            }}
            aria-label={t('common.notifications')}
          >
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsRoundedIcon />
            </Badge>
          </IconButton>
          <Popover
            open={Boolean(notificationsAnchor)}
            anchorEl={notificationsAnchor}
            onClose={() => {
              setNotificationsAnchor(null);
            }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <Box p={2} maxWidth={280}>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                {t('common.notifications')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('common.noData')}
              </Typography>
            </Box>
          </Popover>

          <IconButton
            onClick={(event: MouseEvent<HTMLElement>) => {
              setUserMenuAnchor(event.currentTarget);
            }}
            aria-label={t('common.profile')}
          >
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>
              {displayName.charAt(0).toLocaleUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={() => {
              setUserMenuAnchor(null);
            }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <Box px={2} py={1} minWidth={200}>
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                {displayName}
              </Typography>
              {roleLabel && (
                <Typography variant="caption" color="text.secondary">
                  {roleLabel}
                </Typography>
              )}
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                setUserMenuAnchor(null);
                void navigate(ROUTES.profile);
              }}
            >
              <ListItemIcon>
                <PersonRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('common.profile')}</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => void handleLogout()}>
              <ListItemIcon>
                <LogoutRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('common.logout')}</ListItemText>
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
