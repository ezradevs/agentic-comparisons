'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { clsx } from 'clsx';
import styles from './TopBar.module.css';
import useSystem from '@/hooks/useSystem';
import useAuth from '@/hooks/useAuth';
import { NotificationPanel } from '@/components/navigation/NotificationPanel';

interface Props {
  onCreate?: () => void;
  toolbar?: React.ReactNode;
}

export function TopBar({ onCreate, toolbar }: Props) {
  const { notifications, markNotificationRead } = useSystem();
  const { user } = useAuth();

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);
  const [open, setOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!notificationRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={clsx(styles.topBar)}>
      <div className={styles.left}>
        <div className={styles.searchField}>
          <span className="app-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <circle cx="11" cy="11" r="6" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input placeholder="Search patients, orders, activity" aria-label="Global search" />
        </div>
        {toolbar ?? null}
      </div>
      <div className={styles.right}>
        {onCreate ? (
          <button type="button" className={styles.quickButton} onClick={onCreate}>
            + Quick action
          </button>
        ) : null}
        <div style={{ position: 'relative' }} ref={notificationRef}>
          <button
            type="button"
            className={styles.notification}
            aria-label="Notifications"
            onClick={() => setOpen((prev) => !prev)}
          >
            <span className="app-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M6 9a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </span>
            {unreadCount ? <span className={styles.notificationBadge}>{unreadCount}</span> : null}
          </button>
          {open ? (
            <NotificationPanel
              notifications={notifications}
              onClose={() => setOpen(false)}
              onMarkRead={(id) => {
                markNotificationRead(id, user?.id);
              }}
            />
          ) : null}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Welcome back</div>
          <div style={{ fontWeight: 600 }}>{user?.name ?? 'Guest user'}</div>
        </div>
        <div className={styles.avatar}>{user?.avatarInitials ?? 'GX'}</div>
      </div>
    </div>
  );
}
