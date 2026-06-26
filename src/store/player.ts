import { create } from 'zustand';
import type { Story } from '../../api/data/stories.js';
import { normalizeCompanionId } from '../../api/data/narrations.js';
import {
  findNarratorForCompanion,
  resolveNarratorScript,
  type ResolvedNarrator,
} from '../../api/data/narration-utils.js';
import { isWalkSpeechSupported, speakWalkText } from '../lib/walk-speech.js';

export type PlayerMode = 'city' | 'walk' | 'playlist';

interface WalkPayload {
  snippetId: string;
  content: string;
  duration: number;
}

interface PlayerState {
  mode: PlayerMode;
  currentStory: Story | null;
  currentNarrator: ResolvedNarrator | null;
  currentCompanionId: string | null;
  walkContent: string | null;
  walkSnippetId: string | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  duration: number;
  onEnded: (() => void) | null;
  play: (story: Story, companionId?: string, mode?: PlayerMode) => void;
  playWalk: (payload: WalkPayload, companionId: string, interrupt?: boolean) => void;
  pause: () => void;
  toggle: () => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  switchCompanion: (companionId: string) => void;
  setOnEnded: (callback: (() => void) | null) => void;
  stop: () => void;
}

let audioElement: HTMLAudioElement | null = null;
let fallbackTimer: ReturnType<typeof setInterval> | null = null;
let walkSpeechCancel: (() => void) | null = null;

const getFallbackDuration = (narrator: ResolvedNarrator | null | undefined, story: Story) =>
  narrator?.duration || story.duration;

const clearFallbackTimer = () => {
  if (fallbackTimer) {
    clearInterval(fallbackTimer);
    fallbackTimer = null;
  }
};

const bindAudioEvents = (
  audio: HTMLAudioElement,
  set: (partial: Partial<PlayerState>) => void,
  get: () => PlayerState,
  fallbackDuration: number,
) => {
  audio.addEventListener('loadedmetadata', () => {
    set({
      duration: Number.isFinite(audio.duration) && audio.duration > 0
        ? audio.duration
        : fallbackDuration,
      progress: 0,
    });
  });

  audio.addEventListener('timeupdate', () => {
    const totalDuration = Number.isFinite(audio.duration) && audio.duration > 0
      ? audio.duration
      : get().duration || fallbackDuration;
    const progressPercent = totalDuration > 0
      ? (audio.currentTime / totalDuration) * 100
      : 0;
    set({ progress: progressPercent });
  });

  audio.addEventListener('ended', () => {
    set({ isPlaying: false, progress: 100 });
    get().onEnded?.();
  });

  audio.addEventListener('error', () => {
    console.error('joyjoy Audio playback error');
    clearFallbackTimer();
    set({
      duration: fallbackDuration,
      isPlaying: true,
      progress: 0,
    });

    fallbackTimer = setInterval(() => {
      const state = get();
      if (state.progress >= 100) {
        clearFallbackTimer();
        set({ isPlaying: false, progress: 100 });
        get().onEnded?.();
        return;
      }
      set({
        progress: Math.min(state.progress + (100 / (fallbackDuration * 10)), 100),
      });
    }, 100);
  });
};

const stopCurrentAudio = () => {
  clearFallbackTimer();
  walkSpeechCancel?.();
  walkSpeechCancel = null;
  if (audioElement) {
    audioElement.pause();
    audioElement = null;
  }
};

const startWalkSpeech = (
  content: string,
  companionId: string,
  duration: number,
  set: (partial: Partial<PlayerState> | ((state: PlayerState) => Partial<PlayerState>)) => void,
  get: () => PlayerState,
  extra: Partial<PlayerState>,
) => {
  stopCurrentAudio();

  const normalizedId = normalizeCompanionId(companionId);

  set({
    mode: 'walk',
    currentCompanionId: normalizedId,
    duration,
    isPlaying: true,
    progress: 0,
    ...extra,
  });

  if (isWalkSpeechSupported()) {
    walkSpeechCancel = speakWalkText(content, normalizedId, {
      onProgress: (progress) => set({ progress }),
      onEnd: () => {
        walkSpeechCancel = null;
        set({ isPlaying: false, progress: 100 });
        get().onEnded?.();
      },
    });
    return;
  }

  startContentAudio(content, companionId, duration, 'walk', set, get, extra);
};

const startContentAudio = (
  content: string,
  companionId: string,
  duration: number,
  mode: PlayerMode,
  set: (partial: Partial<PlayerState> | ((state: PlayerState) => Partial<PlayerState>)) => void,
  get: () => PlayerState,
  extra: Partial<PlayerState>,
) => {
  stopCurrentAudio();

  const normalizedId = normalizeCompanionId(companionId);
  const audioUrl = `/api/tts?text=${encodeURIComponent(content)}&lang=zh-CN&companionId=${encodeURIComponent(normalizedId)}`;

  audioElement = new Audio(audioUrl);
  audioElement.volume = get().volume;

  bindAudioEvents(audioElement, set, get, duration);

  set({
    mode,
    currentCompanionId: normalizedId,
    duration,
    isPlaying: true,
    progress: 0,
    ...extra,
  });

  audioElement.play().catch((e) => {
    console.error('joyjoy Playback failed:', e);
  });
};

