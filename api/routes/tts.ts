import express, { type Request, type Response } from 'express';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { getElevenLabsApiKey } from '../config/tts-config.js';
import {
  readCachedTtsAudio,
  synthesizeElevenLabsSpeech,
  synthesizeSpeechWithFallback,
} from '../data/tts-synthesize.js';

const router = express.Router();

const CACHE_HIT_HEADERS = {
  'Cache-Control': 'public, max-age=31536000, immutable',
  'X-TTS-Cache': 'hit',
};

router.get('/', async (req: Request, res: Response) => {
  const text = req.query.text as string | undefined;
  const companionId = req.query.companionId as string | undefined;
  const lang = (req.query.lang as string) || 'zh-CN';
  const stream = req.query.stream === '1' || req.query.stream === 'true';

  if (!text?.trim()) {
    res.status(400).json({ error: 'Text parameter is required' });
    return;
  }

  if (!getElevenLabsApiKey()) {
    console.error('joyjoy ELEVENLABS_API_KEY missing');
  }

  try {
    const cached = readCachedTtsAudio(companionId, text);
    if (cached) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('X-TTS-Provider', 'elevenlabs');
      Object.entries(CACHE_HIT_HEADERS).forEach(([key, value]) => res.setHeader(key, value));
      if (stream) {
        await pipeline(Readable.from(cached), res);
      } else {
        res.send(cached);
      }
      return;
    }

    if (stream && getElevenLabsApiKey()) {
      const upstream = await synthesizeElevenLabsSpeech({ text, companionId, stream: true });
      if (upstream.ok && upstream.body) {
        res.setHeader('Content-Type', upstream.headers.get('Content-Type') || 'audio/mpeg');
        res.setHeader('X-TTS-Provider', 'elevenlabs');
        res.setHeader('X-TTS-Cache', 'miss');
        res.setHeader('Cache-Control', 'no-store');
        await pipeline(
          Readable.fromWeb(upstream.body as Parameters<typeof Readable.fromWeb>[0]),
          res,
        );
        return;
      }
      console.error('joyjoy ElevenLabs stream failed:', upstream.status);
    }

    const result = await synthesizeSpeechWithFallback({ text, companionId }, lang);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Cache-Control', result.provider === 'elevenlabs' ? CACHE_HIT_HEADERS['Cache-Control'] : 'public, max-age=86400');
    res.setHeader('X-TTS-Provider', result.provider);
    res.setHeader('X-TTS-Cache', result.provider === 'elevenlabs' ? 'store' : 'miss');
    res.send(Buffer.from(result.buffer));
  } catch (error) {
    console.error('joyjoy TTS request error:', error);
    res.status(500).json({ error: 'Failed to generate audio' });
  }
});

export default router;
