export interface AuthenticatedUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: AuthenticatedUser;
}

export type MemberStatus = 'active' | 'inactive' | 'guest' | 'alumni';
export type EventCategory = 'tournament' | 'league' | 'training' | 'social';
export type EventStatus = 'draft' | 'published' | 'completed' | 'cancelled';
export type AnnouncementPriority = 'normal' | 'high';

export interface Member {
  id: string;
  first_name: string;
  last_name: string;
  preferred_name?: string | null;
  rating?: number | null;
  email?: string | null;
  phone?: string | null;
  uscf_id?: string | null;
  status: MemberStatus;
  join_date?: string | null;
  membership_expires_on?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventSummary {
  id: string;
  name: string;
  category: EventCategory;
  format: string;
  start_date: string;
  end_date?: string | null;
  status: EventStatus;
  location?: string | null;
}

export interface EventDetail extends EventSummary {
  registration_deadline?: string | null;
  time_control?: string | null;
  description?: string | null;
  capacity?: number | null;
  coordinator_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegistrationDetail {
  id: string;
  event_id: string;
  member_id: string;
  member_name: string;
  member_status: string;
  rating: number | null;
  status: string;
  score: number;
  notes?: string | null;
  check_in_at?: string | null;
  created_at: string;
}

export interface MatchDetail {
  id: string;
  event_id: string;
  round: number;
  board: number;
  white_member_id?: string | null;
  black_member_id?: string | null;
  white_member_name?: string | null;
  black_member_name?: string | null;
  result: string;
  played_at?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface StandingRow {
  member_id: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  forfeits: number;
  matches: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  publish_at: string;
  expires_at?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface DashboardMetrics {
  totals: {
    members: number;
    activeMembers: number;
    newThisMonth: number;
    averageRating: number | null;
  };
  upcomingEvents: Array<{
    id: string;
    name: string;
    start_date: string;
    status: string;
    registrations: number;
  }>;
  standingsPreview: Array<{
    event_id: string;
    event_name: string;
    total_matches: number;
    completed_matches: number;
  }>;
  recentActivity: {
    latestMembers: Array<{
      id: string;
      name: string;
      join_date: string | null;
      status: string;
    }>;
    latestMatches: Array<{
      id: string;
      event_name: string;
      round: number;
      result: string;
      played_at: string | null;
    }>;
  };
}
