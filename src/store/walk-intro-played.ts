import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const INTRO_COOLDOWN_MS = 24 * 60 * 60 * 1000;

interface WalkIntroPlayedState {
  byCompanion: Record<string, number>;
  shouldPlayIntro: (companionId: string) => boolean;
  markIntroPlayed: (companionId: string) => void;
}

export const useWalkIntroPlayedStore = create<WalkIntroPlayedState>()(
  persist(
    (set, get) => ({
      byCompanion: {},
      shouldPlayIntro: (companionId) => {
        const lastAt = get().byCompanion[companionId];
        if (!lastAt) return true;
        return Date.now() - lastAt >= INTRO_COOLDOWN_MS;
      },
      markIntroPlayed: (companionId) =>
        set((state) => ({
          byCompanion: {
            ...state.byCompanion,
            [companionId]: Date.now(),
          },
        })),
    }),
    { name: 'joyjoy-walk-intro-played' },
  ),
);
