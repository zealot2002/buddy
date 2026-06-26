/**
 * Edge TTS 合成（Cloudflare Functions 用，与 api/data/tts-synthesize.ts 保持同步）
 */

const EDGE_OUTPUT_FORMAT = 'audio-24khz-48kbitrate-mono-mp3';
const EDGE_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
const EDGE_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';

const TTS_PROFILES = {
  'sharp-elder': {
    voice: 'zh-CN-YunjianNeural',
    rate: '-6%',
    pitch: '-18Hz',
    sentenceBreakMs: 520,
    commaBreakMs: 240,
  },
  'su-dongpo': {
    voice: 'zh-CN-YunxiNeural',
    rate: '-12%',
    pitch: '-8Hz',
    sentenceBreakMs: 480,
    commaBreakMs: 220,
  },
  'rough-male': {
    voice: 'zh-CN-YunjianNeural',
    rate: '-6%',
    pitch: '-18Hz',
    sentenceBreakMs: 520,
    commaBreakMs: 240,
  },
};

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function resolveProfileId(companionId) {
  if (companionId && TTS_PROFILES[companionId]) return companionId;
  return 'rough-male';
}

function buildSsml(text, profile) {
  const escaped = escapeXml(text.trim())
    .replace(/([。！？；])/g, `$1<break time="${profile.sentenceBreakMs}ms"/>`)
    .replace(/([，、])/g, `$1<break time="${profile.commaBreakMs}ms"/>`)
    .replace(/([——…])/g, `$1<break time="${Math.round((profile.sentenceBreakMs + profile.commaBreakMs) / 2)}ms"/>`);

  return [
    '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN">',
    `<voice name="${profile.voice}">`,
    `<prosody rate="${profile.rate}" pitch="${profile.pitch}">${escaped}</prosody>`,
    '</voice>',
    '</speak>',
  ].join('');
}

export async function synthesizeSpeechWithFallback({ text, companionId, profileId }) {
  const profile = TTS_PROFILES[profileId || resolveProfileId(companionId)] || TTS_PROFILES['rough-male'];
  const ssml = buildSsml(text, profile);
  const url = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${EDGE_CLIENT_TOKEN}`;

  try {
    const edgeResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': EDGE_OUTPUT_FORMAT,
        'User-Agent': EDGE_USER_AGENT,
      },
      body: ssml,
    });
    if (edgeResponse.ok) {
      return { response: edgeResponse, provider: 'edge' };
    }
    console.error('joyjoy edge TTS failed:', edgeResponse.status);
  } catch (error) {
    console.error('joyjoy edge TTS error:', error);
  }

  const encodedText = encodeURIComponent(text);
  const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=zh-CN&client=tw-ob`;
  const fallback = await fetch(googleTtsUrl);
  return { response: fallback, provider: 'google' };
}
