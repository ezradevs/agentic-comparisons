import type {
  Appointment,
  AuditLogEntry,
  DashboardKpi,
  DepartmentSummary,
  Invoice,
  LabOrder,
  MedicalRecord,
  MedicationOrder,
  NotificationItem,
  Patient,
  ResourceSlot,
  ScheduleBlock,
  TimelineEvent,
  User
} from '@/lib/types';

export const users: User[] = [
  {
    id: 'u-admin',
    name: 'Amelia Chen',
    email: 'amelia.chen@codexhms.org',
    role: 'administrator',
    department: 'Operations',
    avatarInitials: 'AC'
  },
  {
    id: 'u-doc-1',
    name: 'Dr. Samuel Leclerc',
    email: 'samuel.leclerc@codexhms.org',
    role: 'doctor',
    department: 'Cardiology',
    avatarInitials: 'SL'
  },
  {
    id: 'u-nurse-1',
    name: 'Nurse Priya Patel',
    email: 'priya.patel@codexhms.org',
    role: 'nurse',
    department: 'ICU',
    avatarInitials: 'PP'
  },
  {
    id: 'u-patient-1',
    name: 'Jordan Miles',
    email: 'jordan.miles@patientmail.com',
    role: 'patient',
    avatarInitials: 'JM'
  }
];

export const patients: Patient[] = [
  {
    id: 'p-001',
    identifier: 'HMS-2048',
    firstName: 'Jordan',
    lastName: 'Miles',
    dob: '1988-03-22',
    gender: 'male',
    phone: '555-112-2048',
    email: 'jordan.miles@patientmail.com',
    address: '482 Cedar Lane, Portland, OR',
    status: 'outpatient',
    allergies: ['Penicillin'],
    bloodType: 'O+',
    insuranceProvider: 'Trident Health',
    policyNumber: 'TRI-8839201',
    primaryPhysicianId: 'u-doc-1',
    chronicConditions: ['Hypertension'],
    lastVisit: '2024-02-01T10:30:00Z',
    nextAppointmentId: 'a-002'
  },
  {
    id: 'p-002',
    identifier: 'HMS-2051',
    firstName: 'Lee',
    lastName: 'Tanaka',
    dob: '1971-11-09',
    gender: 'female',
    phone: '555-775-9834',
    email: 'lee.tanaka@patientmail.com',
    address: '77 West Elm, Seattle, WA',
    status: 'admitted',
    allergies: ['Latex'],
    bloodType: 'A-',
    insuranceProvider: 'SummitCare',
    policyNumber: 'SUM-4822211',
    primaryPhysicianId: 'u-doc-1',
    chronicConditions: ['Type 2 Diabetes'],
    lastVisit: '2024-02-14T13:15:00Z'
  }
];

export const appointments: Appointment[] = [
  {
    id: 'a-001',
    patientId: 'p-002',
    providerId: 'u-doc-1',
    department: 'Cardiology',
    reason: 'Telemetry review',
    status: 'in-progress',
    startTime: '2024-02-18T16:00:00Z',
    endTime: '2024-02-18T16:45:00Z',
    location: 'Building A, Room 310',
    notes: 'Monitor arrhythmia episodes'
  },
  {
    id: 'a-002',
    patientId: 'p-001',
    providerId: 'u-doc-1',
    department: 'Cardiology',
    reason: 'Follow-up consult',
    status: 'scheduled',
    startTime: '2024-02-21T15:30:00Z',
    endTime: '2024-02-21T16:00:00Z',
    location: 'Building A, Room 204',
    notes: 'Review blood pressure trends'
  }
];

