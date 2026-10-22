// Routes for /api/entrants (the players)
//   GET  /api/entrants  → list all saved players
//   POST /api/entrants  → add a player, or return the existing one   body: { "name": "Alex" }

import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

const MAX_NAME_LENGTH = 20;

// Prepared once, reused on every request (faster, and the `?` placeholders
// mean user input is never pasted into the SQL text: no SQL injection).
const listEntrants = db.prepare('SELECT id, name, created_at FROM entrants ORDER BY name');
const findByName   = db.prepare('SELECT id, name, created_at FROM entrants WHERE name = ?');
const findById     = db.prepare('SELECT id, name, created_at FROM entrants WHERE id = ?');
const insert       = db.prepare('INSERT INTO entrants (name) VALUES (?)');

router.get('/', (req, res) => {
  res.json(listEntrants.all());
});

router.post('/', (req, res) => {
  // Tidy the name: trim the ends and squash repeated spaces ("  Alex   Lee " → "Alex Lee")
  const raw = req.body?.name;
  const name = typeof raw === 'string' ? raw.trim().replace(/\s+/g, ' ') : '';

  if (!name) {
    return res.status(400).json({ error: 'Please enter a name.' });
  }
  if ([...name].length > MAX_NAME_LENGTH) {
    return res.status(400).json({ error: `Names can be at most ${MAX_NAME_LENGTH} characters.` });
  }

  // The name column is UNIQUE COLLATE NOCASE, so "alex" finds "Alex".
  const existing = findByName.get(name);
  if (existing) {
    return res.status(200).json(existing); // 200 = already known
  }

  const { lastInsertRowid } = insert.run(name);
  res.status(201).json(findById.get(lastInsertRowid)); // 201 = newly created
});

export default router;
