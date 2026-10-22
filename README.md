# ⏱️ Hobbies Time Tracker

Track the time people spend on their hobbies. Pick (or add) an entrant and a hobby, press **Start**, and watch the timer run. **Pause** or **Stop** at any time, and finish with a celebration screen.

> **Status: boilerplate (v0.1).** The structure, database schema and API routes are in place. Routes return **placeholder** data, and the timer buttons are stubs. Look for `TODO` comments to see what comes next.

---

## Tech stack

| Layer     | Technology                                      | Why                                                |
|-----------|-------------------------------------------------|----------------------------------------------------|
| Front end | Plain HTML, CSS, JavaScript (no framework)      | Nothing to compile. Edit and refresh the browser.  |
| Back end  | [Node.js](https://nodejs.org) 22+ with [Express 5](https://expressjs.com) | Small, popular web server for JSON APIs. |
| Database  | [SQLite](https://sqlite.org) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | A single file on disk. No database server to install. |

---

## Project structure

```
hobbie-time-tracker/
├── package.json          ← project metadata, dependencies, npm scripts
├── data/                 ← SQLite database file is created here (git-ignored)
├── server/               ← BACK END (runs in Node.js)
│   ├── server.js         ← entry point: starts Express, serves /public, mounts /api routes
│   ├── db/
│   │   ├── database.js   ← opens the SQLite connection and applies the schema
│   │   └── schema.sql    ← table definitions: entrants, hobbies, time_entries
│   └── routes/
│       ├── entrants.js   ← GET  /api/entrants, POST /api/entrants
│       ├── hobbies.js    ← POST /api/hobbie
│       └── time.js       ← GET  /api/time
└── public/               ← FRONT END (runs in the browser)
    ├── index.html        ← page layout
    ├── css/styles.css    ← styling
    └── js/app.js         ← calls the API and updates the page
```

**How a request flows:** the browser loads `index.html` → `app.js` calls `fetch('/api/entrants')` → Express routes it to `server/routes/entrants.js` → (later) that route queries SQLite → JSON goes back → `app.js` renders it on the page.

---

## Run it locally

### 1. Prerequisites (one-time)

- **Node.js 22 or newer** (the LTS version is recommended). Check what you have:
  ```bash
  node --version
  ```
  If the command isn't found or shows a version below `v22`, download the LTS installer from <https://nodejs.org>. npm comes bundled with it.
- **Git**, to clone the repository: <https://git-scm.com/downloads>

### 2. Get the code

```bash
git clone https://github.com/EnergyMatrix-Eve/hobbie-time-tracker.git
cd hobbie-time-tracker
```

### 3. Install dependencies

```bash
npm install
```

This downloads Express and better-sqlite3 into a `node_modules/` folder. Run it again whenever `package.json` changes.

### 4. Start the server

```bash
npm run dev
```

You should see:

```
Hobbies Time Tracker running at http://localhost:3000
SQLite database: .../hobbie-time-tracker/data/hobbies.db
```

### 5. Open the app

Go to **<http://localhost:3000>** in your browser. The green badge under the title should read
`Server OK · DB tables: entrants, hobbies, time_entries`.

### 6. Stop the server

Press **Ctrl + C** in the terminal.

---

## npm scripts

| Command         | What it does                                                                 |
|-----------------|------------------------------------------------------------------------------|
| `npm run dev`   | Starts the server and **restarts it automatically** when you save a file in `server/`. Use this while developing. |
| `npm start`     | Starts the server once, with no auto-restart.                                |

Changes to files in `public/` (HTML, CSS, JS) don't need a restart. Just refresh the browser.

**Use a different port** if 3000 is busy:

```bash
# macOS / Linux
PORT=3001 npm run dev
```
```powershell
# Windows PowerShell
$env:PORT=3001; npm run dev
```

---

## API

| Method | Endpoint         | Purpose                               | Body (JSON)            |
|--------|------------------|---------------------------------------|------------------------|
| GET    | `/api/health`    | Server + database check (real query)  | –                      |
| GET    | `/api/entrants`  | List entrants                         | –                      |
| POST   | `/api/entrants`  | Add an entrant                        | `{ "name": "Alex" }`   |
| POST   | `/api/hobbie`    | Add a hobby                           | `{ "name": "Guitar" }` |
| GET    | `/api/time`      | Accumulated time per entrant & hobby  | –                      |

### Try the API from the terminal (while the server is running)

**macOS / Linux / Git Bash:**
```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/entrants
curl -X POST http://localhost:3000/api/entrants -H "Content-Type: application/json" -d '{"name":"Alex"}'
```

**Windows PowerShell:**
```powershell
Invoke-RestMethod http://localhost:3000/api/health
Invoke-RestMethod http://localhost:3000/api/entrants
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/entrants -ContentType 'application/json' -Body '{"name":"Alex"}'
```

You can also paste any `GET` URL straight into the browser.

---

## Database

- The file `data/hobbies.db` is **created automatically** the first time the server starts.
- `server/db/schema.sql` runs on every start. `CREATE TABLE IF NOT EXISTS` means existing data is never touched.
- You'll also see `hobbies.db-wal` and `hobbies.db-shm` next to it. These are normal SQLite working files (WAL mode), so leave them alone.
- **To reset the database**, stop the server, delete the three `data/hobbies.db*` files, and start it again.
- **To browse the data**, open `data/hobbies.db` in [DB Browser for SQLite](https://sqlitebrowser.org) (free) or a VS Code SQLite extension.

### Data model

```
entrants (1) ──< time_entries >── (1) hobbies
```

| Table          | Key columns                                                                 |
|----------------|-----------------------------------------------------------------------------|
| `entrants`     | `id`, `name` (unique), `created_at`                                         |
| `hobbies`      | `id`, `name` (unique), `created_at`                                         |
| `time_entries` | `id`, `entrant_id` → entrants, `hobby_id` → hobbies, `started_at`, `ended_at`, `duration_seconds` (active time, pauses excluded) |

Timestamps are stored in **UTC**. Convert to local time when displaying.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Port 3000 is already in use` | Another copy of the server is still running. Close that terminal or press Ctrl + C in it, or use a different `PORT` (see above). |
| `npm install` fails while building **better-sqlite3** | This usually means your Node version has no prebuilt binary. Install the current **LTS** Node from nodejs.org, delete `node_modules`, and run `npm install` again. |
| `npm` / `node` not recognised (Windows) | Close and reopen the terminal after installing Node so it picks up the new PATH. |
| Page loads but badge says **Server not reachable** | Make sure you opened `http://localhost:3000` (served by Node), not the `index.html` file directly from disk. |
| Changes to the page don't show | Hard refresh: **Ctrl + Shift + R** (Windows) / **Cmd + Shift + R** (macOS). |

---

## Roadmap

- [ ] Replace placeholder routes with real SQLite queries (see `TODO`s in `server/routes/`)
- [ ] Working timer: start / pause / resume / stop
- [ ] Save finished sessions to `time_entries`
- [ ] "Cool" finish display and hobby animations
- [ ] Accumulated time per hobby and encouraging messages

**Out of scope:** payments, deployment.
