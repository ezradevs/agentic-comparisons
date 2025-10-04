'use client';
import type { TimelineEvent } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface Props {
  events: TimelineEvent[];
}

const intentColor: Record<TimelineEvent['intent'], string> = {
  default: 'rgba(56, 189, 248, 0.4)',
  positive: 'rgba(34, 197, 94, 0.5)',
  warning: 'rgba(251, 191, 36, 0.65)',
  critical: 'rgba(248, 113, 113, 0.75)'
};

export function TimelineList({ events }: Props) {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '1rem' }}>
      {events.map((event) => (
        <li
          key={event.id}
          style={{
            display: 'grid',
            gap: '0.35rem',
            padding: '0.75rem 0.9rem',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: intentColor[event.intent]
              }}
            />
            <span style={{ fontWeight: 600 }}>{event.title}</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
              {formatDate(event.timestamp, 'MMM d, HH:mm')}
            </span>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{event.description}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>{event.actor}</div>
        </li>
      ))}
    </ul>
  );
}
