'use client';
import { clsx } from 'clsx';
import styles from './MetricCard.module.css';
import type { DashboardKpi } from '@/lib/types';

interface Props extends DashboardKpi {}

export function MetricCard({ label, value, trend, trendLabel, unit, intent = 'default' }: Props) {
  const trendPositive = trend >= 0;
  const trendClass = trendPositive ? styles.trendUp : styles.trendDown;

  return (
    <div className={clsx(styles.card, intent === 'negative' && styles.intentNegative)}>
      <div className={styles.label}>{label}</div>
      <div className={clsx(styles.value, intent === 'positive' && styles.intentPositive)}>
        {value}
        {unit ? <span style={{ fontSize: '1rem', marginLeft: '0.25rem' }}>{unit}</span> : null}
      </div>
      <div className={styles.footer}>
        <span className={clsx(styles.trend, trendClass)}>
          <span className="app-icon" style={{ width: '1rem', height: '1rem' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              {trendPositive ? <path d="M5 12l4 4 10-10" /> : <path d="M5 12l4-4 10 10" />}
            </svg>
          </span>
          {Math.abs(trend)}%
        </span>
        <span>{trendLabel}</span>
      </div>
    </div>
  );
}
