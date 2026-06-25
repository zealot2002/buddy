import { create } from 'zustand';
import type { Story } from '../../api/data/stories.js';

interface PlayerState {
  currentStory: Story | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  play: (story: Story) => void;
  pause: () => void;
  toggle: () => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  stop: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentStory: null,
  isPlaying: false,
  progress: 0,
  volume: 0.8,
  play: (story) => set({ currentStory: story, isPlaying: true, progress: 0 }),
  pause: () => set({ isPlaying: false }),
  toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setProgress: (progress) => set({ progress }),
  setVolume: (volume) => set({ volume }),
  stop: () => set({ currentStory: null, isPlaying: false, progress: 0 }),
}));
