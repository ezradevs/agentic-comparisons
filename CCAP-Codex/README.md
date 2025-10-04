# Chess Club Admin Portal

A full-stack administration platform designed for chess clubs to manage memberships, tournaments, announcements, and day-to-day operations with a modern, data-rich interface.

## Features

- **Secure authentication** with JWT-based sessions and role-aware authorization
- **Member management** for onboarding, tracking status, ratings, and notes
- **Event orchestration** covering registrations, pairings, match results, and live standings
- **Executive dashboard** highlighting key metrics, recent activity, and upcoming events
- **Announcement board** for high-visibility club communications
- **SQLite storage** with repeatable migrations and seed data for instant demos

## Tech Stack

- **Backend:** Node.js, Express 5, TypeScript, SQLite (better-sqlite3), Zod validation
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, TanStack Query, Zustand state management
- **Tooling:** ts-node-dev for local API development, Vite for modern frontend DX, node:test for backend unit tests

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Backend setup

```bash
npm install
npm run seed   # optional: loads demo users, members, events
npm run dev    # starts the API on http://localhost:4000
```

Key scripts:

- `npm run build` – compile TypeScript sources to `dist`
- `npm start` – run the compiled API (after `build`)
- `npm test` – execute backend service tests

### Frontend setup

```bash
cd frontend
npm install
npm run dev    # launches Vite dev server on http://localhost:5173
```

Production build commands:

```bash
cd frontend
npm run build  # outputs static assets to frontend/dist
```

### Environment variables

Create `.env.local` (already included for development) and set at least:

```
JWT_SECRET=change-me-dev-secret
PORT=4000
DB_PATH=./data/chess-club.db
```

See `docs/deployment.md` for production-ready guidance.

## Project Structure

```
.
├── src/                # Backend services, routes, data access
├── frontend/           # React application (Vite project)
├── data/               # SQLite database (created at runtime)
├── test/               # Node-based backend tests
└── docs/               # Architecture, API, and deployment notes
```

## Documentation

- [`docs/architecture.md`](docs/architecture.md) – system overview, modules, and data model
- [`docs/api-reference.md`](docs/api-reference.md) – REST endpoints and payload contracts
- [`docs/deployment.md`](docs/deployment.md) – container builds, configuration, and lifecycle ops

## Default Credentials

After running `npm run seed`, sign in with:

- Email: `director@chessclub.io`
- Password: `PlayWell!24`

## Testing & Validation

Backend unit tests exercise authentication, member workflows, event standings, and announcements:

```bash
npm test
```

Frontend builds are validated via Vite’s production build. Additional manual QA or e2e automation can be layered as needed.
