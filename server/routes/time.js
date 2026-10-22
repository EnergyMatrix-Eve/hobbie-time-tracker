// Routes for /api/time
//   GET /api/time  → accumulated time per entrant per hobby

import { Router } from 'express';
// import db from '../db/database.js';   // ← un-comment when replacing placeholders

const router = Router();

router.get('/', (req, res) => {
  // TODO: replace placeholder with
  //   SELECT e.name AS entrant, h.name AS hobby, SUM(t.duration_seconds) AS total_seconds
  //   FROM time_entries t
  //   JOIN entrants e ON e.id = t.entrant_id
  //   JOIN hobbies  h ON h.id = t.hobby_id
  //   GROUP BY e.id, h.id
  //   ORDER BY total_seconds DESC
  res.json([
    { entrant: 'Placeholder Entrant A', hobby: 'Guitar',   total_seconds: 5400 },
    { entrant: 'Placeholder Entrant B', hobby: 'Painting', total_seconds: 2700 },
    { entrant: 'Placeholder Entrant C', hobby: 'Running',  total_seconds: 900 },
  ]);
});

export default router;
