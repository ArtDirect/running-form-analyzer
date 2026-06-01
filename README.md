# Running Form Analyzer — Web

Mobile-first web client for the personal running-form analyzer. Upload an iPhone clip → get a biomechanics breakdown (cadence, stride, vertical oscillation, knee angles, foot strike) plus a coaching report.

## Stack

- **Vite + React 18 + TypeScript** — Lovable's default scaffold
- **Tailwind CSS + shadcn/ui** — UI primitives
- **React Router** — navigation
- **TanStack Query** — server state + polling
- **Backend** — FastAPI + MediaPipe service running separately (see `VITE_API_BASE_URL`)

## Design tokens

Warm charcoal background, sodium-amber accent, Fraunces (display) + Archivo (UI). All tokens live in `tailwind.config.ts` and `src/index.css`.

## Local dev

```bash
npm install
cp .env.example .env.local   # set VITE_API_BASE_URL
npm run dev
```

The backend service should be running at the URL in `VITE_API_BASE_URL` (default: `http://localhost:8000`).

## Routes

| Path             | Page          | Purpose                                      |
|------------------|---------------|----------------------------------------------|
| `/`              | Home          | Hero + recent clips + CTA                    |
| `/analyze`       | Analyze       | Upload clip, poll for processing             |
| `/results/:id`   | Results       | Annotated video, metrics, coaching report    |
| `/history`       | History       | List + delete (optimistic UI)                |
| `/compare`       | Compare       | Multi-clip diff view                         |

## API contract

Documented in `src/lib/api.ts`. Endpoints expected:

- `POST /analyses` — multipart upload, returns `{ id, status }`
- `GET /analyses/:id` — returns analysis + status
- `GET /analyses` — list
- `DELETE /analyses/:id` — remove
- `GET /analyses/:id/video` — annotated MP4 stream
- `GET /analyses/:id/skeleton.jpg` — overlay JPG

## Lovable workflow

1. Connect this repo to Lovable.
2. Lovable auto-detects the Vite/Tailwind scaffold.
3. Iterate visually; pushes round-trip via GitHub.
4. `CLAUDE.md` is read by Lovable's Claude integration on every prompt.

See `HANDOVER.md` for current sprint state.
