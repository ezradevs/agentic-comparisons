import { format, parseISO } from 'date-fns';
import type { AuditLogEntry, ExportPayload } from './types';

export function formatDate(date: string, pattern = 'MMM d, yyyy p') {
  try {
    return format(parseISO(date), pattern);
  } catch (error) {
    return date;
  }
}

export function formatCurrency(amount: number, locale = 'en-US', currency = 'USD') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount);
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function createCsvPayload(payload: ExportPayload) {
  const rows = [payload.columns.join(','), ...payload.rows.map((row) => row.join(','))];
  return rows.join('\n');
}

export function mapAuditSummary(logs: AuditLogEntry[]) {
  const grouped = logs.reduce<Record<string, number>>((acc, log) => {
    acc[log.category] = (acc[log.category] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(grouped).map(([category, count]) => ({ category, count }));
}

export function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
