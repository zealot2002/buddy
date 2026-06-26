import {
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
}

export interface SynthesizeSpeechResult {
  buffer: ArrayBuffer;
  contentType: string;
  provider: 'elevenlabs' | 'google';
}

const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1';

/** Google TTS 兜底（无韵律控制，仅开发/故障降级） */
export async function synthesizeSpeechFallback(text: string, lang = 'zh-CN'): Promise<Response> {
  const encodedText = encodeURIComponent(text);
  const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob`;
  return fetch(googleTtsUrl);
}

export async function synthesizeElevenLabsSpeech(
  options: SynthesizeSpeechOptions,
): Promise<Response> {
  const { text, companionId, profileId, apiKey } = options;
  const resolvedKey = apiKey ?? getElevenLabsApiKey();
  if (!resolvedKey) {
    throw new Error('ELEVENLABS_API_KEY is not configured');
  }

  const voiceId = resolveElevenLabsVoiceId(profileId ?? companionId);
  const voiceSettings = resolveElevenLabsVoiceSettings(companionId);
  const { speed, ...settings } = voiceSettings;

  const url = new URL(`${ELEVENLABS_BASE}/text-to-speech/${voiceId}`);
  url.searchParams.set('output_format', TTS_PUBLIC_CONFIG.outputFormat);

  return fetch(url.toString(), {
    method: 'POST',
    headers: {
      'xi-api-key': resolvedKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text: text.trim(),
      model_id: TTS_PUBLIC_CONFIG.modelId,
      voice_settings: settings,
      speed,
    }),
  });
}

export async function synthesizeSpeechWithFallback(
  options: SynthesizeSpeechOptions,
  lang = 'zh-CN',
): Promise<SynthesizeSpeechResult> {
  try {
    const elevenResponse = await synthesizeElevenLabsSpeech(options);
    if (elevenResponse.ok) {
      return {
        buffer: await elevenResponse.arrayBuffer(),
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