export const records: MedicalRecord[] = [
  {
    id: 'r-001',
    patientId: 'p-002',
    encounterDate: '2024-02-18T16:00:00Z',
    encounterType: 'Inpatient rounding',
    clinicianId: 'u-doc-1',
    vitals: {
      heartRate: 86,
      bloodPressure: '132/86',
      temperature: 99.1,
      oxygenSaturation: 96
    },
    diagnoses: ['Atrial fibrillation'],
    orders: ['Echocardiogram', 'CBC'],
    notes: 'Patient stable, review anticoagulation plan.',
    followUp: 'Daily telemetry review'
  },
  {
    id: 'r-002',
    patientId: 'p-001',
    encounterDate: '2024-01-12T09:00:00Z',
    encounterType: 'Clinic visit',
    clinicianId: 'u-doc-1',
    vitals: {
      heartRate: 72,
      bloodPressure: '124/78',
      temperature: 98.4,
      oxygenSaturation: 98
    },
    diagnoses: ['Hypertension'],
    orders: ['CMP'],
    notes: 'Continue ACE inhibitor, follow up in 6 weeks.'
  }
];

export const encounterNotes: TimelineEvent[] = [
  {
    id: 't-001',
    icon: 'stethoscope',
    title: 'Physician rounding note',
    description: 'Medication adjustments submitted for review.',
    timestamp: '2024-02-18T16:20:00Z',
    actor: 'Dr. Samuel Leclerc',
    intent: 'default'
  },
  {
    id: 't-002',
    icon: 'flask',
    title: 'Critical lab flagged',
    description: 'Potassium level trending high, notify provider.',
    timestamp: '2024-02-18T14:55:00Z',
    actor: 'Lab automation',
    intent: 'critical'
  }
];

export const medications: MedicationOrder[] = [
  {
    id: 'm-001',
    patientId: 'p-002',
    prescribedById: 'u-doc-1',
    drugName: 'Heparin',
    dosage: '5000 units',
    route: 'IV',
    frequency: 'q8h',
    startDate: '2024-02-17T08:00:00Z',
    status: 'active',
    refillsRemaining: 0,
    lastDispensed: '2024-02-18T00:00:00Z'
  },
  {
    id: 'm-002',
    patientId: 'p-001',
    prescribedById: 'u-doc-1',
    drugName: 'Lisinopril',
    dosage: '10 mg',
    route: 'PO',
    frequency: 'daily',
    startDate: '2023-12-01T08:00:00Z',
    status: 'active',
    refillsRemaining: 3,
    lastDispensed: '2024-01-31T08:00:00Z'
  }
];

export const labs: LabOrder[] = [
  {
    id: 'l-001',
    patientId: 'p-002',
    orderedById: 'u-doc-1',
    testName: 'Basic Metabolic Panel',
    status: 'critical',
    orderedAt: '2024-02-18T14:40:00Z',
    expectedAt: '2024-02-18T15:10:00Z',
    resultValue: 'Potassium 5.9 mmol/L',
    resultFlag: 'critical',
    comments: 'Notify physician immediately.'
  },
  {
    id: 'l-002',
    patientId: 'p-001',
    orderedById: 'u-doc-1',
    testName: 'Comprehensive Panel',
    status: 'in-progress',
    orderedAt: '2024-02-15T09:10:00Z',
    expectedAt: '2024-02-15T12:00:00Z'
  }
];

export const invoices: Invoice[] = [
  {
    id: 'inv-001',
    patientId: 'p-002',
    serviceDate: '2024-02-18T00:00:00Z',
    amount: 1835.5,
    status: 'sent',
    payer: 'SummitCare',
    insuranceCoverage: 1250,
    patientResponsibility: 585.5,
    notes: 'Awaiting payer remittance.'
  },
  {
    id: 'inv-002',
    patientId: 'p-001',
    serviceDate: '2024-01-12T00:00:00Z',
    amount: 245.0,
    status: 'paid',
    payer: 'Trident Health',
    insuranceCoverage: 200,
    patientResponsibility: 45,
    lastPaymentDate: '2024-01-20T00:00:00Z'
  }
];

