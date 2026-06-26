import { Heart, Users, Settings, HelpCircle, ChevronRight, MapPin, Check } from 'lucide-react';
import { Header } from '../components/Header';
import { PageContent, PageShell } from '../components/PageShell';
import { useFavoritesStore } from '../store/favorites';
import { usePreferencesStore } from '../store/preferences';
import { useCompanions } from '../hooks/useApi';
import { getCompanionAvatar } from '../../api/data/media.js';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const Profile = () => {
  const { stories, companions: favoriteCompanions } = useFavoritesStore();
  const { defaultCompanionId, setDefaultCompanionId } = usePreferencesStore();
  const { companions } = useCompanions();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Users, label: '我的旅伴', path: '/companions', badge: favoriteCompanions.length },
    { icon: Heart, label: '收藏故事', path: '/favorites', badge: stories.length },
    { icon: Settings, label: '设置', path: '/settings' },
    { icon: HelpCircle, label: '帮助与反馈', path: '/help' },
  ];

  return (
    <PageShell>
      <Header />
      
      <PageContent>
        <section className="mb-6">
          <div className="bg-gradient-to-r from-gold/20 to-amber/20 rounded-2xl p-4 sm:p-6 border border-gold/30">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gold/30 flex items-center justify-center shrink-0">
                <Users className="w-7 h-7 sm:w-10 sm:h-10 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-light-blue">AI旅伴</h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">探索世界，聆听故事</p>
              </div>
              <button type="button" className="gold-outline-button text-xs sm:text-sm px-3 sm:px-4 py-2 shrink-0 w-auto">
                登录
              </button>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="font-serif font-bold text-light-blue mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-gold shrink-0" />
            默认旅伴
          </h3>
          <p className="text-xs text-gray-500 mb-3">边走边听将始终使用此旅伴；城市故事可在播放页切换不同版本</p>
          <div className="grid grid-cols-2 gap-2">
            {companions.map((companion) => (
              <button
                key={companion.id}
                type="button"
                onClick={() => setDefaultCompanionId(companion.id)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border text-left touch-target',
                  defaultCompanionId === companion.id
                    ? 'border-gold bg-gold/10'
                    : 'border-card-border bg-card-bg',
                )}
              >
                <img src={getCompanionAvatar(companion.id)} alt={companion.name} className="w-10 h-10 rounded-full shrink-0 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-light-blue font-medium truncate">{companion.name}</p>
                  <p className="text-xs text-gray-500 truncate">{companion.style}</p>
                </div>
                {defaultCompanionId === companion.id && (
                  <Check className="w-4 h-4 text-gold shrink-0" />
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h3 className="font-serif font-bold text-light-blue mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gold shrink-0" />
            我的收藏
          </h3>
          <p className="text-xs text-gray-500 mb-3">收藏仅限城市故事，围栏感言不可收藏</p>
          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button"
              onClick={() => navigate('/favorites')}
              className="bg-card-bg rounded-2xl p-3 sm:p-4 border border-card-border active:border-gold/50 transition-colors text-center touch-target"
            >
              <Heart className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-2 text-red-500" />
              <p className="font-semibold text-light-blue text-lg">{stories.length}</p>
              <p className="text-xs text-gray-500 mt-1">收藏故事</p>
            </button>
            <button 
              type="button"
              onClick={() => navigate('/companions')}
              className="bg-card-bg rounded-2xl p-3 sm:p-4 border border-card-border active:border-gold/50 transition-colors text-center touch-target"
            >
              <Users className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-2 text-gold" />
              <p className="font-semibold text-light-blue text-lg">{favoriteCompanions.length}</p>
              <p className="text-xs text-gray-500 mt-1">收藏旅伴</p>
            </button>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="font-serif font-bold text-light-blue mb-3">功能菜单</h3>
          <div className="bg-card-bg rounded-2xl border border-card-border overflow-hidden">
            {menuItems.map((item) => (
              <button 
                key={item.label}
                type="button"
                onClick={() => navigate(item.path)}
                className="w-full px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between active:bg-card-border/50 transition-colors touch-target"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <item.icon className="w-5 h-5 text-gold shrink-0" />
                  <span className="text-light-blue text-sm sm:text-base">{item.label}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-gold/20 text-gold rounded-full">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-4">
          <div className="bg-gradient-to-r from-card-bg to-card-border rounded-2xl p-4 sm:p-5 border border-card-border">
            <h3 className="font-serif font-bold text-light-blue mb-2">关于AI旅伴</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              AI旅伴是一款沉浸式音频导览应用：发现页浏览城市故事，边走边听像聊天一样听旅伴感言，还可编排专属连播。
            </p>
            <p className="text-xs text-gray-600 mt-3">版本 1.0.0</p>
          </div>
        </section>
      </PageContent>
    </PageShell>
  );
};
