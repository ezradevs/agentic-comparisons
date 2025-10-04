'use client';
import { ModulePage } from '@/layouts/ModulePage';
import useSystem from '@/hooks/useSystem';
import { GlassPanel } from '@/components/panels/GlassPanel';
import { DataTable } from '@/components/tables/DataTable';
import { AuditLogList } from '@/components/panels/AuditLogList';
import { StatusBadge } from '@/components/panels/StatusBadge';
import { formatDate } from '@/lib/utils';
import { users } from '@/data/mockData';

const severityIntent: Record<'info' | 'success' | 'warning' | 'critical', 'default' | 'success' | 'warning' | 'critical'> = {
  info: 'default',
  success: 'success',
  warning: 'warning',
  critical: 'critical'
};

export default function AdminPage() {
  const { auditLog, notifications } = useSystem();

  return (
    <ModulePage title="Administrative Control" subtitle="Staff provisioning, compliance, and governance." iconClassName="fa-shield-halved" actions={<StatusBadge>{notifications.length} open alerts</StatusBadge>}>
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 3fr)', gap: '1.5rem' }}>
        <GlassPanel title="Team roster" caption="Role-based access control">
          <DataTable
            data={users}
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'role', header: 'Role' },
              { key: 'department', header: 'Department' },
              { key: 'email', header: 'Email' }
            ]}
            getRowKey={(row) => row.id}
            emptyState="No staff"
          />
        </GlassPanel>
        <GlassPanel title="Audit log" caption="Full traceability">
          <AuditLogList entries={auditLog} />
        </GlassPanel>
      </section>

      <GlassPanel title="Notifications" caption="Action required">
        <DataTable
          data={notifications}
          columns={[
            { key: 'title', header: 'Title' },
            { key: 'message', header: 'Message' },
            {
              key: 'severity',
              header: 'Severity',
              render: (row) => <StatusBadge intent={severityIntent[row.severity]}>{row.severity}</StatusBadge>
            },
            { key: 'createdAt', header: 'Received', render: (row) => formatDate(row.createdAt, 'MMM d, HH:mm') }
          ]}
          getRowKey={(row) => row.id}
          emptyState="No notifications"
        />
      </GlassPanel>
    </ModulePage>
  );
}
