export type Role = 'admin' | 'director' | 'organizer';
export type MemberStatus = 'active' | 'inactive' | 'guest' | 'alumni';
export type EventCategory = 'tournament' | 'league' | 'training' | 'social';
export type EventStatus = 'draft' | 'published' | 'completed' | 'cancelled';
export type RegistrationStatus = 'registered' | 'waitlisted' | 'withdrawn' | 'checked_in';
export type MatchResult = 'white' | 'black' | 'draw' | 'forfeit' | 'pending';
export type AnnouncementPriority = 'normal' | 'high';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

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

export interface Event {
  id: string;
  name: string;
  category: EventCategory;
  format: string;
  start_date: string;
  end_date?: string | null;
  registration_deadline?: string | null;
  location?: string | null;
  time_control?: string | null;
  description?: string | null;
  status: EventStatus;
  capacity?: number | null;
  coordinator_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  member_id: string;
  status: RegistrationStatus;
  check_in_at?: string | null;
  score: number;
  notes?: string | null;
  created_at: string;
}

export interface Match {
  id: string;
  event_id: string;
  round: number;
  board: number;
  white_member_id?: string | null;
  black_member_id?: string | null;
  result: MatchResult;
  recorded_by?: string | null;
  played_at?: string | null;
  notes?: string | null;
  created_at: string;
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
