import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusIcon } from '@heroicons/react/24/outline';
import SectionHeading from '../components/ui/SectionHeading';
import Loader from '../components/ui/Loader';
import ErrorState from '../components/ui/ErrorState';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import { apiClient } from '../lib/apiClient';
import type { Announcement } from '../types/api';
import { formatDateTime } from '../utils/format';

interface AnnouncementFormValues {
  title: string;
  body: string;
  priority: Announcement['priority'];
  publish_at?: string;
  expires_at?: string;
}

const defaultForm: AnnouncementFormValues = {
  title: '',
  body: '',
  priority: 'normal'
};

const AnnouncementsPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [formValues, setFormValues] = useState<AnnouncementFormValues>(defaultForm);

  const announcementsQuery = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const response = await apiClient.get<{ announcements: Announcement[] }>('/announcements');
      return response.data.announcements;
    }
  });

  const upsertAnnouncement = useMutation({
    mutationFn: async (values: AnnouncementFormValues) => {
      if (editing) {
        const response = await apiClient.put<{ announcement: Announcement }>(`/announcements/${editing.id}`, values);
        return response.data.announcement;
      }
      const response = await apiClient.post<{ announcement: Announcement }>('/announcements', values);
      return response.data.announcement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      closeModal();
    }
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    }
  });

  const openModal = (announcement?: Announcement) => {
    if (announcement) {
      setEditing(announcement);
      setFormValues({
        title: announcement.title,
        body: announcement.body,
        priority: announcement.priority,
        publish_at: announcement.publish_at?.slice(0, 16),
        expires_at: announcement.expires_at?.slice(0, 16)
      });
    } else {
      setEditing(null);
      setFormValues(defaultForm);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setFormValues(defaultForm);
  };

  const handleSubmit = () => {
    upsertAnnouncement.mutate({
      ...formValues,
      publish_at: formValues.publish_at ? new Date(formValues.publish_at).toISOString() : undefined,
      expires_at: formValues.expires_at ? new Date(formValues.expires_at).toISOString() : undefined
    });
  };

  return (
    <div className="space-y-8">
      <SectionHeading
        title="Announcements"
        description="Publish updates for members and highlight key club bulletins"
        action={
          <button
            type="button"
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-primary-600/30 transition hover:bg-primary-500"
          >
            <PlusIcon className="h-4 w-4" />
            New announcement
          </button>
        }
      />

      {announcementsQuery.isLoading ? (
        <Loader label="Loading announcements…" />
      ) : announcementsQuery.isError ? (
        <ErrorState message="Unable to load announcements." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {announcementsQuery.data?.map((announcement) => (
            <article key={announcement.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{announcement.title}</h3>
                  <p className="mt-2 text-sm text-slate-200">{announcement.body}</p>
                </div>
                <StatusBadge
                  label={announcement.priority}
                  tone={announcement.priority === 'high' ? 'orange' : 'slate'}
                />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>Published {formatDateTime(announcement.publish_at)}</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => openModal(announcement)}
                    className="font-semibold text-primary-300 hover:text-primary-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Delete this announcement?')) {
                        deleteAnnouncement.mutate(announcement.id);
                      }
                    }}
                    className="font-semibold text-rose-300 hover:text-rose-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        title={editing ? 'Edit announcement' : 'Create announcement'}
        description="Share updates with the club"
        open={isModalOpen}
        onClose={closeModal}
        footer={
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-primary-600/30 transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={upsertAnnouncement.isPending}
          >
            {upsertAnnouncement.isPending ? 'Saving…' : editing ? 'Save changes' : 'Publish'}
          </button>
        }
      >
        <div className="grid gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Title</label>
            <input
              value={formValues.title}
              onChange={(event) => setFormValues((prev) => ({ ...prev, title: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Body</label>
            <textarea
              rows={4}
              value={formValues.body}
              onChange={(event) => setFormValues((prev) => ({ ...prev, body: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Priority</label>
              <select
                value={formValues.priority}
                onChange={(event) => setFormValues((prev) => ({ ...prev, priority: event.target.value as Announcement['priority'] }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Publish at</label>
              <input
                type="datetime-local"
                value={formValues.publish_at ?? ''}
                onChange={(event) => setFormValues((prev) => ({ ...prev, publish_at: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Expires at</label>
            <input
              type="datetime-local"
              value={formValues.expires_at ?? ''}
              onChange={(event) => setFormValues((prev) => ({ ...prev, expires_at: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AnnouncementsPage;
