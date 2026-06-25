import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, Heart, Share2, Volume2, VolumeX,
  SkipBack, SkipForward, MapPin, Clock, ChevronDown, ChevronUp,
  User, ChevronRight
} from 'lucide-react';
import { Header } from '../components/Header';
import { useStory, useCompanion } from '../hooks/useApi';
import { usePlayerStore } from '../store/player';
import { useFavoritesStore } from '../store/favorites';
import { StoryCard } from '../components/StoryCard';

export const StoryPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const { story, loading } = useStory(id || '');
  const { companion } = useCompanion(story?.companionId || '');
  const { currentStory, isPlaying, progress, play, pause, toggle, setProgress, stop } = usePlayerStore();
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
    
    const interval = setInterval(() => {
      if (currentStory && progress < currentStory.duration) {
        setProgress(progress + 1);
      } else if (currentStory && progress >= currentStory.duration) {
        pause();
        setProgress(currentStory.duration);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentStory, progress, pause, setProgress]);

  const handleProgressClick = (e: React.MouseEvent) => {
    if (!progressRef.current || !currentStory) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setProgress(Math.floor(percent * currentStory.duration));
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
      <div className="min-h-screen bg-deep-navy">
        <Header />
        <div className="pt-16 flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const isFavorite = isStoryFavorite(story.id);
  const progressPercent = story.duration > 0 ? (progress / story.duration) * 100 : 0;

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
            <div className="flex items-center gap-3 mb-2">
              {companion && (
                <img 
                  src={companion.avatar}
                  alt={companion.name}
                  className="w-10 h-10 rounded-full border-2 border-gold object-cover"
                />
              )}
              <div>
                <p className="text-gold text-sm">{companion?.name || '未知旅伴'}</p>
                <p className="text-gray-400 text-xs">{story.location.name}</p>
              </div>
            </div>
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
                    {formatTime(progress)} / {formatTime(story.duration)}
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

          <div className="flex items-center justify-center gap-6 mb-4">
            <button className="p-3 rounded-full bg-card-border hover:bg-card-border/80 transition-colors">
              <SkipBack className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-3 rounded-full bg-card-border hover:bg-card-border/80 transition-colors">
              <SkipForward className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {!isMuted && (
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <input 
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 h-1 bg-card-border rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${volume}%, #1E2A3D ${volume}%, #1E2A3D 100%)`
                }}
              />
              <span className="text-xs text-gray-400 w-8">{volume}%</span>
            </div>
          )}
        </div>

        <div 
          className="bg-card-bg rounded-2xl p-5 border border-card-border mb-6 cursor-pointer hover:border-gold/50 transition-colors"
          onClick={() => navigate('/companions')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                <User className="w-6 h-6 text-gold" />
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-0.5">当前旅伴</p>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-semibold text-light-blue">{companion?.name || '未知旅伴'}</span>
                  <span className="px-2 py-0.5 text-xs bg-amber/20 text-amber rounded-full">讲解中</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">更换</span>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>
          </div>
          {companion && (
            <div className="mt-3 pt-3 border-t border-card-border">
              <p className="text-sm text-gray-400 line-clamp-2">{companion.description}</p>
            </div>
          )}
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
              <p className="text-gray-400 leading-relaxed">{story.content}</p>
            </div>
          )}
        </div>

        <section className="mb-6">
          <h3 className="font-serif font-bold text-light-blue mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gold" />
            相关故事
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {companion?.stories?.map((relatedStory) => (
              <StoryCard key={relatedStory.id} story={relatedStory} compact />
            ))}
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
                <p className="text-sm text-gray-400">{formatTime(progress)} / {formatTime(story.duration)}</p>
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
