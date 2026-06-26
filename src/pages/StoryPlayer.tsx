import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, Heart, Share2, Volume2, VolumeX,
  Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import { Header } from '../components/Header';
import { PageContent, PageShell } from '../components/PageShell';
import { useStory } from '../hooks/useApi';
import { usePlayerStore } from '../store/player';
import { useFavoritesStore } from '../store/favorites';
import { getStoryCoverImage } from '../../api/data/media.js';

export const StoryPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const companionIdFromUrl = searchParams.get('companionId');
  const { story, loading } = useStory(id || '');
  const { 
    currentStory, 
    currentNarrator, 
    isPlaying, 
    progress, 
    duration,
    play, 
    toggle, 
    setProgress, 
    stop
  } = usePlayerStore();
  const { isStoryFavorite, addStory, removeStory } = useFavoritesStore();
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [shareTip, setShareTip] = useState('');
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (story && !currentStory) {
      play(story, companionIdFromUrl || undefined);
    }
  }, [story, currentStory, play, companionIdFromUrl]);

  const updateProgressFromClientX = (clientX: number) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = ((clientX - rect.left) / rect.width) * 100;
    setProgress(percent);
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    updateProgressFromClientX(e.clientX);
  };

  const handleProgressTouch = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      updateProgressFromClientX(e.touches[0].clientX);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setShareTip('链接已复制，快去分享给朋友吧');
    } catch {
      setShareTip('复制失败，请手动复制地址栏链接');
    }
    window.setTimeout(() => setShareTip(''), 2500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    stop();
    navigate('/');
  };

  if (loading || !story) {
    return (
      <PageShell withBottomNav={false}>
        <Header />
        <PageContent className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </PageContent>
      </PageShell>
    );
  }

  const isFavorite = isStoryFavorite(story.id);
  const displayDuration = duration || currentNarrator?.duration || story.duration;
  const progressPercent = Math.max(0, Math.min(100, progress));
  const currentTimeSeconds = Math.floor((progressPercent / 100) * displayDuration);
  const coverSrc = getStoryCoverImage(story.id, story.coverImage);

  return (
    <PageShell withBottomNav={false}>
      <Header />
      
      <PageContent>
        <button 
          type="button"
          onClick={handleBack}
          className="mb-3 flex items-center gap-2 text-gray-400 active:text-light-blue transition-colors touch-target"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>

        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[16/10] mb-4 sm:mb-6 bg-card-border">
          <img 
            src={coverSrc}
            alt={story.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep-navy via-deep-navy/30 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-light-blue line-clamp-2">{story.title}</h1>
          </div>
        </div>

        <div className="bg-card-bg rounded-2xl p-4 sm:p-6 border border-card-border mb-4 sm:mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <button 
                type="button"
                onClick={toggle}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-gold to-amber flex items-center justify-center active:scale-105 transition-transform shrink-0 touch-target"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 sm:w-8 sm:h-8 text-deep-navy" />
                ) : (
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 text-deep-navy ml-0.5" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className="font-serif font-semibold text-light-blue truncate">{story.title}</p>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                  <span className="flex items-center gap-1 shrink-0">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {formatTime(currentTimeSeconds)} / {formatTime(displayDuration)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-1 sm:gap-2 relative">
              <button 
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="p-2.5 rounded-full active:bg-card-border transition-colors touch-target"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-light-blue" />
                )}
              </button>
              <button 
                type="button"
                onClick={() => {
                  if (isFavorite) removeStory(story.id);
                  else addStory(story);
                }}
                className={`p-2.5 rounded-full transition-colors touch-target ${
                  isFavorite ? 'bg-red-500/20 text-red-500' : 'active:bg-card-border text-gray-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="p-2.5 rounded-full active:bg-card-border text-gray-400 transition-colors touch-target"
                aria-label="分享故事"
              >
                <Share2 className="w-5 h-5" />
              </button>
              {shareTip && (
                <span className="absolute -top-9 right-0 whitespace-nowrap rounded-lg bg-card-border px-2.5 py-1 text-xs text-light-blue shadow-lg">
                  {shareTip}
                </span>
              )}
            </div>
          </div>

          <div 
            ref={progressRef}
            onClick={handleProgressClick}
            onTouchStart={handleProgressTouch}
            onTouchMove={handleProgressTouch}
            className="relative h-2.5 bg-card-border rounded-full cursor-pointer mt-4 group touch-none"
          >
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-gold to-amber rounded-full transition-[width] duration-150"
              style={{ width: `${progressPercent}%` }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-gold rounded-full shadow-md"
              style={{ left: `calc(${progressPercent}% - 8px)` }}
            />
          </div>
        </div>

        <div className="bg-card-bg rounded-2xl border border-card-border overflow-hidden mb-4 sm:mb-6">
          <button 
            type="button"
            onClick={() => setShowContent(!showContent)}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between active:bg-card-border/50 transition-colors touch-target"
          >
            <span className="font-serif font-semibold text-light-blue">故事内容</span>
            {showContent ? (
              <ChevronUp className="w-5 h-5 text-gold" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gold" />
            )}
          </button>
          {showContent && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <p className="text-sm text-gray-400 leading-relaxed">
                {currentNarrator?.content || story.narrators[0]?.content}
              </p>
            </div>
          )}
        </div>

      </PageContent>
    </PageShell>
  );
};
