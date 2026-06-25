import { MapPin, Clock, Navigation, ChevronRight, Heart } from 'lucide-react';
import { Header } from '../components/Header';
import { useRoutes } from '../hooks/useApi';
import { useFavoritesStore } from '../store/favorites';
import { useNavigate } from 'react-router-dom';
import type { Route } from '../../api/data/routes.js';

export const Routes = () => {
  const { routes, loading } = useRoutes();
  const { isRouteFavorite, addRoute, removeRoute } = useFavoritesStore();
  const navigate = useNavigate();

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
    }
    return `${mins}分钟`;
  };

  const handleSelect = (route: Route) => {
    navigate(`/story/${route.storyIds[0]}`);
  };

  return (
    <div className="min-h-screen bg-deep-navy">
      <Header />
      
      <main className="pt-16 pb-24 px-4">
        <section className="mb-8">
          <h1 className="font-serif text-2xl font-bold text-light-blue mb-2">路线规划</h1>
          <p className="text-gray-400">将多个故事点串联成一次完整的旅行体验</p>
        </section>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-card-bg rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {routes.map((route) => {
              const isFavorite = isRouteFavorite(route.id);
              
              return (
                <div 
                  key={route.id}
                  className="route-card"
                  onClick={() => handleSelect(route)}
                >
                  <div className="flex gap-4">
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                      <img 
                        src={route.coverImage}
                        alt={route.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/50 to-transparent" />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isFavorite) {
                            removeRoute(route.id);
                          } else {
                            addRoute(route);
                          }
                        }}
                        className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isFavorite ? 'bg-red-500/80' : 'bg-deep-navy/50'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white text-white' : 'text-white'}`} />
                      </button>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-bold text-lg text-light-blue mb-1">{route.name}</h3>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{route.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {route.distance}km
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(route.duration)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Navigation className="w-4 h-4" />
                          {route.storyIds.length}个故事点
                        </span>
                      </div>
                      
                      <button className="gold-outline-button text-sm px-4 py-2">
                        开始旅程
                      </button>
                    </div>
                    
                    <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0 mt-2" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <section className="mt-8">
          <div className="bg-gradient-to-r from-card-bg to-card-border rounded-2xl p-5 border border-card-border">
            <h3 className="font-serif font-bold text-light-blue mb-2">如何使用路线功能？</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span>选择一条路线，按照推荐顺序依次游览各个故事点</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span>每个故事点都有专属讲解，带你深入了解历史文化</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span>收藏喜欢的路线，方便下次旅行时使用</span>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
};
