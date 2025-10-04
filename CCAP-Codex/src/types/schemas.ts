import { z } from 'zod';
import {
  AnnouncementPriority,
  EventCategory,
  EventStatus,
  MatchResult,
  MemberStatus,
  RegistrationStatus
} from './domain';

const memberStatuses = ['active', 'inactive', 'guest', 'alumni'] as const satisfies readonly MemberStatus[];
const eventCategories = ['tournament', 'league', 'training', 'social'] as const satisfies readonly EventCategory[];
const eventStatuses = ['draft', 'published', 'completed', 'cancelled'] as const satisfies readonly EventStatus[];
const registrationStatuses = ['registered', 'waitlisted', 'withdrawn', 'checked_in'] as const satisfies readonly RegistrationStatus[];
const matchResults = ['white', 'black', 'draw', 'forfeit', 'pending'] as const satisfies readonly MatchResult[];
const announcementPriorities = ['normal', 'high'] as const satisfies readonly AnnouncementPriority[];

export const idSchema = z.string().min(1);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const memberCreateSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  preferred_name: z.string().min(1).optional().or(z.literal('').transform(() => undefined)),
  rating: z.number().int().min(0).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(7).optional(),
  uscf_id: z.string().min(4).optional(),
  status: z.enum(memberStatuses).default('active'),
  join_date: z.string().optional(),
  membership_expires_on: z.string().optional(),
  notes: z.string().optional()
});

export const memberUpdateSchema = memberCreateSchema.partial();

export const eventCreateSchema = z.object({
  name: z.string().min(1),
  category: z.enum(eventCategories),
  format: z.string().min(1),
  start_date: z.string().min(1),
  end_date: z.string().optional(),
  registration_deadline: z.string().optional(),
  location: z.string().optional(),
  time_control: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(eventStatuses).default('draft'),
  capacity: z.number().int().min(0).optional(),
  coordinator_id: z.string().optional()
});

export const eventUpdateSchema = eventCreateSchema.partial();

export const registrationCreateSchema = z.object({
  member_id: z.string().min(1),
  status: z.enum(registrationStatuses).optional(),
  notes: z.string().optional()
});

export const registrationUpdateSchema = z.object({
  status: z.enum(registrationStatuses).optional(),
  score: z.number().min(0).optional(),
  notes: z.string().optional(),
  check_in_at: z.string().optional()
});

export const matchCreateSchema = z.object({
  event_id: z.string().min(1),
  round: z.number().int().min(1),
  board: z.number().int().min(1),
  white_member_id: z.string().optional(),
  black_member_id: z.string().optional(),
  result: z.enum(matchResults).optional(),
  played_at: z.string().optional(),
  notes: z.string().optional()
});

export const matchUpdateSchema = z.object({
  round: z.number().int().min(1).optional(),
  board: z.number().int().min(1).optional(),
  white_member_id: z.string().optional(),
  black_member_id: z.string().optional(),
  result: z.enum(matchResults).optional(),
  played_at: z.string().optional(),
  notes: z.string().optional()
});

export const announcementCreateSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  priority: z.enum(announcementPriorities).default('normal'),
  publish_at: z.string().optional(),
  expires_at: z.string().optional()
});

export const announcementUpdateSchema = announcementCreateSchema.partial();
