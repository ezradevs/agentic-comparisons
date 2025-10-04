import { FormEvent, useState } from 'react';
import type { Member } from '../../types/api';

export interface MemberFormValues {
  first_name: string;
  last_name: string;
  preferred_name?: string;
  rating?: number;
  email?: string;
  phone?: string;
  uscf_id?: string;
  status: Member['status'];
  join_date?: string;
  membership_expires_on?: string;
  notes?: string;
}

interface MemberFormProps {
  initialValues?: Partial<Member>;
  onSubmit: (values: MemberFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

const defaultValues: MemberFormValues = {
  first_name: '',
  last_name: '',
  preferred_name: '',
  status: 'active'
};

const MemberForm = ({ initialValues, onSubmit, isSubmitting }: MemberFormProps) => {
  const [formValues, setFormValues] = useState<MemberFormValues>(() => ({
    ...defaultValues,
    ...initialValues,
    rating: initialValues?.rating ?? undefined,
    join_date: initialValues?.join_date ?? undefined,
    membership_expires_on: initialValues?.membership_expires_on ?? undefined
  }));

  const handleChange = (field: keyof MemberFormValues, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: field === 'rating' ? (value ? Number(value) : undefined) : value
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit(formValues);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">First name</label>
          <input
            required
            value={formValues.first_name}
            onChange={(event) => handleChange('first_name', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Last name</label>
          <input
            required
            value={formValues.last_name}
            onChange={(event) => handleChange('last_name', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Preferred name</label>
          <input
            value={formValues.preferred_name ?? ''}
            onChange={(event) => handleChange('preferred_name', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">USCF ID</label>
          <input
            value={formValues.uscf_id ?? ''}
            onChange={(event) => handleChange('uscf_id', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</label>
          <input
            type="email"
            value={formValues.email ?? ''}
            onChange={(event) => handleChange('email', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</label>
          <input
            value={formValues.phone ?? ''}
            onChange={(event) => handleChange('phone', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Rating</label>
          <input
            type="number"
            min={0}
            value={formValues.rating ?? ''}
            onChange={(event) => handleChange('rating', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Join date</label>
          <input
            type="date"
            value={formValues.join_date?.slice(0, 10) ?? ''}
            onChange={(event) => handleChange('join_date', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Membership expires</label>
          <input
            type="date"
            value={formValues.membership_expires_on?.slice(0, 10) ?? ''}
            onChange={(event) => handleChange('membership_expires_on', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Membership status</label>
        <select
          value={formValues.status}
          onChange={(event) => handleChange('status', event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="guest">Guest</option>
          <option value="alumni">Alumni</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</label>
        <textarea
          rows={3}
          value={formValues.notes ?? ''}
          onChange={(event) => handleChange('notes', event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        />
      </div>
      <div className="flex justify-end gap-3 pt-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-primary-600/30 transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : 'Save member'}
        </button>
      </div>
    </form>
  );
};

export default MemberForm;
