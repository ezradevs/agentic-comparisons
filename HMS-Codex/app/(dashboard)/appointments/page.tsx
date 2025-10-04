'use client';
import { useMemo, useState } from 'react';
import { ModulePage } from '@/layouts/ModulePage';
import useSystem from '@/hooks/useSystem';
import { GlassPanel } from '@/components/panels/GlassPanel';
import { DataTable } from '@/components/tables/DataTable';
import { FormField } from '@/components/forms/FormField';
import { FormSection } from '@/components/forms/FormSection';
import { StatusBadge } from '@/components/panels/StatusBadge';
import { ScheduleTimeline } from '@/components/panels/ScheduleTimeline';
import { formatDate } from '@/lib/utils';
import { users } from '@/data/mockData';

const providerOptions = users.filter((user) => user.role === 'doctor');

export default function AppointmentsPage() {
  const { appointments, patients, createAppointment, updateAppointmentStatus, schedule } = useSystem();
  const [query, setQuery] = useState('');
  const [formState, setFormState] = useState({
    patientId: patients[0]?.id ?? '',
    providerId: providerOptions[0]?.id ?? '',
    department: 'Cardiology',
    reason: 'Consult',
    startTime: '',
    endTime: '',
    location: 'Building A',
    notes: ''
  });

  const filteredAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        const haystack = `${appointment.reason} ${appointment.department} ${appointment.patientId}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      }),
    [appointments, query]
  );

  const handleChange = (key: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createAppointment(
      {
        ...formState,
        status: 'scheduled'
      },
      formState.providerId
    );
    setFormState({
      patientId: patients[0]?.id ?? '',
      providerId: providerOptions[0]?.id ?? '',
      department: 'Cardiology',
      reason: 'Consult',
      startTime: '',
      endTime: '',
      location: 'Building A',
      notes: ''
    });
  };

  return (
    <ModulePage
      title="Scheduling & Throughput"
      subtitle="Resource-aware scheduling with real-time status coordination."
      iconClassName="fa-calendar-check"
      toolbar={
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter appointments"
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
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: '1.5rem' }}>
        <GlassPanel title="Agenda">
          <DataTable
            data={filteredAppointments}
            columns={[
              {
                key: 'patient',
                header: 'Patient',
                render: (row) => patients.find((patient) => patient.id === row.patientId)?.firstName ?? row.patientId
              },
              { key: 'department', header: 'Department' },
              {
                key: 'start',
                header: 'When',
                render: (row) => `${formatDate(row.startTime, 'MMM d, HH:mm')} - ${formatDate(row.endTime, 'HH:mm')}`
              },
              {
                key: 'status',
                header: 'Status',
                render: (row) => <StatusBadge intent={row.status === 'completed' ? 'success' : 'warning'}>{row.status}</StatusBadge>
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (row) => (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => updateAppointmentStatus(row.id, 'in-progress', row.providerId)}
                      className="buttonSecondary"
                    >
                      Start
                    </button>
                    <button
                      type="button"
                      onClick={() => updateAppointmentStatus(row.id, 'completed', row.providerId)}
                      className="buttonPrimary"
                    >
                      Complete
                    </button>
                  </div>
                )
              }
            ]}
            getRowKey={(row) => row.id}
            emptyState="No appointments"
          />
        </GlassPanel>
        <GlassPanel title="Schedule matrix" caption="Synced cross-team commitments">
          <ScheduleTimeline blocks={schedule.slice(0, 6)} />
        </GlassPanel>
      </section>

      <GlassPanel title="Create appointment" caption="Smart defaults reduce clicks">
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
          <FormSection>
            <FormField
              label="Patient"
              as="select"
              value={formState.patientId}
              onChange={(event) => handleChange('patientId', event.target.value)}
              options={patients.map((patient) => ({ label: `${patient.firstName} ${patient.lastName}`, value: patient.id }))}
            />
            <FormField
              label="Provider"
              as="select"
              value={formState.providerId}
              onChange={(event) => handleChange('providerId', event.target.value)}
              options={providerOptions.map((provider) => ({ label: provider.name, value: provider.id }))}
            />
            <FormField label="Department" value={formState.department} onChange={(event) => handleChange('department', event.target.value)} />
            <FormField label="Reason" value={formState.reason} onChange={(event) => handleChange('reason', event.target.value)} />
            <FormField label="Start" type="datetime-local" value={formState.startTime} onChange={(event) => handleChange('startTime', event.target.value)} required />
            <FormField label="End" type="datetime-local" value={formState.endTime} onChange={(event) => handleChange('endTime', event.target.value)} required />
            <FormField label="Location" value={formState.location} onChange={(event) => handleChange('location', event.target.value)} />
            <FormField
              label="Notes"
              as="textarea"
              value={formState.notes}
              onChange={(event) => handleChange('notes', event.target.value)}
              style={{ minHeight: '80px' }}
            />
          </FormSection>
          <button type="submit" className="buttonPrimary" style={{ width: 'fit-content' }}>
            Schedule appointment
          </button>
        </form>
      </GlassPanel>
    </ModulePage>
  );
}
