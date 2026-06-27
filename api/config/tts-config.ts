/**
 * ElevenLabs TTS 配置（单一数据源）
 * API Key 仅通过环境变量注入，勿写入代码或同步到 Functions JSON。
 */
import { companions } from '../data/companions.js';
import { normalizeCompanionId } from '../data/narrations.js';

export interface ElevenLabsVoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

/** 同步至 Cloudflare Functions 的公开 TTS 配置（不含 API Key） */
export interface TtsPublicConfig {
  provider: 'elevenlabs';
  modelId: string;
  outputFormat: string;
}

export const TTS_PUBLIC_CONFIG: TtsPublicConfig = {
  provider: 'elevenlabs',
  modelId: process.env.ELEVENLABS_MODEL_ID ?? 'eleven_multilingual_v2',
  outputFormat: 'mp3_44100_128',
};

const EMOTION_STABILITY: Record<string, number> = {
  cheerful: 0.45,
  gentle: 0.55,
  warm: 0.5,
  humorous: 0.35,
};

const EMOTION_STYLE: Record<string, number> = {
  cheerful: 0.35,
  gentle: 0.25,
  warm: 0.3,
  humorous: 0.45,
};

function companionEnvVoiceKey(companionId: string): string {
  return `ELEVENLABS_VOICE_${companionId.toUpperCase().replace(/-/g, '_')}`;
}

export function getElevenLabsApiKey(): string | undefined {
  return process.env.ELEVENLABS_API_KEY?.trim() || undefined;
}

export function resolveElevenLabsVoiceId(companionId?: string | null): string {
  const id = normalizeCompanionId(companionId || 'su-dongpo');
  const fromEnv = process.env[companionEnvVoiceKey(id)]?.trim();
  if (fromEnv) return fromEnv;

  const companion = companions.find((item) => item.id === id);
  if (companion?.voiceId) return companion.voiceId;

  return process.env.ELEVENLABS_DEFAULT_VOICE_ID?.trim() || 'JBFqnCBsd6RMkjVDRZzb';
}

export function resolveElevenLabsVoiceSettings(
  companionId?: string | null,
): ElevenLabsVoiceSettings & { speed: number } {
  const id = normalizeCompanionId(companionId || 'su-dongpo');
  const companion = companions.find((item) => item.id === id);
  const emotion = companion?.toneProfile.emotion ?? 'cheerful';

  return {
    stability: EMOTION_STABILITY[emotion] ?? 0.5,
    similarity_boost: 0.75,
    style: EMOTION_STYLE[emotion] ?? 0.3,
    use_speaker_boost: true,
    speed: companion?.toneProfile.speed ?? 1,
  };
}

/** 拼入旅伴 delivery 风格提示，供 ElevenLabs 合成 */
export function buildTtsSynthesisText(companionId: string | null | undefined, text: string): string {
  const id = normalizeCompanionId(companionId || 'su-dongpo');
  const body = text.trim();
  const style = companions.find((item) => item.id === id)?.ttsStylePrompt?.trim();
  if (!style) return body;
  return `[${style}]\n${body}`;
}

/** @deprecated 兼容旧 Edge TTS 引用；新代码请用 resolveElevenLabsVoiceId */
export function resolveTtsProfileId(companionId?: string | null): string {
  return resolveElevenLabsVoiceId(companionId);
}

/** @deprecated 兼容旧 Edge TTS 引用 */
export type TtsVoiceProfile = {
  voice: string;
  rate: string;
  pitch: string;
  sentenceBreakMs: number;
  commaBreakMs: number;
};

/** @deprecated 兼容旧 Edge TTS 引用 */
export function getTtsProfile(_profileId?: string | null): TtsVoiceProfile {
  return {
    voice: 'zh-CN-YunxiNeural',
    rate: '+0%',
    pitch: '+0Hz',
    sentenceBreakMs: 400,
    commaBreakMs: 200,
  };
}
