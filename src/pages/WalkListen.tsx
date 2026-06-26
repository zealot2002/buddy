import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useCompanions } from '../hooks/useApi';
import {
  fetchWalkPlay,
  fetchWalkAreaStatus,
  useWalkGeofence,
  type WalkPlayPayload,
} from '../hooks/useWalkGeofence';
import { WALK_LISTEN_CONFIG } from '../../api/config/walk-config.js';
import { GONG_WANG_FU_FENCES } from '../../api/data/walk-areas.js';
import { usePreferencesStore } from '../store/preferences';
import { usePlayerStore } from '../store/player';
import { useLocationStore } from '../store/location';
import { useWalkChatStore, type WalkChatMessage } from '../store/walk-chat';
import { useWalkPlayedJokesStore } from '../store/walk-played-jokes';
import { getCompanionAvatar } from '../../api/data/media.js';
import { estimateSpeechDuration } from '../../api/data/narrations.js';
import { cn, formatBeijingTime } from '@/lib/utils';

interface WalkNearbyStatus {
  id: string;
  label?: string;
  distanceMeters: number;
  inside: boolean;
  radius: number;
}

const COMPANION_HINT_VISIBLE_MS = 2800;
const COMPANION_HINT_FADE_MS = 700;

const SIMULATION_ENABLED = WALK_LISTEN_CONFIG.simulation.enabled;

function playCardContent(
  playWalk: ReturnType<typeof usePlayerStore.getState>['playWalk'],
  snippetId: string,
  companionId: string,
  content: string,
  duration: number,
) {
  playWalk({ snippetId, content, duration }, companionId, true);
}

