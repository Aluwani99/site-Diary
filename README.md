# Site Diary

A small web app for a site team to keep a daily diary: log entries, filter by
contract, and see a count of entries per contract.

## Stack

- **Backend:** Node.js + Express, REST API, JSON file storage (`backend/data/entries.json`)
- **Frontend:** Vue 3 + Vite

I picked JSON-file storage over SQLite because the task allowed either, and a
flat file is one less moving part to explain and run — no native module
compilation, no schema migrations, just `fs.readFileSync` / `writeFileSync`.
The storage layer (`backend/db.js`) is isolated behind two functions
(`getAllEntries`, `addEntry`), so swapping in SQLite later only means
rewriting that one file.

## How to run it

Two terminals, backend first:

```bash
# Terminal 1 - backend (http://localhost:3001)
cd backend
npm install
npm start

# Terminal 2 - frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api/*` requests to
the backend on port 3001 (see `frontend/vite.config.js`), so there's no CORS
setup needed in dev.

## API

| Method | Endpoint                          | Description                                  |
|--------|------------------------------------|-----------------------------------------------|
| GET    | `/api/entries`                    | List entries, newest first                    |
| GET    | `/api/entries?contract=<text>`    | List entries, filtered by contract (case-insensitive, partial match) |
| POST   | `/api/entries`                    | Create an entry (validated server-side)       |
| GET    | `/api/entries/summary`            | Entries grouped by contract with counts       |

## Project structure

```
backend/
  server.js          # Express app setup + route mounting only
  routes/entries.js   # HTTP handlers for /api/entries*
  validateEntry.js     # Pure validation function, no HTTP/Express in it
  db.js                # JSON file read/write, the only place that touches disk
  data/entries.json    # Storage

frontend/
  src/
    App.vue             # Page state + wiring; owns entries/summary/filter state
    api.js              # All fetch() calls, in one place
    components/
      EntryForm.vue      # Add-entry form + client-side validation
      EntryFilter.vue    # Contract filter input (v-model)
      EntryList.vue       # Presentational list (props in, no logic)
      SummaryView.vue     # Presentational summary table
```

The split is deliberate: components that talk to the network (`App.vue`)
are kept separate from purely presentational ones (`EntryList`,
`SummaryView`), and validation logic is a plain function
(`validateEntry.js`) so it's easy to point to and reason about on its own,
independent of Express.

## Decisions / trade-offs

- **Validation runs in two places.** The backend is the source of truth
  (`validateEntry.js`) — it's what actually rejects bad data. The frontend
  (`EntryForm.vue`) repeats a lighter version of the same checks so the user
  gets instant feedback instead of waiting on a round trip. If the backend
  returns errors anyway (e.g. a race on the future-date check), the form
  surfaces those too.
- **Date comparison ignores time-of-day.** "No future dates" compares
  calendar days, not exact timestamps, so an entry dated "today" always
  passes regardless of the time it's submitted.
- **Filter is substring, case-insensitive**, not an exact match — closer to
  how someone would actually search for "Hilltop" and expect "Hilltop Mall"
  to show up.
- **No pagination.** Fine for a site diary's realistic entry volume; noted
  below as a "next" item if this had to scale.

## Where AI helped, and what I checked by hand

I used Claude to generate the initial implementation of both the backend
(routes, validation, JSON storage) and the frontend (components, API
wrapper, styling) from the task brief, then reviewed and tested it rather
than shipping it blind:

- Ran the backend directly with `curl` for every endpoint, including the
  validation failure cases (future date, missing notes, notes over 500
  characters) to confirm the error responses actually work, not just that
  the code compiles.
- Ran `npm run build` on the frontend to catch any compile-time issues, then
  ran the Vite dev server against the live backend (through the proxy) to
  confirm the list, add-entry, filter, and summary flows work together, not
  just in isolation.
- Traced through `validateEntry.js` and `routes/entries.js` line by line to
  make sure I could explain each check and each response shape without
  looking anything up.
- Checked the sorting logic (`sortNewestFirst`) and the summary grouping
  (`reduce`-style count in `routes/entries.js`) manually against the test
  data I posted, to confirm the ordering and counts were actually correct
  and not just "looked right."

What I did not hand-verify in depth: the exact CSS in `style.css` — that's
low-risk, cosmetic, and doesn't affect correctness, so I spent the time
budget on the logic instead.

## What I'd do next with more time

- **Edit/delete entries** — currently append-only, which was fine for the
  brief but not realistic for a real diary (typos happen).
- **Automated tests** — `validateEntry.js` in particular is a pure function
  and would be trivial to unit test (Jest/Vitest); I'd add that first.
- **Pagination or date-range filtering** once entry counts grow.
- **Move storage to SQLite** — `db.js` already isolates the storage calls,
  so this would mean rewriting one file, not the routes or the frontend.
- **Loading/error states polish** on the frontend — currently a bare error
  message; would add proper loading spinners and retry affordance.
- **Author name as a dropdown of known site staff** instead of free text,
  to cut down on typos/inconsistent names in the summary view.