export const resources: ResourceSlot[] = [
  {
    id: 'res-001',
    name: 'Cath Lab 1',
    type: 'room',
    status: 'in-use',
    updatedAt: '2024-02-18T15:35:00Z',
    details: 'Procedure in progress'
  },
  {
    id: 'res-002',
    name: 'Telemetry Cart 3',
    type: 'device',
    status: 'available',
    updatedAt: '2024-02-18T14:00:00Z'
  },
  {
    id: 'res-003',
    name: 'Rapid Response Team',
    type: 'staff',
    status: 'available',
    updatedAt: '2024-02-18T13:25:00Z'
  }
];

export const auditLog: AuditLogEntry[] = [
  {
    id: 'audit-001',
    actorId: 'u-doc-1',
    actorName: 'Dr. Samuel Leclerc',
    category: 'patient',
    action: 'Updated care plan for patient Lee Tanaka',
    timestamp: '2024-02-18T16:25:00Z'
  },
  {
    id: 'audit-002',
    actorId: 'u-admin',
    actorName: 'Amelia Chen',
    category: 'admin',
    action: 'Provisioned new nurse account for Priya Patel',
    timestamp: '2024-02-17T11:18:00Z'
  },
  {
    id: 'audit-003',
    actorId: 'u-doc-1',
    actorName: 'Dr. Samuel Leclerc',
    category: 'lab',
    action: 'Acknowledged critical lab result for patient Lee Tanaka',
    timestamp: '2024-02-18T15:02:00Z',
    critical: true
  }
];

export const notifications: NotificationItem[] = [
  {
    id: 'notif-001',
    title: 'Critical lab result',
    message: 'Potassium level elevated for patient Lee Tanaka.',
    severity: 'critical',
    createdAt: '2024-02-18T15:05:00Z',
    read: false,
    link: '/labs'
  },
  {
    id: 'notif-002',
    title: 'Billing reminder',
    message: 'Invoice INV-001 pending payer remittance.',
    severity: 'info',
    createdAt: '2024-02-18T12:00:00Z',
    read: false,
    link: '/billing'
  }
];

export const departmentSummaries: DepartmentSummary[] = [
  {
    id: 'dept-cardio',
    name: 'Cardiology',
    head: 'Dr. Samuel Leclerc',
    staffCount: 42,
    occupiedBeds: 34,
    capacity: 40,
    lastUpdated: '2024-02-18T16:00:00Z'
  },
  {
    id: 'dept-icu',
    name: 'Intensive Care',
    head: 'Dr. Alicia Gomez',
    staffCount: 56,
    occupiedBeds: 18,
    capacity: 20,
    lastUpdated: '2024-02-18T15:45:00Z'
  }
];

export const kpis: DashboardKpi[] = [
  {
    id: 'kpi-occupancy',
    label: 'Bed Occupancy',
    value: '87%',
    trend: 4.2,
    trendLabel: 'Week over week',
    intent: 'positive'
  },
  {
    id: 'kpi-waittime',
    label: 'ED Wait Time',
    value: '18m',
    trend: -6.4,
    trendLabel: 'Compared to yesterday',
    intent: 'positive'
  },
  {
    id: 'kpi-readmit',
    label: '30d Readmissions',
    value: '6.1%',
    trend: 1.1,
    trendLabel: 'Month trend',
    intent: 'negative'
  },
  {
    id: 'kpi-revenue',
    label: 'Revenue Cycle',
    value: '$2.3M',
    trend: 2.3,
    trendLabel: 'Last 30 days',
    intent: 'positive'
  }
];

export const schedule: ScheduleBlock[] = [
  {
    id: 'sch-001',
    title: 'Ablation Procedure',
    start: '2024-02-18T18:00:00Z',
    end: '2024-02-18T20:30:00Z',
    ownerId: 'u-doc-1',
    ownerName: 'Dr. Samuel Leclerc',
    color: '#38bdf8',
    category: 'procedure'
  },
  {
    id: 'sch-002',
    title: 'Cardiology Huddle',
    start: '2024-02-19T13:00:00Z',
    end: '2024-02-19T13:30:00Z',
    ownerId: 'u-doc-1',
    ownerName: 'Cardiology Team',
    color: '#a855f7',
    category: 'meeting'
  }
];
