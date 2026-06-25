import { create } from 'zustand';
import type { Story } from '../../api/data/stories.js';
import type { Companion } from '../../api/data/companions.js';
import type { Route } from '../../api/data/routes.js';

interface FavoritesState {
  stories: Story[];
  companions: Companion[];
  routes: Route[];
  addStory: (story: Story) => void;
  removeStory: (storyId: string) => void;
  isStoryFavorite: (storyId: string) => boolean;
  addCompanion: (companion: Companion) => void;
  removeCompanion: (companionId: string) => void;
  isCompanionFavorite: (companionId: string) => boolean;
  addRoute: (route: Route) => void;
  removeRoute: (routeId: string) => void;
  isRouteFavorite: (routeId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  stories: [],
  companions: [],
  routes: [],
  addStory: (story) => set((state) => ({ stories: [...state.stories, story] })),
  removeStory: (storyId) => set((state) => ({ stories: state.stories.filter((s) => s.id !== storyId) })),
  isStoryFavorite: (storyId) => get().stories.some((s) => s.id === storyId),
  addCompanion: (companion) => set((state) => ({ companions: [...state.companions, companion] })),
  removeCompanion: (companionId) => set((state) => ({ companions: state.companions.filter((c) => c.id !== companionId) })),
  isCompanionFavorite: (companionId) => get().companions.some((c) => c.id === companionId),
  addRoute: (route) => set((state) => ({ routes: [...state.routes, route] })),
  removeRoute: (routeId) => set((state) => ({ routes: state.routes.filter((r) => r.id !== routeId) })),
  isRouteFavorite: (routeId) => get().routes.some((r) => r.id === routeId),
}));
