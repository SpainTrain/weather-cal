# Manual Testing & Release Verification

Checklist for verifying a release (especially dependency waves) before and
after deploy. Automated coverage (unit, handler, rules suites in CI) gates
merges; this list covers what automation can't see: real Google services,
real OpenWeather data, and the production deploy itself.

**Live-user note:** connected calendars only touch `GET /forecast` (server-side
polls). Deploy functions first and verify that endpoint before touching
hosting — if the curl in Stage B returns valid `.ics`, connected users are
safe. Calendar clients keep last-fetched events on a failed poll, so even a
bad window degrades to a stale forecast, not breakage.

## Stage A — local build, real backend (~10 min)

The frontend has no emulator wiring, so a locally served build talks to the
real Firebase project:

```bash
cd frontend && npm run build && cd ..
firebase emulators:start --only hosting    # open http://localhost:5000
```

Keep the devtools console open throughout — it should stay clean.

1. **Log in with Google** — redirect completes, calendar view loads. Log out,
   log back in. *(exercises firebase auth)*
2. **Location picker** — type a city, autocomplete suggests, selection moves
   map + marker; reload and the location persists. *(exercises
   @vis.gl/react-google-maps — spend the most time here after Maps bumps)*
3. **Units toggle** — flips imperial/metric, survives refresh, no flicker or
   re-render loops. *(exercises MUI + the Firestore snapshot path)*
4. **Add-to-calendar accordions** — Google/Apple/Outlook each expand with
   instructions; clicking again collapses; Copy shows "Copied", resets ~3s,
   clipboard contains the webcal URL. *(exercises MUI Accordion/Grid)*

## Stage B — deploy functions, verify, then hosting (~10 min)

```bash
firebase deploy --only functions   # predeploy runs lint + build
```

5. **The `.ics` endpoint** — this is exactly what calendar clients see. Get
   your uid from the copied webcal URL (`calid=...`):

   ```bash
   curl -s "https://calendars.raodix.com/forecast?calid=<your-uid>" | head -30
   ```

   Expect `BEGIN:VCALENDAR`, ~8 `VEVENT`s with emoji summaries like
   `☀️ 46°/30° F`, and the unit matching your setting.
6. **Function logs** — `firebase functions:log`: clean `completed` entries,
   no stack traces, on your curl and the first organic calendar polls.
7. Only when 5–6 pass: `firebase deploy --only hosting`, then fast-repeat
   Stage A items 1–4 on https://calendars.raodix.com.
8. **Real calendar refresh** — confirm an existing Google/Apple Calendar
   subscription still shows forecast events. Pollers can take hours to
   re-poll; the Stage B curl is the authoritative check.
9. Optional: confirm the session appears in FullStory.

## Rollback

- **Hosting:** Firebase console → Hosting → roll back to the previous release
  (one click).
- **Functions:** `git checkout <previous-main-sha> && firebase deploy --only
  functions`.
- Each dependency landed as its own commit on main, so `git log --oneline`
  gives a clean bisect trail for isolating a suspect bump.
