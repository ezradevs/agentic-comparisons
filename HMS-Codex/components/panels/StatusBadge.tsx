'use client';
import { clsx } from 'clsx';
import styles from './StatusBadge.module.css';

type Intent = 'default' | 'success' | 'warning' | 'critical';

interface Props {
  intent?: Intent;
  children: React.ReactNode;
}

export function StatusBadge({ intent = 'default', children }: Props) {
  return <span className={clsx(styles.badge, styles[intent])}>{children}</span>;
}
