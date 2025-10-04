'use client';
import { useMemo, useState } from 'react';
import { ModulePage } from '@/layouts/ModulePage';
import useSystem from '@/hooks/useSystem';
import { GlassPanel } from '@/components/panels/GlassPanel';
import { DataTable } from '@/components/tables/DataTable';
import { FormField } from '@/components/forms/FormField';
import { FormSection } from '@/components/forms/FormSection';
import { StatusBadge } from '@/components/panels/StatusBadge';
import { TimelineList } from '@/components/panels/TimelineList';
import { formatDate } from '@/lib/utils';
import { encounterNotes } from '@/data/mockData';

export default function RecordsPage() {
  const { patients, records, appendRecord } = useSystem();
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id ?? '');
  const [formState, setFormState] = useState({
    encounterType: 'Progress note',
    diagnoses: '',
    orders: '',
    notes: '',
    heartRate: '72',
    bloodPressure: '120/80',
    temperature: '98.6',
    oxygenSaturation: '98'
  });

  const patientRecords = useMemo(() => records.filter((record) => record.patientId === selectedPatientId), [records, selectedPatientId]);

  const handleChange = (key: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPatientId) return;
    appendRecord(
      {
        patientId: selectedPatientId,
        encounterDate: new Date().toISOString(),
        encounterType: formState.encounterType,
        clinicianId: 'u-doc-1',
        vitals: {
          heartRate: Number(formState.heartRate),
          bloodPressure: formState.bloodPressure,
          temperature: Number(formState.temperature),
          oxygenSaturation: Number(formState.oxygenSaturation)
        },
        diagnoses: formState.diagnoses.split(',').map((entry) => entry.trim()).filter(Boolean),
        orders: formState.orders.split(',').map((entry) => entry.trim()).filter(Boolean),
        notes: formState.notes
      },
      'u-doc-1'
    );
    setFormState({
      encounterType: 'Progress note',
      diagnoses: '',
      orders: '',
      notes: '',
      heartRate: '72',
      bloodPressure: '120/80',
      temperature: '98.6',
      oxygenSaturation: '98'
    });
  };

  return (
    <ModulePage
      title="Clinical Records"
      subtitle="Structured charting with timeline intelligence and vitals context."
      iconClassName="fa-clipboard-list"
      toolbar={
        <select
          value={selectedPatientId}
          onChange={(event) => setSelectedPatientId(event.target.value)}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            padding: '0.55rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.firstName} {patient.lastName}
            </option>
          ))}
        </select>
      }
    >
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: '1.5rem', alignItems: 'start' }}>
        <GlassPanel title="Encounters" caption="Every touch documented" actions={<StatusBadge>{patientRecords.length} records</StatusBadge>}>
          <DataTable
            data={patientRecords}
            columns={[
              { key: 'encounterType', header: 'Type' },
              { key: 'encounterDate', header: 'Date', render: (row) => formatDate(row.encounterDate, 'MMM d, yyyy HH:mm') },
              {
                key: 'diagnoses',
                header: 'Diagnoses',
                render: (row) => row.diagnoses.join(', ')
              },
              {
                key: 'orders',
                header: 'Orders',
                render: (row) => row.orders.join(', ')
              }
            ]}
            getRowKey={(row) => row.id}
            emptyState="No encounters recorded"
          />
        </GlassPanel>
        <GlassPanel title="Clinical timeline" caption="Recent chart entries">
          <TimelineList events={encounterNotes.slice(0, 6)} />
        </GlassPanel>
      </section>

      <GlassPanel title="Add note" caption="Inline charting with vitals context">
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
          <FormSection>
            <FormField label="Encounter type" value={formState.encounterType} onChange={(event) => handleChange('encounterType', event.target.value)} />
            <FormField label="Diagnoses" value={formState.diagnoses} onChange={(event) => handleChange('diagnoses', event.target.value)} helperText="Comma separated" />
            <FormField label="Orders" value={formState.orders} onChange={(event) => handleChange('orders', event.target.value)} helperText="Comma separated" />
            <FormField
              label="Clinical note"
              as="textarea"
              value={formState.notes}
              onChange={(event) => handleChange('notes', event.target.value)}
              style={{ minHeight: '120px' }}
            />
          </FormSection>
          <FormSection title="Vitals">
            <FormField label="Heart rate" value={formState.heartRate} onChange={(event) => handleChange('heartRate', event.target.value)} />
            <FormField label="Blood pressure" value={formState.bloodPressure} onChange={(event) => handleChange('bloodPressure', event.target.value)} />
            <FormField label="Temperature" value={formState.temperature} onChange={(event) => handleChange('temperature', event.target.value)} />
            <FormField label="Oxygen saturation" value={formState.oxygenSaturation} onChange={(event) => handleChange('oxygenSaturation', event.target.value)} />
          </FormSection>
          <button type="submit" className="buttonPrimary" style={{ width: 'fit-content' }}>
            Save encounter
          </button>
        </form>
      </GlassPanel>
    </ModulePage>
  );
}
