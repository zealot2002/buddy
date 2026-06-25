import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, MapPin, RefreshCw } from 'lucide-react';
import { useCompanions } from '../hooks/useApi';
import { fetchWalkTap, useWalkGeofence } from '../hooks/useWalkGeofence';
import { usePreferencesStore } from '../store/preferences';
import { usePlayerStore } from '../store/player';
import { useLocationStore } from '../store/location';
import { useWalkChatStore } from '../store/walk-chat';
import { getCompanionAvatar } from '../../api/data/media.js';
import { cn } from '@/lib/utils';

export const WalkListen = () => {
  const { companions } = useCompanions();
  const { defaultCompanionId } = usePreferencesStore();
  const { lat, lng, isLocating, setLocating, setLocation, setError } = useLocationStore();
  const { playWalk } = usePlayerStore();
  const { messages, addMessage, clearMessages } = useWalkChatStore();

  const [companionId, setCompanionId] = useState(defaultCompanionId);
  const [showCompanionPicker, setShowCompanionPicker] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
        setLocation(position.coords.latitude, position.coords.longitude, '当前位置');
      },
      (error) => {
        console.error('joyjoy geolocation failed:', error);
        setError('定位失败，将使用默认位置');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, [setLocation, setLocating, setError]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSnippet = useCallback(
    (payload: { snippetId: string; content: string; duration: number }, source: 'geofence' | 'tap') => {
      addMessage({ role: 'companion', content: payload.content, source });
      playWalk(payload, companionId, true);
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
    if (isFetching || !companion) return;

    setIsFetching(true);
    try {
      const payload = await fetchWalkTap(lat, lng, companionId);
      handleSnippet(payload, 'tap');
    } catch (error) {
      console.error('joyjoy walk tap failed:', error);
      addMessage({
        role: 'system',
        content: '附近暂时没有感言，继续走走，到了故事发生的地方我再跟你说。',
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
        content: '欢迎来到边走边听。你不能打字，但可以随时点旅伴头像，听听 ta 想说什么。',
      });
    }
  }, [messages.length, addMessage]);

  return (
    <div className="min-h-screen bg-[#ededed] flex flex-col pb-safe">
      <header className="sticky top-0 z-20 bg-[#ededed]/95 backdrop-blur border-b border-black/5 pt-safe">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="font-serif text-lg font-bold text-gray-900">边走边听</h1>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {isLocating ? '定位中…' : `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetSession}
            className="p-2 rounded-full text-gray-600 active:bg-black/5 touch-target"
            aria-label="重新开始"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {messages.map((message) => {
          if (message.role === 'system') {
            return (
              <div key={message.id} className="flex justify-center">
                <p className="text-xs text-gray-500 bg-black/5 px-3 py-1.5 rounded-full max-w-[85%] text-center leading-relaxed">
                  {message.content}
                </p>
              </div>
            );
          }

          return (
            <div key={message.id} className="flex items-start gap-2 max-w-[88%]">
              <img
                src={getCompanionAvatar(companionId, companion?.avatar)}
                alt={companion?.name || '旅伴'}
                className="w-9 h-9 rounded-md shrink-0 bg-white object-cover"
              />
              <div className="relative bg-white rounded-lg px-3 py-2.5 shadow-sm before:content-[''] before:absolute before:left-[-6px] before:top-3 before:border-[6px] before:border-transparent before:border-r-white">
                <p className="text-[15px] text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="sticky bottom-0 bg-[#f7f7f7] border-t border-black/5 pb-safe">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowCompanionPicker((open) => !open)}
              className="flex items-center gap-2 min-w-0 flex-1 touch-target"
            >
              <img
                src={getCompanionAvatar(companionId, companion?.avatar)}
                alt={companion?.name || '旅伴'}
                onClick={(event) => {
                  event.stopPropagation();
                  handleCompanionTap();
                }}
                className={cn(
                  'w-11 h-11 rounded-md bg-white object-cover border-2 transition-all',
                  isFetching ? 'opacity-60 scale-95' : 'border-transparent active:border-gold active:scale-95',
                )}
              />
              <div className="min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">{companion?.name || '旅伴'}</p>
                <p className="text-xs text-gray-500 truncate">
                  {isFetching ? '正在组织语言…' : '点头像，听 ta 说一段'}
                </p>
              </div>
              <ChevronDown
                className={cn('w-4 h-4 text-gray-400 shrink-0 transition-transform', showCompanionPicker && 'rotate-180')}
              />
            </button>
          </div>

          {showCompanionPicker && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {companions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCompanionId(item.id);
                    setShowCompanionPicker(false);
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-xl touch-target',
                    companionId === item.id ? 'bg-gold/15 ring-1 ring-gold/40' : 'active:bg-black/5',
                  )}
                >
                  <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-md object-cover" />
                  <span className="text-[10px] text-gray-700 truncate w-full text-center">{item.name}</span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2 px-3 py-2.5 bg-white rounded-full border border-black/5">
            <span className="text-sm text-gray-400 flex-1">点击旅伴头像，聆听感言…</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
