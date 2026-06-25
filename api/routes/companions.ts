import express, { Request, Response } from 'express';
import { companions, type Companion } from '../data/companions.js';
import { stories, type Story } from '../data/stories.js';

const router = express.Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(companions);
});

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const companion = companions.find((c) => c.id === id);
  if (companion) {
    const companionStories = stories.filter((s) => s.narrators.some((n) => n.companionId === id));
    res.json({ ...companion, stories: companionStories });
  } else {
    res.status(404).json({ error: 'Companion not found' });
  }
});

export default router;
