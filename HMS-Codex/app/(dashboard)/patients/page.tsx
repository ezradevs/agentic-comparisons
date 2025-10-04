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
import { users } from '@/data/mockData';
import type { Patient } from '@/lib/types';

const doctorOptions = users.filter((user) => user.role === 'doctor');

type IntakeFormState = {
  firstName: string;
  lastName: string;
  dob: string;
  gender: Patient['gender'];
  phone: string;
  email: string;
  address: string;
  allergies: string;
  bloodType: string;
  insuranceProvider: string;
  policyNumber: string;
  primaryPhysicianId: string;
  chronicConditions: string;
  status: Patient['status'];
};

const initialFormState: IntakeFormState = {
  firstName: '',
  lastName: '',
  dob: '',
  gender: 'female',
  phone: '',
  email: '',
  address: '',
  allergies: '',
  bloodType: 'O+',
  insuranceProvider: '',
  policyNumber: '',
  primaryPhysicianId: doctorOptions[0]?.id ?? '',
  chronicConditions: '',
  status: 'outpatient'
};

export default function PatientsPage() {
  const { patients, registerPatient } = useSystem();
  const [query, setQuery] = useState('');
  const [formState, setFormState] = useState<IntakeFormState>(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  const filteredPatients = useMemo(
    () =>
      patients.filter((patient) => {
        const haystack = `${patient.firstName} ${patient.lastName} ${patient.identifier}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      }),
    [patients, query]
  );

  const handleChange = <K extends keyof IntakeFormState>(key: K, value: IntakeFormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    registerPatient(
      {
        ...formState,
        allergies: formState.allergies.split(',').map((entry) => entry.trim()).filter(Boolean),
        chronicConditions: formState.chronicConditions.split(',').map((entry) => entry.trim()).filter(Boolean)
      },
      doctorOptions[0]?.id ?? 'u-admin'
    );
    setFormState({ ...initialFormState, primaryPhysicianId: doctorOptions[0]?.id ?? '' });
    setSubmitting(false);
  };

  return (
    <ModulePage
      title="Patient Registry"
      subtitle="Structured onboarding, longitudinal history, consent-ready data."
      iconClassName="fa-user-injured"
      toolbar={
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search patients"
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
        <GlassPanel title="Active patients" caption={`${filteredPatients.length} individuals in care`}>
          <DataTable
            data={filteredPatients}
            columns={[
              { key: 'identifier', header: 'MRN' },
              {
                key: 'name',
                header: 'Patient',
                render: (row) => `${row.firstName} ${row.lastName}`
              },
              { key: 'status', header: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
              {
                key: 'lastVisit',
                header: 'Last seen',
                render: (row) => formatDate(row.lastVisit, 'MMM d, yyyy')
              },
              { key: 'bloodType', header: 'Blood' }
            ]}
            getRowKey={(row) => row.id}
            emptyState="No patients found"
          />
        </GlassPanel>
        <GlassPanel title="Rapid intake" caption="FHIR-aligned intake profile" actions={<span style={{ color: 'var(--text-subtle)', fontSize: '0.8rem' }}>Secure</span>}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
            <FormSection title="Patient details">
              <FormField label="First name" value={formState.firstName} onChange={(event) => handleChange('firstName', event.target.value)} required />
              <FormField label="Last name" value={formState.lastName} onChange={(event) => handleChange('lastName', event.target.value)} required />
              <FormField label="Date of birth" type="date" value={formState.dob} onChange={(event) => handleChange('dob', event.target.value)} required />
              <FormField
                label="Gender"
                as="select"
                value={formState.gender}
                onChange={(event) => handleChange('gender', event.target.value as Patient['gender'])}
                options={[
                  { label: 'Female', value: 'female' },
                  { label: 'Male', value: 'male' },
                  { label: 'Other', value: 'other' }
                ]}
              />
              <FormField label="Phone" value={formState.phone} onChange={(event) => handleChange('phone', event.target.value)} required />
              <FormField label="Email" type="email" value={formState.email} onChange={(event) => handleChange('email', event.target.value)} required />
              <FormField
                label="Address"
                value={formState.address}
                onChange={(event) => handleChange('address', event.target.value)}
                as="textarea"
                style={{ minHeight: '80px' }}
              />
            </FormSection>
            <FormSection title="Clinical profile">
              <FormField
                label="Primary physician"
                as="select"
                value={formState.primaryPhysicianId}
                onChange={(event) => handleChange('primaryPhysicianId', event.target.value)}
                options={doctorOptions.map((doctor) => ({ label: doctor.name, value: doctor.id }))}
              />
              <FormField label="Allergies" value={formState.allergies} onChange={(event) => handleChange('allergies', event.target.value)} helperText="Comma separated" />
              <FormField label="Chronic conditions" value={formState.chronicConditions} onChange={(event) => handleChange('chronicConditions', event.target.value)} helperText="Comma separated" />
              <FormField label="Blood type" value={formState.bloodType} onChange={(event) => handleChange('bloodType', event.target.value)} />
              <FormField label="Insurance" value={formState.insuranceProvider} onChange={(event) => handleChange('insuranceProvider', event.target.value)} />
              <FormField label="Policy number" value={formState.policyNumber} onChange={(event) => handleChange('policyNumber', event.target.value)} />
              <FormField
                label="Status"
                as="select"
                value={formState.status}
                onChange={(event) => handleChange('status', event.target.value as Patient['status'])}
                options={[
                  { label: 'Admitted', value: 'admitted' },
                  { label: 'Discharged', value: 'discharged' },
                  { label: 'Outpatient', value: 'outpatient' }
                ]}
              />
            </FormSection>
            <button type="submit" disabled={submitting} className="buttonPrimary" style={{ width: 'fit-content' }}>
              {submitting ? 'Registering...' : 'Register patient'}
            </button>
          </form>
        </GlassPanel>
      </section>
    </ModulePage>
  );
}
