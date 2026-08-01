import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@layouts/AuthLayout';
import { DashboardLayout } from '@layouts/DashboardLayout';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '@features/auth/pages/ForgotPasswordPage';
import { ProfilePage } from '@features/auth/pages/ProfilePage';
import { DashboardPage } from '@features/dashboard/pages/DashboardPage';
import { CasesListPage } from '@features/cases/pages/CasesListPage';
import { CaseCreatePage } from '@features/cases/pages/CaseCreatePage';
import { CaseEditPage } from '@features/cases/pages/CaseEditPage';
import { CaseDetailsPage } from '@features/cases/pages/CaseDetailsPage';
import { VisitsListPage } from '@features/visits/pages/VisitsListPage';
import { VisitCreatePage } from '@features/visits/pages/VisitCreatePage';
import { VisitEditPage } from '@features/visits/pages/VisitEditPage';
import { VisitDetailsPage } from '@features/visits/pages/VisitDetailsPage';
import { AssistancePage } from '@features/assistance/pages/AssistancePage';
import { RemindersPage } from '@features/reminders/pages/RemindersPage';
import { NotificationsPage } from '@features/notifications/pages/NotificationsPage';
import { DonorsPage } from '@features/donors/pages/DonorsPage';
import { DonationsPage } from '@features/donations/pages/DonationsPage';
import { ExpensesPage } from '@features/expenses/pages/ExpensesPage';
import { FinancialPage } from '@features/financial/pages/FinancialPage';
import { ReportsPage } from '@features/reports/pages/ReportsPage';
import { UsersPage } from '@features/users/pages/UsersPage';
import { LookupsSettingsPage } from '@features/settings/pages/LookupsSettingsPage';
import { AuditLogPage } from '@features/auditLog/pages/AuditLogPage';
import { NotFoundPage } from '@pages/NotFoundPage';
import { ROUTES } from '@constants/routes';

/**
 * React Router v7 data router. Every route under `ProtectedRoute` is reachable by any
 * authenticated user — there is no role-based route gating (docs/ARCHITECTURE.md §3): once
 * signed in, all users have identical access.
 */
export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.login, element: <LoginPage /> },
          { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.dashboard} replace /> },
          { path: ROUTES.dashboard, element: <DashboardPage /> },
          { path: ROUTES.profile, element: <ProfilePage /> },
          { path: ROUTES.cases, element: <CasesListPage /> },
          { path: ROUTES.caseDetails, element: <CaseDetailsPage /> },
          { path: ROUTES.caseNew, element: <CaseCreatePage /> },
          { path: ROUTES.caseEdit, element: <CaseEditPage /> },
          { path: ROUTES.visits, element: <VisitsListPage /> },
          { path: ROUTES.visitDetails, element: <VisitDetailsPage /> },
          { path: ROUTES.visitNew, element: <VisitCreatePage /> },
          { path: ROUTES.visitEdit, element: <VisitEditPage /> },
          { path: ROUTES.assistance, element: <AssistancePage /> },
          { path: ROUTES.reminders, element: <RemindersPage /> },
          { path: ROUTES.notifications, element: <NotificationsPage /> },
          { path: ROUTES.donors, element: <DonorsPage /> },
          { path: ROUTES.donations, element: <DonationsPage /> },
          { path: ROUTES.expenses, element: <ExpensesPage /> },
          { path: ROUTES.financial, element: <FinancialPage /> },
          { path: ROUTES.reports, element: <ReportsPage /> },
          { path: ROUTES.users, element: <UsersPage /> },
          { path: ROUTES.settingsLookups, element: <LookupsSettingsPage /> },
          { path: ROUTES.auditLog, element: <AuditLogPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
