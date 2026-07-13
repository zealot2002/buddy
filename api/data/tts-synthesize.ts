import {
  buildTtsSynthesisText,
  getElevenLabsApiKey,
  resolveElevenLabsVoiceId,
  resolveElevenLabsVoiceSettings,
  TTS_PUBLIC_CONFIG,
} from '../config/tts-config.js';

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

/** Google TTS 兜底（无韵律控制，额度/故障降级） */
export async function synthesizeSpeechFallback(text: string, lang = 'zh-CN'): Promise<Response> {
  const encodedText = encodeURIComponent(text.trim());
  const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob`;
  return fetch(googleTtsUrl);
}

function splitTextForGoogleTts(text: string, maxLen = 180): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return [trimmed];

  const chunks: string[] = [];
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

/** 普通 TTS 降级：Google 合成，长文本自动分段 */
export async function synthesizeGoogleTts(
  text: string,
  lang = 'zh-CN',
): Promise<SynthesizeSpeechResult> {
  const chunks = splitTextForGoogleTts(text);
  const buffers: ArrayBuffer[] = [];

  for (const chunk of chunks) {
    const response = await synthesizeSpeechFallback(chunk, lang);
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

  return {
    buffer: merged.buffer,
    contentType: 'audio/mpeg',
    provider: 'google',
  };
}

async function logElevenLabsFailure(response: Response): Promise<void> {
  const detail = await response.text().catch(() => '');
  console.error('joyjoy ElevenLabs TTS failed:', response.status, detail);
  if (detail.includes('quota_exceeded')) {
    console.error('joyjoy ElevenLabs quota exceeded, using Google TTS fallback');
  }
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

export async function synthesizeSpeechWithFallback(
  options: SynthesizeSpeechOptions,
  lang = 'zh-CN',
): Promise<SynthesizeSpeechResult> {
  const apiKey = options.apiKey ?? getElevenLabsApiKey();

  if (apiKey) {
    try {
      const elevenResponse = await synthesizeElevenLabsSpeech({ ...options, apiKey, stream: false });
      if (elevenResponse.ok) {
        return {
          buffer: await elevenResponse.arrayBuffer(),
          contentType: elevenResponse.headers.get('Content-Type') || 'audio/mpeg',
          provider: 'elevenlabs',
        };
      }
      await logElevenLabsFailure(elevenResponse);
    } catch (error) {
      console.error('joyjoy ElevenLabs TTS error:', error);
    }
  } else {
    console.error('joyjoy ELEVENLABS_API_KEY missing, using Google TTS fallback');
  }

  return synthesizeGoogleTts(options.text, lang);
}

/** @deprecated 旧 Edge SSML 路径，保留导出以免外部引用报错 */
export function applyCadenceBreaks(text: string): string {
  return text.trim();
}

/** @deprecated */
export function buildSsml(text: string): string {
  return text.trim();
}
