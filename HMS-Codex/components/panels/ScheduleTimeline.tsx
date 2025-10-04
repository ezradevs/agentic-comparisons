'use client';
import type { ScheduleBlock } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/panels/StatusBadge';

const categoryIntent: Record<ScheduleBlock['category'], 'default' | 'success' | 'warning'> = {
  appointment: 'default',
  procedure: 'warning',
  meeting: 'success'
};

interface Props {
  blocks: ScheduleBlock[];
}

export function ScheduleTimeline({ blocks }: Props) {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.75rem' }}>
      {blocks.map((block) => (
        <li
          key={block.id}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            display: 'grid',
            gap: '0.35rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontWeight: 600 }}>{block.title}</span>
            <StatusBadge intent={categoryIntent[block.category]}>{block.category}</StatusBadge>
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
              {formatDate(block.start, 'MMM d, HH:mm')} - {formatDate(block.end, 'HH:mm')}
            </span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{block.ownerName}</div>
        </li>
      ))}
    </ul>
  );
}
