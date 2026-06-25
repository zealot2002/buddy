import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
      setDefaultCompanionId: (companionId) => set({ defaultCompanionId: companionId }),
      setSubtitleSize: (subtitleSize) => set({ subtitleSize }),
    }),
    { name: 'joyjoy-preferences' },
  ),
);
