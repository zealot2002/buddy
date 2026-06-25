import { create } from 'zustand';
import type { Story, NarratorVersion } from '../../api/data/stories.js';

interface PlayerState {
  currentStory: Story | null;
  currentNarrator: NarratorVersion | null;
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

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentStory: null,
  currentNarrator: null,
  currentCompanionId: null,
  isPlaying: false,
  progress: 0,
  volume: 0.8,
  duration: 0,
  play: (story, companionId) => {
    if (audioElement) {
      audioElement.pause();
      audioElement = null;
    }

    const targetCompanionId = companionId || story.defaultCompanionId;
    const narrator = story.narrators.find((n) => n.companionId === targetCompanionId);
    
    const audioUrl = narrator?.audioUrl || `/api/tts?text=${encodeURIComponent(narrator?.content || story.description)}&lang=zh-CN`;
    
    audioElement = new Audio(audioUrl);
    audioElement.volume = get().volume;

    audioElement.addEventListener('loadedmetadata', () => {
      set({ 
        duration: audioElement?.duration || (narrator?.duration || story.duration) * 60,
        currentStory: story, 
        currentNarrator: narrator || null, 
        currentCompanionId: targetCompanionId,
        isPlaying: true, 
        progress: 0 
      });
    });

    audioElement.addEventListener('timeupdate', () => {
      if (audioElement) {
        const totalDuration = audioElement.duration || get().duration;
        const progressPercent = totalDuration > 0 ? (audioElement.currentTime / totalDuration) * 100 : 0;
        set({ progress: progressPercent });
      }
    });

    audioElement.addEventListener('ended', () => {
      set({ isPlaying: false, progress: 100 });
    });

    audioElement.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      const fallbackDuration = (narrator?.duration || story.duration) * 60;
      set({ 
        duration: fallbackDuration,
        currentStory: story, 
        currentNarrator: narrator || null, 
        currentCompanionId: targetCompanionId,
        isPlaying: true, 
        progress: 0 
      });
      
      const interval = setInterval(() => {
        const state = get();
        if (state.progress >= 100) {
          clearInterval(interval);
          set({ isPlaying: false });
        } else {
          set({ progress: Math.min(state.progress + (100 / (fallbackDuration * 10)), 100) });
        }
      }, 100);
    });

    audioElement.play().catch((e) => {
      console.error('Playback failed:', e);
    });
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
        console.error('Playback failed:', e);
      });
      set({ isPlaying: true });
    }
  },
  setProgress: (progress) => {
    set({ progress });
    if (audioElement) {
      const totalDuration = audioElement.duration || get().duration;
      audioElement.currentTime = (progress / 100) * totalDuration;
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
    
    if (audioElement) {
      audioElement.pause();
      audioElement = null;
    }

    const narrator = currentStory.narrators.find((n) => n.companionId === companionId);
    
    const audioUrl = narrator?.audioUrl || `/api/tts?text=${encodeURIComponent(narrator?.content || currentStory.description)}&lang=zh-CN`;
    
    audioElement = new Audio(audioUrl);
    audioElement.volume = get().volume;

    audioElement.addEventListener('loadedmetadata', () => {
      set({ 
        duration: audioElement?.duration || (narrator?.duration || currentStory.duration) * 60,
        currentNarrator: narrator || null, 
        currentCompanionId: companionId,
        isPlaying: true, 
        progress: 0 
      });
    });

    audioElement.addEventListener('timeupdate', () => {
      if (audioElement) {
        const totalDuration = audioElement.duration || get().duration;
        const progressPercent = totalDuration > 0 ? (audioElement.currentTime / totalDuration) * 100 : 0;
        set({ progress: progressPercent });
      }
    });

    audioElement.addEventListener('ended', () => {
      set({ isPlaying: false, progress: 100 });
    });

    audioElement.play().catch((e) => {
      console.error('Playback failed:', e);
    });
  },
  stop: () => {
    audioElement?.pause();
    audioElement = null;
    set({ 
      currentStory: null, 
      currentNarrator: null, 
      currentCompanionId: null, 
      isPlaying: false, 
      progress: 0,
      duration: 0 
    });
  },
}));
