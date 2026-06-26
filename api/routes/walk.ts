import express, { Request, Response } from 'express';
import {
  findActiveWalkFence,
  getNearbyWalkMetas,
  getNearbyWalkStatus,
  resolveWalkAutoPlay,
  resolveWalkPlay,
} from '../data/walk-snippets.js';
import { resolveOffsiteChatter } from '../data/walk-offsite-chatter.js';
import { normalizeCompanionId } from '../data/narrations.js';

const router = express.Router();

function parseExcludeJokeIds(raw: unknown): string[] {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  return raw.split(',').map((item) => item.trim()).filter(Boolean);
}

router.get('/nearby', (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string) || 39.9371;
  const lng = parseFloat(req.query.lng as string) || 116.3862;
  const verbose = req.query.verbose === '1';
  res.json(verbose ? getNearbyWalkStatus(lat, lng) : getNearbyWalkMetas(lat, lng));
});

/** 围栏内随机未播段子第一幕；围栏外调皮话 */
router.get('/tap', (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string) || 39.9371;
  const lng = parseFloat(req.query.lng as string) || 116.3862;
  const companionId = normalizeCompanionId((req.query.companionId as string) || 'su-dongpo');
  const excludeJokeIds = parseExcludeJokeIds(req.query.exclude);

  const activeFence = findActiveWalkFence(lat, lng);
  if (!activeFence) {
    res.json(resolveOffsiteChatter(companionId));
    return;
  }

  const payload = resolveWalkAutoPlay(activeFence.id, activeFence.primaryCompanionId, excludeJokeIds);
  if (!payload) {
    res.json(resolveOffsiteChatter(companionId));
    return;
  }

  res.json(payload);
});

router.get('/offsite', (req: Request, res: Response) => {
  const companionId = normalizeCompanionId((req.query.companionId as string) || 'su-dongpo');
  res.json(resolveOffsiteChatter(companionId));
});

/** fenceId + jokeId + act(0-based)；无 jokeId 时随机未播段子 */
router.get('/:id/play', (req: Request, res: Response) => {
  const { id } = req.params;
  const companionId = normalizeCompanionId((req.query.companionId as string) || 'su-dongpo');
  const trigger = req.query.trigger === 'tap' ? 'tap' : 'auto';
  const jokeId = req.query.jokeId as string | undefined;
  const actRaw = req.query.act;
  const actIndex = actRaw != null && actRaw !== '' ? Number.parseInt(String(actRaw), 10) : undefined;
  const randomJoke = req.query.random !== '0';
  const excludeJokeIds = parseExcludeJokeIds(req.query.exclude);

  const payload = jokeId || actIndex != null || randomJoke === false
    ? resolveWalkPlay(id, companionId, {
        jokeId,
        actIndex,
        randomJoke,
        excludeJokeIds,
        trigger,
      })
    : resolveWalkAutoPlay(id, companionId, excludeJokeIds);

  if (!payload) {
    res.status(404).json({ error: 'no_unplayed_jokes_or_fence_not_found' });
    return;
  }

  res.json(payload);
});

export default router;
