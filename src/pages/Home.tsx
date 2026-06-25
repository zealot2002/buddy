import { useEffect } from 'react';
import { Play, MapPin, ChevronRight, Sparkles, BookOpen } from 'lucide-react';
import { Header } from '../components/Header';
import { PageContent, PageShell } from '../components/PageShell';
import { StoryCard } from '../components/StoryCard';
import { useLocationStore } from '../store/location';
import { useNearbyStories, useStories } from '../hooks/useApi';
import { usePlayerStore } from '../store/player';
import { useNavigate } from 'react-router-dom';
import { getStoryCoverImage } from '../../api/data/media.js';

export const Home = () => {
  const { lat, lng, setLocation, setLocating, isLocating } = useLocationStore();
  const { stories: nearbyStories, loading: nearbyLoading } = useNearbyStories(lat, lng);
  const { stories, loading } = useStories();
  const { play } = usePlayerStore();
  const navigate = useNavigate();

  useEffect(() => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords.latitude, position.coords.longitude, '当前位置');
        },
        (error) => {
          console.error('Failed to get location:', error);
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    } else {
      setTimeout(() => {
        setLocating(false);
      }, 2000);
    }
  }, [setLocation, setLocating]);

  const handleQuickPlay = () => {
    if (nearbyStories.length > 0) {
      play(nearbyStories[0]);
      navigate(`/story/${nearbyStories[0].id}`);
    }
  };

  return (
    <PageShell>
      <Header />
      
      <PageContent>
        <section className="mb-6">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[16/11] sm:aspect-[16/10]">
            <img 
              src={getStoryCoverImage('west-lake-bridge')}
              alt="Hero"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep-navy via-deep-navy/50 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber shrink-0" />
                <span className="text-amber text-xs sm:text-sm font-medium">附近发现精彩故事</span>
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-light-blue mb-3 sm:mb-4 leading-snug">
                你想听听这里的故事吗？
              </h1>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <button 
                  type="button"
                  onClick={handleQuickPlay}
                  disabled={nearbyLoading || nearbyStories.length === 0}
                  className="gold-button flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  {nearbyLoading ? '加载中...' : '一键播放'}
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/stories')}
                  className="gold-outline-button flex items-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  浏览故事
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-light-blue">附近故事</h2>
            <button 
              type="button"
              onClick={() => navigate('/stories')}
              className="flex items-center gap-1 text-sm text-gold active:text-amber transition-colors touch-target"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {nearbyLoading ? (
            <div className="horizontal-scroll">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-[72vw] max-w-[260px] flex-shrink-0 aspect-[3/4] bg-card-bg rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : nearbyStories.length > 0 ? (
            <div className="horizontal-scroll">
              {nearbyStories.map((story) => (
                <StoryCard key={story.id} story={story} layout="scroll" />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>附近暂时没有故事点</p>
              <p className="text-sm mt-1">尝试手动定位或浏览热门故事</p>
            </div>
          )}
        </section>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-light-blue">热门故事</h2>
            <button 
              type="button"
              onClick={() => navigate('/stories')}
              className="flex items-center gap-1 text-sm text-gold active:text-amber transition-colors touch-target"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[4/5] bg-card-bg rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} compact layout="grid" />
              ))}
            </div>
          )}
        </section>
      </PageContent>
    </PageShell>
  );
};
