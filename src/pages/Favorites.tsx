import { Heart, MapPin, User, Clock, Play, Trash2 } from 'lucide-react';
import { Header } from '../components/Header';
import { PageContent, PageShell } from '../components/PageShell';
import { useFavoritesStore } from '../store/favorites';
import { usePlayerStore } from '../store/player';
import { useNavigate } from 'react-router-dom';
import { getCompanionAvatar } from '../../api/data/media.js';

export const Favorites = () => {
  const { stories, companions, removeStory, removeCompanion } = useFavoritesStore();
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
    <PageShell withBottomNav={false}>
      <Header />
      
      <PageContent>
        <section className="mb-6">
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-light-blue mb-2">我的收藏</h1>
          <p className="text-sm text-gray-400">收藏喜欢的故事、旅伴和路线，随时回味</p>
        </section>

        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-red-500 shrink-0" />
            <h2 className="font-serif text-lg font-bold text-light-blue">收藏的故事</h2>
          </div>
          
          {stories.length === 0 ? (
            <div className="bg-card-bg rounded-2xl p-6 sm:p-8 border border-card-border text-center">
              <Heart className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-500">还没有收藏任何故事</p>
              <p className="text-sm text-gray-600 mt-1">浏览故事时点击心形图标即可收藏</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stories.map((story) => (
                <div 
                  key={story.id}
                  className="bg-card-bg rounded-xl p-3 sm:p-4 border border-card-border flex items-center gap-3 min-w-0"
                >
                  <img 
                    src={story.coverImage}
                    alt={story.title}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-semibold text-light-blue truncate text-sm sm:text-base">{story.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 truncate">{story.location.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-500 shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatDuration(story.duration)}
                      </span>
                      <div className="flex flex-wrap gap-1 min-w-0">
                        {story.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 text-[10px] bg-card-border rounded-full text-gold/70">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      type="button"
                      onClick={() => handlePlayStory(story)}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gold/20 flex items-center justify-center active:bg-gold/30 transition-colors touch-target"
                    >
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 text-gold ml-0.5" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => removeStory(story.id)}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full active:bg-card-border flex items-center justify-center text-gray-500 active:text-red-500 transition-colors touch-target"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-gold shrink-0" />
            <h2 className="font-serif text-lg font-bold text-light-blue">收藏的旅伴</h2>
          </div>
          
          {companions.length === 0 ? (
            <div className="bg-card-bg rounded-2xl p-6 sm:p-8 border border-card-border text-center">
              <User className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-500">还没有收藏任何旅伴</p>
              <p className="text-sm text-gray-600 mt-1">在旅伴页面点击心形图标即可收藏</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {companions.map((companion) => (
                <div 
                  key={companion.id}
                  className="companion-card"
                >
                  <img 
                    src={getCompanionAvatar(companion.id)}
                    alt={companion.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full object-cover border-2 border-gold/30 mb-2"
                  />
                  <h3 className="font-serif font-bold text-light-blue mb-1 line-clamp-1 text-sm sm:text-base">{companion.name}</h3>
                  <span className="inline-block px-2 py-0.5 text-[10px] sm:text-xs bg-gold/20 text-gold rounded-full mb-2">
                    {companion.style}
                  </span>
                  <button 
                    type="button"
                    onClick={() => removeCompanion(companion.id)}
                    className="text-xs text-red-500 active:text-red-400 transition-colors touch-target"
                  >
                    取消收藏
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </PageContent>
    </PageShell>
  );
};
