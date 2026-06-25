import express, { Request, Response } from 'express';
import { stories, type Story } from '../data/stories.js';

const router = express.Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(stories);
});

router.get('/nearby', (req: Request, res: Response) => {
  const { lat, lng } = req.query;
  const userLat = parseFloat(lat as string) || 30.2741;
  const userLng = parseFloat(lng as string) || 120.1551;

  const nearbyStories = stories.map((story) => {
    const dx = (story.location.lat - userLat) * 111320;
    const dy = (story.location.lng - userLng) * 40075000 * Math.cos(story.location.lat * Math.PI / 180) / 360;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return { ...story, distance };
  }).sort((a, b) => a.distance - b.distance).slice(0, 5);

  res.json(nearbyStories);
});

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const story = stories.find((s) => s.id === id);
  if (story) {
    res.json(story);
  } else {
    res.status(404).json({ error: 'Story not found' });
  }
});

export default router;
