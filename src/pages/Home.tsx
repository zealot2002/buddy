import { useEffect } from 'react';
import { Play, MapPin, ChevronRight, Sparkles } from 'lucide-react';
import { Header } from '../components/Header';
import { StoryCard } from '../components/StoryCard';
import { useLocationStore } from '../store/location';
import { useNearbyStories, useStories } from '../hooks/useApi';
import { usePlayerStore } from '../store/player';
import { useNavigate } from 'react-router-dom';

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
    <div className="min-h-screen bg-deep-navy">
      <Header />
      
      <main className="pt-16 pb-24 px-4">
        <section className="mb-8">
          <div className="relative rounded-3xl overflow-hidden h-64">
            <img 
              src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20chinese%20landscape%20painting%20mountains%20and%20lake%20traditional%20style%20golden%20hour&image_size=landscape_16_9"
              alt="Hero"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep-navy via-deep-navy/50 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber" />
                <span className="text-amber text-sm font-medium">附近发现精彩故事</span>
              </div>
              <h1 className="font-serif text-2xl font-bold text-light-blue mb-4">
                你想听听这里的故事吗？
              </h1>
              <button 
                onClick={handleQuickPlay}
                disabled={nearbyLoading || nearbyStories.length === 0}
                className="gold-button flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                {nearbyLoading ? '加载中...' : '一键播放'}
              </button>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-bold text-light-blue">附近故事</h2>
            <button className="flex items-center gap-1 text-sm text-gold hover:text-amber transition-colors">
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {nearbyLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 w-80 h-64 bg-card-bg rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : nearbyStories.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {nearbyStories.map((story) => (
                <StoryCard key={story.id} story={story} />
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

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-bold text-light-blue">热门故事</h2>
            <button className="flex items-center gap-1 text-sm text-gold hover:text-amber transition-colors">
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[4/5] bg-card-bg rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} compact />
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <div className="bg-gradient-to-r from-card-bg to-card-border rounded-2xl p-5 border border-card-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-light-blue mb-1">个性化推荐</h3>
                <p className="text-sm text-gray-400 mb-3">根据你的位置和偏好，为你推荐最适合的故事</p>
                <button className="gold-outline-button text-sm px-4 py-2">
                  开启推荐
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
