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
  const encodedText = encodeURIComponent(String(text || '').trim());
  return fetch(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob`);
}

function splitTextForGoogleTts(text, maxLen = 180) {
  const trimmed = String(text || '').trim();
  if (trimmed.length <= maxLen) return [trimmed];

  const chunks = [];
  let rest = trimmed;
  while (rest.length > maxLen) {
    const slice = rest.slice(0, maxLen);
    const breakAt = Math.max(
      slice.lastIndexOf('。'),
      slice.lastIndexOf('！'),
      slice.lastIndexOf('？'),
      slice.lastIndexOf('\n'),
    );
    const cut = breakAt > maxLen * 0.4 ? breakAt + 1 : maxLen;
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) chunks.push(rest);
  return chunks.filter(Boolean);
}

async function synthesizeGoogleTts(text, lang = 'zh-CN') {
  const chunks = splitTextForGoogleTts(text);
  const buffers = [];

  for (const chunk of chunks) {
    const response = await synthesizeGoogleSpeechFallback(chunk, lang);
    if (!response.ok) {
      throw new Error(`joyjoy Google TTS fallback failed: ${response.status}`);
    }
    buffers.push(await response.arrayBuffer());
  }

  const totalLength = buffers.reduce((sum, buf) => sum + buf.byteLength, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const buf of buffers) {
    merged.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }

  return merged.buffer;
}

async function respondWithGoogleFallback(text, lang, reason) {
  console.error(`joyjoy ${reason}, using Google TTS fallback`);
  const audioBuffer = await synthesizeGoogleTts(text, lang);
  return new Response(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400',
      'X-TTS-Provider': 'google',
    },
  });
}

export async function handleTtsRequest({
  url,
  companions,
  ttsConfig,
  apiKey,
  corsHeaders,
}) {
  const text = url.searchParams.get('text');
  const lang = url.searchParams.get('lang') || 'zh-CN';
  const companionId = url.searchParams.get('companionId') || 'su-dongpo';
  const stream = url.searchParams.get('stream') === '1' || url.searchParams.get('stream') === 'true';

  if (!text?.trim()) {
    return Response.json({ error: 'Text parameter is required' }, { status: 400, headers: corsHeaders });
  }

  if (apiKey) {
    const upstream = await synthesizeElevenLabsSpeech({
      text,
      companionId,
      apiKey,
      companions,
      ttsConfig,
      stream,
    });

    if (upstream.ok && stream && upstream.body) {
      return new Response(upstream.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': upstream.headers.get('Content-Type') || 'audio/mpeg',
          'Cache-Control': 'no-store',
          'X-TTS-Provider': 'elevenlabs',
        },
      });
    }

    if (upstream.ok && !stream) {
      const audioBuffer = await upstream.arrayBuffer();
      return new Response(audioBuffer, {
        headers: {
          ...corsHeaders,
          'Content-Type': upstream.headers.get('Content-Type') || 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400',
          'X-TTS-Provider': 'elevenlabs',
        },
      });
    }

    const detail = await upstream.text().catch(() => '');
    console.error('joyjoy ElevenLabs TTS failed:', upstream.status, detail);
    const reason = detail.includes('quota_exceeded')
      ? 'ElevenLabs quota exceeded'
      : 'ElevenLabs unavailable';
    const fallback = await respondWithGoogleFallback(text, lang, reason);
    return new Response(fallback.body, {
      headers: { ...corsHeaders, ...Object.fromEntries(fallback.headers.entries()) },
    });
  }

  console.error('joyjoy ELEVENLABS_API_KEY missing');
  const fallback = await respondWithGoogleFallback(text, lang, 'ElevenLabs not configured');
  return new Response(fallback.body, {
    headers: { ...corsHeaders, ...Object.fromEntries(fallback.headers.entries()) },
  });
}

export { buildTtsSynthesisText, resolveElevenLabsVoiceId };
