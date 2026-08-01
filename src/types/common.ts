import type { SvgIconComponent } from '@mui/icons-material';

export interface SelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: string;
  direction: SortDirection;
}

export interface PaginationState {
  page: number;
  pageSize: number;
}

/** Soft-delete fields present on every major Firestore collection (docs/ARCHITECTURE.md §6). */
export interface SoftDeleteFields {
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface NavItem {
  labelKey: string;
  path: string;
  icon: SvgIconComponent;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  labelKey: string;
  path?: string;
}
