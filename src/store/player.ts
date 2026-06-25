import { create } from 'zustand';
import type { Story, NarratorVersion } from '../../api/data/stories.js';
import { normalizeCompanionId } from '../../api/data/narrations.js';
import {
  findNarratorForCompanion,
  resolveNarratorScript,
  type ResolvedNarrator,
} from '../../api/data/narration-utils.js';

interface PlayerState {
  currentStory: Story | null;
  currentNarrator: ResolvedNarrator | null;
  currentCompanionId: string | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  duration: number;
  play: (story: Story, companionId?: string) => void;
  pause: () => void;
  toggle: () => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  switchCompanion: (companionId: string) => void;
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
        return;
      }
      set({
        progress: Math.min(state.progress + (100 / (fallbackDuration * 10)), 100),
      });
    }, 100);
  });
};

const startAudio = (
  story: Story,
  companionId: string,
  set: (partial: Partial<PlayerState> | ((state: PlayerState) => Partial<PlayerState>)) => void,
  get: () => PlayerState,
) => {
  clearFallbackTimer();

  if (audioElement) {
    audioElement.pause();
    audioElement = null;
  }

  const normalizedId = normalizeCompanionId(companionId);
  const rawNarrator = findNarratorForCompanion(story.narrators, normalizedId);
  if (!rawNarrator) {
    console.error('joyjoy Narrator not found for companion:', companionId);
    return;
  }

  const narrator = resolveNarratorScript(rawNarrator);
  const fallbackDuration = getFallbackDuration(narrator, story);
  const audioUrl = narrator.audioUrl
    || `/api/tts?text=${encodeURIComponent(narrator.content)}&lang=zh-CN`;

  audioElement = new Audio(audioUrl);
  audioElement.volume = get().volume;

  bindAudioEvents(audioElement, set, get, fallbackDuration);

  set({
    currentStory: story,
    currentNarrator: narrator,
    currentCompanionId: normalizedId,
    duration: fallbackDuration,
    isPlaying: true,
    progress: 0,
  });

  audioElement.play().catch((e) => {
    console.error('joyjoy Playback failed:', e);
  });
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentStory: null,
  currentNarrator: null,
  currentCompanionId: null,
  isPlaying: false,
  progress: 0,
  volume: 0.8,
  duration: 0,

  play: (story, companionId) => {
    startAudio(story, companionId || story.defaultCompanionId, set, get);
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
    const { currentStory } = get();
    if (!currentStory) return;
    startAudio(currentStory, companionId, set, get);
  },

  stop: () => {
    clearFallbackTimer();
    audioElement?.pause();
    audioElement = null;
    set({
      currentStory: null,
      currentNarrator: null,
      currentCompanionId: null,
      isPlaying: false,
      progress: 0,
      duration: 0,
    });
  },
}));
