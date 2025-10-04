'use client';
import { useMemo, useState } from 'react';
import { ModulePage } from '@/layouts/ModulePage';
import useSystem from '@/hooks/useSystem';
import { GlassPanel } from '@/components/panels/GlassPanel';
import { DataTable } from '@/components/tables/DataTable';
import { FormField } from '@/components/forms/FormField';
import { FormSection } from '@/components/forms/FormSection';
import { StatusBadge } from '@/components/panels/StatusBadge';
import { formatDate } from '@/lib/utils';

export default function MedicationsPage() {
  const { medications, patients, createMedicationOrder, recordMedicationDispense } = useSystem();
  const [query, setQuery] = useState('');
  const [formState, setFormState] = useState({
    patientId: patients[0]?.id ?? '',
    prescribedById: 'u-doc-1',
    drugName: '',
    dosage: '',
    route: 'PO',
    frequency: '',
    startDate: '',
    endDate: '',
    refillsRemaining: '0'
  });

  const filteredMedications = useMemo(
    () =>
      medications.filter((order) => {
        const haystack = `${order.drugName} ${order.patientId}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      }),
    [medications, query]
  );

  const handleChange = (key: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMedicationOrder(
      {
        patientId: formState.patientId,
        prescribedById: formState.prescribedById,
        drugName: formState.drugName,
        dosage: formState.dosage,
        route: formState.route,
        frequency: formState.frequency,
        startDate: formState.startDate,
        endDate: formState.endDate || undefined,
        refillsRemaining: Number(formState.refillsRemaining)
      },
      formState.prescribedById
    );
    setFormState({
      patientId: patients[0]?.id ?? '',
      prescribedById: 'u-doc-1',
      drugName: '',
      dosage: '',
      route: 'PO',
      frequency: '',
      startDate: '',
      endDate: '',
      refillsRemaining: '0'
    });
  };

  return (
    <ModulePage
      title="Medication Management"
      subtitle="Closed-loop med safety with refill tracking and dispense logs."
      iconClassName="fa-pills"
      toolbar={
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search pharmacotherapy"
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
        <GlassPanel title="Active orders">
          <DataTable
            data={filteredMedications}
            columns={[
              {
                key: 'drug',
                header: 'Medication',
                render: (row) => `${row.drugName} ${row.dosage}`
              },
              {
                key: 'patient',
                header: 'Patient',
                render: (row) => patients.find((patient) => patient.id === row.patientId)?.firstName ?? row.patientId
              },
              { key: 'route', header: 'Route' },
              { key: 'frequency', header: 'Frequency' },
              {
                key: 'status',
                header: 'Status',
                render: (row) => <StatusBadge intent={row.status === 'active' ? 'success' : 'warning'}>{row.status}</StatusBadge>
              },
              {
                key: 'lastDispensed',
                header: 'Last dispensed',
                render: (row) => (row.lastDispensed ? formatDate(row.lastDispensed, 'MMM d, HH:mm') : 'N/A')
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (row) => (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => recordMedicationDispense(row.id, 'completed', row.prescribedById)}
                      className="buttonPrimary"
                    >
                      Mark dispensed
                    </button>
                    <button
                      type="button"
                      onClick={() => recordMedicationDispense(row.id, 'on-hold', row.prescribedById)}
                      className="buttonDanger"
                    >
                      Hold
                    </button>
                  </div>
                )
              }
            ]}
            getRowKey={(row) => row.id}
            emptyState="No medication orders"
          />
        </GlassPanel>
        <GlassPanel title="Prescribe" caption="Clinical decision support ready">
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
            <FormSection>
              <FormField
                label="Patient"
                as="select"
                value={formState.patientId}
                onChange={(event) => handleChange('patientId', event.target.value)}
                options={patients.map((patient) => ({ label: `${patient.firstName} ${patient.lastName}`, value: patient.id }))}
              />
              <FormField label="Medication" value={formState.drugName} onChange={(event) => handleChange('drugName', event.target.value)} required />
              <FormField label="Dosage" value={formState.dosage} onChange={(event) => handleChange('dosage', event.target.value)} required />
              <FormField label="Route" value={formState.route} onChange={(event) => handleChange('route', event.target.value)} />
              <FormField label="Frequency" value={formState.frequency} onChange={(event) => handleChange('frequency', event.target.value)} />
              <FormField label="Start" type="datetime-local" value={formState.startDate} onChange={(event) => handleChange('startDate', event.target.value)} required />
              <FormField label="End" type="datetime-local" value={formState.endDate} onChange={(event) => handleChange('endDate', event.target.value)} />
              <FormField
                label="Refills"
                value={formState.refillsRemaining}
                onChange={(event) => handleChange('refillsRemaining', event.target.value)}
              />
            </FormSection>
            <button type="submit" className="buttonPrimary" style={{ width: 'fit-content' }}>
              Create order
            </button>
          </form>
        </GlassPanel>
      </section>
    </ModulePage>
  );
}
