import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, Heart, Share2, Volume2, VolumeX,
  MapPin, Clock, ChevronDown, ChevronUp,
  User, ChevronRight, Check
} from 'lucide-react';
import { Header } from '../components/Header';
import { PageContent, PageShell } from '../components/PageShell';
import { useStory, useCompanions } from '../hooks/useApi';
import { usePlayerStore } from '../store/player';
import { useFavoritesStore } from '../store/favorites';
import { StoryCard } from '../components/StoryCard';
import { getStoryCoverImage, getCompanionAvatar } from '../../api/data/media.js';
import { uniqueNarratorsByCompanion } from '../../api/data/narration-utils.js';
import { normalizeCompanionId } from '../../api/data/narrations.js';

export const StoryPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const companionIdFromUrl = searchParams.get('companionId');
  const { story, loading } = useStory(id || '');
  const { companions } = useCompanions();
  const { 
    currentStory, 
    currentNarrator, 
    currentCompanionId, 
    isPlaying, 
    progress, 
    duration,
    play, 
    toggle, 
    setProgress, 
    stop,
    switchCompanion 
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

  useEffect(() => {
    if (story && currentStory && companionIdFromUrl && currentCompanionId !== companionIdFromUrl) {
      switchCompanion(companionIdFromUrl);
    }
  }, [story, currentStory, companionIdFromUrl, currentCompanionId, switchCompanion]);

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

  const handleSwitchCompanion = (companionId: string) => {
    switchCompanion(normalizeCompanionId(companionId));
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

  const companionChoices = uniqueNarratorsByCompanion(story.narrators);
  const isFavorite = isStoryFavorite(story.id);
  const displayDuration = duration || currentNarrator?.duration || story.duration;
  const progressPercent = Math.max(0, Math.min(100, progress));
  const currentTimeSeconds = Math.floor((progressPercent / 100) * displayDuration);
  const currentCompanion = companions.find((c) => c.id === currentCompanionId);
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
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-card-border flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <User className="w-5 h-5 text-gold shrink-0" />
              <span className="font-serif font-semibold text-light-blue">选择旅伴</span>
            </div>
            <button 
              type="button"
              onClick={() => navigate(`/companions?storyId=${story.id}`)}
              className="text-sm text-gold active:text-amber transition-colors flex items-center gap-1 shrink-0 touch-target"
            >
              更多旅伴
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {companionChoices.map((narrator) => {
                const companion = companions.find(
                  (c) => normalizeCompanionId(c.id) === narrator.companionId,
                );
                const isActive = currentCompanionId === narrator.companionId;
                
                return (
                  <button
                    key={narrator.companionId}
                    type="button"
                    onClick={() => handleSwitchCompanion(narrator.companionId)}
                    className={`p-2.5 sm:p-3 rounded-xl border transition-all duration-300 text-left min-w-0 ${
                      isActive 
                        ? 'border-gold bg-gold/10' 
                        : 'border-card-border active:border-gold/50 bg-card-bg/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="relative shrink-0">
                        <img 
                          src={getCompanionAvatar(companion?.id || '')}
                          alt={companion?.name}
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ${
                            isActive ? 'ring-2 ring-gold ring-offset-1 sm:ring-offset-2 ring-offset-card-bg' : ''
                          }`}
                        />
                        {isActive && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gold rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-deep-navy" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-light-blue text-xs sm:text-sm truncate">{companion?.name}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 truncate">{narrator.styleNote}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[10px] sm:text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(narrator.duration)}
                      </span>
                      {isActive && (
                        <span className="px-1.5 sm:px-2 py-0.5 bg-amber/20 text-amber rounded-full shrink-0">
                          讲解中
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
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

        <section className="mb-4">
          <h3 className="font-serif font-bold text-light-blue mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gold shrink-0" />
            附近更多故事
          </h3>
          <div className="horizontal-scroll">
            {story.id !== 'west-lake-bridge' && 
              <StoryCard key="west-lake-bridge" story={{
                id: 'west-lake-bridge',
                title: '西湖断桥的传说',
                location: { name: '杭州西湖', lat: 30.2741, lng: 120.1551 },
                distance: 120,
                duration: 180,
                description: '断桥不断，肝肠寸断。白娘子与许仙的爱情故事...',
                coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=west%20lake%20hangzhou%20broken%20bridge%20chinese%20traditional%20painting%20style%20beautiful%20scenery%20willow%20trees%20misty&image_size=landscape_16_9',
                defaultCompanionId: 'su-dongpo',
                tags: ['爱情', '传说', '西湖'],
                narrators: []
              }} compact layout="scroll" />}
          </div>
        </section>


      </PageContent>
    </PageShell>
  );
};
