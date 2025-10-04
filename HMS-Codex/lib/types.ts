export type Role = 'administrator' | 'doctor' | 'nurse' | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  avatarInitials?: string;
}

export interface Patient {
  id: string;
  identifier: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'female' | 'male' | 'other';
  phone: string;
  email: string;
  address: string;
  status: 'admitted' | 'discharged' | 'outpatient';
  allergies: string[];
  bloodType: string;
  insuranceProvider: string;
  policyNumber: string;
  primaryPhysicianId: string;
  chronicConditions: string[];
  lastVisit: string;
  nextAppointmentId?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  department: string;
  reason: string;
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled';
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
}

export interface EncounterNote {
  id: string;
  encounterId: string;
  authorId: string;
  createdAt: string;
  title: string;
  summary: string;
  chartData: Array<{
    label: string;
    value: number;
    unit?: string;
  }>;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  encounterDate: string;
  encounterType: string;
  clinicianId: string;
  vitals: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    oxygenSaturation: number;
  };
  diagnoses: string[];
  orders: string[];
  notes: string;
  followUp?: string;
  attachments?: string[];
}

export interface MedicationOrder {
  id: string;
  patientId: string;
  prescribedById: string;
  drugName: string;
  dosage: string;
  route: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'on-hold';
  refillsRemaining: number;
  lastDispensed?: string;
}

export interface LabOrder {
  id: string;
  patientId: string;
  orderedById: string;
  testName: string;
  status: 'ordered' | 'in-progress' | 'completed' | 'critical';
  orderedAt: string;
  expectedAt: string;
  resultValue?: string;
  resultFlag?: 'critical' | 'abnormal' | 'normal';
  comments?: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  serviceDate: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  payer: string;
  insuranceCoverage: number;
  patientResponsibility: number;
  lastPaymentDate?: string;
  notes?: string;
}

export interface ResourceSlot {
  id: string;
  name: string;
  type: 'room' | 'device' | 'staff';
  status: 'available' | 'in-use' | 'maintenance';
  updatedAt: string;
  details?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'critical';
  createdAt: string;
  read: boolean;
  link?: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  category: 'patient' | 'appointment' | 'medication' | 'lab' | 'billing' | 'admin' | 'system';
  action: string;
  context?: Record<string, string | number>;
  timestamp: string;
  critical?: boolean;
}

export interface DepartmentSummary {
  id: string;
  name: string;
  head: string;
  staffCount: number;
  occupiedBeds: number;
  capacity: number;
  lastUpdated: string;
}

export interface DashboardKpi {
  id: string;
  label: string;
  value: number | string;
  trend: number;
  trendLabel: string;
  unit?: string;
  intent?: 'default' | 'positive' | 'negative';
}

export interface TimelineEvent {
  id: string;
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  intent: 'default' | 'positive' | 'warning' | 'critical';
}

export interface ExportPayload {
  type: 'csv' | 'pdf';
  title: string;
  columns: string[];
  rows: Array<Array<string | number>>;
}

export interface ScheduleBlock {
  id: string;
  title: string;
  start: string;
  end: string;
  ownerId: string;
  ownerName: string;
  color: string;
  category: 'appointment' | 'procedure' | 'meeting';
}
