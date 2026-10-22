// Entry point for the Hobbies Time Tracker server.
//   1. Serves the front end (everything in /public) at http://localhost:3000
//   2. Exposes the JSON API under /api/...

import path from 'node:path';
import express from 'express';
import db, { DB_PATH } from './db/database.js';
import entrantsRouter from './routes/entrants.js';
import hobbiesRouter from './routes/hobbies.js';
import timeRouter from './routes/time.js';

const PORT = process.env.PORT ?? 3000;
const PUBLIC_DIR = path.join(import.meta.dirname, '..', 'public');

const app = express();

// --- Middleware ----------------------------------------------------------
app.use(express.json());              // parse JSON request bodies into req.body
app.use(express.static(PUBLIC_DIR));  // serve index.html, css/, js/

// --- API routes ----------------------------------------------------------

// Health check: proves the server is up AND the database is reachable.
app.get('/api/health', (req, res) => {
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all()
    .map((row) => row.name);

  res.json({ status: 'ok', database: path.basename(DB_PATH), tables });
});

app.use('/api/entrants', entrantsRouter);
app.use('/api/hobbie', hobbiesRouter);
app.use('/api/time', timeRouter);

// Any other /api/... URL → JSON 404 (instead of Express's default HTML page).
app.use('/api', (req, res) => {
  res.status(404).json({ error: `No API route for ${req.method} ${req.originalUrl}` });
});

// Central error handler: anything thrown in a route ends up here.
// 4xx (e.g. malformed JSON) → show the reason; 5xx → log it, keep details off the client.
app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status < 500 ? err.message : 'Something went wrong on the server' });
});

// --- Start ---------------------------------------------------------------
app.listen(PORT, (error) => {
  if (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the other process or start with a different PORT.`);
      process.exit(1);
    }
    throw error;
  }
  console.log(`Hobbies Time Tracker running at http://localhost:${PORT}`);
  console.log(`SQLite database: ${DB_PATH}`);
});
