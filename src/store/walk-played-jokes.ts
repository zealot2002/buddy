import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function fenceCompanionKey(fenceId: string, companionId: string): string {
  return `${fenceId}:${companionId}`;
}

/** 按围栏 + 旅伴记录已播放过的段子 id（同旅伴同段子不重复自动触发） */
interface WalkPlayedJokesState {
  byFenceCompanion: Record<string, string[]>;
  getPlayedJokeIds: (fenceId: string, companionId: string) => string[];
  hasPlayed: (fenceId: string, companionId: string, jokeId: string) => boolean;
  markPlayed: (fenceId: string, companionId: string, jokeId: string) => void;
  isFenceExhausted: (fenceId: string, companionId: string, totalJokeCount: number) => boolean;
  clearFence: (fenceId: string, companionId: string) => void;
  clearAll: () => void;
}

export const useWalkPlayedJokesStore = create<WalkPlayedJokesState>()(
  persist(
    (set, get) => ({
      byFenceCompanion: {},
      getPlayedJokeIds: (fenceId, companionId) =>
        get().byFenceCompanion[fenceCompanionKey(fenceId, companionId)] ?? [],
      hasPlayed: (fenceId, companionId, jokeId) =>
        get().byFenceCompanion[fenceCompanionKey(fenceId, companionId)]?.includes(jokeId) ?? false,
      markPlayed: (fenceId, companionId, jokeId) =>
        set((state) => {
          const key = fenceCompanionKey(fenceId, companionId);
          const prev = state.byFenceCompanion[key] ?? [];
          if (prev.includes(jokeId)) return state;
          return {
            byFenceCompanion: {
              ...state.byFenceCompanion,
              [key]: [...prev, jokeId],
            },
          };
        }),
      isFenceExhausted: (fenceId, companionId, totalJokeCount) =>
        (get().byFenceCompanion[fenceCompanionKey(fenceId, companionId)]?.length ?? 0) >= totalJokeCount,
      clearFence: (fenceId, companionId) =>
        set((state) => {
          const key = fenceCompanionKey(fenceId, companionId);
          const next = { ...state.byFenceCompanion };
          delete next[key];
          return { byFenceCompanion: next };
        }),
      clearAll: () => set({ byFenceCompanion: {} }),
    }),
    {
      name: 'joyjoy-walk-played-jokes',
      version: 1,
      migrate: (persisted) => {
        const state = persisted as { byFence?: Record<string, string[]>; byFenceCompanion?: Record<string, string[]> };
        if (state.byFenceCompanion) return persisted;
        const byFenceCompanion: Record<string, string[]> = {};
        if (state.byFence) {
          for (const [fenceId, jokeIds] of Object.entries(state.byFence)) {
            byFenceCompanion[`${fenceId}:su-dongpo`] = jokeIds;
            byFenceCompanion[`${fenceId}:sharp-elder`] = [...jokeIds];
          }
        }
        return { ...state, byFenceCompanion, byFence: undefined };
      },
    },
  ),
);
