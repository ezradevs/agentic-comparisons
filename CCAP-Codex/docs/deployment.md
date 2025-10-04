# Deployment Guide

This document outlines recommended approaches for running the Chess Club Admin Portal in production.

## 1. Configuration

### Environment variables

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | Backend HTTP port | `4000` |
| `JWT_SECRET` | Secret for signing JWT tokens | **required** |
| `DB_PATH` | Absolute path to SQLite database file | `./data/chess-club.db` |
| `NODE_ENV` | Runtime mode | `production` |

Set variables via `.env` files or your orchestration platform (Docker, Kubernetes, etc.).

## 2. Docker Compose (recommended)

A ready-to-run compose file is provided:

```bash
docker compose up --build
```

Services:

- `api` – Express/TypeScript backend exposed on `localhost:4000`
- `web` – Nginx serving the built React SPA on `localhost:5173` and proxying `/api` to the backend

Persistent data is stored in the named volume `chessclub_data`.

### Customising secrets

Set `JWT_SECRET` when running compose:

```bash
JWT_SECRET="super-secret" docker compose up --build -d
```

## 3. Manual deployment steps

### Backend

```bash
npm install
npm run build
NODE_ENV=production JWT_SECRET=... PORT=4000 node dist/server.js
```

SQLite will create `/data/chess-club.db` automatically. Use managed PostgreSQL/MySQL by swapping `better-sqlite3` with your driver and updating services if you need horizontal scale.

### Frontend

```bash
cd frontend
npm install
npm run build
npx serve dist  # or any static file host (Nginx, S3 + CloudFront, Netlify)
```

If hosting behind a different origin than the API, ensure CORS is configured on the backend and adjust `proxy`/API base URL in `frontend/vite.config.ts` or via environment variables.

## 4. Observability & Ops

- **Logging:** API logs to stdout; pipe into your logging stack (e.g., `docker logs`, CloudWatch)
- **Backups:** For SQLite, snapshot the `chessclub_data` volume or file regularly
- **Health checks:** `GET /health` returns `{"status":"ok"}` for liveness probes
- **Scaling:** The current stack suits small/mid-sized clubs. Consider migrating to PostgreSQL + connection pooling under heavier concurrency.

## 5. Security Checklist

- Change `JWT_SECRET` in production
- Serve traffic over HTTPS (terminated at load balancer or reverse proxy)
- Restrict access to the docker socket/volume storing the database
- Rotate admin credentials seeded in development; create organisation-specific accounts

## 6. Continuous Integration

Suggested pipeline:

1. Install dependencies (`npm ci` + `npm ci` in `frontend/`)
2. Run tests (`npm test`)
3. Build backend (`npm run build`) and frontend (`npm run build` in `frontend/`)
4. Build/push Docker images (`docker compose build` or separate Dockerfiles)
5. Deploy to target infrastructure

Feel free to extend with linting, formatting, or E2E suites as the project grows.
