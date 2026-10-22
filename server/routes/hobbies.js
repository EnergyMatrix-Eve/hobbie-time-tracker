// Routes for /api/hobbie
//   POST /api/hobbie  → add a new hobby   body: { "name": "Guitar" }

import { Router } from 'express';
// import db from '../db/database.js';   // ← un-comment when replacing placeholders

const router = Router();

router.post('/', (req, res) => {
  // TODO: validate req.body.name, then
  //   db.prepare('INSERT INTO hobbies (name) VALUES (?)').run(name)
  res.status(201).json({
    message: 'Placeholder: hobby would be saved to the database here',
    received: req.body,
  });
});

export default router;
