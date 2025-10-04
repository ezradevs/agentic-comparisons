'use client';
import { useMemo } from 'react';
import { ModulePage } from '@/layouts/ModulePage';
import useSystem from '@/hooks/useSystem';
import { GlassPanel } from '@/components/panels/GlassPanel';
import { MiniTrend } from '@/components/charts/MiniTrend';
import { DataTable } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/panels/StatusBadge';
import { TimelineList } from '@/components/panels/TimelineList';
import { formatDate } from '@/lib/utils';
import { encounterNotes } from '@/data/mockData';

export default function ChartingPage() {
  const { records, patients } = useSystem();

  const lastRecords = useMemo(() => records.slice(0, 12), [records]);
  const vitalsTrend = useMemo(() => lastRecords.map((record) => record.vitals.heartRate), [lastRecords]);

  return (
    <ModulePage title="Clinical Charting" subtitle="Real-time documentation, vitals tracking, and bedside collaboration." iconClassName="fa-heart-pulse">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <GlassPanel title="Heart rate trend" caption="Last 12 entries">
          <MiniTrend data={vitalsTrend} />
        </GlassPanel>
        <GlassPanel title="Blood pressure" caption="Systolic / Diastolic">
          <MiniTrend data={lastRecords.map((record) => Number(record.vitals.bloodPressure.split('/')[0]))} color="#a855f7" />
        </GlassPanel>
        <GlassPanel title="Temperature" caption="Fahrenheit">
          <MiniTrend data={lastRecords.map((record) => record.vitals.temperature)} color="#f97316" />
        </GlassPanel>
        <GlassPanel title="Oxygen saturation" caption="Percent">
          <MiniTrend data={lastRecords.map((record) => record.vitals.oxygenSaturation)} color="#22c55e" />
        </GlassPanel>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: '1.5rem', alignItems: 'start' }}>
        <GlassPanel title="Recent chart entries">
          <DataTable
            data={lastRecords}
            columns={[
              {
                key: 'patient',
                header: 'Patient',
                render: (row) => {
                  const patient = patients.find((entry) => entry.id === row.patientId);
                  return patient ? `${patient.firstName} ${patient.lastName}` : row.patientId;
                }
              },
              { key: 'encounterType', header: 'Encounter' },
              { key: 'encounterDate', header: 'Documented', render: (row) => formatDate(row.encounterDate, 'MMM d, HH:mm') },
              {
                key: 'vitals',
                header: 'Vitals',
                render: (row) => `${row.vitals.heartRate} bpm / ${row.vitals.bloodPressure}`
              }
            ]}
            getRowKey={(row) => row.id}
            emptyState="No chart entries"
          />
        </GlassPanel>
        <GlassPanel title="Care timeline" caption="High-signal updates">
          <TimelineList events={encounterNotes.slice(0, 5)} />
        </GlassPanel>
      </section>

      <GlassPanel title="Clinical guidance" caption="Evidence-based pathways">
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {[
            {
              title: 'Atrial fibrillation bundle',
              detail: 'Follow telemetry, anticoagulation, and lab cadence protocol.'
            },
            {
              title: 'Sepsis surveillance',
              detail: 'Track qSOFA score, escalate to rapid response if trending up.'
            },
            {
              title: 'Discharge readiness',
              detail: 'Ensure meds reconciled, follow-up scheduled, patient education documented.'
            }
          ].map((item) => (
            <div
              key={item.title}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{item.title}</span>
                <StatusBadge intent="success">In guidelines</StatusBadge>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.detail}</div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </ModulePage>
  );
}
