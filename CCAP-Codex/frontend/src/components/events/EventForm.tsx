import { FormEvent, useState } from 'react';
import type { EventDetail } from '../../types/api';

export interface EventFormValues {
  name: string;
  category: EventDetail['category'];
  format: string;
  start_date: string;
  end_date?: string;
  registration_deadline?: string;
  location?: string;
  time_control?: string;
  description?: string;
  status: EventDetail['status'];
  capacity?: number;
}

interface EventFormProps {
  initialValues?: Partial<EventDetail>;
  onSubmit: (values: EventFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

const defaultValues: EventFormValues = {
  name: '',
  category: 'tournament',
  format: '',
  start_date: '',
  end_date: '',
  registration_deadline: '',
  location: '',
  time_control: '',
  description: '',
  status: 'draft',
  capacity: undefined
};

const toInputValue = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const tz = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tz).toISOString().slice(0, 16);
};

const EventForm = ({ initialValues, onSubmit, isSubmitting }: EventFormProps) => {
  const [formValues, setFormValues] = useState<EventFormValues>({
    ...defaultValues,
    ...initialValues,
    start_date: toInputValue(initialValues?.start_date) ?? '',
    end_date: toInputValue(initialValues?.end_date),
    registration_deadline: toInputValue(initialValues?.registration_deadline)
  });

  const handleChange = (field: keyof EventFormValues, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: field === 'capacity' ? (value ? Number(value) : undefined) : value
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      ...formValues,
      start_date: new Date(formValues.start_date).toISOString(),
      end_date: formValues.end_date ? new Date(formValues.end_date).toISOString() : undefined,
      registration_deadline: formValues.registration_deadline
        ? new Date(formValues.registration_deadline).toISOString()
        : undefined
    };
    await onSubmit(payload);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Event name</label>
          <input
            required
            value={formValues.name}
            onChange={(event) => handleChange('name', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Category</label>
          <select
            value={formValues.category}
            onChange={(event) => handleChange('category', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          >
            <option value="tournament">Tournament</option>
            <option value="league">League</option>
            <option value="training">Training</option>
            <option value="social">Social</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Format</label>
          <input
            value={formValues.format}
            onChange={(event) => handleChange('format', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Time control</label>
          <input
            value={formValues.time_control ?? ''}
            onChange={(event) => handleChange('time_control', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Start</label>
          <input
            type="datetime-local"
            required
            value={formValues.start_date}
            onChange={(event) => handleChange('start_date', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">End</label>
          <input
            type="datetime-local"
            value={formValues.end_date ?? ''}
            onChange={(event) => handleChange('end_date', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Registration deadline</label>
          <input
            type="datetime-local"
            value={formValues.registration_deadline ?? ''}
            onChange={(event) => handleChange('registration_deadline', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Capacity</label>
          <input
            type="number"
            min={0}
            value={formValues.capacity ?? ''}
            onChange={(event) => handleChange('capacity', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Location</label>
        <input
          value={formValues.location ?? ''}
          onChange={(event) => handleChange('location', event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</label>
        <select
          value={formValues.status}
          onChange={(event) => handleChange('status', event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Description</label>
        <textarea
          rows={3}
          value={formValues.description ?? ''}
          onChange={(event) => handleChange('description', event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        />
      </div>
      <div className="flex justify-end gap-3 pt-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-primary-600/30 transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : 'Save event'}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
