import express, { type Request, type Response } from 'express';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { getElevenLabsApiKey } from '../config/tts-config.js';
import {
  synthesizeElevenLabsSpeech,
  synthesizeGoogleTts,
} from '../data/tts-synthesize.js';

const router = express.Router();

async function respondWithGoogleFallback(
  res: Response,
  text: string,
  lang: string,
  reason: string,
) {
  console.error(`joyjoy ${reason}, using Google TTS fallback`);
  const result = await synthesizeGoogleTts(text, lang);
  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('X-TTS-Provider', result.provider);
  res.send(Buffer.from(result.buffer));
}

router.get('/', async (req: Request, res: Response) => {
  const text = req.query.text as string | undefined;
  const companionId = req.query.companionId as string | undefined;
  const lang = (req.query.lang as string) || 'zh-CN';
  const stream = req.query.stream === '1' || req.query.stream === 'true';
  const apiKey = getElevenLabsApiKey();

  if (!text?.trim()) {
    res.status(400).json({ error: 'Text parameter is required' });
    return;
  }

  try {
    if (apiKey) {
      const upstream = await synthesizeElevenLabsSpeech({
        text,
        companionId,
        apiKey,
        stream,
      });

      if (upstream.ok && stream && upstream.body) {
        res.setHeader('Content-Type', upstream.headers.get('Content-Type') || 'audio/mpeg');
        res.setHeader('X-TTS-Provider', 'elevenlabs');
        res.setHeader('Cache-Control', 'no-store');
        await pipeline(
          Readable.fromWeb(upstream.body as Parameters<typeof Readable.fromWeb>[0]),
          res,
        );
        return;
      }

      if (upstream.ok && !stream) {
        const buffer = await upstream.arrayBuffer();
        res.setHeader('Content-Type', upstream.headers.get('Content-Type') || 'audio/mpeg');
        res.setHeader('X-TTS-Provider', 'elevenlabs');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(Buffer.from(buffer));
        return;
      }

      const detail = await upstream.text().catch(() => '');
      console.error('joyjoy ElevenLabs TTS failed:', upstream.status, detail);
      await respondWithGoogleFallback(
        res,
        text,
        lang,
        detail.includes('quota_exceeded') ? 'ElevenLabs quota exceeded' : 'ElevenLabs unavailable',
      );
      return;
    }

    console.error('joyjoy ELEVENLABS_API_KEY missing');
    await respondWithGoogleFallback(res, text, lang, 'ElevenLabs not configured');
  } catch (error) {
    console.error('joyjoy TTS request error:', error);
    try {
      await respondWithGoogleFallback(res, text!, lang, 'TTS error');
    } catch (fallbackError) {
      console.error('joyjoy Google TTS fallback failed:', fallbackError);
      res.status(500).json({ error: 'Failed to generate audio' });
    }
  }
});

export default router;
