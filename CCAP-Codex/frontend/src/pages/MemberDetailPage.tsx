import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/ui/Loader';
import ErrorState from '../components/ui/ErrorState';
import SectionHeading from '../components/ui/SectionHeading';
import Modal from '../components/ui/Modal';
import MemberForm, { MemberFormValues } from '../components/members/MemberForm';
import StatusBadge from '../components/ui/StatusBadge';
import { apiClient } from '../lib/apiClient';
import type { Member } from '../types/api';
import { formatDate } from '../utils/format';

const MemberDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditOpen, setEditOpen] = useState(false);

  const memberQuery = useQuery({
    queryKey: ['member', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await apiClient.get<{ member: Member }>(`/members/${id}`);
      return response.data.member;
    }
  });

  const updateMember = useMutation({
    mutationFn: async (values: MemberFormValues) => {
      const response = await apiClient.put<{ member: Member }>(`/members/${id}`, values);
      return response.data.member;
    },
    onSuccess: (member) => {
      queryClient.setQueryData(['member', id], member);
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setEditOpen(false);
    }
  });

  const removeMember = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/members/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      navigate('/members');
    }
  });

  if (memberQuery.isLoading) {
    return <Loader label="Loading member profile…" />;
  }

  if (memberQuery.isError || !memberQuery.data) {
    return <ErrorState message="We could not load this member." />;
  }

  const member = memberQuery.data;
  const statusTone = {
    active: 'green',
    inactive: 'orange',
    guest: 'blue',
    alumni: 'slate'
  } as const;

  return (
    <div className="space-y-8">
      <SectionHeading
        title={`${member.first_name} ${member.last_name}`}
        description="Detailed profile, contact, and engagement overview"
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-primary-500 hover:text-primary-200"
            >
              Edit profile
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Remove this member from the roster?')) {
                  removeMember.mutate();
                }
              }}
              className="rounded-lg border border-rose-600/40 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:border-rose-500 hover:bg-rose-500/10"
            >
              Delete
            </button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Contact Information</h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Email</dt>
                <dd className="mt-1 text-sm text-white">{member.email ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Phone</dt>
                <dd className="mt-1 text-sm text-white">{member.phone ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Preferred name</dt>
                <dd className="mt-1 text-sm text-white">{member.preferred_name ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">USCF ID</dt>
                <dd className="mt-1 text-sm text-white">{member.uscf_id ?? '—'}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Membership Details</h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Status</dt>
                <dd className="mt-1">
                  <StatusBadge label={member.status} tone={statusTone[member.status] ?? 'slate'} />
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Join date</dt>
                <dd className="mt-1 text-sm text-white">{formatDate(member.join_date)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Membership expires</dt>
                <dd className="mt-1 text-sm text-white">{formatDate(member.membership_expires_on)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Rating</dt>
                <dd className="mt-1 text-sm text-white">{member.rating ?? 'Not set'}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <dt className="text-xs uppercase tracking-wide text-slate-400">Notes</dt>
              <dd className="mt-1 text-sm text-slate-200">{member.notes ?? 'No notes recorded.'}</dd>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Quick Stats</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li className="flex items-center justify-between">
                <span>Profile created</span>
                <span>{formatDate(member.created_at)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Last updated</span>
                <span>{formatDate(member.updated_at)}</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <Modal
        title="Edit member"
        description="Update profile details"
        open={isEditOpen}
        onClose={() => setEditOpen(false)}
      >
        <MemberForm
          initialValues={member}
          onSubmit={(values) => updateMember.mutateAsync(values)}
          isSubmitting={updateMember.isPending}
        />
      </Modal>
    </div>
  );
};

export default MemberDetailPage;
