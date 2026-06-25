import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, Heart, Share2, Volume2, VolumeX,
  SkipBack, SkipForward, MapPin, Clock, ChevronDown, ChevronUp,
  User, ChevronRight, Check
} from 'lucide-react';
import { Header } from '../components/Header';
import { useStory, useCompanions } from '../hooks/useApi';
import { usePlayerStore } from '../store/player';
import { useFavoritesStore } from '../store/favorites';
import { StoryCard } from '../components/StoryCard';

export const StoryPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const { story, loading } = useStory(id || '');
  const { companions } = useCompanions();
  const { 
    currentStory, 
    currentNarrator, 
    currentCompanionId, 
    isPlaying, 
    progress, 
    play, 
    pause, 
    toggle, 
    setProgress, 
    stop,
    switchCompanion 
  } = usePlayerStore();
  const { isStoryFavorite, addStory, removeStory } = useFavoritesStore();
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (story && !currentStory) {
      play(story);
    }
  }, [story, currentStory, play]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const duration = currentNarrator?.duration || currentStory?.duration || 0;
    const interval = setInterval(() => {
      if (duration > 0 && progress < duration) {
        setProgress(progress + 1);
      } else if (duration > 0 && progress >= duration) {
        pause();
        setProgress(duration);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentStory, currentNarrator, progress, pause, setProgress]);

  const handleProgressClick = (e: React.MouseEvent) => {
    if (!progressRef.current) return;
    const duration = currentNarrator?.duration || currentStory?.duration || 0;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setProgress(Math.floor(percent * duration));
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
    switchCompanion(companionId);
  };

  if (loading || !story) {
    return (
      <div className="min-h-screen bg-deep-navy">
        <Header />
        <div className="pt-16 flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const isFavorite = isStoryFavorite(story.id);
  const displayDuration = currentNarrator?.duration || story.duration;
  const progressPercent = displayDuration > 0 ? (progress / displayDuration) * 100 : 0;
  const currentCompanion = companions.find((c) => c.id === currentCompanionId);

  return (
    <div className="min-h-screen bg-deep-navy">
      <Header />
      
      <main className="pt-16 pb-24 px-4">
        <button 
          onClick={handleBack}
          className="mb-4 flex items-center gap-2 text-gray-400 hover:text-light-blue transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>

        <div className="relative rounded-3xl overflow-hidden h-64 mb-6">
          <img 
            src={story.coverImage}
            alt={story.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep-navy via-deep-navy/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="font-serif text-2xl font-bold text-light-blue">{story.title}</h1>
          </div>
        </div>

        <div className="bg-card-bg rounded-2xl p-6 border border-card-border mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={toggle}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-gold to-amber flex items-center justify-center hover:scale-110 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-deep-navy" />
                ) : (
                  <Play className="w-8 h-8 text-deep-navy ml-1" />
                )}
              </button>
              <div>
                <p className="font-serif font-semibold text-light-blue">{story.title}</p>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(progress)} / {formatTime(displayDuration)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full hover:bg-card-border transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-light-blue" />
                )}
              </button>
              <button 
                onClick={() => {
                  if (isFavorite) removeStory(story.id);
                  else addStory(story);
                }}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite ? 'bg-red-500/20 text-red-500' : 'hover:bg-card-border text-gray-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 rounded-full hover:bg-card-border text-gray-400 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div 
            ref={progressRef}
            onClick={handleProgressClick}
            className="relative h-2 bg-card-border rounded-full cursor-pointer mb-4 group"
          >
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-gold to-amber rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progressPercent}% - 8px)` }}
            />
          </div>
        </div>

        <div className="bg-card-bg rounded-2xl border border-card-border overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-card-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gold" />
              <span className="font-serif font-semibold text-light-blue">选择旅伴</span>
            </div>
            <button 
              onClick={() => navigate('/companions')}
              className="text-sm text-gold hover:text-amber transition-colors flex items-center gap-1"
            >
              更多旅伴
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {story.narrators.map((narrator) => {
                const companion = companions.find((c) => c.id === narrator.companionId);
                const isActive = currentCompanionId === narrator.companionId;
                
                return (
                  <button
                    key={narrator.companionId}
                    onClick={() => handleSwitchCompanion(narrator.companionId)}
                    className={`p-3 rounded-xl border transition-all duration-300 text-left ${
                      isActive 
                        ? 'border-gold bg-gold/10' 
                        : 'border-card-border hover:border-gold/50 bg-card-bg/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={companion?.avatar}
                          alt={companion?.name}
                          className={`w-10 h-10 rounded-full object-cover ${
                            isActive ? 'ring-2 ring-gold ring-offset-2 ring-offset-card-bg' : ''
                          }`}
                        />
                        {isActive && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gold rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-deep-navy" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-light-blue text-sm">{companion?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{narrator.styleNote}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(narrator.duration)}
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 bg-amber/20 text-amber rounded-full">
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

        <div className="bg-card-bg rounded-2xl border border-card-border overflow-hidden mb-6">
          <button 
            onClick={() => setShowContent(!showContent)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-card-border/50 transition-colors"
          >
            <span className="font-serif font-semibold text-light-blue">故事内容</span>
            {showContent ? (
              <ChevronUp className="w-5 h-5 text-gold" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gold" />
            )}
          </button>
          {showContent && (
            <div className="px-6 pb-6">
              <p className="text-gray-400 leading-relaxed">
                {currentNarrator?.content || story.narrators[0]?.content}
              </p>
            </div>
          )}
        </div>

        <section className="mb-6">
          <h3 className="font-serif font-bold text-light-blue mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gold" />
            附近更多故事
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {story.id !== 'west-lake-bridge' && 
              <StoryCard key="west-lake-bridge" story={{
                id: 'west-lake-bridge',
                title: '西湖断桥的传说',
                location: { name: '杭州西湖', lat: 30.2741, lng: 120.1551 },
                distance: 120,
                duration: 180,
                description: '断桥不断，肝肠寸断。白娘子与许仙的爱情故事...',
                coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=west%20lake%20hangzhou%20broken%20bridge%20chinese%20traditional%20painting%20style%20beautiful%20scenery%20willow%20trees%20misty&image_size=landscape_16_9',
                defaultCompanionId: 'lin-huiyin',
                tags: ['爱情', '传说', '西湖'],
                narrators: []
              }} compact />}
          </div>
        </section>

        {isPlaying && (
          <div className="fixed bottom-24 left-4 right-4 bg-card-bg/95 backdrop-blur-md rounded-2xl p-4 border border-card-border shadow-lg">
            <div className="flex items-center gap-3">
              <img 
                src={story.coverImage}
                alt={story.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-serif font-semibold text-light-blue truncate">{story.title}</p>
                <p className="text-sm text-gray-400">
                  {currentCompanion?.name} · {formatTime(progress)} / {formatTime(displayDuration)}
                </p>
              </div>
              <button 
                onClick={toggle}
                className="w-10 h-10 rounded-full bg-gold flex items-center justify-center"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-deep-navy" />
                ) : (
                  <Play className="w-5 h-5 text-deep-navy ml-0.5" />
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
