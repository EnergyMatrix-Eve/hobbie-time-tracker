// Routes for /api/entrants
//   GET  /api/entrants  → list all entrants
//   POST /api/entrants  → add a new entrant   body: { "name": "Alex" }

import { Router } from 'express';
// import db from '../db/database.js';   // ← un-comment when replacing placeholders

const router = Router();

router.get('/', (req, res) => {
  // TODO: replace placeholder with
  //   db.prepare('SELECT id, name, created_at FROM entrants ORDER BY name').all()
  res.json([
    { id: 1, name: 'Placeholder Entrant A' },
    { id: 2, name: 'Placeholder Entrant B' },
    { id: 3, name: 'Placeholder Entrant C' },
  ]);
});

router.post('/', (req, res) => {
  // TODO: validate req.body.name, then
  //   db.prepare('INSERT INTO entrants (name) VALUES (?)').run(name)
  res.status(201).json({
    message: 'Placeholder: entrant would be saved to the database here',
    received: req.body,
  });
});

export default router;
