import express from 'express';
import { synthesizeSpeechWithFallback } from '../data/tts-synthesize.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const text = req.query.text as string | undefined;
  const companionId = (req.query.companionId as string | undefined) ?? null;
  const profileId = (req.query.profile as string | undefined) ?? null;

  if (!text) {
    res.status(400).json({ error: 'Text parameter is required' });
    return;
  }

  try {
    const { response, provider } = await synthesizeSpeechWithFallback({
      text,
      companionId,
      profileId,
    });

    if (!response.ok) {
      res.status(500).json({ error: 'Failed to generate audio' });
      return;
    }

    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-TTS-Provider', provider);
    res.send(Buffer.from(audioBuffer));
  } catch (err) {
    console.error('joyjoy TTS request error:', err);
    res.status(500).json({ error: 'Failed to generate audio' });
  }
});

export default router;
