# HANDOVER

## Current sprint

**Goal:** stand up the Lovable web client so it can talk to the existing FastAPI analyzer backend.

## Status

### Done in this scaffold
- Vite + React + TS + Tailwind + shadcn-ready config
- Design tokens wired (warm charcoal + sodium amber, Fraunces/Archivo)
- API client (`src/lib/api.ts`) matching the FastAPI contract
- Type definitions for `Analysis`, `Metrics`, `CoachingReport`
- Five page stubs (Home, Analyze, Results, History, Compare) with routing
- Upload dropzone component
- TanStack Query polling pattern on Results
- Env config (`VITE_API_BASE_URL`)

### Not done — open work
1. **shadcn install** — run `npx shadcn@latest init` inside Lovable, accept defaults except color = "neutral". Then add: `button card input dialog skeleton sonner badge progress`.
2. **CORS on backend** — the FastAPI service needs to allow the Lovable preview origin (`*.lovableproject.com` during dev, your prod domain after).
3. **Real iPhone clip end-to-end** — the single highest-leverage unresolved action from the backend project still applies here: upload a real clip through this UI and verify `thresholds.yaml` calibration holds.
4. **Annotated video player** — current `Results.tsx` uses a plain `<video>`. Consider a custom scrubber with frame-stepping for biomechanics inspection.
5. **Compare page** — stub only. Needs the two-clip side-by-side metric diff once `/analyses` returns enough records to compare.
6. **Auth** — deferred. Backend is currently local-only / single-user. Revisit if this gets shared.

## Backend assumptions baked in

- Runs at `VITE_API_BASE_URL` (default `http://localhost:8000`).
- All endpoints listed in `CLAUDE.md` are live.
- Path-traversal protection lives server-side; client just passes IDs.

## Workflow

1. Push this scaffold to GitHub: `ArtDirect/running-form-analyzer-web` (private).
2. In Lovable, "Connect to GitHub" → pick that repo.
3. First Lovable prompt: *"Install shadcn/ui and add the components listed in HANDOVER.md, then wire up the upload flow on /analyze."*
4. Iterate visually from there.

## Known frictions

- Lovable's preview cannot reach `localhost:8000`. For Lovable preview testing, either expose the FastAPI service via ngrok/Cloudflare Tunnel, or deploy a staging backend.
- Mobile Safari has quirks with `<video>` autoplay + inline playback. Test on real device before assuming desktop behavior translates.