const startStoryAudio = (
  story: Story,
  companionId: string,
  mode: PlayerMode,
  set: (partial: Partial<PlayerState> | ((state: PlayerState) => Partial<PlayerState>)) => void,
  get: () => PlayerState,
) => {
  stopCurrentAudio();

  const normalizedId = normalizeCompanionId(companionId);
  const rawNarrator = findNarratorForCompanion(story.narrators, normalizedId);
  if (!rawNarrator) {
    console.error('joyjoy Narrator not found for companion:', companionId);
    return;
  }

  const narrator = resolveNarratorScript(rawNarrator);
  const fallbackDuration = getFallbackDuration(narrator, story);
  const audioUrl = narrator.audioUrl
    || `/api/tts?text=${encodeURIComponent(narrator.content)}&lang=zh-CN&companionId=${encodeURIComponent(normalizedId)}`;

  audioElement = new Audio(audioUrl);
  audioElement.volume = get().volume;

  bindAudioEvents(audioElement, set, get, fallbackDuration);

  set({
    mode,
    currentStory: story,
    currentNarrator: narrator,
    currentCompanionId: normalizedId,
    walkContent: null,
    walkSnippetId: null,
    duration: fallbackDuration,
    isPlaying: true,
    progress: 0,
  });

  audioElement.play().catch((e) => {
    console.error('joyjoy Playback failed:', e);
  });
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  mode: 'city',
  currentStory: null,
  currentNarrator: null,
  currentCompanionId: null,
  walkContent: null,
  walkSnippetId: null,
  isPlaying: false,
  progress: 0,
  volume: 0.8,
  duration: 0,
  onEnded: null,

  play: (story, companionId, mode = 'city') => {
    startStoryAudio(story, companionId || story.defaultCompanionId, mode, set, get);
  },

  playWalk: (payload, companionId, interrupt = true) => {
    const { isPlaying, mode } = get();
    if (isPlaying && mode === 'playlist' && !interrupt) return;

    startWalkSpeech(
      payload.content,
      companionId,
      payload.duration,
      set,
      get,
      {
        currentStory: null,
        currentNarrator: null,
        walkContent: payload.content,
        walkSnippetId: payload.snippetId,
      },
    );
  },

  pause: () => {
    if (walkSpeechCancel) {
      walkSpeechCancel();
      walkSpeechCancel = null;
    }
    audioElement?.pause();
    set({ isPlaying: false });
  },

  toggle: () => {
    const { isPlaying, mode, walkContent, walkSnippetId, duration, currentCompanionId } = get();
    if (isPlaying) {
      if (walkSpeechCancel) {
        walkSpeechCancel();
        walkSpeechCancel = null;
      }
      audioElement?.pause();
      set({ isPlaying: false });
      return;
    }

    if (mode === 'walk' && walkContent && walkSnippetId && currentCompanionId) {
      startWalkSpeech(
        walkContent,
        currentCompanionId,
        duration,
        set,
        get,
        {
          currentStory: null,
          currentNarrator: null,
          walkContent,
          walkSnippetId,
        },
      );
      return;
    }

    audioElement?.play().catch((e) => {
      console.error('joyjoy Playback failed:', e);
    });
    set({ isPlaying: true });
  },

  setProgress: (progress) => {
    const clamped = Math.max(0, Math.min(100, progress));
    set({ progress: clamped });

    if (audioElement) {
      const totalDuration = Number.isFinite(audioElement.duration) && audioElement.duration > 0
        ? audioElement.duration
        : get().duration;
      if (totalDuration > 0) {
        audioElement.currentTime = (clamped / 100) * totalDuration;
      }
    }
  },

  setVolume: (volume) => {
    set({ volume });
    if (audioElement) {
      audioElement.volume = volume;
    }
  },

  switchCompanion: (companionId) => {
    const { currentStory, mode, walkContent, walkSnippetId, duration } = get();
    if (mode === 'walk' && walkContent && walkSnippetId) {
      startWalkSpeech(
        walkContent,
        companionId,
        duration,
        set,
        get,
        {
          currentStory: null,
          currentNarrator: null,
          walkContent,
          walkSnippetId,
        },
      );
      return;
    }
    if (!currentStory) return;
    startStoryAudio(currentStory, companionId, mode, set, get);
  },

  setOnEnded: (callback) => set({ onEnded: callback }),

  stop: () => {
    stopCurrentAudio();
    set({
      mode: 'city',
      currentStory: null,
      currentNarrator: null,
      currentCompanionId: null,
      walkContent: null,
      walkSnippetId: null,
      isPlaying: false,
      progress: 0,
      duration: 0,
      onEnded: null,
    });
  },
}));
