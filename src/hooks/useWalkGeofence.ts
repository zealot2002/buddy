import { useCallback, useEffect, useRef } from 'react';
import {
  canAutoTriggerWalk,
  WALK_LISTEN_CONFIG,
  type WalkAutoTriggerGate,
} from '../../api/config/walk-config.js';
import { haversineMeters } from '../../api/data/walk-snippets.js';
import type { WalkSnippetMeta } from '../../api/data/walk-snippets.js';

const API_BASE = '/api';

export interface WalkPlayPayload {
  snippetId: string;
  companionId: string;
  content: string;
  duration: number;
  triggerType?: 'auto' | 'tap' | 'offsite';
  layer?: 'L1' | 'L2' | 'L3';
  branch?: 'A' | 'B';
  label?: string;
}

interface UseWalkGeofenceOptions {
  enabled: boolean;
  lat: number;
  lng: number;
  simulationMode?: boolean;
  onTrigger: (payload: WalkPlayPayload, meta: WalkSnippetMeta) => void;
}

async function fetchNearbyMetas(lat: number, lng: number): Promise<WalkSnippetMeta[]> {
  const res = await fetch(`${API_BASE}/walk/nearby?lat=${lat}&lng=${lng}`);
  if (!res.ok) throw new Error('Failed to fetch nearby walk snippets');
  return res.json();
}

export async function fetchWalkPlay(
  snippetId: string,
  companionId: string,
  options: {
    layer?: 'L1' | 'L2' | 'L3';
    branch?: 'A' | 'B';
    trigger?: 'auto' | 'tap';
  } = {},
): Promise<WalkPlayPayload> {
  const params = new URLSearchParams({
    companionId,
    trigger: options.trigger ?? (options.layer === 'L1' || !options.layer ? 'auto' : 'tap'),
  });
  if (options.layer) params.set('layer', options.layer);
  if (options.branch) params.set('branch', options.branch);

  const res = await fetch(`${API_BASE}/walk/${snippetId}/play?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch walk snippet content');
  return res.json();
}

export function useWalkGeofence({
  enabled,
  lat,
  lng,
  simulationMode = WALK_LISTEN_CONFIG.simulation.enabled,
  onTrigger,
}: UseWalkGeofenceOptions) {
  const triggeredRef = useRef<Set<string>>(new Set());
  const metasRef = useRef<WalkSnippetMeta[]>([]);
  const autoTriggerGateRef = useRef<WalkAutoTriggerGate | null>(null);
  const onTriggerRef = useRef(onTrigger);

  useEffect(() => {
    onTriggerRef.current = onTrigger;
  }, [onTrigger]);

  const checkGeofences = useCallback(
    async (currentLat: number, currentLng: number, forcePointId?: string) => {
      if (!enabled) return;

      if (!metasRef.current.length) {
        try {
          metasRef.current = await fetchNearbyMetas(currentLat, currentLng);
        } catch (error) {
          console.error('joyjoy walk nearby fetch failed:', error);
          return;
        }
      }

      const candidates = metasRef.current
        .map((meta) => ({
          meta,
          distance: haversineMeters(currentLat, currentLng, meta.lat, meta.lng),
        }))
        .filter(({ meta, distance }) => {
          if (forcePointId) return meta.id === forcePointId;
          return distance <= meta.radius && !triggeredRef.current.has(meta.id);
        })
        .sort((a, b) => a.distance - b.distance);

      if (!candidates.length) return;

      const skipCooldown =
        simulationMode && WALK_LISTEN_CONFIG.simulation.skipAutoTriggerCooldown;

      if (
        !skipCooldown
        && !canAutoTriggerWalk(autoTriggerGateRef.current, currentLat, currentLng, haversineMeters)
      ) {
        return;
      }

      const { meta } = candidates[0];
      const companionId = meta.primaryCompanionId || 'su-dongpo';

      try {
        const payload = await fetchWalkPlay(meta.id, companionId, { layer: 'L1', trigger: 'auto' });
        triggeredRef.current.add(meta.id);
        autoTriggerGateRef.current = {
          at: Date.now(),
          lat: currentLat,
          lng: currentLng,
        };
        onTriggerRef.current(payload, meta);
      } catch (error) {
        console.error('joyjoy walk play fetch failed:', error);
      }
    },
    [enabled, simulationMode],
  );

  useEffect(() => {
    if (!enabled) return undefined;

    triggeredRef.current = new Set();
    metasRef.current = [];
    autoTriggerGateRef.current = null;

    checkGeofences(lat, lng);

    if (simulationMode || !navigator.geolocation) return undefined;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        checkGeofences(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('joyjoy geolocation watch failed:', error);
      },
      {
        enableHighAccuracy: WALK_LISTEN_CONFIG.geolocation.enableHighAccuracy,
        maximumAge: WALK_LISTEN_CONFIG.geolocation.maximumAgeMs,
        timeout: WALK_LISTEN_CONFIG.geolocation.timeoutMs,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [enabled, lat, lng, simulationMode, checkGeofences]);

  const resetSession = useCallback(() => {
    triggeredRef.current = new Set();
    metasRef.current = [];
    autoTriggerGateRef.current = null;
  }, []);

  const triggerPoint = useCallback(
    async (pointId: string, pointLat: number, pointLng: number) => {
      triggeredRef.current.delete(pointId);
      metasRef.current = [];
      await checkGeofences(pointLat, pointLng, pointId);
    },
    [checkGeofences],
  );

  return { resetSession, triggerPoint };
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
