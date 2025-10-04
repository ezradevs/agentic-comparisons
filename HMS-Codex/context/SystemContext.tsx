'use client';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  appointments as appointmentsSeed,
  auditLog as auditSeed,
  departmentSummaries as departmentSeed,
  invoices as invoiceSeed,
  kpis as kpiSeed,
  labs as labSeed,
  medications as medicationSeed,
  notifications as notificationSeed,
  patients as patientSeed,
  records as recordSeed,
  resources as resourceSeed,
  schedule as scheduleSeed,
  users
} from '@/data/mockData';
import type {
  Appointment,
  AuditLogEntry,
  DepartmentSummary,
  ExportPayload,
  Invoice,
  LabOrder,
  MedicalRecord,
  MedicationOrder,
  NotificationItem,
  Patient,
  ResourceSlot,
  ScheduleBlock
} from '@/lib/types';
import { createPdfDocument } from '@/lib/exporters';
import { createCsvPayload, formatDate, generateId } from '@/lib/utils';

interface RegisterPatientPayload extends Omit<Patient, 'id' | 'identifier' | 'lastVisit'> {
  lastVisit?: string;
}

interface AppointmentPayload extends Omit<Appointment, 'id' | 'status'> {
  status?: Appointment['status'];
}

interface SystemContextValue {
  patients: Patient[];
  appointments: Appointment[];
  records: MedicalRecord[];
  medications: MedicationOrder[];
  labs: LabOrder[];
  invoices: Invoice[];
  resources: ResourceSlot[];
  departments: DepartmentSummary[];
  schedule: ScheduleBlock[];
  kpis: typeof kpiSeed;
  notifications: NotificationItem[];
  auditLog: AuditLogEntry[];
  registerPatient: (payload: RegisterPatientPayload, actorId: string) => Patient;
  updatePatient: (patientId: string, updates: Partial<Patient>, actorId: string) => Patient | undefined;
  createAppointment: (payload: AppointmentPayload, actorId: string) => Appointment;
  updateAppointmentStatus: (appointmentId: string, status: Appointment['status'], actorId: string) => void;
  appendRecord: (record: Omit<MedicalRecord, 'id'>, actorId: string) => MedicalRecord;
  createMedicationOrder: (
    payload: Omit<MedicationOrder, 'id' | 'lastDispensed' | 'status' | 'refillsRemaining'> & {
      status?: MedicationOrder['status'];
      refillsRemaining?: number;
      lastDispensed?: string;
    },
    actorId: string
  ) => MedicationOrder;
  recordMedicationDispense: (orderId: string, status: MedicationOrder['status'], actorId: string) => void;
  acknowledgeLabResult: (labId: string, actorId: string) => void;
  addInvoicePayment: (invoiceId: string, amount: number, actorId: string) => void;
  createNotification: (
    notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read' | 'severity'>,
    severity?: NotificationItem['severity']
  ) => void;
  markNotificationRead: (id: string, actorId?: string) => void;
  addAuditEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'actorName'> & { actorName?: string }) => void;
  exportDataAsCsv: (payload: ExportPayload) => { filename: string; content: string };
  exportDataAsPdf: (payload: ExportPayload) => { filename: string; content: string };
}

const SystemContext = createContext<SystemContextValue | undefined>(undefined);

