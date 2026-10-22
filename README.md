# ⏱️ Hobbies Time Tracker

Track the time people spend on their hobbies. Tell the island guide your name, pick (or add) a hobby, press **Start**, and watch the timer run. **Pause** or **Stop** at any time, and finish with a celebration screen.

The look is a cozy island theme inspired by Animal Crossing: sky and clouds, cream panels, rounded type and bouncy motion. All artwork is original CSS/SVG, with no Nintendo assets.

> **Status: v0.2.** The welcome (name entry) screen, the screen transition and the themed tracker UI are done. The API routes still return **placeholder** data, and the timer buttons are stubs. Look for `TODO` comments to see what comes next.

---

## Tech stack

| Layer     | Technology                                      | Why                                                |
|-----------|-------------------------------------------------|----------------------------------------------------|
| Front end | Plain HTML, CSS, JavaScript (no framework)      | Nothing to compile. Edit and refresh the browser.  |
| Fonts     | [Fredoka](https://fonts.google.com/specimen/Fredoka) and [Nunito](https://fonts.google.com/specimen/Nunito) from Google Fonts | Rounded, friendly type. Needs internet; offline it falls back to system fonts. |
| Back end  | [Node.js](https://nodejs.org) 22+ with [Express 5](https://expressjs.com) | Small, popular web server for JSON APIs. |
| Database  | [SQLite](https://sqlite.org) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | A single file on disk. No database server to install. |

---

## Project structure

```
hobbie-time-tracker/
├── package.json          ← project metadata, dependencies, npm scripts
├── .npmrc                ← npm settings: skip dependency install scripts (see Troubleshooting)
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

Go to **<http://localhost:3000>** in your browser.

1. The welcome screen opens and **Tracky** (the island guide) asks for your name.
2. Type it and press **Enter** (or click **That's me!**). A leafy circle wipe takes you to the tracker.
3. The top bar should show a green dot with **Island server online**. Hover over it to see the database tables.

Click **Switch player** in the top bar to go back and enter a different name.

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
| `git clone` says `destination path 'hobbie-time-tracker' already exists` | A folder with that name is already there (e.g. an unzipped copy). Run `git -C hobbie-time-tracker status`. If it says *not a git repository*, delete or rename that folder and clone again. If it is a clone, `cd` into it and run `git pull` instead. |
| `npm install` fails with `node-gyp rebuild` / `gyp ERR! find VS` (better-sqlite3) | better-sqlite3 already ships ready-made binaries, but npm 10/11 wrongly tries to compile it when installing from `package-lock.json`. The project's `.npmrc` (`ignore-scripts=true`) prevents this. Make sure `.npmrc` exists (it starts with a dot, so it may be hidden in Explorer), delete `node_modules`, and run `npm install` again. You do **not** need Visual Studio. |
| `npm` / `node` not recognised (Windows) | Close and reopen the terminal after installing Node so it picks up the new PATH. |
| Top bar says **Island server offline** | Make sure you opened `http://localhost:3000` (served by Node), not the `index.html` file directly from disk. |
| Text looks plain instead of rounded | The Google Fonts couldn't load (no internet or blocked by a firewall). The app still works with system fonts. |
| Changes to the page don't show | Hard refresh: **Ctrl + Shift + R** (Windows) / **Cmd + Shift + R** (macOS). |

---

## Roadmap

- [x] Welcome screen: enter your name, then a smooth transition into the tracker
- [x] Cozy island theme (Animal Crossing-inspired)
- [ ] Save the player's name via `POST /api/entrants` (see `TODO` in `public/js/app.js`)
- [ ] Replace placeholder routes with real SQLite queries (see `TODO`s in `server/routes/`)
- [ ] Working timer: start / pause / resume / stop
- [ ] Save finished sessions to `time_entries`
- [ ] "Cool" finish display and hobby animations
- [ ] Accumulated time per hobby and encouraging messages

**Out of scope:** payments, deployment.
