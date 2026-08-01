import type { Role } from '@types-app/user';

export const ROLE_LABELS_AR: Record<Role, string> = {
  super_admin: 'مدير النظام',
  admin: 'مدير الجمعية',
  social_researcher: 'باحث اجتماعي',
  case_reviewer: 'مراجع الحالات',
  financial_officer: 'مسؤول مالي',
  data_entry: 'مدخل بيانات',
  auditor: 'مدقق',
};

/** Roles allowed to manage users, lookups, and role permissions. */
export const ADMIN_ROLES: Role[] = ['super_admin', 'admin'];

/** Roles with read access across the whole system (used by the audit log / activity feed). */
export const FULL_READ_ROLES: Role[] = ['super_admin', 'admin', 'auditor'];
