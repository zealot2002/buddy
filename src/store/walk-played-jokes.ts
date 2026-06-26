import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** 按围栏记录已播放过的段子 id（localStorage 持久化，同一段子不重复自动触发） */
interface WalkPlayedJokesState {
  byFence: Record<string, string[]>;
  getPlayedJokeIds: (fenceId: string) => string[];
  hasPlayed: (fenceId: string, jokeId: string) => boolean;
  markPlayed: (fenceId: string, jokeId: string) => void;
  isFenceExhausted: (fenceId: string, totalJokeCount: number) => boolean;
  clearFence: (fenceId: string) => void;
  clearAll: () => void;
}

export const useWalkPlayedJokesStore = create<WalkPlayedJokesState>()(
  persist(
    (set, get) => ({
      byFence: {},
      getPlayedJokeIds: (fenceId) => get().byFence[fenceId] ?? [],
      hasPlayed: (fenceId, jokeId) => get().byFence[fenceId]?.includes(jokeId) ?? false,
      markPlayed: (fenceId, jokeId) =>
        set((state) => {
          const prev = state.byFence[fenceId] ?? [];
          if (prev.includes(jokeId)) return state;
          return {
            byFence: {
              ...state.byFence,
              [fenceId]: [...prev, jokeId],
            },
          };
        }),
      isFenceExhausted: (fenceId, totalJokeCount) =>
        (get().byFence[fenceId]?.length ?? 0) >= totalJokeCount,
      clearFence: (fenceId) =>
        set((state) => {
          const next = { ...state.byFence };
          delete next[fenceId];
          return { byFence: next };
        }),
      clearAll: () => set({ byFence: {} }),
    }),
    { name: 'joyjoy-walk-played-jokes' },
  ),
);
