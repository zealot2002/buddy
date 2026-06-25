import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowDown, ArrowUp, Check, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStories, useCompanions } from '../hooks/useApi';
import { usePlaylistStore } from '../store/playlist';
import { usePlayerStore } from '../store/player';
import { usePreferencesStore } from '../store/preferences';
import { PageContent, PageShell } from '../components/PageShell';
import { getStoryCoverImage, getCompanionAvatar } from '../../api/data/media.js';
import { cn } from '@/lib/utils';

export const PlaylistPage = () => {
  const navigate = useNavigate();
  const { stories } = useStories();
  const { companions } = useCompanions();
  const { defaultCompanionId } = usePreferencesStore();
  const {
    draftStoryIds,
    draftCompanionId,
    toggleDraftStory,
    moveDraftStory,
    setDraftCompanionId,
    startSession,
    session,
  } = usePlaylistStore();
  const { play, setOnEnded, stop } = usePlayerStore();
  const [phase, setPhase] = useState<'edit' | 'play'>(session ? 'play' : 'edit');

  useEffect(() => {
    if (!draftCompanionId) {
      setDraftCompanionId(defaultCompanionId);
    }
  }, [defaultCompanionId, draftCompanionId, setDraftCompanionId]);

  const orderedStories = useMemo(
    () => draftStoryIds.map((id) => stories.find((story) => story.id === id)).filter(Boolean),
    [draftStoryIds, stories],
  );

  const currentPlayStory = session
    ? stories.find((story) => story.id === session.storyIds[session.currentIndex])
    : null;

  useEffect(() => {
    if (phase !== 'play' || !session || !currentPlayStory) return undefined;

    play(currentPlayStory, session.companionId, 'playlist');

    setOnEnded(() => {
      const { session: activeSession, advanceIndex } = usePlaylistStore.getState();
      if (!activeSession) return;

      const nextIndex = activeSession.currentIndex + 1;
      if (nextIndex >= activeSession.storyIds.length) {
        advanceIndex();
        stop();
        setPhase('edit');
        return;
      }

      advanceIndex();
      const nextStory = stories.find((story) => story.id === activeSession.storyIds[nextIndex]);
      if (nextStory) {
        play(nextStory, activeSession.companionId, 'playlist');
      }
    });

    return () => setOnEnded(null);
  }, [phase, session?.currentIndex, currentPlayStory?.id, play, setOnEnded, stop, stories]);

  const handleStart = () => {
    if (draftStoryIds.length === 0) return;
    startSession(draftCompanionId || defaultCompanionId, draftStoryIds);
    setPhase('play');
  };

  if (phase === 'play' && session && currentPlayStory) {
    const companion = companions.find((item) => item.id === session.companionId);

    return (
      <PageShell withBottomNav={false}>
        <PageContent withHeader={false} className="pt-safe">
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => {
                stop();
                setPhase('edit');
              }}
              className="p-2 rounded-full bg-card-bg border border-card-border touch-target"
            >
              <ArrowLeft className="w-5 h-5 text-light-blue" />
            </button>
            <div>
              <h1 className="font-serif text-xl font-bold text-light-blue">故事连播</h1>
              <p className="text-sm text-gray-500">
                {session.currentIndex + 1} / {session.storyIds.length} · {companion?.name}
              </p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-card-border mb-4">
            <img
              src={getStoryCoverImage(currentPlayStory.id, currentPlayStory.coverImage)}
              alt={currentPlayStory.title}
              className="w-full aspect-[16/10] object-cover"
            />
          </div>
          <h2 className="font-serif text-2xl font-bold text-light-blue mb-2">{currentPlayStory.title}</h2>
          <p className="text-gray-400 text-sm leading-relaxed">{currentPlayStory.description}</p>
        </PageContent>
      </PageShell>
    );
  }

  return (
    <PageShell withBottomNav={false}>
      <PageContent withHeader={false} className="pt-safe pb-28">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-2 rounded-full bg-card-bg border border-card-border touch-target"
          >
            <ArrowLeft className="w-5 h-5 text-light-blue" />
          </button>
          <div>
            <h1 className="font-serif text-xl font-bold text-light-blue">故事连播</h1>
            <p className="text-sm text-gray-500">多选故事、排序，固定一位旅伴连播</p>
          </div>
        </div>

        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-3">选择旅伴</h2>
          <div className="grid grid-cols-2 gap-2">
            {companions.map((companion) => (
              <button
                key={companion.id}
                type="button"
                onClick={() => setDraftCompanionId(companion.id)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border touch-target text-left',
                  draftCompanionId === companion.id
                    ? 'border-gold bg-gold/10'
                    : 'border-card-border bg-card-bg',
                )}
              >
                <img src={getCompanionAvatar(companion.id)} alt={companion.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="text-light-blue font-medium truncate">{companion.name}</p>
                  <p className="text-xs text-gray-500 truncate">{companion.style}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-400 mb-3">选择并排序故事</h2>
          <div className="space-y-2">
            {stories.map((story) => {
              const selectedIndex = draftStoryIds.indexOf(story.id);
              const isSelected = selectedIndex >= 0;

              return (
                <div
                  key={story.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border',
                    isSelected ? 'border-gold/40 bg-gold/5' : 'border-card-border bg-card-bg',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleDraftStory(story.id)}
                    className={cn(
                      'w-6 h-6 rounded-full border flex items-center justify-center shrink-0',
                      isSelected ? 'bg-gold border-gold text-deep-navy' : 'border-gray-500',
                    )}
                  >
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-light-blue font-medium truncate">{story.title}</p>
                    <p className="text-xs text-gray-500 truncate">{story.location.name}</p>
                  </div>
                  {isSelected && (
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={selectedIndex === 0}
                        onClick={() => moveDraftStory(selectedIndex, selectedIndex - 1)}
                        className="p-1 rounded bg-card-border/50 disabled:opacity-30"
                      >
                        <ArrowUp className="w-4 h-4 text-light-blue" />
                      </button>
                      <button
                        type="button"
                        disabled={selectedIndex === draftStoryIds.length - 1}
                        onClick={() => moveDraftStory(selectedIndex, selectedIndex + 1)}
                        className="p-1 rounded bg-card-border/50 disabled:opacity-30"
                      >
                        <ArrowDown className="w-4 h-4 text-light-blue" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </PageContent>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app px-4 pb-safe pt-3 bg-deep-navy/95 backdrop-blur border-t border-card-border">
        <button
          type="button"
          disabled={draftStoryIds.length === 0}
          onClick={handleStart}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gold text-deep-navy font-semibold disabled:opacity-40 touch-target"
        >
          <Play className="w-5 h-5" />
          开始连播 ({draftStoryIds.length})
        </button>
      </div>
    </PageShell>
  );
};
