import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import SectionHeading from '../components/ui/SectionHeading';
import Loader from '../components/ui/Loader';
import ErrorState from '../components/ui/ErrorState';
import StatusBadge from '../components/ui/StatusBadge';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import EventForm, { EventFormValues } from '../components/events/EventForm';
import { apiClient } from '../lib/apiClient';
import type { EventDetail, MatchDetail, Member, RegistrationDetail, StandingRow } from '../types/api';
import { formatDate, formatDateTime } from '../utils/format';

type EventResponse = {
  event: EventDetail;
  registrations: RegistrationDetail[];
  matches: MatchDetail[];
  standings: StandingRow[];
};

const registrationStatuses = ['registered', 'checked_in', 'waitlisted', 'withdrawn'] as const;
const matchResults = ['pending', 'white', 'black', 'draw', 'forfeit'] as const;

const EventDetailPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isEditOpen, setEditOpen] = useState(false);
  const [isRegistrationOpen, setRegistrationOpen] = useState(false);
  const [isMatchOpen, setMatchOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [matchForm, setMatchForm] = useState({ round: 1, board: 1, white_member_id: '', black_member_id: '', result: 'pending' });

  const eventQuery = useQuery({
    queryKey: ['event', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await apiClient.get<EventResponse>(`/events/${id}`);
      return response.data;
    }
  });

  const membersQuery = useQuery({
    queryKey: ['members-selection'],
    queryFn: async () => {
      const response = await apiClient.get<{ members: Member[] }>('/members', {
        params: { status: 'active' }
      });
      return response.data.members;
    }
  });

  const updateEvent = useMutation({
    mutationFn: async (values: EventFormValues) => {
      const response = await apiClient.put<{ event: EventDetail }>(`/events/${id}`, values);
      return response.data.event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setEditOpen(false);
    }
  });

  const addRegistration = useMutation({
    mutationFn: async (member_id: string) => {
      const response = await apiClient.post<{ registration: RegistrationDetail }>(`/events/${id}/registrations`, {
        member_id
      });
      return response.data.registration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      setRegistrationOpen(false);
      setSelectedMemberId('');
    }
  });

  const updateRegistration = useMutation({
    mutationFn: async ({ registrationId, data }: { registrationId: string; data: Partial<RegistrationDetail> }) => {
      const response = await apiClient.patch<{ registration: RegistrationDetail }>(`/events/registrations/${registrationId}`, data);
      return response.data.registration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
    }
  });

  const removeRegistration = useMutation({
    mutationFn: async (registrationId: string) => {
      await apiClient.delete(`/events/registrations/${registrationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
    }
  });

  const addMatch = useMutation({
    mutationFn: async (payload: any) => {
      const response = await apiClient.post<{ match: MatchDetail }>(`/events/${id}/matches`, payload);
      return response.data.match;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      setMatchOpen(false);
      setMatchForm({ round: 1, board: 1, white_member_id: '', black_member_id: '', result: 'pending' });
    }
  });

  const updateMatch = useMutation({
    mutationFn: async ({ matchId, data }: { matchId: string; data: Partial<MatchDetail> }) => {
      const response = await apiClient.patch<{ match: MatchDetail }>(`/events/matches/${matchId}`, data);
      return response.data.match;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
    }
  });

  const removeMatch = useMutation({
    mutationFn: async (matchId: string) => {
      await apiClient.delete(`/events/matches/${matchId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
    }
  });

  if (eventQuery.isLoading) {
    return <Loader label="Loading event details…" />;
  }

  if (eventQuery.isError || !eventQuery.data) {
    return <ErrorState message="Could not load this event." />;
  }

  const { event, registrations, matches, standings } = eventQuery.data;
  const registrationNameMap = new Map(registrations.map((record) => [record.member_id, record.member_name]));

  return (
    <div className="space-y-10">
      <SectionHeading
        title={event.name}
        description={event.description ?? 'Event overview and controls'}
        action={
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-primary-500 hover:text-primary-200"
          >
            Edit event
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Event Details</h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Category</dt>
                <dd className="mt-1">
                  <StatusBadge label={event.category} tone="purple" />
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Status</dt>
                <dd className="mt-1">
                  <StatusBadge
                    label={event.status}
                    tone={
                      {
                        draft: 'slate',
                        published: 'green',
                        completed: 'blue',
                        cancelled: 'red'
                      }[event.status] ?? 'slate'
                    }
                  />
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Start</dt>
                <dd className="mt-1 text-sm text-white">{formatDateTime(event.start_date)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">End</dt>
                <dd className="mt-1 text-sm text-white">{formatDateTime(event.end_date)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Registration deadline</dt>
                <dd className="mt-1 text-sm text-white">{formatDateTime(event.registration_deadline)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Capacity</dt>
                <dd className="mt-1 text-sm text-white">{event.capacity ?? '—'}</dd>
              </div>
            </dl>
            <div className="mt-4 text-sm text-slate-200">
              <span className="text-xs uppercase tracking-wide text-slate-400">Location</span>
              <p className="mt-1">{event.location ?? 'Not specified'}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Registrations</h3>
              <button
                type="button"
                onClick={() => setRegistrationOpen(true)}
                className="text-xs font-semibold text-primary-300 hover:text-primary-100"
              >
                Add registration
              </button>
            </div>
            <DataTable
              columns={[
                {
                  key: 'member_name',
                  header: 'Participant',
                  render: (row) => (
                    <div>
                      <div className="font-semibold text-white">{(row as RegistrationDetail).member_name}</div>
                      <div className="text-xs text-slate-400">Rating {(row as RegistrationDetail).rating ?? '—'}</div>
                    </div>
                  )
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (row) => (
                    <select
                      value={(row as RegistrationDetail).status}
                      onChange={(event) =>
                        updateRegistration.mutate({
                          registrationId: (row as RegistrationDetail).id,
                          data: { status: event.target.value }
                        })
                      }
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                    >
                      {registrationStatuses.map((statusOption) => (
                        <option key={statusOption} value={statusOption}>
                          {statusOption}
                        </option>
                      ))}
                    </select>
                  )
                },
                {
                  key: 'score',
                  header: 'Score',
                  render: (row) => (
                    <input
                      type="number"
                      step="0.5"
                      value={(row as RegistrationDetail).score}
                      onChange={(event) =>
                        updateRegistration.mutate({
                          registrationId: (row as RegistrationDetail).id,
                          data: { score: Number(event.target.value) }
                        })
                      }
                      className="w-20 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                    />
                  )
                },
                {
                  key: 'actions',
                  header: '',
                  render: (row) => (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Remove this registration?')) {
                          removeRegistration.mutate((row as RegistrationDetail).id);
                        }
                      }}
                      className="text-xs font-semibold text-rose-300 hover:text-rose-200"
                    >
                      Remove
                    </button>
                  )
                }
              ]}
              data={registrations}
              emptyMessage="No participants registered yet."
            />
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Matches</h3>
              <button
                type="button"
                onClick={() => setMatchOpen(true)}
                className="text-xs font-semibold text-primary-300 hover:text-primary-100"
              >
                Record match
              </button>
            </div>
            <DataTable
              columns={[
                { key: 'round', header: 'Round', render: (row) => (row as MatchDetail).round },
                { key: 'board', header: 'Board', render: (row) => (row as MatchDetail).board },
                {
                  key: 'players',
                  header: 'Players',
                  render: (row) => (
                    <div className="text-xs text-slate-200">
                      <div>♙ {(row as MatchDetail).white_member_name ?? 'TBD'}</div>
                      <div>♟ {(row as MatchDetail).black_member_name ?? 'TBD'}</div>
                    </div>
                  )
                },
                {
                  key: 'result',
                  header: 'Result',
                  render: (row) => (
                    <select
                      value={(row as MatchDetail).result}
                      onChange={(event) =>
                        updateMatch.mutate({
                          matchId: (row as MatchDetail).id,
                          data: { result: event.target.value }
                        })
                      }
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                    >
                      {matchResults.map((result) => (
                        <option key={result} value={result}>
                          {result}
                        </option>
                      ))}
                    </select>
                  )
                },
                {
                  key: 'actions',
                  header: '',
                  render: (row) => (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Delete this match record?')) {
                          removeMatch.mutate((row as MatchDetail).id);
                        }
                      }}
                      className="text-xs font-semibold text-rose-300 hover:text-rose-200"
                    >
                      Delete
                    </button>
                  )
                }
              ]}
              data={matches}
              emptyMessage="No match results recorded."
            />
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Leaderboard</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              {standings.map((row, index) => (
                <li key={row.member_id} className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">#{index + 1}</span>
                    <span className="ml-2 font-semibold text-white">
                      {registrationNameMap.get(row.member_id) ?? row.member_id.slice(0, 8)}
                    </span>
                    <div className="text-xs text-slate-400">
                      {row.wins}W · {row.draws}D · {row.losses}L
                    </div>
                  </div>
                  <div className="font-semibold text-primary-200">{row.points.toFixed(1)} pts</div>
                </li>
              ))}
              {standings.length === 0 && <li className="text-xs text-slate-400">No standings available yet.</li>}
            </ul>
          </section>
        </aside>
      </div>

      <Modal
        title="Edit event"
        description="Update scheduling and publishing details"
        open={isEditOpen}
        onClose={() => setEditOpen(false)}
      >
        <EventForm
          initialValues={event}
          onSubmit={(values) => updateEvent.mutateAsync(values)}
          isSubmitting={updateEvent.isPending}
        />
      </Modal>

      <Modal
        title="Add registration"
        description="Select a club member to add to this event"
        open={isRegistrationOpen}
        onClose={() => setRegistrationOpen(false)}
        footer={
          <button
            type="button"
            onClick={() => selectedMemberId && addRegistration.mutate(selectedMemberId)}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-primary-600/30 transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!selectedMemberId || addRegistration.isPending}
          >
            {addRegistration.isPending ? 'Adding…' : 'Add participant'}
          </button>
        }
      >
        {membersQuery.isLoading ? (
          <Loader label="Loading member list…" />
        ) : membersQuery.isError ? (
          <ErrorState message="Unable to load members." />
        ) : (
          <select
            value={selectedMemberId}
            onChange={(event) => setSelectedMemberId(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          >
            <option value="">Select member…</option>
            {membersQuery.data?.map((member) => (
              <option key={member.id} value={member.id}>
                {member.first_name} {member.last_name} · Rating {member.rating ?? '—'}
              </option>
            ))}
          </select>
        )}
      </Modal>

      <Modal
        title="Record match"
        description="Log a pairing and result"
        open={isMatchOpen}
        onClose={() => setMatchOpen(false)}
        footer={
          <button
            type="button"
            onClick={() =>
              addMatch.mutate({
                round: matchForm.round,
                board: matchForm.board,
                white_member_id: matchForm.white_member_id || undefined,
                black_member_id: matchForm.black_member_id || undefined,
                result: matchForm.result
              })
            }
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-primary-600/30 transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={addMatch.isPending}
          >
            {addMatch.isPending ? 'Saving…' : 'Record'}
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Round</label>
            <input
              type="number"
              min={1}
              value={matchForm.round}
              onChange={(event) => setMatchForm((prev) => ({ ...prev, round: Number(event.target.value) }))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Board</label>
            <input
              type="number"
              min={1}
              value={matchForm.board}
              onChange={(event) => setMatchForm((prev) => ({ ...prev, board: Number(event.target.value) }))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">White</label>
            <select
              value={matchForm.white_member_id}
              onChange={(event) => setMatchForm((prev) => ({ ...prev, white_member_id: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">Assign later</option>
              {membersQuery.data?.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.first_name} {member.last_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Black</label>
            <select
              value={matchForm.black_member_id}
              onChange={(event) => setMatchForm((prev) => ({ ...prev, black_member_id: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">Assign later</option>
              {membersQuery.data?.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.first_name} {member.last_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Result</label>
          <select
            value={matchForm.result}
            onChange={(event) => setMatchForm((prev) => ({ ...prev, result: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          >
            {matchResults.map((result) => (
              <option key={result} value={result}>
                {result}
              </option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  );
};

export default EventDetailPage;
