# Weather Calendar

Firebase app serving subscribable weather-forecast calendars (iCal). Live at
[calendars.raodix.com](https://calendars.raodix.com). Two **independent** npm
packages — there is no root package.json, no workspaces:

- `functions/` — Cloud Functions Gen 2 (Node 22, CommonJS TypeScript 5.9).
  One HTTP function, `forecast`: `GET /forecast?calid=<uid>` returns an `.ics`
  calendar. Flow: `index.ts` → `getUserRecord` (Firestore) →
  `getWeatherForecast` (Firestore day-cache, else OpenWeather One Call 3.0) →
  `openWeatherDayToEvent` → ical-generator.
- `frontend/` — Vite 6 + React 18 + TypeScript 5.6 + MUI 6 SPA. Google
  sign-in, location picker (Google Maps), units toggle, webcal URL copy.
- Root — `firebase.json` (hosting rewrites `/forecast` → function; predeploy
  runs lint+build), `firestore.rules` (the app's primary security control),
  `.prettierrc` (no semicolons, single quotes, 2-space, trailing commas).

## Commands

Single-command workflows via mise (`mise.toml` at root): `mise run setup`
(all installs), `mise run check` (everything CI checks), `mise run test`,
`test:rules`, `emulators`, `deploy*`. Per-package equivalents below — run
inside the relevant package (`cd functions` or `cd frontend`):

| Command | Notes |
| --- | --- |
| `npm run lint` | functions lint is type-aware; also a firebase predeploy hook |
| `npm run build` | functions: `tsc` → `lib/` (gitignored); frontend: `tsc -b && vite build` |
| `npm test` | fast Vitest suite, no emulator needed |
| `npm run test:coverage` | coverage report (report-only, no thresholds) |
| `npm run test:rules` (repo root) | Firestore rules suite — wraps the frontend suite in `firebase emulators:exec` |

The Firebase CLI is a **root devDependency** (root `package.json`,
Renovate-managed) — use `npx firebase` or the root npm scripts
(`emulators`, `test:rules`, `deploy*`); no global install.

## Workflow: everything through PR

- **Never commit to `main`.** Branch → PR → green CI (`functions`, `frontend`,
  `rules` are required checks) → merge. A GitHub ruleset enforces this for
  everyone including admins; a local hook blocks accidental commits to main.
- CI runs lint + build + test for both packages plus the emulator-backed rules
  suite on every push/PR. Green CI on a Renovate PR is the merge signal.
- Renovate PRs: use the `renovate-maintainer` agent (see `.claude/agents/`).
  Merging is deliberate — no automerge is configured.
- Before deploying, run the manual checklist in `docs/manual-testing.md` —
  deploy functions first, verify `/forecast`, then hosting.

## Testing conventions

- Tests live **outside `src/`** (`functions/test/`, `frontend/test/`,
  `frontend/test-rules/`) so the build tsconfigs never see them.
- Explicit `import { describe, it, expect, vi } from 'vitest'` — no globals.
- Shared backend fixture: `functions/test/fixtures/open-weather.ts`.
- Firestore access is tested against an in-memory admin-SDK fake
  (`functions/test/firestore.test.ts`) — the doc-ID format tests pin the
  cache-key scheme; don't "fix" them casually.
- Frontend tests must never import `src/main.tsx` (top-level DOM access) or
  `src/App.tsx` (FullStory init at render).
- RTL auto-cleanup doesn't run (no vitest globals) — test files call
  `cleanup()` in `afterEach` explicitly.

## Gotchas

- `functions/` keeps `@types/node` on the major matching the Node 22 runtime
  (`~22.x`). Majors beyond the runtime (v26+) have historically broken the
  build; let CI be the judge on any `@types/node` bump.
- Both packages use ESLint flat config (`eslint.config.*`). The functions
  config ignores `lib`, `generated`, and `test` — test files belong to no
  tsconfig project and must stay out of type-aware linting.
- `functions/eslint.config.mjs` limits linting to `**/*.ts`, so
  `vitest.config.mts` is intentionally not linted.
- Rules tests need Java + the Firebase CLI (v13 pinned in CI) and read
  `firestore.rules` from the repo root.
- `openweather-api-node` and `firebase-functions-test` are unused deps kept to
  avoid prod-dependency churn; a cleanup PR is a known follow-up.
- Secrets: functions read `OPEN_WEATHER_KEY` via `defineSecret`; local value in
  gitignored `functions/.secret.local`. Frontend env via `VITE_*` vars
  (`frontend/.env.example`).
