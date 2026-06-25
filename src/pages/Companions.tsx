import { Heart, Play } from 'lucide-react';
import { Header } from '../components/Header';
import { PageContent, PageShell } from '../components/PageShell';
import { useCompanions } from '../hooks/useApi';
import { useFavoritesStore } from '../store/favorites';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Companion } from '../../api/data/companions.js';
import { getCompanionAvatar } from '../../api/data/media.js';

export const Companions = () => {
  const { companions, loading } = useCompanions();
  const { isCompanionFavorite, addCompanion, removeCompanion } = useFavoritesStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storyId = searchParams.get('storyId');

  const handleSelect = (companion: Companion) => {
    if (storyId) {
      navigate(`/story/${storyId}?companionId=${companion.id}`);
    }
  };

  return (
    <PageShell withBottomNav={false}>
      <Header />
      
      <PageContent>
        <section className="mb-6">
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-light-blue mb-2">选择你的旅伴</h1>
          <p className="text-sm text-gray-400">每一位旅伴都有独特的风格和故事，找到最适合你的那一位</p>
        </section>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-card-bg rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {companions.map((companion) => {
              const isFavorite = isCompanionFavorite(companion.id);
              
              return (
                <div 
                  key={companion.id}
                  className="companion-card group"
                  onClick={() => handleSelect(companion)}
                >
                  <div className="relative mb-2 sm:mb-3 mx-auto w-fit">
                    <img 
                      src={getCompanionAvatar(companion.id, companion.avatar)}
                      alt={companion.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full object-cover border-2 border-gold/30 group-active:border-gold transition-colors"
                    />
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isFavorite) {
                          removeCompanion(companion.id);
                        } else {
                          addCompanion(companion);
                        }
                      }}
                      className={`absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors touch-target ${
                        isFavorite ? 'bg-red-500' : 'bg-card-bg border border-card-border'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? 'fill-white text-white' : 'text-gray-400'}`} />
                    </button>
                  </div>
                  
                  <h3 className="font-serif font-bold text-base sm:text-lg text-light-blue mb-1 line-clamp-1">{companion.name}</h3>
                  <span className="inline-block px-2 py-0.5 text-[10px] sm:text-xs bg-gold/20 text-gold rounded-full mb-2">
                    {companion.style}
                  </span>
                  <p className="text-[11px] sm:text-xs text-gray-400 mb-2 sm:mb-3 line-clamp-2">{companion.description}</p>
                  
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(companion);
                    }}
                    className="w-full py-2 rounded-full bg-card-border text-gold text-xs sm:text-sm font-medium active:bg-gold active:text-deep-navy transition-colors flex items-center justify-center gap-1.5 touch-target"
                  >
                    <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    听TA讲故事
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <section className="mt-6">
          <div className="bg-gradient-to-r from-card-bg to-card-border rounded-2xl p-4 sm:p-5 border border-card-border">
            <h3 className="font-serif font-bold text-light-blue mb-2">为什么选择旅伴？</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                <span>不同的旅伴会用不同的视角讲述同一个故事</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                <span>苏东坡会用诗词解读，林徽因会从建筑角度切入</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                <span>找到你最喜欢的声音和风格，让旅途更有趣</span>
              </li>
            </ul>
          </div>
        </section>
      </PageContent>
    </PageShell>
  );
};
