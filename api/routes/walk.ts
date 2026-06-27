import express, { Request, Response } from 'express';
import {
  walkFindActiveFence,
  walkGetFences,
  walkGetNearbyMetas,
  walkGetNearbyStatus,
  walkResolveAutoPlay,
  walkResolvePlay,
} from '../data/walk-service.js';
import { resolveOffsiteChatter } from '../data/walk-offsite-chatter.js';
import { normalizeCompanionId } from '../data/narrations.js';

const router = express.Router();

function parseExcludeJokeIds(raw: unknown): string[] {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  return raw.split(',').map((item) => item.trim()).filter(Boolean);
}

router.get('/fences', async (req: Request, res: Response) => {
  try {
    const areaId = (req.query.areaId as string) || 'gong-wang-fu';
    const fences = await walkGetFences(areaId);
    res.json(fences);
  } catch (error) {
    console.error('joyjoy walk fences failed:', error);
    res.status(500).json({ error: 'walk_db_error' });
  }
});

router.get('/nearby', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 39.9371;
    const lng = parseFloat(req.query.lng as string) || 116.3862;
    const verbose = req.query.verbose === '1';
    res.json(verbose ? await walkGetNearbyStatus(lat, lng) : await walkGetNearbyMetas(lat, lng));
  } catch (error) {
    console.error('joyjoy walk nearby failed:', error);
    res.status(500).json({ error: 'walk_db_error' });
  }
});

router.get('/tap', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 39.9371;
    const lng = parseFloat(req.query.lng as string) || 116.3862;
    const companionId = normalizeCompanionId((req.query.companionId as string) || 'su-dongpo');
    const excludeJokeIds = parseExcludeJokeIds(req.query.exclude);

    const activeFence = await walkFindActiveFence(lat, lng);
    if (!activeFence) {
      res.json(resolveOffsiteChatter(companionId));
      return;
    }

    const payload = await walkResolveAutoPlay(activeFence.id, companionId, excludeJokeIds);
    if (!payload) {
      res.json(resolveOffsiteChatter(companionId));
      return;
    }

    res.json(payload);
  } catch (error) {
    console.error('joyjoy walk tap failed:', error);
    res.status(500).json({ error: 'walk_db_error' });
  }
});

router.get('/offsite', (req: Request, res: Response) => {
  const companionId = normalizeCompanionId((req.query.companionId as string) || 'su-dongpo');
  res.json(resolveOffsiteChatter(companionId));
});

router.get('/:id/play', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companionId = normalizeCompanionId((req.query.companionId as string) || 'su-dongpo');
    const trigger = req.query.trigger === 'tap' ? 'tap' : 'auto';
    const jokeId = req.query.jokeId as string | undefined;
    const actRaw = req.query.act;
    const actIndex = actRaw != null && actRaw !== '' ? Number.parseInt(String(actRaw), 10) : undefined;
    const randomJoke = req.query.random !== '0';
    const excludeJokeIds = parseExcludeJokeIds(req.query.exclude);

    const payload = jokeId || actIndex != null || randomJoke === false
      ? await walkResolvePlay(id, companionId, {
          jokeId,
          actIndex,
          randomJoke,
          excludeJokeIds,
          trigger,
        })
      : await walkResolveAutoPlay(id, companionId, excludeJokeIds);

    if (!payload) {
      res.status(404).json({ error: 'no_unplayed_jokes_or_fence_not_found' });
      return;
    }

    res.json(payload);
  } catch (error) {
    console.error('joyjoy walk play failed:', error);
    res.status(500).json({ error: 'walk_db_error' });
  }
});

export default router;
