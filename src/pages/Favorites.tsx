import { Heart, MapPin, User, Navigation, Clock, Play, Trash2 } from 'lucide-react';
import { Header } from '../components/Header';
import { useFavoritesStore } from '../store/favorites';
import { usePlayerStore } from '../store/player';
import { useNavigate } from 'react-router-dom';

export const Favorites = () => {
  const { stories, companions, routes, removeStory, removeCompanion, removeRoute } = useFavoritesStore();
  const { play } = usePlayerStore();
  const navigate = useNavigate();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayStory = (story: typeof stories[0]) => {
    play(story);
    navigate(`/story/${story.id}`);
  };

  return (
    <div className="min-h-screen bg-deep-navy">
      <Header />
      
      <main className="pt-16 pb-24 px-4">
        <section className="mb-8">
          <h1 className="font-serif text-2xl font-bold text-light-blue mb-2">我的收藏</h1>
          <p className="text-gray-400">收藏喜欢的故事、旅伴和路线，随时回味</p>
        </section>

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-red-500" />
            <h2 className="font-serif text-lg font-bold text-light-blue">收藏的故事</h2>
          </div>
          
          {stories.length === 0 ? (
            <div className="bg-card-bg rounded-2xl p-8 border border-card-border text-center">
              <Heart className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-500">还没有收藏任何故事</p>
              <p className="text-sm text-gray-600 mt-1">浏览故事时点击心形图标即可收藏</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stories.map((story) => (
                <div 
                  key={story.id}
                  className="bg-card-bg rounded-xl p-4 border border-card-border flex items-center gap-4"
                >
                  <img 
                    src={story.coverImage}
                    alt={story.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-semibold text-light-blue truncate">{story.title}</h3>
                    <p className="text-sm text-gray-400">{story.location.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatDuration(story.duration)}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {story.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 text-xs bg-card-border rounded-full text-gold/70">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handlePlayStory(story)}
                      className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center hover:bg-gold/30 transition-colors"
                    >
                      <Play className="w-5 h-5 text-gold ml-0.5" />
                    </button>
                    <button 
                      onClick={() => removeStory(story.id)}
                      className="w-10 h-10 rounded-full hover:bg-card-border flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gold" />
            <h2 className="font-serif text-lg font-bold text-light-blue">收藏的旅伴</h2>
          </div>
          
          {companions.length === 0 ? (
            <div className="bg-card-bg rounded-2xl p-8 border border-card-border text-center">
              <User className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-500">还没有收藏任何旅伴</p>
              <p className="text-sm text-gray-600 mt-1">在旅伴页面点击心形图标即可收藏</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {companions.map((companion) => (
                <div 
                  key={companion.id}
                  className="companion-card"
                >
                  <img 
                    src={companion.avatar}
                    alt={companion.name}
                    className="w-20 h-20 mx-auto rounded-full object-cover border-2 border-gold/30 mb-2"
                  />
                  <h3 className="font-serif font-bold text-light-blue mb-1">{companion.name}</h3>
                  <span className="inline-block px-2 py-0.5 text-xs bg-gold/20 text-gold rounded-full mb-2">
                    {companion.style}
                  </span>
                  <button 
                    onClick={() => removeCompanion(companion.id)}
                    className="text-xs text-red-500 hover:text-red-400 transition-colors"
                  >
                    取消收藏
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Navigation className="w-5 h-5 text-amber" />
            <h2 className="font-serif text-lg font-bold text-light-blue">收藏的路线</h2>
          </div>
          
          {routes.length === 0 ? (
            <div className="bg-card-bg rounded-2xl p-8 border border-card-border text-center">
              <Navigation className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-500">还没有收藏任何路线</p>
              <p className="text-sm text-gray-600 mt-1">在路线页面点击心形图标即可收藏</p>
            </div>
          ) : (
            <div className="space-y-3">
              {routes.map((route) => (
                <div 
                  key={route.id}
                  className="bg-card-bg rounded-xl p-4 border border-card-border flex items-center gap-4"
                >
                  <img 
                    src={route.coverImage}
                    alt={route.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-semibold text-light-blue truncate">{route.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-1">{route.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {route.distance}km
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {Math.floor(route.duration / 60)}小时
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeRoute(route.id)}
                    className="w-10 h-10 rounded-full hover:bg-card-border flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
