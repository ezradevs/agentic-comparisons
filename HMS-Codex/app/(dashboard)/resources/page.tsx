'use client';
import { ModulePage } from '@/layouts/ModulePage';
import useSystem from '@/hooks/useSystem';
import { GlassPanel } from '@/components/panels/GlassPanel';
import { ResourceBoard } from '@/components/panels/ResourceBoard';
import { DataTable } from '@/components/tables/DataTable';
import { ScheduleTimeline } from '@/components/panels/ScheduleTimeline';
import { formatDate } from '@/lib/utils';

export default function ResourcesPage() {
  const { resources, departments, schedule } = useSystem();

  return (
    <ModulePage title="Resource Command" subtitle="Bed management, staffing, and procedural assets in one view." iconClassName="fa-hospital">
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 3fr)', gap: '1.5rem' }}>
        <GlassPanel title="Assets" caption="Live status">
          <ResourceBoard resources={resources} />
        </GlassPanel>
        <GlassPanel title="Department capacity" caption="Utilization and headcount">
          <DataTable
            data={departments}
            columns={[
              { key: 'name', header: 'Department' },
              { key: 'head', header: 'Lead' },
              {
                key: 'occupancy',
                header: 'Occupancy',
                render: (row) => `${row.occupiedBeds}/${row.capacity}`
              },
              {
                key: 'staffCount',
                header: 'Staff'
              },
              { key: 'lastUpdated', header: 'Updated', render: (row) => formatDate(row.lastUpdated, 'MMM d, HH:mm') }
            ]}
            getRowKey={(row) => row.id}
            emptyState="No departments"
          />
        </GlassPanel>
      </section>

      <GlassPanel title="Shared schedule" caption="Procedures and coordination">
        <ScheduleTimeline blocks={schedule} />
      </GlassPanel>
    </ModulePage>
  );
}
