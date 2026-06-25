import express, { Request, Response } from 'express';
import {
  findActiveWalkSnippet,
  getNearbyWalkMetas,
  getNearbyWalkStatus,
  resolveWalkPlay,
} from '../data/walk-snippets.js';
import { resolveOffsiteChatter } from '../data/walk-offsite-chatter.js';
import { normalizeCompanionId } from '../data/narrations.js';

const router = express.Router();

router.get('/nearby', (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string) || 39.9163;
  const lng = parseFloat(req.query.lng as string) || 116.3972;
  const verbose = req.query.verbose === '1';
  res.json(verbose ? getNearbyWalkStatus(lat, lng) : getNearbyWalkMetas(lat, lng));
});

/** 场景B：点击头像 — 围栏内延伸解读，围栏外调皮话 */
router.get('/tap', (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string) || 39.9163;
  const lng = parseFloat(req.query.lng as string) || 116.3972;
  const companionId = normalizeCompanionId((req.query.companionId as string) || 'su-dongpo');

  const activeSnippet = findActiveWalkSnippet(lat, lng);
  if (!activeSnippet) {
    res.json(resolveOffsiteChatter(companionId));
    return;
  }

  const payload = resolveWalkPlay(activeSnippet.id, companionId, 'tap');
  if (!payload) {
    res.json(resolveOffsiteChatter(companionId));
    return;
  }

  res.json(payload);
});

/** 场景A：围栏自动触发 — trigger=auto；手动调试可用 trigger=tap */
router.get('/:id/play', (req: Request, res: Response) => {
  const { id } = req.params;
  const companionId = normalizeCompanionId((req.query.companionId as string) || 'su-dongpo');
  const trigger = req.query.trigger === 'tap' ? 'tap' : 'auto';
  const payload = resolveWalkPlay(id, companionId, trigger);

  if (!payload) {
    res.status(404).json({ error: 'Walk snippet not found' });
    return;
  }

  res.json(payload);
});

export default router;
