import dayjs from 'dayjs';

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value || 0);

export const formatDate = (value: string) => dayjs(value).format('MMM D, YYYY');
