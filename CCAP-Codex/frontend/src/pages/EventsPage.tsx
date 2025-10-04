import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CalendarDaysIcon, PlusIcon } from '@heroicons/react/24/outline';
import SectionHeading from '../components/ui/SectionHeading';
import Loader from '../components/ui/Loader';
import ErrorState from '../components/ui/ErrorState';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import EventForm, { EventFormValues } from '../components/events/EventForm';
import { apiClient } from '../lib/apiClient';
import type { EventCategory, EventDetail } from '../types/api';
import { formatDateTime } from '../utils/format';

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' }
];

const categoryTone: Record<EventCategory, 'blue' | 'purple' | 'green' | 'orange'> = {
  tournament: 'blue',
  league: 'purple',
  training: 'green',
  social: 'orange'
};

const EventsPage = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('all');
  const [isModalOpen, setModalOpen] = useState(false);

  const eventsQuery = useQuery({
    queryKey: ['events', { status }],
    queryFn: async () => {
      const response = await apiClient.get<{ events: EventDetail[] }>('/events', {
        params: { status: status !== 'all' ? status : undefined }
      });
      return response.data.events;
    }
  });

  const createEvent = useMutation({
    mutationFn: async (values: EventFormValues) => {
      const response = await apiClient.post<{ event: EventDetail }>('/events', values);
      return response.data.event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setModalOpen(false);
    }
  });

  return (
    <div className="space-y-8">
      <SectionHeading
        title="Events & Tournaments"
        description="Plan, publish, and review all competitive and social engagements"
        action={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-primary-600/30 transition hover:bg-primary-500"
          >
            <PlusIcon className="h-4 w-4" />
            Create event
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <CalendarDaysIcon className="h-5 w-5 text-primary-300" />
        <span className="text-sm text-slate-300">Filter by status:</span>
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setStatus(option.value)}
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
              status === option.value
                ? 'bg-primary-600 text-white shadow-primary-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {eventsQuery.isLoading ? (
        <Loader label="Loading events…" />
      ) : eventsQuery.isError ? (
        <ErrorState message="Unable to load events." />
      ) : (
        <DataTable
          columns={[
            {
              key: 'name',
              header: 'Event',
              render: (row) => (
                <div className="flex flex-col">
                  <span className="font-semibold text-white">{(row as EventDetail).name}</span>
                  <span className="text-xs text-slate-400">{(row as EventDetail).format}</span>
                </div>
              )
            },
            {
              key: 'category',
              header: 'Category',
              render: (row) => (
                <StatusBadge
                  label={(row as EventDetail).category}
                  tone={categoryTone[(row as EventDetail).category] ?? 'slate'}
                />
              )
            },
            {
              key: 'start_date',
              header: 'Start',
              render: (row) => formatDateTime((row as EventDetail).start_date)
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) => (
                <StatusBadge
                  label={(row as EventDetail).status}
                  tone={
                    {
                      draft: 'slate',
                      published: 'green',
                      completed: 'blue',
                      cancelled: 'red'
                    }[(row as EventDetail).status] || 'slate'
                  }
                />
              )
            },
            {
              key: 'actions',
              header: '',
              render: (row) => (
                <Link
                  to={`/events/${(row as EventDetail).id}`}
                  className="text-xs font-semibold text-primary-300 hover:text-primary-100"
                >
                  Manage →
                </Link>
              )
            }
          ]}
          data={eventsQuery.data ?? []}
        />
      )}

      <Modal
        title="Create event"
        description="Publish tournaments and sessions to the club portal"
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
      >
        <EventForm onSubmit={(values) => createEvent.mutateAsync(values)} isSubmitting={createEvent.isPending} />
      </Modal>
    </div>
  );
};

export default EventsPage;
