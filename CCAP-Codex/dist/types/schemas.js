"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.announcementUpdateSchema = exports.announcementCreateSchema = exports.matchUpdateSchema = exports.matchCreateSchema = exports.registrationUpdateSchema = exports.registrationCreateSchema = exports.eventUpdateSchema = exports.eventCreateSchema = exports.memberUpdateSchema = exports.memberCreateSchema = exports.loginSchema = exports.idSchema = void 0;
const zod_1 = require("zod");
const memberStatuses = ['active', 'inactive', 'guest', 'alumni'];
const eventCategories = ['tournament', 'league', 'training', 'social'];
const eventStatuses = ['draft', 'published', 'completed', 'cancelled'];
const registrationStatuses = ['registered', 'waitlisted', 'withdrawn', 'checked_in'];
const matchResults = ['white', 'black', 'draw', 'forfeit', 'pending'];
const announcementPriorities = ['normal', 'high'];
exports.idSchema = zod_1.z.string().min(1);
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
exports.memberCreateSchema = zod_1.z.object({
    first_name: zod_1.z.string().min(1),
    last_name: zod_1.z.string().min(1),
    preferred_name: zod_1.z.string().min(1).optional().or(zod_1.z.literal('').transform(() => undefined)),
    rating: zod_1.z.number().int().min(0).optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().min(7).optional(),
    uscf_id: zod_1.z.string().min(4).optional(),
    status: zod_1.z.enum(memberStatuses).default('active'),
    join_date: zod_1.z.string().optional(),
    membership_expires_on: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional()
});
exports.memberUpdateSchema = exports.memberCreateSchema.partial();
exports.eventCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    category: zod_1.z.enum(eventCategories),
    format: zod_1.z.string().min(1),
    start_date: zod_1.z.string().min(1),
    end_date: zod_1.z.string().optional(),
    registration_deadline: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    time_control: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(eventStatuses).default('draft'),
    capacity: zod_1.z.number().int().min(0).optional(),
    coordinator_id: zod_1.z.string().optional()
});
exports.eventUpdateSchema = exports.eventCreateSchema.partial();
exports.registrationCreateSchema = zod_1.z.object({
    member_id: zod_1.z.string().min(1),
    status: zod_1.z.enum(registrationStatuses).optional(),
    notes: zod_1.z.string().optional()
});
exports.registrationUpdateSchema = zod_1.z.object({
    status: zod_1.z.enum(registrationStatuses).optional(),
    score: zod_1.z.number().min(0).optional(),
    notes: zod_1.z.string().optional(),
    check_in_at: zod_1.z.string().optional()
});
exports.matchCreateSchema = zod_1.z.object({
    event_id: zod_1.z.string().min(1),
    round: zod_1.z.number().int().min(1),
    board: zod_1.z.number().int().min(1),
    white_member_id: zod_1.z.string().optional(),
    black_member_id: zod_1.z.string().optional(),
    result: zod_1.z.enum(matchResults).optional(),
    played_at: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional()
});
exports.matchUpdateSchema = zod_1.z.object({
    round: zod_1.z.number().int().min(1).optional(),
    board: zod_1.z.number().int().min(1).optional(),
    white_member_id: zod_1.z.string().optional(),
    black_member_id: zod_1.z.string().optional(),
    result: zod_1.z.enum(matchResults).optional(),
    played_at: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional()
});
exports.announcementCreateSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    body: zod_1.z.string().min(1),
    priority: zod_1.z.enum(announcementPriorities).default('normal'),
    publish_at: zod_1.z.string().optional(),
    expires_at: zod_1.z.string().optional()
});
exports.announcementUpdateSchema = exports.announcementCreateSchema.partial();