export function SystemProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState(patientSeed);
  const [appointments, setAppointments] = useState(appointmentsSeed);
  const [records, setRecords] = useState(recordSeed);
  const [medications, setMedications] = useState(medicationSeed);
  const [labs, setLabs] = useState(labSeed);
  const [invoices, setInvoices] = useState(invoiceSeed);
  const [resources, setResources] = useState(resourceSeed);
  const [departments, setDepartments] = useState(departmentSeed);
  const [schedule, setSchedule] = useState(scheduleSeed);
  const [kpis] = useState(kpiSeed);
  const [notifications, setNotifications] = useState(notificationSeed);
  const [auditLog, setAuditLog] = useState(auditSeed);

  const appendAudit = useCallback(
    (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'actorName'> & { actorName?: string }) => {
      const actor = users.find((user) => user.id === entry.actorId);
      const enhanced: AuditLogEntry = {
        id: generateId('audit'),
        timestamp: new Date().toISOString(),
        actorName: actor?.name ?? entry.actorName ?? 'Unknown Actor',
        ...entry
      };
      setAuditLog((current) => [enhanced, ...current].slice(0, 120));
    },
    []
  );

  const createNotification = useCallback(
    (
      notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read' | 'severity'>,
      severity: NotificationItem['severity'] = 'info'
    ) => {
      const item: NotificationItem = {
        id: generateId('notif'),
        createdAt: new Date().toISOString(),
        read: false,
        severity,
        ...notification
      };
      setNotifications((current) => [item, ...current].slice(0, 80));
    },
    []
  );

  const registerPatient: SystemContextValue['registerPatient'] = useCallback(
    (payload, actorId) => {
      const identifier = `HMS-${Math.floor(Math.random() * 9000 + 1000)}`;
      const patient: Patient = {
        id: generateId('patient'),
        identifier,
        lastVisit: payload.lastVisit ?? new Date().toISOString(),
        ...payload
      };
      setPatients((current) => [patient, ...current]);
      appendAudit({
        actorId,
        category: 'patient',
        action: `Registered new patient ${patient.firstName} ${patient.lastName}`,
        context: {
          identifier: patient.identifier,
          physician: patient.primaryPhysicianId
        }
      });
      createNotification(
        {
          title: 'New patient intake',
          message: `${patient.firstName} ${patient.lastName} assigned to physician ${patient.primaryPhysicianId}.`,
          link: '/patients'
        },
        'success'
      );
      return patient;
    },
    [appendAudit, createNotification]
  );

  const updatePatient: SystemContextValue['updatePatient'] = useCallback(
    (patientId, updates, actorId) => {
      let updatedPatient: Patient | undefined;
      setPatients((current) =>
        current.map((patient) => {
          if (patient.id === patientId) {
            updatedPatient = { ...patient, ...updates };
            return updatedPatient;
          }
          return patient;
        })
      );
      if (updatedPatient) {
        appendAudit({
          actorId,
          category: 'patient',
          action: `Updated patient ${updatedPatient.firstName} ${updatedPatient.lastName}`,
          context: { status: updatedPatient.status }
        });
      }
      return updatedPatient;
    },
    [appendAudit]
  );

  const createAppointment: SystemContextValue['createAppointment'] = useCallback(
    (payload, actorId) => {
      const appointment: Appointment = {
        id: generateId('appt'),
        status: payload.status ?? 'scheduled',
        ...payload
      };
      setAppointments((current) => [appointment, ...current]);
      setSchedule((current) => [
        {
          id: appointment.id,
          title: `${appointment.department}: ${appointment.reason}`,
          start: appointment.startTime,
          end: appointment.endTime,
          ownerId: appointment.providerId,
          ownerName: users.find((user) => user.id === appointment.providerId)?.name ?? 'Provider',
          color: '#38bdf8',
          category: 'appointment'
        },
        ...current
      ]);
      appendAudit({
        actorId,
        category: 'appointment',
        action: `Scheduled appointment ${appointment.reason}`,
        context: {
          patientId: appointment.patientId,
          department: appointment.department,
          status: appointment.status
        }
      });
      createNotification(
        {
          title: 'Appointment scheduled',
          message: `Appointment created for patient ${appointment.patientId}.`,
          link: '/appointments'
        },
        'info'
      );
      return appointment;
    },
    [appendAudit, createNotification]
  );

  const updateAppointmentStatus: SystemContextValue['updateAppointmentStatus'] = useCallback(
    (appointmentId, status, actorId) => {
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                status
              }
            : appointment
        )
      );
      appendAudit({
        actorId,
        category: 'appointment',
        action: `Updated appointment ${appointmentId} to ${status}`
      });
    },
    [appendAudit]
  );

  const appendRecord: SystemContextValue['appendRecord'] = useCallback(
    (record, actorId) => {
      const normalized: MedicalRecord = {
        id: generateId('record'),
        ...record
      };
      setRecords((current) => [normalized, ...current]);
      appendAudit({
        actorId,
        category: 'patient',
        action: `Added clinical note for patient ${record.patientId}`,
        context: { encounterType: record.encounterType }
      });
      return normalized;
    },
    [appendAudit]
  );

  const createMedicationOrder: SystemContextValue['createMedicationOrder'] = useCallback(
    (payload, actorId) => {
      const order: MedicationOrder = {
        id: generateId('med'),
        status: payload.status ?? 'active',
        refillsRemaining: payload.refillsRemaining ?? 0,
        ...payload
      };
      setMedications((current) => [order, ...current]);
      appendAudit({
        actorId,
        category: 'medication',
        action: `Prescribed ${order.drugName}`,
        context: { dosage: order.dosage }
      });
      createNotification(
        {
          title: 'New medication order',
          message: `${order.drugName} created for patient ${order.patientId}.`,
          link: '/medications'
        },
        'info'
      );
      return order;
    },
    [appendAudit, createNotification]
  );

  const recordMedicationDispense: SystemContextValue['recordMedicationDispense'] = useCallback(
    (orderId, status, actorId) => {
      setMedications((current) =>
        current.map((med) =>
          med.id === orderId
            ? {
                ...med,
                status,
                lastDispensed: new Date().toISOString()
              }
            : med
        )
      );
      appendAudit({
        actorId,
        category: 'medication',
        action: `Updated medication order ${orderId}`,
        context: { status }
      });
    },
    [appendAudit]
  );

  const acknowledgeLabResult: SystemContextValue['acknowledgeLabResult'] = useCallback(
    (labId, actorId) => {
      setLabs((current) =>
        current.map((lab) =>
          lab.id === labId
            ? {
                ...lab,
                status: 'completed',
                resultFlag: lab.resultFlag ?? 'normal'
              }
            : lab
        )
      );
      appendAudit({
        actorId,
        category: 'lab',
        action: `Acknowledged lab ${labId}`
      });
    },
    [appendAudit]
  );

  const addInvoicePayment: SystemContextValue['addInvoicePayment'] = useCallback(
    (invoiceId, amount, actorId) => {
      setInvoices((current) =>
        current.map((invoice) =>
          invoice.id === invoiceId
            ? {
                ...invoice,
                patientResponsibility: Math.max(invoice.patientResponsibility - amount, 0),
                status: Math.max(invoice.patientResponsibility - amount, 0) === 0 ? 'paid' : invoice.status,
                lastPaymentDate: new Date().toISOString()
              }
            : invoice
        )
      );
      appendAudit({
        actorId,
        category: 'billing',
        action: `Applied payment to invoice ${invoiceId}`,
        context: { amount }
      });
    },
    [appendAudit]
  );

  const markNotificationRead: SystemContextValue['markNotificationRead'] = useCallback(
    (id, actorId) => {
      setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
      if (actorId) {
        appendAudit({
          actorId,
          category: 'system',
          action: `Acknowledged notification ${id}`
        });
      }
    },
    [appendAudit]
  );

  const exportDataAsCsv: SystemContextValue['exportDataAsCsv'] = useCallback((payload) => {
    const content = createCsvPayload(payload);
    const filename = `${payload.title.replace(/\s+/g, '-').toLowerCase()}-${formatDate(new Date().toISOString(), 'yyyyMMdd-HHmm')}.csv`;
    return { filename, content };
  }, []);

  const exportDataAsPdf: SystemContextValue['exportDataAsPdf'] = useCallback((payload) => {
    const result = createPdfDocument(payload);
    return result;
  }, []);

  const addAuditEntry: SystemContextValue['addAuditEntry'] = useCallback(({ actorId, actorName, ...rest }) => {
    appendAudit({ actorId, actorName, ...rest });
  }, [appendAudit]);

  const value = useMemo<SystemContextValue>(
    () => ({
      patients,
      appointments,
      records,
      medications,
      labs,
      invoices,
      resources,
      departments,
      schedule,
      kpis,
      notifications,
      auditLog,
      registerPatient,
      updatePatient,
      createAppointment,
      updateAppointmentStatus,
      appendRecord,
      createMedicationOrder,
      recordMedicationDispense,
      acknowledgeLabResult,
      addInvoicePayment,
      createNotification,
      markNotificationRead,
      addAuditEntry,
      exportDataAsCsv,
      exportDataAsPdf
    }),
    [
      patients,
      appointments,
      records,
      medications,
      labs,
      invoices,
      resources,
      departments,
      schedule,
      kpis,
      notifications,
      auditLog,
      registerPatient,
      updatePatient,
      createAppointment,
      updateAppointmentStatus,
      appendRecord,
      createMedicationOrder,
      recordMedicationDispense,
      acknowledgeLabResult,
      addInvoicePayment,
      createNotification,
      markNotificationRead,
      addAuditEntry,
      exportDataAsCsv,
      exportDataAsPdf
    ]
  );

  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>;
}

export function useSystemContext() {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystemContext must be used within a SystemProvider');
  }
  return context;
}
