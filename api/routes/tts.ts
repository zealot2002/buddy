import express, { type Request, type Response } from 'express';
import { getElevenLabsApiKey } from '../config/tts-config.js';
import { synthesizeSpeechWithFallback } from '../data/tts-synthesize.js';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const text = req.query.text as string | undefined;
  const companionId = req.query.companionId as string | undefined;
  const lang = (req.query.lang as string) || 'zh-CN';

  if (!text?.trim()) {
    res.status(400).json({ error: 'Text parameter is required' });
    return;
  }

  if (!getElevenLabsApiKey()) {
    console.error('joyjoy ELEVENLABS_API_KEY missing');
  }

  try {
    const result = await synthesizeSpeechWithFallback({ text, companionId }, lang);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-TTS-Provider', result.provider);
    res.send(Buffer.from(result.buffer));
  } catch (error) {
    console.error('joyjoy TTS request error:', error);
    res.status(500).json({ error: 'Failed to generate audio' });
  }
});

export default router;
