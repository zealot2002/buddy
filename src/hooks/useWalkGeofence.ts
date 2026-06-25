import { useCallback, useEffect, useRef } from 'react';
import { haversineMeters } from '../../api/data/walk-snippets.js';
import type { WalkSnippetMeta } from '../../api/data/walk-snippets.js';

const API_BASE = '/api';

interface WalkPlayPayload {
  snippetId: string;
  companionId: string;
  content: string;
  duration: number;
  triggerType?: 'auto' | 'tap' | 'offsite';
}

interface UseWalkGeofenceOptions {
  enabled: boolean;
  lat: number;
  lng: number;
  companionId: string;
  onTrigger: (payload: WalkPlayPayload, meta: WalkSnippetMeta) => void;
}

async function fetchNearbyMetas(lat: number, lng: number): Promise<WalkSnippetMeta[]> {
  const res = await fetch(`${API_BASE}/walk/nearby?lat=${lat}&lng=${lng}`);
  if (!res.ok) throw new Error('Failed to fetch nearby walk snippets');
  return res.json();
}

async function fetchWalkPlay(
  snippetId: string,
  companionId: string,
  trigger: 'auto' | 'tap' = 'auto',
): Promise<WalkPlayPayload> {
  const res = await fetch(
    `${API_BASE}/walk/${snippetId}/play?companionId=${encodeURIComponent(companionId)}&trigger=${trigger}`,
  );
  if (!res.ok) throw new Error('Failed to fetch walk snippet content');
  return res.json();
}

export function useWalkGeofence({
  enabled,
  lat,
  lng,
  companionId,
  onTrigger,
}: UseWalkGeofenceOptions) {
  const triggeredRef = useRef<Set<string>>(new Set());
  const metasRef = useRef<WalkSnippetMeta[]>([]);
  const onTriggerRef = useRef(onTrigger);

  useEffect(() => {
    onTriggerRef.current = onTrigger;
  }, [onTrigger]);

  const checkGeofences = useCallback(
    async (currentLat: number, currentLng: number) => {
      if (!enabled) return;

      if (!metasRef.current.length) {
        try {
          metasRef.current = await fetchNearbyMetas(currentLat, currentLng);
        } catch (error) {
          console.error('joyjoy walk nearby fetch failed:', error);
          return;
        }
      }

      for (const meta of metasRef.current) {
        if (triggeredRef.current.has(meta.id)) continue;

        const distance = haversineMeters(currentLat, currentLng, meta.lat, meta.lng);
        if (distance > meta.radius) continue;

        triggeredRef.current.add(meta.id);

        try {
          const payload = await fetchWalkPlay(meta.id, companionId, 'auto');
          onTriggerRef.current(payload, meta);
        } catch (error) {
          console.error('joyjoy walk play fetch failed:', error);
          triggeredRef.current.delete(meta.id);
        }
      }
    },
    [enabled, companionId],
  );

  useEffect(() => {
    if (!enabled) return undefined;

    triggeredRef.current = new Set();
    metasRef.current = [];

    checkGeofences(lat, lng);

    if (!navigator.geolocation) return undefined;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        checkGeofences(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('joyjoy geolocation watch failed:', error);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [enabled, lat, lng, companionId, checkGeofences]);

  const resetSession = useCallback(() => {
    triggeredRef.current = new Set();
    metasRef.current = [];
  }, []);

  return { resetSession };
}

export async function fetchWalkTap(
  lat: number,
  lng: number,
  companionId: string,
): Promise<WalkPlayPayload> {
  const res = await fetch(
    `${API_BASE}/walk/tap?lat=${lat}&lng=${lng}&companionId=${encodeURIComponent(companionId)}`,
  );
  if (!res.ok) throw new Error('Failed to fetch walk tap content');
  return res.json();
}

/** 围栏外调皮话（仅灰色状态灯触发） */
export async function fetchWalkOffsite(companionId: string): Promise<WalkPlayPayload> {
  const res = await fetch(
    `${API_BASE}/walk/offsite?companionId=${encodeURIComponent(companionId)}`,
  );
  if (!res.ok) throw new Error('Failed to fetch offsite chatter');
  return res.json();
}

export async function fetchWalkAreaStatus(lat: number, lng: number): Promise<{
  hasAreaContent: boolean;
  nearest: WalkSnippetMeta & { label?: string; distanceMeters?: number; inside?: boolean };
}> {
  const res = await fetch(`${API_BASE}/walk/nearby?lat=${lat}&lng=${lng}&verbose=1`);
  if (!res.ok) throw new Error('Failed to fetch walk area status');
  const items = (await res.json()) as Array<WalkSnippetMeta & { label?: string; distanceMeters: number; inside: boolean }>;
  const insideFence = items.find((item) => item.inside);
  return {
    hasAreaContent: Boolean(insideFence),
    nearest: insideFence ?? items[0] ?? { id: '', lat, lng, radius: 0, distanceMeters: 0, inside: false },
  };
}
