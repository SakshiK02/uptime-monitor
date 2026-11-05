# PingWatch — Frontend

An uptime-monitoring SaaS frontend (think a mini UptimeRobot): add a URL, it gets checked automatically on a schedule, and you're alerted the moment it goes down. Built against a Django + DRF backend (not included in this repo).

## Tech stack

React 18 + Vite + TypeScript (strict) + Tailwind CSS v4 + React Router + TanStack Query + axios + react-hook-form + zod + recharts.

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Environment variables

Copy `.env.example` to `.env` and adjust:

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | Base URL the frontend calls when `VITE_USE_MOCK=false`. |
| `VITE_USE_MOCK` | `false` | When `true`, all API calls are served by an in-memory, localStorage-backed mock layer — no backend required. |

This repo ships with `.env` set to `VITE_USE_MOCK=true` so you can see the UI immediately with seeded demo data (any username/password logs you in). Switch it to `false` once your Django backend is running.

## Mock mode

With `VITE_USE_MOCK=true`, [src/mocks/store.ts](src/mocks/store.ts) seeds three demo monitors into `localStorage` — one healthy, one with a past and an ongoing outage — with ~24h of simulated check history, so the dashboard, charts, and incident views have real-looking data from the first load. Delete the `uptime_mock_db` localStorage key to reset it.

## Project structure

```
src/
  api/          axios instance + interceptors, token store, one file per resource (mock-aware)
  components/   shared UI (Layout, Modal, StatusBadge, forms, ...)
  context/      AuthContext (JWT session), ToastContext
  hooks/        TanStack Query hooks, one file per resource
  mocks/        localStorage-backed mock backend (mock mode only)
  pages/        Dashboard, Monitors (list/CRUD), Monitor detail, Incidents, Settings
  types/        domain types (Monitor, Check, Incident, AlertChannel)
  utils/        formatting + uptime-percentage helpers
```

## Domain model

- **Monitor** — a URL to check, with an interval (minutes) and active/paused flag
- **Check** — one ping result: status, response time, HTTP status code, timestamp
- **Incident** — a span of consecutive failed checks for a monitor (open until resolved)
- **AlertChannel** — where to send a notification when a monitor's status changes (email or Telegram)

## Auth notes

- The access token is kept in memory only; the refresh token is kept in `localStorage`.
- The axios response interceptor retries a request once after a successful token refresh; concurrent 401s share one in-flight refresh call.

## Backend integration (when ready)

Point `VITE_API_BASE_URL` at your Django + DRF API and set `VITE_USE_MOCK=false`. Expected endpoints:

- `POST /auth/token/`, `POST /auth/token/refresh/`, `POST /auth/register/`, `GET /auth/me/`
- `GET|POST|PUT|DELETE /monitors/[:id/]`, `GET /monitors/:id/checks/?hours=24`
- `GET /incidents/?monitor=:id`
- `GET|POST|DELETE /alert-channels/[:id/]`

The actual pinging, incident detection, and alert dispatch are expected to run as backend cron jobs (e.g. Celery Beat or `django-crontab`) — the frontend only ever reads results and manages configuration.
