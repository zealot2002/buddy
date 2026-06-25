import { create } from 'zustand';

interface LocationState {
  lat: number;
  lng: number;
  city: string;
  isLocating: boolean;
  error: string | null;
  setLocation: (lat: number, lng: number, city: string) => void;
  setLocating: (isLocating: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  lat: 30.2741,
  lng: 120.1551,
  city: '杭州',
  isLocating: false,
  error: null,
  setLocation: (lat, lng, city) => set({ lat, lng, city, isLocating: false, error: null }),
  setLocating: (isLocating) => set({ isLocating }),
  setError: (error) => set({ error, isLocating: false }),
  reset: () => set({ lat: 30.2741, lng: 120.1551, city: '杭州', isLocating: false, error: null }),
}));
