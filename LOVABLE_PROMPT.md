# Lovable kickoff prompt

Paste this as your first message in Lovable after connecting the repo.

---

I'm connecting an existing scaffold. Don't rewrite the structure — extend it.

The project is a mobile-first web client for a personal running-form analyzer.
The FastAPI backend already exists and runs separately. This frontend just consumes its API.

Read these files first:
- `CLAUDE.md` (full project context, stack rules, design tokens, do-not-drift list)
- `HANDOVER.md` (current sprint state and the next unblocked tasks)
- `README.md` (overview + routes + API contract)

Then please do this, in order:

1. Install shadcn/ui: `npx shadcn@latest init` with `--defaults` and base color = "neutral". Then add these components:
   `button card input dialog skeleton sonner badge progress select`

2. Replace the plain HTML elements in my page stubs with shadcn equivalents where it makes sense — but keep the existing classnames and design tokens. Don't change colors. Don't change typography. The palette in `tailwind.config.ts` is final.

3. On `/analyze`, wire up an upload progress indicator using shadcn `<Progress>` bound to the fetch upload progress (use `XMLHttpRequest` if needed for progress events).

4. On `/results/:id`, add a quality-gate warning banner (using shadcn `<Alert>`) when `metrics.quality_score < 0.6`.

5. Verify everything still builds. Run typecheck. Don't add any backend code — the FastAPI service is out of scope for this repo.

When unsure: ask. Don't guess and apologize later.
