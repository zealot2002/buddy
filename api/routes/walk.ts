import express, { Request, Response } from 'express';
import {
  findActiveWalkSnippet,
  getNearbyWalkMetas,
  getNearbyWalkStatus,
  resolveWalkPlay,
  type WalkBranch,
  type WalkTreeLayer,
} from '../data/walk-snippets.js';
import { resolveOffsiteChatter } from '../data/walk-offsite-chatter.js';
import { normalizeCompanionId } from '../data/narrations.js';

const router = express.Router();

router.get('/nearby', (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string) || 39.9371;
  const lng = parseFloat(req.query.lng as string) || 116.3862;
  const verbose = req.query.verbose === '1';
  res.json(verbose ? getNearbyWalkStatus(lat, lng) : getNearbyWalkMetas(lat, lng));
});

/** 场景B：点击头像 — 围栏内默认 L2-A，围栏外调皮话 */
router.get('/tap', (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string) || 39.9371;
  const lng = parseFloat(req.query.lng as string) || 116.3862;
  const companionId = normalizeCompanionId((req.query.companionId as string) || 'su-dongpo');

  const activeSnippet = findActiveWalkSnippet(lat, lng);
  if (!activeSnippet) {
    res.json(resolveOffsiteChatter(companionId));
    return;
  }

  const payload = resolveWalkPlay(activeSnippet.id, activeSnippet.primaryCompanionId, {
    layer: 'L2',
    branch: 'A',
    trigger: 'tap',
  });
  if (!payload) {
    res.json(resolveOffsiteChatter(companionId));
    return;
  }

  res.json(payload);
});

/** 围栏外调皮话 */
router.get('/offsite', (req: Request, res: Response) => {
  const companionId = normalizeCompanionId((req.query.companionId as string) || 'su-dongpo');
  res.json(resolveOffsiteChatter(companionId));
});

/** 按 layer / branch 取树形语料；默认 L1 自动触发 */
router.get('/:id/play', (req: Request, res: Response) => {
  const { id } = req.params;
  const companionId = normalizeCompanionId((req.query.companionId as string) || 'su-dongpo');
  const trigger = req.query.trigger === 'tap' ? 'tap' : 'auto';
  const layer = (req.query.layer as WalkTreeLayer | undefined) || 'L1';
  const branch = (req.query.branch as WalkBranch | undefined) || 'A';
  const payload = resolveWalkPlay(id, companionId, { layer, branch, trigger });

  if (!payload) {
    res.status(404).json({ error: 'Walk snippet not found' });
    return;
  }

  res.json(payload);
});

export default router;
