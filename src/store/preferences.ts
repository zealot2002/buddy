import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isMvpCompanionId } from '../../api/data/companions.js';

interface PreferencesState {
  defaultCompanionId: string;
  subtitleSize: 'sm' | 'md' | 'lg';
  setDefaultCompanionId: (companionId: string) => void;
  setSubtitleSize: (size: 'sm' | 'md' | 'lg') => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      defaultCompanionId: 'su-dongpo',
      subtitleSize: 'md',
      setDefaultCompanionId: (companionId) =>
        set({ defaultCompanionId: isMvpCompanionId(companionId) ? companionId : 'su-dongpo' }),
      setSubtitleSize: (subtitleSize) => set({ subtitleSize }),
    }),
    {
      name: 'joyjoy-preferences',
      version: 1,
      migrate: (persisted) => {
        const state = persisted as PreferencesState;
        if (!isMvpCompanionId(state.defaultCompanionId)) {
          state.defaultCompanionId = 'su-dongpo';
        }
        return state;
      },
    },
  ),
);
