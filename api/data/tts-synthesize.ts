import {
  buildTtsSynthesisText,
  getElevenLabsApiKey,
  resolveElevenLabsVoiceId,
  resolveElevenLabsVoiceSettings,
  TTS_PUBLIC_CONFIG,
} from '../config/tts-config.js';
import {
  readLocalTtsCache,
  ttsCacheObjectKey,
  writeLocalTtsCache,
} from './tts-cache.js';

export interface SynthesizeSpeechOptions {
  text: string;
  companionId?: string | null;
  profileId?: string | null;
  apiKey?: string;
  stream?: boolean;
}

export interface SynthesizeSpeechResult {
  buffer: ArrayBuffer;
  contentType: string;
  provider: 'elevenlabs' | 'google';
}

const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1';

function buildElevenLabsUrl(voiceId: string, stream: boolean): URL {
  const path = stream
    ? `${ELEVENLABS_BASE}/text-to-speech/${voiceId}/stream`
    : `${ELEVENLABS_BASE}/text-to-speech/${voiceId}`;
  const url = new URL(path);
  url.searchParams.set('output_format', TTS_PUBLIC_CONFIG.outputFormat);
  return url;
}

function buildElevenLabsBody(companionId: string | null | undefined, text: string) {
  const synthesisText = buildTtsSynthesisText(companionId, text);
  const voiceSettings = resolveElevenLabsVoiceSettings(companionId);
  const { speed, ...settings } = voiceSettings;
  return {
    synthesisText,
    body: JSON.stringify({
      text: synthesisText,
      model_id: TTS_PUBLIC_CONFIG.modelId,
      voice_settings: settings,
      speed,
    }),
  };
}

/** Google TTS 兜底（无韵律控制，仅开发/故障降级） */
export async function synthesizeSpeechFallback(text: string, lang = 'zh-CN'): Promise<Response> {
  const encodedText = encodeURIComponent(text);
  const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob`;
  return fetch(googleTtsUrl);
}

export async function synthesizeElevenLabsSpeech(
  options: SynthesizeSpeechOptions,
): Promise<Response> {
  const { text, companionId, profileId, apiKey, stream = false } = options;
  const resolvedKey = apiKey ?? getElevenLabsApiKey();
  if (!resolvedKey) {
    throw new Error('ELEVENLABS_API_KEY is not configured');
  }

  const voiceId = resolveElevenLabsVoiceId(profileId ?? companionId);
  const { body } = buildElevenLabsBody(companionId, text);
  const url = buildElevenLabsUrl(voiceId, stream);

  return fetch(url.toString(), {
    method: 'POST',
    headers: {
      'xi-api-key': resolvedKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body,
  });
}

export function resolveTtsCacheKey(companionId: string | null | undefined, text: string): {
  objectKey: string;
  voiceId: string;
  synthesisText: string;
} {
  const voiceId = resolveElevenLabsVoiceId(companionId);
  const synthesisText = buildTtsSynthesisText(companionId, text);
  return {
    objectKey: ttsCacheObjectKey(voiceId, synthesisText),
    voiceId,
    synthesisText,
  };
}

export function readCachedTtsAudio(companionId: string | null | undefined, text: string): Buffer | null {
  const { objectKey } = resolveTtsCacheKey(companionId, text);
  return readLocalTtsCache(objectKey);
}

export function writeCachedTtsAudio(
  companionId: string | null | undefined,
  text: string,
  data: Buffer | ArrayBuffer,
): string {
  const { objectKey } = resolveTtsCacheKey(companionId, text);
  writeLocalTtsCache(objectKey, data);
  return objectKey;
}

export async function synthesizeSpeechWithFallback(
  options: SynthesizeSpeechOptions,
  lang = 'zh-CN',
): Promise<SynthesizeSpeechResult> {
  const cached = readCachedTtsAudio(options.companionId, options.text);
  if (cached) {
    return {
      buffer: cached.buffer.slice(cached.byteOffset, cached.byteOffset + cached.byteLength),
      contentType: 'audio/mpeg',
      provider: 'elevenlabs',
    };
  }

  try {
    const elevenResponse = await synthesizeElevenLabsSpeech({ ...options, stream: false });
    if (elevenResponse.ok) {
      const buffer = await elevenResponse.arrayBuffer();
      writeCachedTtsAudio(options.companionId, options.text, buffer);
      return {
        buffer,
        contentType: elevenResponse.headers.get('Content-Type') || 'audio/mpeg',
        provider: 'elevenlabs',
      };
    }
    console.error('joyjoy ElevenLabs TTS failed:', elevenResponse.status, await elevenResponse.text());
  } catch (error) {
    console.error('joyjoy ElevenLabs TTS error:', error);
  }

  const fallback = await synthesizeSpeechFallback(options.text, lang);
  if (!fallback.ok) {
    throw new Error(`TTS fallback failed: ${fallback.status}`);
  }

  return {
    buffer: await fallback.arrayBuffer(),
    contentType: fallback.headers.get('Content-Type') || 'audio/mpeg',
    provider: 'google',
  };
}

/** @deprecated 旧 Edge SSML 路径，保留导出以免外部引用报错 */
export function applyCadenceBreaks(text: string): string {
  return text.trim();
}

/** @deprecated */
export function buildSsml(text: string): string {
  return text.trim();
}
