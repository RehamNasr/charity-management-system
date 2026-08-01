import { format, formatDistanceToNow, isValid } from 'date-fns';
import { ar } from 'date-fns/locale';

function toDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatDate(value: Date | string | number, pattern = 'd MMMM yyyy'): string {
  const date = toDate(value);
  if (!isValid(date)) return '—';
  return format(date, pattern, { locale: ar });
}

export function formatDateTime(value: Date | string | number): string {
  return formatDate(value, 'd MMMM yyyy، h:mm a');
}

export function formatRelativeTime(value: Date | string | number): string {
  const date = toDate(value);
  if (!isValid(date)) return '—';
  return formatDistanceToNow(date, { locale: ar, addSuffix: true });
}

const currencyFormatter = new Intl.NumberFormat('ar-EG', {
  style: 'currency',
  currency: 'EGP',
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

const numberFormatter = new Intl.NumberFormat('ar-EG');

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}
