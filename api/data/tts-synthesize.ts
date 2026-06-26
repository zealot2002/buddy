import { getTtsProfile, resolveTtsProfileId, type TtsVoiceProfile } from '../config/tts-config.js';

const EDGE_OUTPUT_FORMAT = 'audio-24khz-48kbitrate-mono-mp3';
const EDGE_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** 在标点处插入 SSML break，增强抑扬顿挫 */
export function applyCadenceBreaks(text: string, profile: TtsVoiceProfile): string {
  const escaped = escapeXml(text.trim());
  return escaped
    .replace(/([。！？；])/g, `$1<break time="${profile.sentenceBreakMs}ms"/>`)
    .replace(/([，、])/g, `$1<break time="${profile.commaBreakMs}ms"/>`)
    .replace(/([——…])/g, `$1<break time="${Math.round((profile.sentenceBreakMs + profile.commaBreakMs) / 2)}ms"/>`);
}

export function buildSsml(text: string, profile: TtsVoiceProfile): string {
  const body = applyCadenceBreaks(text, profile);
  return [
    '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN">',
    `<voice name="${profile.voice}">`,
    `<prosody rate="${profile.rate}" pitch="${profile.pitch}">${body}</prosody>`,
    '</voice>',
    '</speak>',
  ].join('');
}

export interface SynthesizeSpeechOptions {
  text: string;
  companionId?: string | null;
  profileId?: string | null;
  edgeClientToken?: string;
}

export async function synthesizeSpeech(options: SynthesizeSpeechOptions): Promise<Response> {
  const { text, companionId, profileId, edgeClientToken } = options;
  const profile = getTtsProfile(profileId ?? resolveTtsProfileId(companionId));
  const token = edgeClientToken ?? '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
  const ssml = buildSsml(text, profile);
  const url = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${token}`;

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': EDGE_OUTPUT_FORMAT,
      'User-Agent': EDGE_USER_AGENT,
    },
    body: ssml,
  });
}

/** Google TTS 兜底（无韵律控制） */
export async function synthesizeSpeechFallback(text: string, lang = 'zh-CN'): Promise<Response> {
  const encodedText = encodeURIComponent(text);
  const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob`;
  return fetch(googleTtsUrl);
}

export async function synthesizeSpeechWithFallback(
  options: SynthesizeSpeechOptions,
): Promise<{ response: Response; provider: 'edge' | 'google' }> {
  try {
    const edgeResponse = await synthesizeSpeech(options);
    if (edgeResponse.ok) {
      return { response: edgeResponse, provider: 'edge' };
    }
    console.error('joyjoy edge TTS failed:', edgeResponse.status);
  } catch (error) {
    console.error('joyjoy edge TTS error:', error);
  }

  const fallback = await synthesizeSpeechFallback(options.text);
  return { response: fallback, provider: 'google' };
}
