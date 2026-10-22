# ⏱️ Hobbies Time Tracker

Track the time people spend on their hobbies. Tell Tracky the quokka (the island guide) your name the first time (after that, just pick it from the list). A loading page shows **today's weather**, and the island's sky matches it: sun, clouds, rain, snow, fog, storms, day or night. Then pick (or add) a hobby, press **Start**, and watch the timer run. **Pause** or **Stop** at any time, and finish with a celebration screen.

The look is a cozy island theme inspired by Animal Crossing: sky and clouds, cream panels, rounded type and bouncy motion. All artwork is original CSS/SVG, with no Nintendo assets.

> **Status: v0.3.** Players are saved in the database and remembered. The weather loading page and weather-reactive backgrounds are done. Hobbies, time entries and the timer are still **placeholders**. Look for `TODO` comments to see what comes next.

---

## Tech stack

| Layer     | Technology                                      | Why                                                |
|-----------|-------------------------------------------------|----------------------------------------------------|
| Front end | Plain HTML, CSS, JavaScript (no framework)      | Nothing to compile. Edit and refresh the browser.  |
| Fonts     | [Fredoka](https://fonts.google.com/specimen/Fredoka) and [Nunito](https://fonts.google.com/specimen/Nunito) from Google Fonts | Rounded, friendly type. Needs internet; offline it falls back to system fonts. |
| Back end  | [Node.js](https://nodejs.org) 22+ with [Express 5](https://expressjs.com) | Small, popular web server for JSON APIs. |
| Database  | [SQLite](https://sqlite.org) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | A single file on disk. No database server to install. |
| Weather   | [Open-Meteo](https://open-meteo.com) | Free, and no account or API key needed. Called from the browser. |

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
    ├── css/styles.css    ← styling, including the weather scenes
    └── js/
        ├── app.js        ← screens, player list, calls the API, updates the page
        └── weather.js    ← today's weather: location, Open-Meteo, weather codes
```

**How a request flows:** the browser loads `index.html` → `app.js` calls `fetch('/api/entrants')` → Express routes it to `server/routes/entrants.js` → that route queries SQLite → JSON goes back → `app.js` shows the players on the page.

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

1. The welcome screen opens and **Tracky** the quokka (the island guide) greets you.
   - **First time:** type your name and press **Enter** (or click **That's me!**). Tracky remembers it.
   - **After that:** click your name in the list. New people click **+ I'm new here**.
2. A leafy circle wipe opens the **loading page**, which shows today's weather. The first time, your browser asks to use your location: **Allow** gives your local weather, **Block** uses the fallback city (see [Weather](#weather)).
3. After a few seconds (or click **Let's go!**) the tracker opens, with the sky matching the weather.
4. Today's weather appears under the **Hobbies Time Tracker** title (hover over it for the high and low).

Click **Switch player** (under the server status) to go back and pick someone else.

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
| GET    | `/api/entrants`  | List saved players (real)             | –                      |
| POST   | `/api/entrants`  | Add a player (real), see below        | `{ "name": "Alex" }`   |
| POST   | `/api/hobbie`    | Add a hobby (placeholder)             | `{ "name": "Guitar" }` |
| GET    | `/api/time`      | Accumulated time per player & hobby (placeholder) | –          |

`POST /api/entrants` returns the player as `{ "id", "name", "created_at" }`:

- **201 Created:** a new player was saved.
- **200 OK:** that name already exists (matching ignores upper/lower case), so you get the existing player back, not a duplicate.
- **400 Bad Request:** the name is empty or longer than 20 characters.

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

## Weather

- **Where it comes from:** [Open-Meteo](https://open-meteo.com), free with no key. `public/js/weather.js` calls it straight from the browser. The browser already knows how to get through office proxies and certificates, and there's no secret key to protect.
- **Location:** the browser asks permission once. Your position is rounded to about 1 km before it's sent, which is plenty for weather.
- **Fallback city:** if location is blocked or unavailable, the app shows the weather for **Sydney**. To change it, edit `FALLBACK_LOCATION` at the top of `public/js/weather.js` (find your coordinates by searching your city on open-meteo.com), then refresh the browser.
- **Scenes:** clear, partly cloudy, cloudy, fog, rain, storm and snow, each by day or night. "Night" uses that location's sunrise and sunset. If the weather can't be loaded, the app says so and picks day or night from your computer's clock.
- Results are reused for 10 minutes, so switching players doesn't re-check the weather each time.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Port 3000 is already in use` | Another copy of the server is still running. Close that terminal or press Ctrl + C in it, or use a different `PORT` (see above). |
| `git clone` says `destination path 'hobbie-time-tracker' already exists` | A folder with that name is already there (e.g. an unzipped copy). Run `git -C hobbie-time-tracker status`. If it says *not a git repository*, delete or rename that folder and clone again. If it is a clone, `cd` into it and run `git pull` instead. |
| `npm install` fails with `node-gyp rebuild` / `gyp ERR! find VS` (better-sqlite3) | better-sqlite3 already ships ready-made binaries, but npm 10/11 wrongly tries to compile it when installing from `package-lock.json`. The project's `.npmrc` (`ignore-scripts=true`) prevents this. Make sure `.npmrc` exists (it starts with a dot, so it may be hidden in Explorer), delete `node_modules`, and run `npm install` again. You do **not** need Visual Studio. |
| `npm` / `node` not recognised (Windows) | Close and reopen the terminal after installing Node so it picks up the new PATH. |
| Tracky says **"I can't reach the island server"** | The server isn't running, or you opened the `index.html` file directly from disk. Start it with `npm run dev` and open `http://localhost:3000`. To check the server and database on their own, open <http://localhost:3000/api/health>. |
| Text looks plain instead of rounded | The Google Fonts couldn't load (no internet or blocked by a firewall). The app still works with system fonts. |
| Loading page says **Weather unavailable** | The browser couldn't reach `api.open-meteo.com` (no internet, or a work firewall blocks it). The app still works; the sky follows your clock instead. Press F12 → **Console** to see the exact error. |
| Weather shows the fallback city instead of where you are | Location was blocked. In Chrome/Edge, click the icon left of the address bar → **Location** → **Allow**, then reload. On Windows, also check **Settings → Privacy & security → Location**. |
| Want to remove saved players | Players live in the database: stop the server and reset the database (see [Database](#database)). |
| Changes to the page don't show | Hard refresh: **Ctrl + Shift + R** (Windows) / **Cmd + Shift + R** (macOS). |

---

## Roadmap

- [x] Welcome screen: enter your name, then a smooth transition into the tracker
- [x] Cozy island theme (Animal Crossing-inspired)
- [x] Remember players in the database; returning players pick their name
- [x] Loading page with today's weather; weather-reactive backgrounds (day and night)
- [ ] Replace the remaining placeholder routes (`/api/hobbie`, `/api/time`) with real SQLite queries
- [ ] Working timer: start / pause / resume / stop
- [ ] Save finished sessions to `time_entries`
- [ ] "Cool" finish display and hobby animations
- [ ] Accumulated time per hobby and encouraging messages

**Out of scope:** payments, deployment.
