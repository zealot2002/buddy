import express, { Request, Response } from 'express';
import { routes, type Route } from '../data/routes.js';
import { stories, type Story } from '../data/stories.js';

const router = express.Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(routes);
});

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const route = routes.find((r) => r.id === id);
  if (route) {
    const routeStories = route.storyIds.map((storyId) => 
      stories.find((s) => s.id === storyId)
    ).filter(Boolean) as Story[];
    res.json({ ...route, stories: routeStories });
  } else {
    res.status(404).json({ error: 'Route not found' });
  }
});

export default router;
