import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import FolderSharedRoundedIcon from '@mui/icons-material/FolderSharedRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import AlarmRoundedIcon from '@mui/icons-material/AlarmRounded';
import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded';
import { ROUTES } from './routes';
import type { NavItem } from '@types-app/common';

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.dashboard', path: ROUTES.dashboard, icon: DashboardRoundedIcon },
  {
    labelKey: 'nav.cases',
    path: ROUTES.cases,
    icon: FolderSharedRoundedIcon,
    roles: ['super_admin', 'admin', 'social_researcher', 'case_reviewer', 'data_entry', 'auditor'],
  },
  {
    labelKey: 'nav.visits',
    path: ROUTES.visits,
    icon: EventNoteRoundedIcon,
    roles: ['super_admin', 'admin', 'social_researcher', 'auditor'],
  },
  {
    labelKey: 'nav.assistance',
    path: ROUTES.assistance,
    icon: FactCheckRoundedIcon,
    roles: ['super_admin', 'admin', 'case_reviewer', 'financial_officer', 'auditor'],
  },
  {
    labelKey: 'nav.reminders',
    path: ROUTES.reminders,
    icon: AlarmRoundedIcon,
    roles: ['super_admin', 'admin', 'social_researcher'],
  },
  {
    labelKey: 'nav.donors',
    path: ROUTES.donors,
    icon: PeopleAltRoundedIcon,
    roles: ['super_admin', 'admin', 'financial_officer', 'auditor'],
  },
  {
    labelKey: 'nav.donations',
    path: ROUTES.donations,
    icon: VolunteerActivismRoundedIcon,
    roles: ['super_admin', 'admin', 'financial_officer', 'auditor'],
  },
  {
    labelKey: 'nav.expenses',
    path: ROUTES.expenses,
    icon: ReceiptLongRoundedIcon,
    roles: ['super_admin', 'admin', 'financial_officer', 'auditor'],
  },
  {
    labelKey: 'nav.financial',
    path: ROUTES.financial,
    icon: AccountBalanceRoundedIcon,
    roles: ['super_admin', 'admin', 'financial_officer', 'auditor'],
  },
  {
    labelKey: 'nav.reports',
    path: ROUTES.reports,
    icon: SummarizeRoundedIcon,
    roles: ['super_admin', 'admin', 'financial_officer', 'case_reviewer', 'auditor'],
  },
  {
    labelKey: 'nav.users',
    path: ROUTES.users,
    icon: ManageAccountsRoundedIcon,
    roles: ['super_admin', 'admin'],
  },
  {
    labelKey: 'nav.settings',
    path: ROUTES.settingsLookups,
    icon: TuneRoundedIcon,
    roles: ['super_admin', 'admin'],
  },
  {
    labelKey: 'nav.auditLog',
    path: ROUTES.auditLog,
    icon: ManageSearchRoundedIcon,
    roles: ['super_admin', 'admin', 'auditor'],
  },
];
