import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, MapPin, RefreshCw } from 'lucide-react';
import { useCompanions } from '../hooks/useApi';
import { fetchWalkTap, fetchWalkOffsite, fetchWalkAreaStatus, useWalkGeofence } from '../hooks/useWalkGeofence';
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
  const { messages, addMessage, clearMessages } = useWalkChatStore();

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
      { enableHighAccuracy: true, timeout: 15000 },
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
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
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
      addMessage({ role: 'companion', content: payload.content, source });
      playWalk(payload, companionId, source === 'geofence');
    },
    [addMessage, playWalk, companionId],
  );

  const { resetSession } = useWalkGeofence({
    enabled: true,
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
      handleSnippet(payload, 'tap');
    } catch (error) {
      console.error('joyjoy walk tap failed:', error);
      addMessage({
        role: 'companion',
        content: '（信号飘了一下）稍等，我重新组织语言…你再点我一次？',
        source: 'tap',
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleStatusLightTap = async () => {
    if (isFetching || !companion || hasAreaContent) return;

    setIsFetching(true);
    try {
      const payload = await fetchWalkOffsite(companionId);
      handleSnippet(payload, 'tap');
    } catch (error) {
      console.error('joyjoy walk offsite failed:', error);
      addMessage({
        role: 'companion',
        content: '（信号飘了一下）稍等，我重新组织语言…你再点一次灰灯？',
        source: 'tap',
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleResetSession = () => {
    clearMessages();
    resetSession();
    addMessage({
      role: 'system',
      content: '新的漫步开始了。点我的头像，或在故事发生的地方，我会主动跟你聊。',
    });
  };

  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        role: 'system',
        content: '欢迎来到边走边听。到了景点我会主动开口；不在景点时，点旅伴头像，听听 ta 的调皮话。',
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
      <header className="z-30 shrink-0 border-b border-black/5 bg-[#ededed] pt-safe">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="font-serif text-lg font-bold text-gray-900">边走边听</h1>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              {isLocating
                ? '定位中…'
                : nearestFence
                  ? nearestFence.inside
                    ? `已在「${nearestFence.label ?? nearestFence.id}」围栏内`
                    : `距「${nearestFence.label ?? nearestFence.id}」${nearestFence.distanceMeters}m`
                  : `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetSession}
            className="touch-target rounded-full p-2 text-gray-600 active:bg-black/5"
            aria-label="重新开始"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
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

      <footer className="relative z-30 shrink-0 border-t border-black/5 bg-[#f7f7f7]">
        {showCompanionPicker && (
          <div className="absolute bottom-full left-0 right-0 max-h-[40vh] overflow-y-auto border-t border-black/5 bg-[#f7f7f7] px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
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

        <div className="px-4 py-3 pb-safe">
          <div className="flex items-center gap-3">
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
                    'h-11 w-11 rounded-md border-2 bg-white object-cover',
                    isFetching && 'opacity-60',
                    hasAreaContent ? 'border-emerald-400' : 'border-transparent',
                  )}
                />
              </button>
              {hasAreaContent ? (
                <span
                  className="pointer-events-none absolute -bottom-0.5 -right-0.5 z-10 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white shadow"
                  title="当前区域有讲解"
                />
              ) : (
                <button
                  type="button"
                  onClick={handleStatusLightTap}
                  disabled={isFetching}
                  aria-label="点击听调皮话"
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 z-10 h-3.5 w-3.5 rounded-full bg-gray-400 ring-2 ring-white shadow',
                    'active:scale-110 disabled:opacity-50',
                  )}
                />
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowCompanionPicker((open) => !open)}
              className="flex min-w-0 flex-1 touch-target items-center gap-2 text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{companion?.name || '旅伴'}</p>
                <p className="truncate text-xs text-gray-500">
                  {isFetching
                    ? '正在组织语言…'
                    : hasAreaContent
                      ? '点头像，听延伸解读'
                      : '点灰灯，听调皮话'}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 text-gray-400 transition-transform',
                  showCompanionPicker && 'rotate-180',
                )}
              />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-2.5">
            <span
              className={cn(
                'h-3 w-3 shrink-0 rounded-full ring-2 ring-white shadow',
                hasAreaContent ? 'bg-emerald-500' : 'bg-gray-400',
              )}
            />
            <span className="flex-1 text-sm text-gray-500">
              {isLocating
                ? '定位中，正在检测区域讲解…'
                : hasAreaContent
                  ? `当前区域有讲解${nearestFence?.label ? ` · ${nearestFence.label}` : ''}`
                  : '暂无区域讲解，点头像旁灰灯闲聊'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
