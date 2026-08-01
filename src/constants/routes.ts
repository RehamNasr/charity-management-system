/**
 * Central route-path registry (docs/ARCHITECTURE.md §10). Business-module routes are wired to
 * placeholder pages until each module is implemented — see src/app/router/routes.tsx.
 */
export const ROUTES = {
  login: '/login',
  forgotPassword: '/forgot-password',
  dashboard: '/dashboard',
  cases: '/cases',
  caseNew: '/cases/new',
  caseDetails: '/cases/:caseId',
  caseEdit: '/cases/:caseId/edit',
  visits: '/visits',
  assistance: '/assistance',
  reminders: '/reminders',
  notifications: '/notifications',
  donors: '/donors',
  donations: '/donations',
  expenses: '/expenses',
  financial: '/financial',
  reports: '/reports',
  users: '/users',
  settingsLookups: '/settings/lookups',
  settingsPermissions: '/settings/permissions',
  auditLog: '/audit-log',
  profile: '/profile',
  unauthorized: '/unauthorized',
} as const;

export type RouteKey = keyof typeof ROUTES;

export function getCaseDetailsPath(caseId: string): string {
  return `/cases/${caseId}`;
}

export function getCaseEditPath(caseId: string): string {
  return `/cases/${caseId}/edit`;
}
