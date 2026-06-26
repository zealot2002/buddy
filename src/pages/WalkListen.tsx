import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { useCompanions } from '../hooks/useApi';
import {
  fetchWalkAreaStatus,
  useWalkGeofence,
  type WalkPlayPayload,
} from '../hooks/useWalkGeofence';
import { WALK_LISTEN_CONFIG } from '../../api/config/walk-config.js';
import { GONG_WANG_FU_WALK_POINTS } from '../../api/data/gong-wang-fu-walk.js';
import { estimateSpeechDuration } from '../../api/data/narrations.js';
import { usePreferencesStore } from '../store/preferences';
import { usePlayerStore } from '../store/player';
import { useLocationStore } from '../store/location';
import {
  useWalkChatStore,
  type WalkCardAct,
  type WalkCardLayers,
  type WalkChatBranch,
  type WalkChatMessage,
} from '../store/walk-chat';
import { getCompanionAvatar } from '../../api/data/media.js';
import { cn, formatBeijingTime } from '@/lib/utils';

interface WalkNearbyStatus {
  id: string;
  label?: string;
  distanceMeters: number;
  inside: boolean;
  radius: number;
}

const SIMULATION_ENABLED = WALK_LISTEN_CONFIG.simulation.enabled;
const WALK_NARRATOR_IDS = ['su-dongpo', 'sharp-elder'] as const;

function buildCardLayers(snippetId: string): WalkCardLayers | null {
  const point = GONG_WANG_FU_WALK_POINTS.find((item) => item.id === snippetId);
  if (!point) return null;
  return {
    l1: point.tree.l1.content,
    l2A: point.tree.l2A.content,
    l2B: point.tree.l2B.content,
    l3: point.tree.l3.content,
    l2ALabel: point.tree.l2A.label,
    l2BLabel: point.tree.l2B.label,
  };
}

function getActLayer(act: WalkCardAct): WalkChatMessage['layer'] {
  if (act === 0) return 'L1';
  if (act === 1) return 'L2';
  return 'L3';
}

function getActContent(layers: WalkCardLayers, act: WalkCardAct, branch: WalkChatBranch = 'A'): string {
  if (act === 0) return layers.l1;
  if (act === 1) return branch === 'B' ? (layers.l2B ?? layers.l2A ?? '') : (layers.l2A ?? '');
  return layers.l3 ?? '';
}

