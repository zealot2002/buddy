import express from 'express';
import https from 'https';

const router = express.Router();

router.get('/', (req, res) => {
  const { text, lang = 'zh-CN' } = req.query;
  
  if (!text) {
    return res.status(400).json({ error: 'Text parameter is required' });
  }

  const encodedText = encodeURIComponent(text as string);
  const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob`;

  https.get(googleTtsUrl, (response) => {
    res.setHeader('Content-Type', 'audio/mp3');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    response.pipe(res);
  }).on('error', (err) => {
    console.error('TTS request error:', err);
    res.status(500).json({ error: 'Failed to generate audio' });
  });
});

export default router;
