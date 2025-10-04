'use client';
import { useMemo } from 'react';
import { ModulePage } from '@/layouts/ModulePage';
import useSystem from '@/hooks/useSystem';
import { GlassPanel } from '@/components/panels/GlassPanel';
import { DataTable } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/panels/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function BillingPage() {
  const { invoices, patients, addInvoicePayment, exportDataAsCsv, exportDataAsPdf } = useSystem();

  const totals = useMemo(
    () =>
      invoices.reduce(
        (acc, invoice) => {
          acc.revenue += invoice.amount;
          acc.outstanding += invoice.patientResponsibility;
          return acc;
        },
        { revenue: 0, outstanding: 0 }
      ),
    [invoices]
  );

  const handleExport = () => {
    const payload = exportDataAsCsv({
      type: 'csv',
      title: 'billing-report',
      columns: ['Invoice', 'Patient', 'Amount', 'Status', 'Service Date'],
      rows: invoices.map((invoice) => [
        invoice.id,
        patients.find((patient) => patient.id === invoice.patientId)?.firstName ?? invoice.patientId,
        invoice.amount.toFixed(2),
        invoice.status,
        invoice.serviceDate
      ])
    });
    console.info('CSV ready', payload.filename, payload.content.substring(0, 80));
  };

  const handlePdf = () => {
    const payload = exportDataAsPdf({
      type: 'pdf',
      title: 'billing-report',
      columns: ['Invoice', 'Patient', 'Amount', 'Status'],
      rows: invoices.map((invoice) => [
        invoice.id,
        patients.find((patient) => patient.id === invoice.patientId)?.firstName ?? invoice.patientId,
        invoice.amount.toFixed(2),
        invoice.status
      ])
    });
    console.info('PDF ready', payload.filename, payload.content.substring(0, 80));
  };

  return (
    <ModulePage
      title="Revenue Cycle"
      subtitle="Billing, reimbursements, and patient responsibility tracking."
      iconClassName="fa-file-invoice-dollar"
      actions={
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleExport}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              background: 'rgba(56, 189, 248, 0.08)',
              color: 'var(--accent)',
              cursor: 'pointer'
            }}
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={handlePdf}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(148, 163, 184, 0.4)',
              background: 'rgba(148, 163, 184, 0.1)',
              color: 'var(--text)',
              cursor: 'pointer'
            }}
          >
            Export PDF
          </button>
        </div>
      }
    >
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <GlassPanel title="Total billed" caption="Gross charges">
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{formatCurrency(totals.revenue)}</div>
        </GlassPanel>
        <GlassPanel title="Outstanding" caption="Patient responsibility">
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{formatCurrency(totals.outstanding)}</div>
        </GlassPanel>
      </section>

      <GlassPanel title="Invoices" caption="Remittance trail">
        <DataTable
          data={invoices}
          columns={[
            { key: 'id', header: 'Invoice' },
            {
              key: 'patient',
              header: 'Patient',
              render: (row) => patients.find((patient) => patient.id === row.patientId)?.firstName ?? row.patientId
            },
            { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
            {
              key: 'status',
              header: 'Status',
              render: (row) => (
                <StatusBadge intent={row.status === 'paid' ? 'success' : row.status === 'overdue' ? 'critical' : 'warning'}>{row.status}</StatusBadge>
              )
            },
            {
              key: 'serviceDate',
              header: 'Service date',
              render: (row) => formatDate(row.serviceDate, 'MMM d, yyyy')
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (row) => (
                <button
                  type="button"
                  onClick={() => addInvoicePayment(row.id, row.patientResponsibility, 'u-admin')}
                  className="buttonPrimary"
                >
                  Mark paid
                </button>
              )
            }
          ]}
          getRowKey={(row) => row.id}
          emptyState="No invoices"
        />
      </GlassPanel>
    </ModulePage>
  );
}
