'use client';
import type { ResourceSlot } from '@/lib/types';
import { StatusBadge } from '@/components/panels/StatusBadge';
import { formatDate } from '@/lib/utils';

interface Props {
  resources: ResourceSlot[];
}

const statusIntent: Record<ResourceSlot['status'], 'default' | 'success' | 'warning' | 'critical'> = {
  available: 'success',
  'in-use': 'warning',
  maintenance: 'critical'
};

export function ResourceBoard({ resources }: Props) {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.75rem' }}>
      {resources.map((resource) => (
        <li
          key={resource.id}
          style={{
            display: 'grid',
            gap: '0.4rem',
            padding: '0.9rem 1rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 600 }}>{resource.name}</div>
            <StatusBadge intent={statusIntent[resource.status]}>{resource.status.replace('-', ' ')}</StatusBadge>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{resource.details ?? 'No details'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            Updated {formatDate(resource.updatedAt, 'MMM d, HH:mm')}
          </div>
        </li>
      ))}
    </ul>
  );
}
