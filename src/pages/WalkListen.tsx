import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { useCompanions } from '../hooks/useApi';
import {
  fetchWalkPlay,
  fetchWalkAreaStatus,
  useWalkGeofence,
  type WalkPlayPayload,
} from '../hooks/useWalkGeofence';
import { WALK_LISTEN_CONFIG } from '../../api/config/walk-config.js';
import { GONG_WANG_FU_WALK_POINTS } from '../../api/data/gong-wang-fu-walk.js';
import { usePreferencesStore } from '../store/preferences';
import { usePlayerStore } from '../store/player';
import { useLocationStore } from '../store/location';
import { useWalkChatStore, type WalkChatBranch, type WalkChatMessage } from '../store/walk-chat';
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

export const WalkListen = () => {
  const { companions } = useCompanions();
  const { defaultCompanionId, setDefaultCompanionId } = usePreferencesStore();
  const { lat, lng, isLocating, setLocating, setLocation, setError } = useLocationStore();
  const { playWalk } = usePlayerStore();
  const { messages, addMessage, hideThreadChildren } = useWalkChatStore();

  const [companionId, setCompanionId] = useState(defaultCompanionId);
  const [showCompanionPicker, setShowCompanionPicker] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [nearestFence, setNearestFence] = useState<WalkNearbyStatus | null>(null);
  const [hasAreaContent, setHasAreaContent] = useState(false);
  const [simPointId, setSimPointId] = useState(GONG_WANG_FU_WALK_POINTS[0].id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const threadsRef = useRef<Record<string, { snippetId: string; companionId: string }>>({});
  const lastL1TriggerRef = useRef<{ snippetId: string; at: number } | null>(null);

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
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const appendCompanionLine = useCallback(
    (
      payload: WalkPlayPayload,
      meta: { threadId?: string; layer?: WalkChatMessage['layer']; branch?: WalkChatBranch; source?: WalkChatMessage['source'] },
      voiceCompanionId?: string,
    ) => {
      const narratorId = voiceCompanionId ?? payload.companionId;
      addMessage({
        role: 'companion',
        content: payload.content,
        source: meta.source ?? 'geofence',
        snippetId: payload.snippetId,
        companionId: narratorId,
        threadId: meta.threadId,
        layer: meta.layer ?? payload.layer ?? 'L1',
        branch: meta.branch ?? payload.branch,
      });
      playWalk(payload, narratorId, true);
    },
    [addMessage, playWalk],
  );

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

      const threadId = `thread-${payload.snippetId}-${Date.now()}`;
      threadsRef.current[threadId] = {
        snippetId: payload.snippetId,
        companionId: payload.companionId,
      };

      applyCompanion(payload.companionId);
      appendCompanionLine(payload, {
        threadId,
        layer: 'L1',
        source: 'geofence',
      });
    },
    [appendCompanionLine, applyCompanion, hasAreaContent],
  );

  const { resetSession, triggerPoint } = useWalkGeofence({
    enabled: SIMULATION_ENABLED || hasAreaContent,
    lat,
    lng,
    simulationMode: SIMULATION_ENABLED,
    onTrigger: handleGeofenceTrigger,
  });

  const handleExpandLayer = async (
    threadId: string,
    layer: 'L2' | 'L3',
    branch: WalkChatBranch = 'A',
  ) => {
    const thread = threadsRef.current[threadId];
    if (!thread || isFetching) return;

    setIsFetching(true);
    try {
      const payload = await fetchWalkPlay(thread.snippetId, companionId, {
        layer,
        branch,
        trigger: 'tap',
      });
      appendCompanionLine(
        payload,
        {
          threadId,
          layer,
          branch: layer === 'L2' ? branch : undefined,
          source: layer === 'L3' ? 'deep' : branch === 'B' ? 'branch' : 'expand',
        },
        companionId,
      );
    } catch (error) {
      console.error('joyjoy walk expand failed:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleCollapseThread = (threadId: string) => {
    hideThreadChildren(threadId);
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

  const visibleMessages = messages.filter((message) => !message.hidden);

  const getThreadMessages = (threadId: string) =>
    messages.filter((message) => message.threadId === threadId && !message.hidden);

  const renderThreadActions = (l1Message: WalkChatMessage) => {
    if (!l1Message.threadId) return null;

    const threadMessages = getThreadMessages(l1Message.threadId);
    const l2Message = threadMessages.find((message) => message.layer === 'L2');
    const l3Message = threadMessages.find((message) => message.layer === 'L3');

    if (!l2Message) {
      return (
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isFetching}
            onClick={() => handleExpandLayer(l1Message.threadId!, 'L2', 'A')}
            className="rounded-full bg-gold/15 px-3 py-1 text-xs text-gray-800 active:bg-gold/25 disabled:opacity-50"
          >
            展开故事
          </button>
          <button
            type="button"
            disabled={isFetching}
            onClick={() => handleExpandLayer(l1Message.threadId!, 'L2', 'B')}
            className="rounded-full bg-black/5 px-3 py-1 text-xs text-gray-700 active:bg-black/10 disabled:opacity-50"
          >
            换一个说法
          </button>
        </div>
      );
    }

    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {!l3Message && (
          <button
            type="button"
            disabled={isFetching}
            onClick={() => handleExpandLayer(l1Message.threadId!, 'L3')}
            className="rounded-full bg-gold/15 px-3 py-1 text-xs text-gray-800 active:bg-gold/25 disabled:opacity-50"
          >
            再多说点
          </button>
        )}
        <button
          type="button"
          onClick={() => handleCollapseThread(l1Message.threadId!)}
          className="rounded-full bg-black/5 px-3 py-1 text-xs text-gray-600 active:bg-black/10"
        >
          收起
        </button>
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
        {visibleMessages.map((message) => {
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

          return (
            <div key={message.id} className="flex max-w-[88%] items-start gap-2">
              <img
                src={getCompanionAvatar(messageCompanionId)}
                alt={companion?.name || '旅伴'}
                className="h-9 w-9 shrink-0 rounded-md bg-white object-cover"
              />
              <div className="relative min-w-0 rounded-lg bg-white px-3 py-2.5 shadow-sm before:absolute before:left-[-6px] before:top-3 before:border-[6px] before:border-transparent before:border-r-white before:content-['']">
                {message.layer === 'L2' && message.branch && (
                  <p className="mb-1 text-[11px] font-medium text-gold">
                    {message.branch === 'A' ? '展开故事' : '换一个说法'}
                  </p>
                )}
                {message.layer === 'L3' && (
                  <p className="mb-1 text-[11px] font-medium text-gold">再多说点</p>
                )}
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-900">
                  {message.content}
                </p>
                <p className="mt-1 text-right text-[11px] text-gray-400">{timeLabel}</p>
                {message.layer === 'L1' && renderThreadActions(message)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
