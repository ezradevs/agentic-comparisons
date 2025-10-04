import { useQuery } from '@tanstack/react-query';
import { CalendarDaysIcon, MegaphoneIcon, TrophyIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import StatCard from '../components/ui/StatCard';
import SectionHeading from '../components/ui/SectionHeading';
import Loader from '../components/ui/Loader';
import ErrorState from '../components/ui/ErrorState';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { apiClient } from '../lib/apiClient';
import type { Announcement, DashboardMetrics } from '../types/api';
import { formatDate, formatDateTime, formatRelativeTime } from '../utils/format';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const metricsQuery = useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      const response = await apiClient.get<{ metrics: DashboardMetrics }>('/dashboard/metrics');
      return response.data.metrics;
    }
  });

  const announcementsQuery = useQuery({
    queryKey: ['announcements', 'active'],
    queryFn: async () => {
      const response = await apiClient.get<{ announcements: Announcement[] }>('/announcements', {
        params: { activeOnly: true }
      });
      return response.data.announcements;
    }
  });

  if (metricsQuery.isLoading) {
    return <Loader label="Loading dashboard insights…" />;
  }

  if (metricsQuery.isError || !metricsQuery.data) {
    return <ErrorState message="Unable to load dashboard metrics. Please try again shortly." />;
  }

  const { totals, upcomingEvents, standingsPreview, recentActivity } = metricsQuery.data;

  return (
    <div className="space-y-10">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Members"
          value={totals.activeMembers}
          description={`Total roster: ${totals.members}`}
          icon={<UserGroupIcon className="h-10 w-10" />}
          accent="blue"
        />
        <StatCard
          title="New This Month"
          value={totals.newThisMonth}
          description="Members joined in the last 30 days"
          icon={<MegaphoneIcon className="h-10 w-10" />}
          accent="orange"
        />
        <StatCard
          title="Average Rating"
          value={totals.averageRating ? Math.round(totals.averageRating) : '—'}
          description="Across members with a reported rating"
          icon={<TrophyIcon className="h-10 w-10" />}
          accent="purple"
        />
        <StatCard
          title="Upcoming Events"
          value={upcomingEvents.length}
          description="Published events yet to start"
          icon={<CalendarDaysIcon className="h-10 w-10" />}
          accent="green"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <SectionHeading
              title="Upcoming Events"
              description="Keep an eye on registration counts for the next fixtures"
              action={
                <Link
                  to="/events"
                  className="rounded-lg border border-primary-500/40 px-3 py-1.5 text-sm text-primary-200 transition hover:border-primary-400 hover:text-primary-100"
                >
                  View all events
                </Link>
              }
            />
            <DataTable
              columns={[
                { key: 'name', header: 'Event' },
                {
                  key: 'start',
                  header: 'Start',
                  render: (row) => formatDateTime((row as any).start_date)
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (row) => (
                    <StatusBadge
                      label={(row as any).status}
                      tone={(row as any).status === 'published' ? 'green' : 'orange'}
                    />
                  )
                },
                {
                  key: 'registrations',
                  header: 'Registrations',
                  align: 'right'
                }
              ]}
              data={upcomingEvents as any}
              emptyMessage="No upcoming events are scheduled."
            />
          </section>

          <section>
            <SectionHeading
              title="Latest Activity"
              description="New members and recorded games in the last meetings"
            />
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Newest Members</h3>
                <ul className="mt-4 space-y-3">
                  {recentActivity.latestMembers.map((member) => (
                    <li key={member.id} className="flex items-center justify-between text-sm text-slate-200">
                      <div>
                        <div className="font-medium text-white">{member.name}</div>
                        <div className="text-xs text-slate-400">Joined {formatDate(member.join_date)}</div>
                      </div>
                      <StatusBadge label={member.status} tone="blue" />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Recent Results</h3>
                <ul className="mt-4 space-y-3">
                  {recentActivity.latestMatches.map((match) => (
                    <li key={match.id} className="space-y-1 text-sm text-slate-200">
                      <div className="font-medium text-white">{match.event_name}</div>
                      <div className="text-xs text-slate-400">
                        Round {match.round} · Result {match.result.toUpperCase()} · {formatRelativeTime(match.played_at)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-primary-950/20">
            <SectionHeading title="Standings Snapshot" description="Progress across active events" />
            <ul className="space-y-4">
              {standingsPreview.map((record) => (
                <li key={record.event_id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="text-sm font-semibold text-white">{record.event_name}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    {record.completed_matches} / {record.total_matches} matches recorded
                  </div>
                  <Link
                    to={`/events/${record.event_id}`}
                    className="mt-3 inline-flex items-center text-xs font-semibold text-primary-300 hover:text-primary-200"
                  >
                    Review standings →
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Announcements</h2>
              <Link to="/announcements" className="text-xs font-semibold text-primary-200 hover:text-primary-100">
                Manage
              </Link>
            </div>
            {announcementsQuery.isLoading && <Loader label="Loading announcements…" />}
            {announcementsQuery.isError && <ErrorState message="Could not load announcements." />}
            {announcementsQuery.data && (
              <ul className="space-y-4">
                {announcementsQuery.data.slice(0, 3).map((announcement) => (
                  <li key={announcement.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">{announcement.title}</h3>
                      <StatusBadge
                        label={announcement.priority}
                        tone={announcement.priority === 'high' ? 'orange' : 'slate'}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-400">Published {formatRelativeTime(announcement.publish_at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
};

export default DashboardPage;
