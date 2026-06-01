# CLAUDE.md

Context for Claude Code and Lovable's Claude integration. Read this before making changes.

## What this project is

The web frontend for AG's personal running-form analyzer. The hard work — pose estimation, biomechanics extraction, FFT-based cadence, rule-based coaching — lives in a separate FastAPI + MediaPipe service. This repo is the **thin, fast, opinionated client** that consumes that API.

## Stack realities

- **Vite + React 18 + TypeScript** (not Next.js — Lovable's default).
- **Tailwind + shadcn/ui** for components. Use shadcn primitives where they exist; build only when they don't.
- **TanStack Query** for all server state. Don't `useEffect(fetch)`.
- **React Router v6** for navigation.
- **No Next.js features** — no `app/`, no server components, no `next/image`. Plain Vite SPA.
- **No Supabase** in this project (the backend handles persistence). If auth gets added later, it'll be JWT against the FastAPI service.

## Design system — DO NOT drift

The palette and typography were chosen deliberately. Don't redesign without explicit approval.

- **Background**: warm charcoal `oklch(0.16 0.01 60)`
- **Surface**: `oklch(0.21 0.012 60)`
- **Foreground**: `oklch(0.96 0.005 90)`
- **Accent (sodium amber)**: `oklch(0.78 0.16 70)` — used for primary actions and highlights
- **Muted**: `oklch(0.55 0.02 70)`
- **Fonts**: Fraunces (display, headings), Archivo (UI, body, mono-ish numbers)

All tokens are in `tailwind.config.ts`. Use Tailwind utilities (`bg-bg`, `text-fg`, `bg-accent`, `font-display`) — never hardcode hex.

## API contract — source of truth is `src/lib/api.ts`

The FastAPI service exposes:

- `POST /analyses` — multipart `{ video: File }` → `{ id: string, status: 'queued'|'processing'|'done'|'failed' }`
- `GET /analyses/:id` — full record with metrics + report when `status === 'done'`
- `GET /analyses` — paginated list
- `DELETE /analyses/:id` — 204 on success
- `GET /analyses/:id/video` — annotated MP4 (stream)
- `GET /analyses/:id/skeleton.jpg` — single overlay frame

Types live in `src/lib/types.ts`. Keep these in lockstep with the backend's Pydantic models.

## Conventions

- **Path traversal**: any user-supplied ID hits the API — never construct file paths client-side.
- **Polling**: while `status !== 'done' | 'failed'`, poll `GET /analyses/:id` every 2s via `useQuery({ refetchInterval })`. Stop on terminal state.
- **Errors**: surface backend errors plainly. No silent retries on 4xx.
- **Mobile-first**: every page must work at 380px. Default Tailwind breakpoint is desktop-up.
- **Delete UX**: optimistic — remove from list immediately, rollback on failure.

## What's done vs what's not

See `HANDOVER.md` for current sprint state and the next unblocked task.

## Tone

AG prefers direct, honest assessment over optimistic reporting. If something is broken, say so. If a request is ambiguous, ask. Don't claim work is done when it isn't.
