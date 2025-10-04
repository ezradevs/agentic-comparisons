# Architecture Overview

## High-Level Design

The Chess Club Admin Portal is split into two deployable units:

1. **Backend API (`/src`)** – Express 5 + TypeScript service backed by SQLite. It exposes authenticated REST endpoints for members, events, matches, announcements, and dashboard analytics.
2. **Frontend SPA (`/frontend`)** – React + Vite + Tailwind UI consuming the API to present a rich administrative console.

## Backend

### Core Modules

| Module | Responsibility |
| --- | --- |
| `src/app.ts` | Express factory configuring middleware, routes, and error handling |
| `src/config` | Environment resolution (`.env.local`, `.env`), port/secret/db path management |
| `src/db/database.ts` | Creates the SQLite connection via `better-sqlite3` with WAL + FK enforcement |
| `src/db/migrations.ts` | Idempotent schema creation for users, members, events, registrations, matches, announcements |
| `src/services/*` | Domain services encapsulating database access and business rules |
| `src/routes/*` | REST endpoints using Zod for validation and auth middleware for protection |
| `src/scripts/seed.ts` | Seed routine populating demo users, members, events, matches, announcements |

### Data Model

- **users**: staff accounts with role (`admin`, `director`, `organizer`)
- **members**: club roster with contact details, ratings, membership lifecycle metadata
- **events**: tournaments/leagues/training sessions; contain scheduling, format, and publication status
- **event_registrations**: join table linking members to events with scoring and attendance state
- **matches**: per-event round/board pairings with results for standings computation
- **announcements**: time-bound bulletin posts with priority labels

Every table records `created_at`/`updated_at` timestamps for auditability.

### Authentication

- Passwords hashed with `bcryptjs`
- JWT token issuance via `jsonwebtoken`; secret configurable via `JWT_SECRET`
- `authenticate` middleware guards `/api/*` routes
- Role-based helper (`requireRole`) is available for future granular permissions

### Validation & Error Handling

- Request payloads validated using Zod schemas in `src/types/schemas.ts`
- Central `errorHandler` converts thrown errors into JSON responses (400/404) and logs stack traces for diagnostics

## Frontend

### Application Shell

- `src/App.tsx` defines routing with a protected admin layout and login screen
- `components/layout/AdminLayout.tsx` renders the sidebar/topbar shell with responsive behavior
- Zustand (`src/store/authStore.ts`) holds auth state, token persistence, and profile hydration
- TanStack Query handles remote data fetching, caching, and mutation lifecycles

### Feature Areas

| Feature | Files |
| --- | --- |
| Dashboard | `pages/DashboardPage.tsx`, `components/ui/*` statistics widgets |
| Members | `pages/MembersPage.tsx`, `pages/MemberDetailPage.tsx`, `components/members/MemberForm.tsx` |
| Events | `pages/EventsPage.tsx`, `pages/EventDetailPage.tsx`, `components/events/EventForm.tsx` |
| Announcements | `pages/AnnouncementsPage.tsx` |
| Auth | `pages/LoginPage.tsx`, `components/ProtectedRoute.tsx` |

Tailwind provides design primitives; custom utility components (`StatCard`, `DataTable`, `StatusBadge`, `Modal`, etc.) keep UI consistent.

### State & Networking Strategy

- **Auth tokens** saved to `localStorage` and injected via Axios request interceptor (`src/lib/apiClient.ts`)
- **Query invalidation** ensures UI consistency after mutations (members, events, registrations, matches, announcements)
- **Form components** encapsulate complex input flows (member + event forms) with minimal repetition

## Testing

Backend unit tests (Node's built-in `node:test`) cover the core service layers:

- `authService` issuing JWT tokens
- `memberService` CRUD and filtering
- `eventService` standings aggregation
- `announcementService` lifecycle

Add Vitest/Playwright or Cypress for expanded coverage as the UI evolves.

## Build & Deployment Flow

1. `npm run build` – compiles backend TypeScript into `dist/`
2. `npm run build` in `/frontend` – outputs static assets in `frontend/dist`
3. Docker compose (see `docs/deployment.md`) bundles the API and static frontend for production

## Future Enhancements

- Extend auth roles (e.g., directors vs organizers) with route-level restrictions
- Add attendance tracking and payment records to the data model
- Integrate pairing logic / rating updates directly into `eventService`
- Implement websocket updates for live boards and standings
