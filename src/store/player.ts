import { create } from 'zustand';
import type { Story } from '../../api/data/stories.js';
import { normalizeCompanionId } from '../../api/data/narrations.js';
import {
  findNarratorForCompanion,
  resolveNarratorScript,
  type ResolvedNarrator,
} from '../../api/data/narration-utils.js';

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
  onPlay: (() => void) | null;
  play: (story: Story, companionId?: string, mode?: PlayerMode) => void;
  playWalk: (payload: WalkPayload, companionId: string, interrupt?: boolean) => void;
  pause: () => void;
  toggle: () => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  switchCompanion: (companionId: string) => void;
  setOnEnded: (callback: (() => void) | null) => void;
  setOnPlay: (callback: (() => void) | null) => void;
  stop: () => void;
}

let audioElement: HTMLAudioElement | null = null;
let fallbackTimer: ReturnType<typeof setInterval> | null = null;

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
  if (audioElement) {
    audioElement.pause();
    audioElement = null;
  }
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
  const audioUrl = `/api/tts?text=${encodeURIComponent(content)}&companionId=${encodeURIComponent(normalizedId)}&lang=zh-CN&stream=1`;

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

  audioElement.play().then(() => {
    get().onPlay?.();
  }).catch((e) => {
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
    || `/api/tts?text=${encodeURIComponent(narrator.content)}&companionId=${encodeURIComponent(normalizedId)}&lang=zh-CN`;

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

  audioElement.play().then(() => {
    get().onPlay?.();
  }).catch((e) => {
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
  onPlay: null,

  play: (story, companionId, mode = 'city') => {
    startStoryAudio(story, companionId || story.defaultCompanionId, mode, set, get);
  },

  playWalk: (payload, companionId, interrupt = true) => {
    const { isPlaying, mode } = get();
    if (isPlaying && mode === 'playlist' && !interrupt) return;

    startContentAudio(
      payload.content,
      companionId,
      payload.duration,
      'walk',
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
    audioElement?.pause();
    set({ isPlaying: false });
  },

  toggle: () => {
    const { isPlaying } = get();
    if (isPlaying) {
      audioElement?.pause();
      set({ isPlaying: false });
    } else {
      audioElement?.play().catch((e) => {
        console.error('joyjoy Playback failed:', e);
      });
      set({ isPlaying: true });
    }
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
    const { currentStory, mode } = get();
    if (mode === 'walk') return;
    if (!currentStory) return;
    startStoryAudio(currentStory, companionId, mode, set, get);
  },

  setOnEnded: (callback) => set({ onEnded: callback }),
  setOnPlay: (callback) => set({ onPlay: callback }),

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
