'use client';
import { JSX } from 'react';
import { clsx } from 'clsx';

const stroke = 'currentColor';

const iconMap: Record<string, JSX.Element> = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.5}>
      <rect x="3" y="3" width="7" height="9" rx="2" />
      <rect x="14" y="3" width="7" height="5" rx="2" />
      <rect x="14" y="11" width="7" height="10" rx="2" />
      <rect x="3" y="15" width="7" height="6" rx="2" />
    </svg>
  ),
  patients: (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.5}>
      <circle cx="12" cy="7" r="4" />
      <path d="M5 21c0-3.866 3.582-7 8-7s8 3.134 8 7" />
    </svg>
  ),
  appointments: (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.5}>
      <rect x="3" y="4" width="18" height="18" rx="4" />
      <path d="M7 2v4" />
      <path d="M17 2v4" />
      <path d="M3 10h18" />
      <path d="M9 16h2" />
      <path d="M13 16h2" />
    </svg>
  ),
  records: (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.5}>
      <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  ),
  charting: (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.5}>
      <path d="M4 19 9.5 9l3.5 6 4-7 3 5" />
      <path d="M4 19h16" />
    </svg>
  ),
  medications: (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.5}>
      <rect x="3" y="3" width="8" height="18" rx="4" />
      <rect x="13" y="10" width="8" height="11" rx="4" />
      <path d="M13 14h8" />
    </svg>
  ),
  labs: (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.5}>
      <path d="M10 2v6l-5.5 9a3 3 0 0 0 2.6 4.5h9.8a3 3 0 0 0 2.6-4.5L14 8V2" />
      <path d="M6 16h12" />
    </svg>
  ),
  billing: (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.5}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M7 9h10" />
      <path d="M7 13h6" />
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.5}>
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
      <path d="M3 9h3" />
      <path d="M3 13h2" />
      <path d="M18 9h3" />
      <path d="M19 13h2" />
    </svg>
  ),
  resources: (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.5}>
      <rect x="3" y="4" width="18" height="6" rx="2" />
      <rect x="3" y="14" width="18" height="6" rx="2" />
      <path d="M12 10v4" />
    </svg>
  )
};

interface Props {
  name: keyof typeof iconMap;
  className?: string;
}

export function AppIcon({ name, className }: Props) {
  return (
    <span className={clsx('app-icon', className)} aria-hidden>
      {iconMap[name] ?? iconMap.dashboard}
    </span>
  );
}
