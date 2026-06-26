import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { useCompanions } from '../hooks/useApi';
import { fetchWalkTap, fetchWalkAreaStatus, useWalkGeofence } from '../hooks/useWalkGeofence';
import { WALK_LISTEN_CONFIG } from '../../api/config/walk-config.js';
import { usePreferencesStore } from '../store/preferences';
import { usePlayerStore } from '../store/player';
import { useLocationStore } from '../store/location';
import { useWalkChatStore } from '../store/walk-chat';
import { getCompanionAvatar } from '../../api/data/media.js';
import { cn, formatBeijingTime } from '@/lib/utils';

interface WalkNearbyStatus {
  id: string;
  label?: string;
  distanceMeters: number;
  inside: boolean;
  radius: number;
}

export const WalkListen = () => {
  const { companions } = useCompanions();
  const { defaultCompanionId } = usePreferencesStore();
  const { lat, lng, isLocating, setLocating, setLocation, setError } = useLocationStore();
  const { playWalk } = usePlayerStore();
  const { messages, addMessage } = useWalkChatStore();

  const [companionId, setCompanionId] = useState(defaultCompanionId);
  const [showCompanionPicker, setShowCompanionPicker] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [nearestFence, setNearestFence] = useState<WalkNearbyStatus | null>(null);
  const [hasAreaContent, setHasAreaContent] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    setCompanionId(defaultCompanionId);
  }, [defaultCompanionId]);

  useEffect(() => {
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
      { enableHighAccuracy: WALK_LISTEN_CONFIG.geolocation.enableHighAccuracy, timeout: WALK_LISTEN_CONFIG.geolocation.timeoutMs },
    );
  }, [setLocation, setLocating, setError, refreshAreaStatus]);

  useEffect(() => {
    if (!navigator.geolocation) return undefined;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(latitude, longitude, '当前位置');
        refreshAreaStatus(latitude, longitude);
      },
      (error) => {
        console.error('joyjoy geolocation watch failed:', error);
      },
      { enableHighAccuracy: WALK_LISTEN_CONFIG.geolocation.enableHighAccuracy, maximumAge: WALK_LISTEN_CONFIG.geolocation.maximumAgeMs, timeout: WALK_LISTEN_CONFIG.geolocation.timeoutMs },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [setLocation, refreshAreaStatus]);

  useEffect(() => {
    if (!isLocating) {
      refreshAreaStatus(lat, lng);
    }
  }, [lat, lng, isLocating, companionId, refreshAreaStatus]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSnippet = useCallback(
    (
      payload: { snippetId: string; content: string; duration: number; triggerType?: string },
      source: 'geofence' | 'tap',
    ) => {
      if (!hasAreaContent) return;
      addMessage({ role: 'companion', content: payload.content, source });
      playWalk(payload, companionId, source === 'geofence');
    },
    [addMessage, playWalk, companionId, hasAreaContent],
  );

  useWalkGeofence({
    enabled: hasAreaContent,
    lat,
    lng,
    companionId,
    onTrigger: (payload) => handleSnippet(payload, 'geofence'),
  });

  const handleCompanionTap = async () => {
    if (isFetching || !companion || !hasAreaContent) return;

    setIsFetching(true);
    try {
      const payload = await fetchWalkTap(lat, lng, companionId);
      if (payload.triggerType === 'offsite') return;
      handleSnippet(payload, 'tap');
    } catch (error) {
      console.error('joyjoy walk tap failed:', error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        role: 'system',
        content: '欢迎来到边走边听。到了有讲解的区域，旅伴会主动跟你聊。',
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
                {isLocating
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
                <div className="grid grid-cols-4 gap-2">
                  {companions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setCompanionId(item.id);
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
                <button
                  type="button"
                  onClick={handleCompanionTap}
                  disabled={!hasAreaContent || isFetching}
                  aria-label={hasAreaContent ? '听延伸解读' : '当前区域暂无讲解'}
                  className={cn(
                    'block rounded-md transition-all',
                    hasAreaContent && !isFetching && 'active:scale-95',
                    (!hasAreaContent || isFetching) && 'cursor-default opacity-90',
                  )}
                >
                  <img
                    src={getCompanionAvatar(companionId)}
                    alt={companion?.name || '旅伴'}
                    className={cn(
                      'h-10 w-10 rounded-md border-2 bg-white object-cover',
                      isFetching && 'opacity-60',
                      hasAreaContent ? 'border-emerald-400' : 'border-transparent',
                    )}
                  />
                </button>
                {hasAreaContent ? (
                  <span
                    className="pointer-events-none absolute -bottom-0.5 -right-0.5 z-10 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white shadow"
                    title={nearestFence?.label ?? '当前区域'}
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

            {hasAreaContent && nearestFence?.label && (
              <div className="flex max-w-full items-center gap-1.5 rounded-full border border-black/5 bg-white px-2.5 py-1">
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                <span className="truncate text-[11px] text-gray-500">{nearestFence.label}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-4"
      >
        {messages.map((message) => {
          const timeLabel = formatBeijingTime(message.timestamp);

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
                src={getCompanionAvatar(companionId)}
                alt={companion?.name || '旅伴'}
                className="h-9 w-9 shrink-0 rounded-md bg-white object-cover"
              />
              <div className="relative rounded-lg bg-white px-3 py-2.5 shadow-sm before:absolute before:left-[-6px] before:top-3 before:border-[6px] before:border-transparent before:border-r-white before:content-['']">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-900">
                  {message.content}
                </p>
                <p className="mt-1 text-right text-[11px] text-gray-400">{timeLabel}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
