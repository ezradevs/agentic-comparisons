'use client';
import { formatDate } from '@/lib/utils';
import type { NotificationItem } from '@/lib/types';
import { StatusBadge } from '@/components/panels/StatusBadge';

const severityIntent: Record<'info' | 'success' | 'warning' | 'critical', 'default' | 'success' | 'warning' | 'critical'> = {
  info: 'default',
  success: 'success',
  warning: 'warning',
  critical: 'critical'
};

interface Props {
  notifications: NotificationItem[];
  onClose?: () => void;
  onMarkRead?: (id: string) => void;
}

export function NotificationPanel({ notifications, onClose, onMarkRead }: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '0.75rem',
        width: '360px',
        maxHeight: '420px',
        overflow: 'auto',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        padding: '1rem',
        zIndex: 20
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontWeight: 600 }}>Notifications</span>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-subtle)',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.75rem' }}>
        {notifications.map((notification) => (
          <li
            key={notification.id}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
              background: notification.read ? 'var(--surface-muted)' : 'var(--accent-soft)',
              display: 'grid',
              gap: '0.35rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <StatusBadge intent={severityIntent[notification.severity]}>{notification.severity}</StatusBadge>
              <span style={{ fontWeight: 600 }}>{notification.title}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{notification.message}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{formatDate(notification.createdAt, 'MMM d, HH:mm')}</div>
            {onMarkRead && !notification.read ? (
              <button
                type="button"
                onClick={() => onMarkRead(notification.id)}
                style={{
                  justifySelf: 'start',
                  padding: '0.35rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--accent)',
                  background: 'transparent',
                  color: 'var(--accent)',
                  cursor: 'pointer'
                }}
              >
                Mark as read
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      {!notifications.length ? <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>All clear</div> : null}
    </div>
  );
}