export const WalkListen = () => {
  const { companions } = useCompanions();
  const { defaultCompanionId, setDefaultCompanionId } = usePreferencesStore();
  const { lat, lng, isLocating, setLocating, setLocation, setError } = useLocationStore();
  const { playWalk } = usePlayerStore();
  const { messages, addMessage, updateMessage } = useWalkChatStore();

  const [companionId, setCompanionId] = useState(defaultCompanionId);
  const [showCompanionPicker, setShowCompanionPicker] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [nearestFence, setNearestFence] = useState<WalkNearbyStatus | null>(null);
  const [hasAreaContent, setHasAreaContent] = useState(false);
  const [simPointId, setSimPointId] = useState(GONG_WANG_FU_WALK_POINTS[0].id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastL1TriggerRef = useRef<{ snippetId: string; at: number } | null>(null);
  const lastMessageCountRef = useRef(0);

  const simPoint = useMemo(
    () => GONG_WANG_FU_WALK_POINTS.find((point) => point.id === simPointId) ?? GONG_WANG_FU_WALK_POINTS[0],
    [simPointId],
  );

  const refreshAreaStatus = useCallback(async (currentLat: number, currentLng: number) => {
    try {
      const { hasAreaContent: inside, nearest } = await fetchWalkAreaStatus(currentLat, currentLng);
      setHasAreaContent(inside);
      if (nearest.id) {
        setNearestFence({
          id: nearest.id,
          label: nearest.label,
          distanceMeters: nearest.distanceMeters ?? 0,
          inside: nearest.inside ?? false,
          radius: nearest.radius,
        });
      }
    } catch (error) {
      console.error('joyjoy walk area status failed:', error);
    }
  }, []);

  const companion = companions.find((item) => item.id === companionId) ?? companions[0];
  const walkCompanions = companions.filter((item) =>
    WALK_NARRATOR_IDS.includes(item.id as (typeof WALK_NARRATOR_IDS)[number]),
  );
  const pickerCompanions = walkCompanions.length ? walkCompanions : companions;

  const applyCompanion = useCallback(
    (nextCompanionId: string) => {
      setCompanionId(nextCompanionId);
      setDefaultCompanionId(nextCompanionId);
    },
    [setDefaultCompanionId],
  );

  const playCardContent = useCallback(
    (snippetId: string, content: string, narratorId: string) => {
      playWalk(
        { snippetId, content, duration: estimateSpeechDuration(content) },
        narratorId,
        true,
      );
    },
    [playWalk],
  );

  useEffect(() => {
    if (SIMULATION_ENABLED) return;

    if (!navigator.geolocation) {
      setError('当前设备不支持定位');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(latitude, longitude, '当前位置');
        refreshAreaStatus(latitude, longitude);
      },
      (error) => {
        console.error('joyjoy geolocation failed:', error);
        setError('定位失败，将使用默认位置');
        setLocating(false);
      },
      {
        enableHighAccuracy: WALK_LISTEN_CONFIG.geolocation.enableHighAccuracy,
        timeout: WALK_LISTEN_CONFIG.geolocation.timeoutMs,
      },
    );
  }, [setLocation, setLocating, setError, refreshAreaStatus]);

  useEffect(() => {
    if (SIMULATION_ENABLED || !navigator.geolocation) return undefined;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(latitude, longitude, '当前位置');
        refreshAreaStatus(latitude, longitude);
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
  }, [setLocation, refreshAreaStatus]);

  useEffect(() => {
    if (SIMULATION_ENABLED || isLocating) return;
    refreshAreaStatus(lat, lng);
  }, [lat, lng, isLocating, refreshAreaStatus]);

  useEffect(() => {
    const companionCount = messages.filter((message) => message.role === 'companion').length;
    if (companionCount > lastMessageCountRef.current) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
    lastMessageCountRef.current = companionCount;
  }, [messages]);

  const handleGeofenceTrigger = useCallback(
    (payload: WalkPlayPayload) => {
      if (!SIMULATION_ENABLED && !hasAreaContent) return;

      const now = Date.now();
      if (
        lastL1TriggerRef.current?.snippetId === payload.snippetId
        && now - lastL1TriggerRef.current.at < 1500
      ) {
        return;
      }
      lastL1TriggerRef.current = { snippetId: payload.snippetId, at: now };

      const layers = buildCardLayers(payload.snippetId);
      if (!layers) return;

      const point = GONG_WANG_FU_WALK_POINTS.find((item) => item.id === payload.snippetId);
      applyCompanion(payload.companionId);

      addMessage({
        role: 'companion',
        content: layers.l1,
        source: 'geofence',
        snippetId: payload.snippetId,
        companionId: payload.companionId,
        cardAct: 0,
        layers,
        spotLabel: point?.label,
        layer: 'L1',
        branch: 'A',
      });

      playCardContent(payload.snippetId, layers.l1, payload.companionId);
    },
    [addMessage, applyCompanion, hasAreaContent, playCardContent],
  );

  const { resetSession, triggerPoint } = useWalkGeofence({
    enabled: SIMULATION_ENABLED || hasAreaContent,
    lat,
    lng,
    simulationMode: SIMULATION_ENABLED,
    onTrigger: handleGeofenceTrigger,
  });

  const handleContinueCard = (message: WalkChatMessage) => {
    if (!message.layers || message.cardAct === undefined || message.cardAct >= 2 || isFetching) return;

    const nextAct = (message.cardAct + 1) as WalkCardAct;
    const branch = message.branch ?? 'A';
    const content = getActContent(message.layers, nextAct, branch);
    const narratorId = message.companionId ?? companionId;

    updateMessage(message.id, {
      cardAct: nextAct,
      content,
      layer: getActLayer(nextAct),
    });
    playCardContent(message.snippetId ?? message.id, content, narratorId);
  };

  const handleBackCard = (message: WalkChatMessage) => {
    if (!message.layers || message.cardAct === undefined || message.cardAct <= 0 || isFetching) return;

    const prevAct = (message.cardAct - 1) as WalkCardAct;
    const branch = message.branch ?? 'A';
    const content = getActContent(message.layers, prevAct, branch);
    const narratorId = message.companionId ?? companionId;

    updateMessage(message.id, {
      cardAct: prevAct,
      content,
      layer: getActLayer(prevAct),
    });
    playCardContent(message.snippetId ?? message.id, content, narratorId);
  };

  const handleSwapL2Branch = (message: WalkChatMessage) => {
    if (!message.layers || message.cardAct !== 1 || isFetching) return;

    const nextBranch: WalkChatBranch = message.branch === 'B' ? 'A' : 'B';
    const content = getActContent(message.layers, 1, nextBranch);
    const narratorId = message.companionId ?? companionId;

    updateMessage(message.id, {
      branch: nextBranch,
      content,
      source: 'branch',
    });
    playCardContent(message.snippetId ?? message.id, content, narratorId);
  };

  const handleSimPointSelect = async (pointId: string) => {
    const point = GONG_WANG_FU_WALK_POINTS.find((item) => item.id === pointId);
    if (!point) return;

    setSimPointId(pointId);
    setLocation(point.lat, point.lng, point.label);
    applyCompanion(point.primaryCompanionId);
    setHasAreaContent(true);
    setNearestFence({
      id: point.id,
      label: point.label,
      distanceMeters: 0,
      inside: true,
      radius: WALK_LISTEN_CONFIG.fence.byAreaTag['gong-wang-fu'] ?? 30,
    });
    resetSession();
    lastL1TriggerRef.current = null;
    await triggerPoint(pointId, point.lat, point.lng);
  };

  const initialSimTriggeredRef = useRef(false);
  useEffect(() => {
    if (!SIMULATION_ENABLED || initialSimTriggeredRef.current) return;
    initialSimTriggeredRef.current = true;
    void handleSimPointSelect(GONG_WANG_FU_WALK_POINTS[0].id);
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        role: 'system',
        content: SIMULATION_ENABLED
          ? '恭王府模拟游览。点选下方站点，旅伴会在对应位置开口。'
          : '欢迎来到边走边听。到了有讲解的区域，旅伴会主动跟你聊。',
      });
    }
  }, [messages.length, addMessage]);

  useEffect(() => {
    const html = document.documentElement;
    const { body } = document;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  const renderCardNav = (message: WalkChatMessage) => {
    if (!message.layers || message.cardAct === undefined) return null;

    const canBack = message.cardAct > 0;
    const canContinue = message.cardAct < 2;

    return (
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="min-w-[2rem]">
          {canBack && (
            <button
              type="button"
              onClick={() => handleBackCard(message)}
              className="px-1 text-sm text-gray-500 active:text-gray-800"
              aria-label="上一幕"
            >
              {'<-'}
            </button>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          {message.cardAct === 1 && (
            <button
              type="button"
              disabled={isFetching}
              onClick={() => handleSwapL2Branch(message)}
              className="rounded-full bg-black/5 px-2.5 py-1 text-[11px] text-gray-600 active:bg-black/10 disabled:opacity-50"
            >
              换一个说法
            </button>
          )}
          {canContinue && (
            <button
              type="button"
              disabled={isFetching}
              onClick={() => handleContinueCard(message)}
              className="rounded-full bg-gold/15 px-3 py-1 text-xs text-gray-800 active:bg-gold/25 disabled:opacity-50"
            >
              继续说
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed left-1/2 z-10 flex w-full max-w-app -translate-x-1/2 flex-col overflow-hidden bg-[#ededed]"
      style={{
        top: 0,
        bottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <header className="relative z-30 shrink-0 border-b border-black/5 bg-[#ededed] pt-safe">
        <div className="flex items-start justify-between gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-lg font-bold text-gray-900">边走边听</h1>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {SIMULATION_ENABLED
                  ? `模拟 · ${simPoint.label}`
                  : isLocating
                    ? '定位中…'
                    : nearestFence
                      ? nearestFence.inside
                        ? `已在「${nearestFence.label ?? nearestFence.id}」`
                        : `距「${nearestFence.label ?? nearestFence.id}」${nearestFence.distanceMeters}m`
                      : `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
              </span>
            </p>
          </div>

          <div className="relative flex max-w-[52%] shrink-0 flex-col items-end gap-1.5">
            {showCompanionPicker && (
              <div className="absolute right-0 top-full z-40 mt-2 w-[min(100vw-2rem,280px)] rounded-xl border border-black/5 bg-white p-3 shadow-lg">
                <div className="grid grid-cols-2 gap-2">
                  {pickerCompanions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        applyCompanion(item.id);
                        setShowCompanionPicker(false);
                      }}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-xl p-2 touch-target',
                        companionId === item.id ? 'bg-gold/15 ring-1 ring-gold/40' : 'active:bg-black/5',
                      )}
                    >
                      <img src={getCompanionAvatar(item.id)} alt={item.name} className="h-10 w-10 rounded-md object-cover" />
                      <span className="w-full truncate text-center text-[10px] text-gray-700">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="relative shrink-0">
                <div
                  aria-label={hasAreaContent ? '当前站点有讲解' : '当前区域暂无讲解'}
                  className={cn('block rounded-md', !hasAreaContent && 'opacity-90')}
                >
                  <img
                    src={getCompanionAvatar(companionId)}
                    alt={companion?.name || '旅伴'}
                    className={cn(
                      'h-10 w-10 rounded-md border-2 bg-white object-cover',
                      hasAreaContent ? 'border-emerald-400' : 'border-transparent',
                    )}
                  />
                </div>
                {hasAreaContent ? (
                  <span
                    className="pointer-events-none absolute -bottom-0.5 -right-0.5 z-10 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white shadow"
                    title={nearestFence?.label ?? simPoint.label}
                  />
                ) : (
                  <span
                    className="pointer-events-none absolute -bottom-0.5 -right-0.5 z-10 h-3 w-3 rounded-full bg-gray-400 ring-2 ring-white shadow"
                    title="当前区域暂无讲解"
                  />
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowCompanionPicker((open) => !open)}
                className="min-w-0 touch-target text-right"
              >
                <p className="truncate text-sm font-medium text-gray-900">{companion?.name || '旅伴'}</p>
                {isFetching && (
                  <p className="truncate text-[11px] text-gray-500">正在组织语言…</p>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowCompanionPicker((open) => !open)}
                className="touch-target shrink-0 p-0.5"
                aria-label="切换旅伴"
              >
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-gray-400 transition-transform',
                    showCompanionPicker && 'rotate-180',
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {SIMULATION_ENABLED && (
          <div className="border-t border-black/5 px-3 py-2">
            <p className="mb-2 text-[11px] text-gray-500">模拟站点（恭王府动线）</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {GONG_WANG_FU_WALK_POINTS.map((point) => (
                <button
                  key={point.id}
                  type="button"
                  onClick={() => handleSimPointSelect(point.id)}
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-1 text-[11px] transition-colors',
                    simPointId === point.id
                      ? 'bg-gold/20 text-gray-900 ring-1 ring-gold/40'
                      : 'bg-white text-gray-600 ring-1 ring-black/5 active:bg-black/5',
                  )}
                >
                  {point.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-4"
      >
        {messages.map((message) => {
          const timeLabel = formatBeijingTime(message.timestamp);
          const messageCompanionId = message.companionId ?? companionId;

          if (message.role === 'system') {
            return (
              <div key={message.id} className="flex flex-col items-center gap-1">
                <span className="text-[11px] text-gray-400">{timeLabel}</span>
                <p className="max-w-[85%] rounded-full bg-black/5 px-3 py-1.5 text-center text-xs leading-relaxed text-gray-500">
                  {message.content}
                </p>
              </div>
            );
          }

          const act = message.cardAct ?? 0;

          return (
            <div key={message.id} className="flex max-w-[88%] items-start gap-2">
              <img
                src={getCompanionAvatar(messageCompanionId)}
                alt={companion?.name || '旅伴'}
                className="h-9 w-9 shrink-0 rounded-md bg-white object-cover"
              />
              <div className="relative min-w-0 rounded-lg bg-white px-3 py-2.5 shadow-sm before:absolute before:left-[-6px] before:top-3 before:border-[6px] before:border-transparent before:border-r-white before:content-['']">
                {message.spotLabel && (
                  <p className="mb-1 text-[11px] text-gray-400">{message.spotLabel}</p>
                )}
                {act > 0 && (
                  <p className="mb-1 text-[11px] font-medium text-gold">
                    {act === 1 ? '第二幕' : '第三幕'}
                  </p>
                )}
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-900">
                  {message.content}
                </p>
                <p className="mt-1 text-right text-[11px] text-gray-400">{timeLabel}</p>
                {message.layers && renderCardNav(message)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
