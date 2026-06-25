import { Heart, Play, MessageCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { useCompanions } from '../hooks/useApi';
import { useFavoritesStore } from '../store/favorites';
import { useNavigate } from 'react-router-dom';
import type { Companion } from '../../api/data/companions.js';

export const Companions = () => {
  const { companions, loading } = useCompanions();
  const { isCompanionFavorite, addCompanion, removeCompanion } = useFavoritesStore();
  const navigate = useNavigate();

  const handleSelect = (companion: Companion) => {
    navigate(`/story/${companion.id}`);
  };

  return (
    <div className="min-h-screen bg-deep-navy">
      <Header />
      
      <main className="pt-16 pb-24 px-4">
        <section className="mb-8">
          <h1 className="font-serif text-2xl font-bold text-light-blue mb-2">选择你的旅伴</h1>
          <p className="text-gray-400">每一位旅伴都有独特的风格和故事，找到最适合你的那一位</p>
        </section>

        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-card-bg rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {companions.map((companion) => {
              const isFavorite = isCompanionFavorite(companion.id);
              
              return (
                <div 
                  key={companion.id}
                  className="companion-card group"
                  onClick={() => handleSelect(companion)}
                >
                  <div className="relative mb-3">
                    <img 
                      src={companion.avatar}
                      alt={companion.name}
                      className="w-24 h-24 mx-auto rounded-full object-cover border-2 border-gold/30 group-hover:border-gold transition-colors"
                    />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isFavorite) {
                          removeCompanion(companion.id);
                        } else {
                          addCompanion(companion);
                        }
                      }}
                      className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isFavorite ? 'bg-red-500' : 'bg-card-bg border border-card-border'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white text-white' : 'text-gray-400'}`} />
                    </button>
                  </div>
                  
                  <h3 className="font-serif font-bold text-lg text-light-blue mb-1">{companion.name}</h3>
                  <span className="inline-block px-2 py-0.5 text-xs bg-gold/20 text-gold rounded-full mb-2">
                    {companion.style}
                  </span>
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">{companion.description}</p>
                  
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <MessageCircle className="w-3 h-3" />
                    <span>{companion.storiesCount} 个故事</span>
                  </div>
                  
                  <button className="mt-3 w-full py-2 rounded-full bg-card-border text-gold text-sm font-medium hover:bg-gold hover:text-deep-navy transition-colors flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" />
                    听TA讲故事
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <section className="mt-8">
          <div className="bg-gradient-to-r from-card-bg to-card-border rounded-2xl p-5 border border-card-border">
            <h3 className="font-serif font-bold text-light-blue mb-2">为什么选择旅伴？</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span>不同的旅伴会用不同的视角讲述同一个故事</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span>苏东坡会用诗词解读，林徽因会从建筑角度切入</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span>找到你最喜欢的声音和风格，让旅途更有趣</span>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
};
