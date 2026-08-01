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

/** Every authenticated user sees the same navigation — there is no role-based filtering
 * (docs/ARCHITECTURE.md §3). */
export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.dashboard', path: ROUTES.dashboard, icon: DashboardRoundedIcon },
  { labelKey: 'nav.cases', path: ROUTES.cases, icon: FolderSharedRoundedIcon },
  { labelKey: 'nav.visits', path: ROUTES.visits, icon: EventNoteRoundedIcon },
  { labelKey: 'nav.assistance', path: ROUTES.assistance, icon: FactCheckRoundedIcon },
  { labelKey: 'nav.reminders', path: ROUTES.reminders, icon: AlarmRoundedIcon },
  { labelKey: 'nav.donors', path: ROUTES.donors, icon: PeopleAltRoundedIcon },
  { labelKey: 'nav.donations', path: ROUTES.donations, icon: VolunteerActivismRoundedIcon },
  { labelKey: 'nav.expenses', path: ROUTES.expenses, icon: ReceiptLongRoundedIcon },
  { labelKey: 'nav.financial', path: ROUTES.financial, icon: AccountBalanceRoundedIcon },
  { labelKey: 'nav.reports', path: ROUTES.reports, icon: SummarizeRoundedIcon },
  { labelKey: 'nav.users', path: ROUTES.users, icon: ManageAccountsRoundedIcon },
  { labelKey: 'nav.settings', path: ROUTES.settingsLookups, icon: TuneRoundedIcon },
  { labelKey: 'nav.auditLog', path: ROUTES.auditLog, icon: ManageSearchRoundedIcon },
];
