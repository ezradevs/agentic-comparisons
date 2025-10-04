'use client';
import type { AuditLogEntry } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface Props {
  entries: AuditLogEntry[];
  limit?: number;
}

export function AuditLogList({ entries, limit = 10 }: Props) {
  const visible = entries.slice(0, limit);
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.75rem' }}>
      {visible.map((entry) => (
        <li
          key={entry.id}
          style={{
            display: 'grid',
            gap: '0.35rem',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            background: entry.critical ? '#fef2f2' : 'var(--surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>{entry.action}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{formatDate(entry.timestamp)}</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{entry.actorName}</div>
          {entry.context ? (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
              {Object.entries(entry.context)
                .map(([key, value]) => `${key}: ${value}`)
                .join(' | ')}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
