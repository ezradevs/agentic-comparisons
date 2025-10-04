import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusIcon } from '@heroicons/react/24/outline';
import SectionHeading from '../components/ui/SectionHeading';
import Loader from '../components/ui/Loader';
import ErrorState from '../components/ui/ErrorState';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import MemberForm, { MemberFormValues } from '../components/members/MemberForm';
import { apiClient } from '../lib/apiClient';
import type { Member } from '../types/api';
import { formatDate } from '../utils/format';
import { Link } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';

const statusFilters = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Guest', value: 'guest' },
  { label: 'Alumni', value: 'alumni' }
];

const MembersPage = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [isModalOpen, setModalOpen] = useState(false);

  const membersQuery = useQuery({
    queryKey: ['members', { status, search: debouncedSearch }],
    queryFn: async () => {
      const response = await apiClient.get<{ members: Member[] }>('/members', {
        params: {
          status: status !== 'all' ? status : undefined,
          search: debouncedSearch || undefined
        }
      });
      return response.data;
    }
  });

  const createMember = useMutation({
    mutationFn: async (values: MemberFormValues) => {
      const response = await apiClient.post<{ member: Member }>('/members', values);
      return response.data.member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setModalOpen(false);
    }
  });

  return (
    <div className="space-y-8">
      <SectionHeading
        title="Members"
        description="Manage club roster, contact information, and membership statuses"
        action={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-primary-600/30 transition hover:bg-primary-500"
          >
            <PlusIcon className="h-4 w-4" />
            Add member
          </button>
        }
      />

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatus(filter.value)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                status === filter.value
                  ? 'bg-primary-600 text-white shadow-primary-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div>
          <input
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 md:w-72"
          />
        </div>
      </div>

      {membersQuery.isLoading ? (
        <Loader label="Loading members…" />
      ) : membersQuery.isError ? (
        <ErrorState message="Unable to load members." />
      ) : (
        <DataTable
          columns={[
            {
              key: 'name',
              header: 'Member',
              render: (row) => (
                <div>
                  <div className="font-semibold text-white">
                    {(row as Member).preferred_name || `${(row as Member).first_name} ${(row as Member).last_name}`}
                  </div>
                  <div className="text-xs text-slate-400">{(row as Member).email ?? 'No email provided'}</div>
                </div>
              )
            },
            {
              key: 'rating',
              header: 'Rating',
              align: 'right',
              render: (row) => ((row as Member).rating ? (row as Member).rating : '—')
            },
            {
              key: 'join_date',
              header: 'Join Date',
              render: (row) => formatDate((row as Member).join_date)
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) => (
                <StatusBadge
                  label={(row as Member).status}
                  tone={
                    {
                      active: 'green',
                      inactive: 'orange',
                      guest: 'blue',
                      alumni: 'slate'
                    }[(row as Member).status] || 'slate'
                  }
                />
              )
            },
            {
              key: 'actions',
              header: '',
              render: (row) => (
                <Link
                  to={`/members/${(row as Member).id}`}
                  className="text-xs font-semibold text-primary-300 hover:text-primary-100"
                >
                  View profile →
                </Link>
              )
            }
          ]}
          data={membersQuery.data?.members ?? []}
        />
      )}

      <Modal
        title="Add new member"
        description="Capture membership details and contact information"
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
      >
        <MemberForm onSubmit={(values) => createMember.mutateAsync(values)} isSubmitting={createMember.isPending} />
      </Modal>
    </div>
  );
};

export default MembersPage;
