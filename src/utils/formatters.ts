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

const CURRENCY_LABEL = 'ج.م';

/** Western digits + comma thousands separators, no decimals unless the amount actually has a
 * fractional part — `Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' })` produces
 * Arabic-Indic digits and a trailing "٫٠٠" (e.g. "٤٬٠٠٠٫٠٠ ج.م.‏"), which is the confusing format
 * this replaces. Money throughout the app should go through this single function — see the
 * `formatCurrency` usages across dashboard/donations/expenses/reports/etc. */
const wholeAmountFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const fractionalAmountFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number): string {
  const formattedAmount = Number.isInteger(amount)
    ? wholeAmountFormatter.format(amount)
    : fractionalAmountFormatter.format(amount);
  return `${formattedAmount} ${CURRENCY_LABEL}`;
}

const numberFormatter = new Intl.NumberFormat('ar-EG');

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}
