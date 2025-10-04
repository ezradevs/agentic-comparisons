'use client';
import { useMemo, useState } from 'react';
import { ModulePage } from '@/layouts/ModulePage';
import useSystem from '@/hooks/useSystem';
import { GlassPanel } from '@/components/panels/GlassPanel';
import { DataTable } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/panels/StatusBadge';
import { MiniTrend } from '@/components/charts/MiniTrend';
import { formatDate } from '@/lib/utils';

export default function LabsPage() {
  const { labs, patients, acknowledgeLabResult } = useSystem();
  const [query, setQuery] = useState('');

  const filteredLabs = useMemo(
    () =>
      labs.filter((order) => {
        const haystack = `${order.testName} ${order.patientId}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      }),
    [labs, query]
  );

  const criticalTrend = useMemo(() => labs.map((order) => (order.status === 'critical' ? 1 : 0)), [labs]);

  return (
    <ModulePage
      title="Laboratory Hub"
      subtitle="Specimen tracking, critical results, and provider acknowledgment."
      iconClassName="fa-flask"
      toolbar={
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search labs"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            padding: '0.55rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text)',
            boxShadow: 'var(--shadow-sm)'
          }}
        />
      }
    >
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <GlassPanel title="Critical alerts" caption="Flagged results in last 24h">
          <MiniTrend data={criticalTrend} color="#f87171" />
        </GlassPanel>
        <GlassPanel title="Turnaround" caption="Expected ready times">
          <MiniTrend data={labs.map(() => Math.random() * 60 + 20)} color="#38bdf8" />
        </GlassPanel>
      </section>

      <GlassPanel title="Lab orders" caption="Chain of custody">
        <DataTable
          data={filteredLabs}
          columns={[
            {
              key: 'testName',
              header: 'Test'
            },
            {
              key: 'patient',
              header: 'Patient',
              render: (row) => patients.find((patient) => patient.id === row.patientId)?.firstName ?? row.patientId
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) => <StatusBadge intent={row.status === 'critical' ? 'critical' : row.status === 'completed' ? 'success' : 'warning'}>{row.status}</StatusBadge>
            },
            {
              key: 'orderedAt',
              header: 'Ordered',
              render: (row) => formatDate(row.orderedAt, 'MMM d, HH:mm')
            },
            {
              key: 'expectedAt',
              header: 'Expected',
              render: (row) => formatDate(row.expectedAt, 'MMM d, HH:mm')
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (row) => (
                <button
                  type="button"
                  onClick={() => acknowledgeLabResult(row.id, row.orderedById)}
                  className="buttonPrimary"
                >
                  Acknowledge
                </button>
              )
            }
          ]}
          getRowKey={(row) => row.id}
          emptyState="No labs"
        />
      </GlassPanel>
    </ModulePage>
  );
}