export const WalkListen = () => {
  const { companions } = useCompanions();
  const { defaultCompanionId } = usePreferencesStore();
  const { lat, lng, isLocating, setLocating, setLocation, setError } = useLocationStore();
  const { playWalk, isPlaying, mode } = usePlayerStore();
  const { messages, addMessage, updateMessage } = useWalkChatStore();
  const markJokePlayed = useWalkPlayedJokesStore((state) => state.markPlayed);

  const [companionHintPhase, setCompanionHintPhase] = useState<'off' | 'in' | 'out'>('off');

  const [fetchingMessageId, setFetchingMessageId] = useState<string | null>(null);
  const [nearestFence, setNearestFence] = useState<WalkNearbyStatus | null>(null);
  const [hasAreaContent, setHasAreaContent] = useState(false);
  const [simPointId, setSimPointId] = useState(GONG_WANG_FU_FENCES[0].id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastL1TriggerRef = useRef<{ snippetId: string; at: number } | null>(null);
  const messageCountRef = useRef(0);

  type CompanionState = 'idle' | 'preparing' | 'speaking';

  const [companionState, setCompanionState] = useState<CompanionState>('idle');

  useEffect(() => {
    const isFetching = fetchingMessageId !== null;
    const isSpeaking = isPlaying && mode === 'walk';

    if (isFetching) {
      setCompanionState('preparing');
    } else if (isSpeaking) {
      setCompanionState('speaking');
    } else {
      setCompanionState('idle');
    }
  }, [fetchingMessageId, isPlaying, mode]);

  const simPoint = useMemo(
    () => GONG_WANG_FU_FENCES.find((point) => point.id === simPointId) ?? GONG_WANG_FU_FENCES[0],
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

  const companion = companions.find((item) => item.id === defaultCompanionId) ?? companions[0];

  useEffect(() => {
    setCompanionHintPhase('in');
    const fadeTimer = window.setTimeout(() => setCompanionHintPhase('out'), COMPANION_HINT_VISIBLE_MS);
    const hideTimer = window.setTimeout(
      () => setCompanionHintPhase('off'),
      COMPANION_HINT_VISIBLE_MS + COMPANION_HINT_FADE_MS,
    );
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

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
    if (companionCount > messageCountRef.current) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
    messageCountRef.current = companionCount;
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

      if (payload.jokeId && (payload.actIndex ?? 0) === 0) {
        markJokePlayed(payload.snippetId, defaultCompanionId, payload.jokeId);
      }
      addMessage({
        role: 'companion',
        content: payload.content,
        source: 'geofence',
        snippetId: payload.snippetId,
        companionId: defaultCompanionId,
        jokeId: payload.jokeId,
        jokeLabel: payload.jokeLabel,
        actIndex: payload.actIndex ?? 0,
        actCount: payload.actCount ?? 1,
        actLabel: payload.actLabel,
        spotLabel: payload.fenceLabel ?? simPoint.label,
      });
      playWalk(payload, defaultCompanionId, true);
    },
    [addMessage, defaultCompanionId, hasAreaContent, markJokePlayed, playWalk, simPoint.label],
  );

  const { resetSession, triggerPoint } = useWalkGeofence({
    enabled: SIMULATION_ENABLED || hasAreaContent,
    lat,
    lng,
    companionId: defaultCompanionId,
    simulationMode: SIMULATION_ENABLED,
    onTrigger: handleGeofenceTrigger,
  });

  const applyCardAct = useCallback(
    async (message: WalkChatMessage, nextActIndex: number) => {
      if (!message.snippetId || !message.jokeId || fetchingMessageId) return;

      setFetchingMessageId(message.id);
      try {
        const narratorId = message.companionId ?? defaultCompanionId;
        const payload = await fetchWalkPlay(message.snippetId, narratorId, {
          jokeId: message.jokeId,
          actIndex: nextActIndex,
          randomJoke: false,
          trigger: nextActIndex === 0 ? 'auto' : 'tap',
        });

        updateMessage(message.id, {
          content: payload.content,
          actIndex: payload.actIndex ?? nextActIndex,
          actCount: payload.actCount ?? message.actCount,
          actLabel: payload.actLabel,
          jokeLabel: payload.jokeLabel ?? message.jokeLabel,
        });

        playCardContent(
          playWalk,
          message.snippetId,
          narratorId,
          payload.content,
          payload.duration || estimateSpeechDuration(payload.content),
        );
      } catch (error) {
        console.error('joyjoy walk card act failed:', error);
      } finally {
        setFetchingMessageId(null);
      }
    },
    [defaultCompanionId, fetchingMessageId, playWalk, updateMessage],
  );

  const handleContinueStory = (message: WalkChatMessage) => {
    const actIndex = message.actIndex ?? 0;
    const actCount = message.actCount ?? 1;
    if (actIndex >= actCount - 1) return;
    void applyCardAct(message, actIndex + 1);
  };

  const handlePrevAct = (message: WalkChatMessage) => {
    const actIndex = message.actIndex ?? 0;
    if (actIndex <= 0) return;
    void applyCardAct(message, actIndex - 1);
  };

  const handleSimPointSelect = async (pointId: string) => {
    const point = GONG_WANG_FU_FENCES.find((item) => item.id === pointId);
    if (!point) return;

    setSimPointId(pointId);
    setLocation(point.location.lat, point.location.lng, point.label);
    setHasAreaContent(true);
    setNearestFence({
      id: point.id,
      label: point.label,
      distanceMeters: 0,
      inside: true,
      radius: point.location.radiusMeters,
    });
    resetSession();
    lastL1TriggerRef.current = null;
    await triggerPoint(pointId, point.location.lat, point.location.lng);
  };

  const initialSimTriggeredRef = useRef(false);
  useEffect(() => {
    if (!SIMULATION_ENABLED || initialSimTriggeredRef.current) return;
    initialSimTriggeredRef.current = true;
    void handleSimPointSelect(GONG_WANG_FU_FENCES[0].id);
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        role: 'system',
        content: SIMULATION_ENABLED
            ? '恭王府模拟游览。点选下方站点，旅伴会随机开讲一个段子。感兴趣就点「继续说」。'
            : '欢迎来到同游。到了有讲解的区域，旅伴会主动跟你聊。',
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

  const renderCardFooter = (message: WalkChatMessage) => {
    const actIndex = message.actIndex ?? 0;
    const actCount = message.actCount ?? 1;
    const isLoading = fetchingMessageId === message.id;
    const canContinue = actIndex < actCount - 1;

    if (!canContinue && actIndex === 0) return null;

    return (
      <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-black/5 pt-2">
        {actIndex > 0 ? (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handlePrevAct(message)}
            className="shrink-0 text-xs text-gray-500 active:text-gray-800 disabled:opacity-50"
          >
            上一幕
          </button>
        ) : (
          <span className="shrink-0" aria-hidden />
        )}

        {canContinue ? (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleContinueStory(message)}
            className="shrink-0 rounded-full bg-gold/15 px-3 py-1 text-xs text-gray-800 active:bg-gold/25 disabled:opacity-50"
          >
            {isLoading ? '加载中…' : '继续说'}
          </button>
        ) : (
          <span className="shrink-0 text-xs text-gray-400">已是最后一幕</span>
        )}
      </div>
    );
  };

  const getCardSubtitle = (message: WalkChatMessage) => {
    const actIndex = message.actIndex ?? 0;
    if (actIndex === 0) return message.jokeLabel ?? null;
    return message.actLabel ?? message.jokeLabel ?? null;
  };

  return (
    <div
      className="fixed left-1/2 z-10 flex w-full max-w-app -translate-x-1/2 flex-col overflow-hidden"
      style={{
        top: 0,
        bottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))',
        backgroundImage: 'url(/images/background/gong-wang-fu.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <header className="relative z-30 shrink-0 border-b border-black/5 bg-[#ededed] pt-safe">
        <div className="flex items-start justify-between gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-lg font-bold text-gray-900">同游</h1>
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

          <div className="relative flex max-w-[40%] shrink-0 flex-col items-end">
            {companionHintPhase !== 'off' && (
              <div
                className={cn(
                  'pointer-events-none absolute right-0 top-[calc(100%+6px)] z-40 whitespace-nowrap rounded-lg bg-gray-900/88 px-2.5 py-1.5 text-[11px] text-white shadow-md backdrop-blur-sm transition-opacity ease-out',
                  companionHintPhase === 'in' ? 'opacity-100' : 'opacity-0',
                )}
                style={{ transitionDuration: `${COMPANION_HINT_FADE_MS}ms` }}
              >
                我的页可改默认旅伴
              </div>
            )}
            {companionState === 'preparing' && (
              <div className="pointer-events-none absolute right-0 top-[calc(100%+6px)] z-40 whitespace-nowrap rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] text-gray-500 shadow-md ring-1 ring-black/5">
                正在组织语言…
              </div>
            )}
            {companionState === 'speaking' && (
              <div className="pointer-events-none absolute right-0 top-[calc(100%+6px)] z-40 whitespace-nowrap rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] text-gray-500 shadow-md ring-1 ring-black/5">
                讲解中…
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="relative shrink-0">
                <div
                  aria-label={hasAreaContent ? '当前站点有讲解' : '当前区域暂无讲解'}
                  className={cn('block rounded-md', !hasAreaContent && 'opacity-90')}
                >
                  <img
                    src={getCompanionAvatar(defaultCompanionId)}
                    alt={companion?.name || '旅伴'}
                    className={cn(
                      'h-10 w-10 rounded-md border-2 bg-white object-cover',
                      hasAreaContent ? 'border-emerald-400' : 'border-transparent',
                    )}
                  />
                </div>

              </div>

              <div className="flex h-10 min-w-0 items-center justify-end text-right">
                <p className="truncate text-sm font-medium text-gray-900">{companion?.name || '旅伴'}</p>
              </div>
            </div>
          </div>
        </div>

        {SIMULATION_ENABLED && (
          <div className="border-t border-black/5 px-3 py-2">
            <p className="mb-2 text-[11px] text-gray-500">模拟站点（恭王府动线）</p>
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {GONG_WANG_FU_FENCES.map((point) => (
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
                  {point.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-4 bg-black/10 hide-scrollbar"
      >
        {messages.map((message) => {
          const timeLabel = formatBeijingTime(message.timestamp);
          const messageCompanionId = message.companionId ?? defaultCompanionId;
          const actIndex = message.actIndex ?? 0;
          const actCount = message.actCount ?? 1;
          const cardSubtitle = getCardSubtitle(message);

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
              <div className="relative min-w-0 flex-1 rounded-lg bg-white px-3 py-2.5 shadow-sm before:absolute before:left-[-6px] before:top-3 before:border-[6px] before:border-transparent before:border-r-white before:content-['']">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    {message.spotLabel && (
                      <p className="truncate text-[11px] text-gray-400">{message.spotLabel}</p>
                    )}
                    {cardSubtitle && (
                      <p className="truncate text-[11px] font-medium text-gold">{cardSubtitle}</p>
                    )}
                  </div>
                  {actCount > 1 && (
                    <span className="shrink-0 text-[10px] tabular-nums text-gray-300">
                      {actIndex + 1}/{actCount}
                    </span>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-900">
                  {message.content}
                </p>
                <p className="mt-1 text-right text-[11px] text-gray-400">{timeLabel}</p>
                {renderCardFooter(message)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
