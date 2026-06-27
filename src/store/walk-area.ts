import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalkAreaState {
  areaId: string;
  setAreaId: (areaId: string) => void;
}

export const useWalkAreaStore = create<WalkAreaState>()(
  persist(
    (set) => ({
      areaId: 'gong-wang-fu',
      setAreaId: (areaId) => set({ areaId }),
    }),
    { name: 'joyjoy-walk-area' },
  ),
);
