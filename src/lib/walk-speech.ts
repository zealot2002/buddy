/** 边走边听：浏览器 TTS，粗犷男声 + 标点气口（抑扬顿挫） */

export interface WalkSpeechProfile {
  rate: number;
  pitch: number;
  volume: number;
  sentencePauseMs: number;
  commaPauseMs: number;
}

const WALK_SPEECH_PROFILES: Record<string, WalkSpeechProfile> = {
  'sharp-elder': {
    rate: 0.82,
    pitch: 0.7,
    volume: 1,
    sentencePauseMs: 520,
    commaPauseMs: 240,
  },
  'su-dongpo': {
    rate: 0.78,
    pitch: 0.82,
    volume: 0.95,
    sentencePauseMs: 500,
    commaPauseMs: 260,
  },
};

let cachedVoices: SpeechSynthesisVoice[] = [];

function refreshVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  cachedVoices = window.speechSynthesis.getVoices();
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = refreshVoices;
}

function pickChineseMaleVoice(companionId: string): SpeechSynthesisVoice | undefined {
  const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
  const zhVoices = voices.filter((voice) => voice.lang.startsWith('zh'));

  const preferPatterns =
    companionId === 'sharp-elder'
      ? [/Yunjian/i, /Kangkang/i, /Li-mu/i, /男/i, /Male/i]
      : [/Yunxi/i, /Kangkang/i, /男/i, /Male/i];

  for (const pattern of preferPatterns) {
    const matched = zhVoices.find((voice) => pattern.test(voice.name));
    if (matched) return matched;
  }

  const femalePattern = /女|female|Ting|Sin|Meijia|Yu-shu|Li-mu \(Enhanced\)/i;
  return zhVoices.find((voice) => !femalePattern.test(voice.name)) ?? zhVoices[0];
}

function splitCadenceSegments(text: string): string[] {
  return text.match(/[^。！？；]+[。！？；]?|[^，、]+[，、]?/g)?.filter(Boolean) ?? [text];
}

export function isWalkSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakWalkText(
  text: string,
  companionId: string,
  callbacks?: {
    onStart?: () => void;
    onProgress?: (progress: number) => void;
    onEnd?: () => void;
  },
): () => void {
  if (!isWalkSpeechSupported()) {
    callbacks?.onEnd?.();
    return () => {};
  }

  window.speechSynthesis.cancel();

  const profile = WALK_SPEECH_PROFILES[companionId] ?? WALK_SPEECH_PROFILES['sharp-elder'];
  const voice = pickChineseMaleVoice(companionId);
  const segments = splitCadenceSegments(text.trim());

  let index = 0;
  let cancelled = false;
  let pauseTimer: ReturnType<typeof setTimeout> | null = null;

  const cleanup = () => {
    cancelled = true;
    if (pauseTimer) clearTimeout(pauseTimer);
    window.speechSynthesis.cancel();
  };

  const speakNext = () => {
    if (cancelled) return;

    if (index >= segments.length) {
      callbacks?.onProgress?.(100);
      callbacks?.onEnd?.();
      return;
    }

    const segment = segments[index];
    index += 1;

    const utterance = new SpeechSynthesisUtterance(segment);
    utterance.lang = 'zh-CN';
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;
    utterance.volume = profile.volume;
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      if (cancelled) return;
      callbacks?.onProgress?.(Math.min(99, (index / segments.length) * 100));

      const pauseMs = /[。！？；]$/.test(segment)
        ? profile.sentencePauseMs
        : /[，、]$/.test(segment)
          ? profile.commaPauseMs
          : 80;

      pauseTimer = setTimeout(speakNext, pauseMs);
    };

    utterance.onerror = () => {
      if (!cancelled) speakNext();
    };

    window.speechSynthesis.speak(utterance);
  };

  callbacks?.onStart?.();
  speakNext();

  return cleanup;
}
