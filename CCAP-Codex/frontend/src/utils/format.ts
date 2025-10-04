import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (value?: string | null, fallback = '—') => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return format(date, 'MMM d, yyyy');
};

export const formatDateTime = (value?: string | null, fallback = '—') => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return format(date, 'MMM d, yyyy • h:mm a');
};

export const formatRelativeTime = (value?: string | null, fallback = '—') => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return formatDistanceToNow(date, { addSuffix: true });
};
