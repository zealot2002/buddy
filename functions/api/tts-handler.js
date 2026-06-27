const EMOTION_STABILITY = { cheerful: 0.45, gentle: 0.55, warm: 0.5, humorous: 0.35 };
const EMOTION_STYLE = { cheerful: 0.35, gentle: 0.25, warm: 0.3, humorous: 0.45 };

function normalizeCompanionId(companionId) {
  if (companionId === 'dongpo' || companionId === 'poison-tongue') {
    return companionId === 'dongpo' ? 'su-dongpo' : 'sharp-elder';
  }
  return companionId || 'su-dongpo';
}

function buildTtsSynthesisText(companionId, text, companions) {
  const id = normalizeCompanionId(companionId);
  const body = String(text || '').trim();
  const style = companions.find((item) => item.id === id)?.ttsStylePrompt?.trim();
  if (!style) return body;
  return `[${style}]\n${body}`;
}

function resolveElevenLabsVoiceSettings(companionId, companions) {
  const normalizedId = normalizeCompanionId(companionId);
  const companion = companions.find((item) => item.id === normalizedId) || companions[0];
  const emotion = companion?.toneProfile?.emotion || 'cheerful';
  return {
    stability: EMOTION_STABILITY[emotion] ?? 0.5,
    similarity_boost: 0.75,
    style: EMOTION_STYLE[emotion] ?? 0.3,
    use_speaker_boost: true,
    speed: companion?.toneProfile?.speed ?? 1,
  };
}

function resolveElevenLabsVoiceId(companionId, companions) {
  const normalizedId = normalizeCompanionId(companionId);
  const companion = companions.find((item) => item.id === normalizedId);
  return companion?.voiceId || 'JBFqnCBsd6RMkjVDRZzb';
}

async function ttsCacheDigest(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

async function ttsCacheObjectKey(voiceId, synthesisText) {
  const digest = await ttsCacheDigest(synthesisText);
  return `tts/${voiceId}/${digest}.mp3`;
}

async function readR2TtsCache(bucket, voiceId, synthesisText) {
  if (!bucket) return null;
  const key = await ttsCacheObjectKey(voiceId, synthesisText);
  const object = await bucket.get(key);
  if (!object) return null;
  return { key, object };
}

async function writeR2TtsCache(bucket, key, data) {
  if (!bucket) return;
  await bucket.put(key, data, {
    httpMetadata: { contentType: 'audio/mpeg' },
  });
}

async function synthesizeElevenLabsSpeech({
  text,
  companionId,
  apiKey,
  companions,
  ttsConfig,
  stream = false,
}) {
  const voiceId = resolveElevenLabsVoiceId(companionId, companions);
  const synthesisText = buildTtsSynthesisText(companionId, text, companions);
  const voiceSettings = resolveElevenLabsVoiceSettings(companionId, companions);
  const { speed, ...settings } = voiceSettings;
  const base = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const url = new URL(stream ? `${base}/stream` : base);
  url.searchParams.set('output_format', ttsConfig.outputFormat || 'mp3_44100_128');

  return fetch(url.toString(), {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text: synthesisText,
      model_id: ttsConfig.modelId || 'eleven_multilingual_v2',
      voice_settings: settings,
      speed,
    }),
  });
}

async function synthesizeGoogleSpeechFallback(text, lang = 'zh-CN') {
  const encodedText = encodeURIComponent(text);
  return fetch(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob`);
}

export async function handleTtsRequest({
  url,
  companions,
  ttsConfig,
  apiKey,
  r2Bucket,
  corsHeaders,
}) {
  const text = url.searchParams.get('text');
  const lang = url.searchParams.get('lang') || 'zh-CN';
  const companionId = url.searchParams.get('companionId') || 'su-dongpo';
  const stream = url.searchParams.get('stream') === '1' || url.searchParams.get('stream') === 'true';

  if (!text?.trim()) {
    return Response.json({ error: 'Text parameter is required' }, { status: 400, headers: corsHeaders });
  }

  const voiceId = resolveElevenLabsVoiceId(companionId, companions);
  const synthesisText = buildTtsSynthesisText(companionId, text, companions);
  const cacheKey = await ttsCacheObjectKey(voiceId, synthesisText);

  const cached = await readR2TtsCache(r2Bucket, voiceId, synthesisText);
  if (cached?.object) {
    return new Response(cached.object.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-TTS-Provider': 'elevenlabs',
        'X-TTS-Cache': 'hit',
      },
    });
  }

  if (apiKey) {
    if (stream) {
      const upstream = await synthesizeElevenLabsSpeech({
        text,
        companionId,
        apiKey,
        companions,
        ttsConfig,
        stream: true,
      });
      if (upstream.ok && upstream.body) {
        return new Response(upstream.body, {
          headers: {
            ...corsHeaders,
            'Content-Type': upstream.headers.get('Content-Type') || 'audio/mpeg',
            'Cache-Control': 'no-store',
            'X-TTS-Provider': 'elevenlabs',
            'X-TTS-Cache': 'miss',
          },
        });
      }
      console.error('joyjoy ElevenLabs stream failed:', upstream.status);
    } else {
      const upstream = await synthesizeElevenLabsSpeech({
        text,
        companionId,
        apiKey,
        companions,
        ttsConfig,
        stream: false,
      });
      if (upstream.ok) {
        const audioBuffer = await upstream.arrayBuffer();
        await writeR2TtsCache(r2Bucket, cacheKey, audioBuffer);
        return new Response(audioBuffer, {
          headers: {
            ...corsHeaders,
            'Content-Type': upstream.headers.get('Content-Type') || 'audio/mpeg',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-TTS-Provider': 'elevenlabs',
            'X-TTS-Cache': 'store',
          },
        });
      }
      console.error('joyjoy ElevenLabs TTS failed:', upstream.status);
    }
  }

  const fallback = await synthesizeGoogleSpeechFallback(text, lang);
  if (!fallback.ok) {
    return Response.json({ error: 'Failed to generate audio' }, { status: 500, headers: corsHeaders });
  }

  const audioBuffer = await fallback.arrayBuffer();
  return new Response(audioBuffer, {
    headers: {
      ...corsHeaders,
      'Content-Type': fallback.headers.get('Content-Type') || 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400',
      'X-TTS-Provider': 'google',
      'X-TTS-Cache': 'miss',
    },
  });
}

export {
  buildTtsSynthesisText,
  resolveElevenLabsVoiceId,
  ttsCacheObjectKey,
};
