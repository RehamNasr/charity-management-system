import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { NavItem } from '@types-app/common';

interface SidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}

export function SidebarNavItem({ item, collapsed, onNavigate }: SidebarNavItemProps) {
  const { t } = useTranslation();
  const Icon = item.icon;
  const label = t(item.labelKey);

  const button = (
    <ListItemButton
      component={NavLink}
      to={item.path}
      onClick={onNavigate}
      sx={{
        borderRadius: 2,
        mx: 1,
        justifyContent: collapsed ? 'center' : 'flex-start',
        '&.active': {
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
          '&:hover': { backgroundColor: 'primary.dark' },
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}>
        <Icon fontSize="small" />
      </ListItemIcon>
      {!collapsed && <ListItemText primary={label} />}
    </ListItemButton>
  );

  if (collapsed) {
    return (
      <Tooltip title={label} placement="left">
        {button}
      </Tooltip>
    );
  }

  return button;
}
