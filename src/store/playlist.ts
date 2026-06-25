import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PlaylistSession {
  companionId: string;
  storyIds: string[];
  currentIndex: number;
}

interface PlaylistState {
  session: PlaylistSession | null;
  draftStoryIds: string[];
  draftCompanionId: string;
  setDraftStoryIds: (storyIds: string[]) => void;
  toggleDraftStory: (storyId: string) => void;
  moveDraftStory: (fromIndex: number, toIndex: number) => void;
  setDraftCompanionId: (companionId: string) => void;
  startSession: (companionId: string, storyIds: string[]) => void;
  advanceIndex: () => void;
  clearSession: () => void;
}

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set, get) => ({
      session: null,
      draftStoryIds: [],
      draftCompanionId: 'su-dongpo',
      setDraftStoryIds: (storyIds) => set({ draftStoryIds: storyIds }),
      toggleDraftStory: (storyId) =>
        set((state) => ({
          draftStoryIds: state.draftStoryIds.includes(storyId)
            ? state.draftStoryIds.filter((id) => id !== storyId)
            : [...state.draftStoryIds, storyId],
        })),
      moveDraftStory: (fromIndex, toIndex) =>
        set((state) => {
          const next = [...state.draftStoryIds];
          const [item] = next.splice(fromIndex, 1);
          next.splice(toIndex, 0, item);
          return { draftStoryIds: next };
        }),
      setDraftCompanionId: (companionId) => set({ draftCompanionId: companionId }),
      startSession: (companionId, storyIds) =>
        set({
          session: {
            companionId,
            storyIds,
            currentIndex: 0,
          },
        }),
      advanceIndex: () => {
        const { session } = get();
        if (!session) return;
        const nextIndex = session.currentIndex + 1;
        if (nextIndex >= session.storyIds.length) {
          set({ session: null });
          return;
        }
        set({ session: { ...session, currentIndex: nextIndex } });
      },
      clearSession: () => set({ session: null }),
    }),
    {
      name: 'joyjoy-playlist',
      partialize: (state) => ({
        session: state.session,
        draftStoryIds: state.draftStoryIds,
        draftCompanionId: state.draftCompanionId,
      }),
    },
  ),
);
