import express, { Request, Response } from 'express';
import {
  getNearbyWalkMetas,
  resolveWalkPlay,
  walkSnippets,
  haversineMeters,
} from '../data/walk-snippets.js';
import { normalizeCompanionId } from '../data/narrations.js';

const router = express.Router();

router.get('/nearby', (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string) || 39.9163;
  const lng = parseFloat(req.query.lng as string) || 116.3972;
  res.json(getNearbyWalkMetas(lat, lng));
});

router.get('/tap', (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string) || 39.9163;
  const lng = parseFloat(req.query.lng as string) || 116.3972;
  const companionId = normalizeCompanionId((req.query.companionId as string) || 'su-dongpo');

  const active = walkSnippets
    .map((snippet) => ({
      snippet,
      distance: haversineMeters(lat, lng, snippet.location.lat, snippet.location.lng),
    }))
    .filter(({ snippet, distance }) => distance <= snippet.location.radiusMeters)
    .sort((a, b) => a.distance - b.distance)[0]?.snippet;

  const nearest = getNearbyWalkMetas(lat, lng, 1)[0];
  const snippetId = active?.id || nearest?.id;

  if (!snippetId) {
    res.status(404).json({ error: 'No walk snippets available' });
    return;
  }

  const payload = resolveWalkPlay(snippetId, companionId);
  if (!payload) {
    res.status(404).json({ error: 'Walk snippet not found' });
    return;
  }

  res.json(payload);
});

router.get('/:id/play', (req: Request, res: Response) => {
  const { id } = req.params;
  const companionId = normalizeCompanionId((req.query.companionId as string) || 'su-dongpo');
  const payload = resolveWalkPlay(id, companionId);

  if (!payload) {
    res.status(404).json({ error: 'Walk snippet not found' });
    return;
  }

  res.json(payload);
});

export default router;
