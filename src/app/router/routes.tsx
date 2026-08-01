import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@layouts/AuthLayout';
import { DashboardLayout } from '@layouts/DashboardLayout';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { PermissionGuard } from './PermissionGuard';
import { LoginPage } from '@features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '@features/auth/pages/ForgotPasswordPage';
import { ProfilePage } from '@features/auth/pages/ProfilePage';
import { DashboardPage } from '@features/dashboard/pages/DashboardPage';
import { CasesListPage } from '@features/cases/pages/CasesListPage';
import { CaseCreatePage } from '@features/cases/pages/CaseCreatePage';
import { CaseEditPage } from '@features/cases/pages/CaseEditPage';
import { CaseDetailsPage } from '@features/cases/pages/CaseDetailsPage';
import { VisitsPage } from '@features/visits/pages/VisitsPage';
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
import { PermissionsSettingsPage } from '@features/settings/pages/PermissionsSettingsPage';
import { AuditLogPage } from '@features/auditLog/pages/AuditLogPage';
import { NotFoundPage } from '@pages/NotFoundPage';
import { UnauthorizedPage } from '@pages/UnauthorizedPage';
import { ROUTES } from '@constants/routes';
import { ADMIN_ROLES, FULL_READ_ROLES } from '@constants/roles';

/**
 * React Router v7 data router. Business-module routes point at their feature's placeholder page
 * (docs/ARCHITECTURE.md §10/§12) and are already wrapped in the same `PermissionGuard` roles used
 * by the sidebar (docs/ARCHITECTURE.md §3), so swapping the placeholder for the real page later
 * requires no routing/guard changes.
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
          {
            element: (
              <PermissionGuard
                roles={[
                  'super_admin',
                  'admin',
                  'social_researcher',
                  'case_reviewer',
                  'data_entry',
                  'auditor',
                ]}
              />
            ),
            children: [
              { path: ROUTES.cases, element: <CasesListPage /> },
              { path: ROUTES.caseDetails, element: <CaseDetailsPage /> },
              {
                element: (
                  <PermissionGuard
                    roles={['super_admin', 'admin', 'social_researcher', 'data_entry']}
                  />
                ),
                children: [{ path: ROUTES.caseNew, element: <CaseCreatePage /> }],
              },
              {
                element: (
                  <PermissionGuard
                    roles={[
                      'super_admin',
                      'admin',
                      'social_researcher',
                      'data_entry',
                      'case_reviewer',
                    ]}
                  />
                ),
                children: [{ path: ROUTES.caseEdit, element: <CaseEditPage /> }],
              },
            ],
          },
          {
            element: (
              <PermissionGuard roles={['super_admin', 'admin', 'social_researcher', 'auditor']} />
            ),
            children: [{ path: ROUTES.visits, element: <VisitsPage /> }],
          },
          {
            element: (
              <PermissionGuard
                roles={['super_admin', 'admin', 'case_reviewer', 'financial_officer', 'auditor']}
              />
            ),
            children: [{ path: ROUTES.assistance, element: <AssistancePage /> }],
          },
          {
            element: <PermissionGuard roles={['super_admin', 'admin', 'social_researcher']} />,
            children: [{ path: ROUTES.reminders, element: <RemindersPage /> }],
          },
          { path: ROUTES.notifications, element: <NotificationsPage /> },
          {
            element: (
              <PermissionGuard roles={['super_admin', 'admin', 'financial_officer', 'auditor']} />
            ),
            children: [
              { path: ROUTES.donors, element: <DonorsPage /> },
              { path: ROUTES.donations, element: <DonationsPage /> },
              { path: ROUTES.expenses, element: <ExpensesPage /> },
              { path: ROUTES.financial, element: <FinancialPage /> },
            ],
          },
          {
            element: (
              <PermissionGuard
                roles={['super_admin', 'admin', 'financial_officer', 'case_reviewer', 'auditor']}
              />
            ),
            children: [{ path: ROUTES.reports, element: <ReportsPage /> }],
          },
          {
            element: <PermissionGuard roles={ADMIN_ROLES} />,
            children: [
              { path: ROUTES.users, element: <UsersPage /> },
              { path: ROUTES.settingsLookups, element: <LookupsSettingsPage /> },
              { path: ROUTES.settingsPermissions, element: <PermissionsSettingsPage /> },
            ],
          },
          {
            element: <PermissionGuard roles={FULL_READ_ROLES} />,
            children: [{ path: ROUTES.auditLog, element: <AuditLogPage /> }],
          },
        ],
      },
      { path: ROUTES.unauthorized, element: <UnauthorizedPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
