import { create } from 'zustand';
import type { Story, NarratorVersion } from '../../api/data/stories.js';

interface PlayerState {
  currentStory: Story | null;
  currentNarrator: NarratorVersion | null;
  currentCompanionId: string | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  play: (story: Story, companionId?: string) => void;
  pause: () => void;
  toggle: () => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  switchCompanion: (companionId: string) => void;
  stop: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentStory: null,
  currentNarrator: null,
  currentCompanionId: null,
  isPlaying: false,
  progress: 0,
  volume: 0.8,
  play: (story, companionId) => {
    const targetCompanionId = companionId || story.defaultCompanionId;
    const narrator = story.narrators.find((n) => n.companionId === targetCompanionId);
    set({ 
      currentStory: story, 
      currentNarrator: narrator || null, 
      currentCompanionId: targetCompanionId,
      isPlaying: true, 
      progress: 0 
    });
  },
  pause: () => set({ isPlaying: false }),
  toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setProgress: (progress) => set({ progress }),
  setVolume: (volume) => set({ volume }),
  switchCompanion: (companionId) => {
    const { currentStory } = get();
    if (!currentStory) return;
    const narrator = currentStory.narrators.find((n) => n.companionId === companionId);
    set({ 
      currentNarrator: narrator || null, 
      currentCompanionId: companionId,
      progress: 0,
      isPlaying: true
    });
  },
  stop: () => set({ 
    currentStory: null, 
    currentNarrator: null, 
    currentCompanionId: null, 
    isPlaying: false, 
    progress: 0 
  }),
}));
