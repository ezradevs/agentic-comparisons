'use client';
import { useMemo } from 'react';
import { ModulePage } from '@/layouts/ModulePage';
import useSystem from '@/hooks/useSystem';
import { MetricCard } from '@/components/panels/MetricCard';
import { GlassPanel } from '@/components/panels/GlassPanel';
import { DataTable } from '@/components/tables/DataTable';
import { TimelineList } from '@/components/panels/TimelineList';
import { ResourceBoard } from '@/components/panels/ResourceBoard';
import { StatusBadge } from '@/components/panels/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { encounterNotes } from '@/data/mockData';

export default function DashboardPage() {
  const { kpis, appointments, notifications, resources, invoices, auditLog } = useSystem();

  const upcoming = useMemo(
    () => appointments.filter((item) => ['scheduled', 'checked-in', 'in-progress'].includes(item.status)).slice(0, 6),
    [appointments]
  );
  const revenue = useMemo(() => invoices.reduce((total, invoice) => total + invoice.amount, 0), [invoices]);

  return (
    <ModulePage
      title="Executive Command Center"
      subtitle="Operational awareness, throughput, and safety at a glance."
      iconClassName="fa-chart-pie"
      onQuickAction={() => {
        console.info('Quick action triggered');
      }}
      actions={<StatusBadge intent={notifications.length ? 'warning' : 'success'}>{notifications.length} alerts</StatusBadge>}
    >
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem' }}>
        {kpis.map((metric) => (
          <MetricCard key={metric.id} {...metric} />
        ))}
        <MetricCard id="kpi-revenue" label="Revenue Captured" value={formatCurrency(revenue)} trend={3.4} trendLabel="Last 30 days" intent="positive" />
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        <GlassPanel title="Care Pathways" caption="Upcoming arrivals, status changes, cross-cover needs">
          <DataTable
            data={upcoming}
            columns={[
              {
                key: 'patient',
                header: 'Patient',
                render: (row) => row.patientId
              },
              {
                key: 'department',
                header: 'Department'
              },
              {
                key: 'reason',
                header: 'Reason'
              },
              {
                key: 'start',
                header: 'Start',
                render: (row) => formatDate(row.startTime, 'MMM d, HH:mm')
              },
              {
                key: 'status',
                header: 'Status',
                render: (row) => (
                  <StatusBadge intent={row.status === 'cancelled' ? 'critical' : row.status === 'completed' ? 'success' : 'warning'}>
                    {row.status}
                  </StatusBadge>
                )
              }
            ]}
            getRowKey={(row) => row.id}
            emptyState="No appointments scheduled."
          />
        </GlassPanel>

        <GlassPanel title="Critical Signals" caption="Live clinical events">
          <TimelineList events={encounterNotes} />
        </GlassPanel>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: '1.5rem', alignItems: 'start' }}>
        <GlassPanel title="Operational Resources" caption="Capacity, rooms, and staff readiness">
          <ResourceBoard resources={resources} />
        </GlassPanel>
        <GlassPanel title="Recent Audit Trail" caption="Regulatory-grade event ledger">
          <div style={{ maxHeight: '360px', overflow: 'auto' }}>
            <DataTable
              data={auditLog.slice(0, 8)}
              columns={[
                { key: 'timestamp', header: 'When', render: (row) => formatDate(row.timestamp, 'MMM d, HH:mm') },
                { key: 'actorName', header: 'Actor' },
                { key: 'action', header: 'Action' }
              ]}
              getRowKey={(row) => row.id}
              emptyState="No audit events."
            />
          </div>
        </GlassPanel>
      </section>
    </ModulePage>
  );
}
