import { Heart, Users, Settings, HelpCircle, ChevronRight, MapPin } from 'lucide-react';
import { Header } from '../components/Header';
import { useFavoritesStore } from '../store/favorites';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
  const { stories, companions } = useFavoritesStore();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Users, label: '我的旅伴', path: '/companions', badge: companions.length },
    { icon: Heart, label: '收藏故事', path: '/favorites', badge: stories.length },
    { icon: Settings, label: '设置', path: '/settings' },
    { icon: HelpCircle, label: '帮助与反馈', path: '/help' },
  ];

  return (
    <div className="min-h-screen bg-deep-navy">
      <Header />
      
      <main className="pt-16 pb-24 px-4">
        <section className="mb-8">
          <div className="bg-gradient-to-r from-gold/20 to-amber/20 rounded-2xl p-6 border border-gold/30">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gold/30 flex items-center justify-center">
                <Users className="w-10 h-10 text-gold" />
              </div>
              <div className="flex-1">
                <h2 className="font-serif text-xl font-bold text-light-blue">AI旅伴</h2>
                <p className="text-gray-400 text-sm mt-1">探索世界，聆听故事</p>
              </div>
              <button className="gold-outline-button text-sm px-4 py-2">
                登录
              </button>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h3 className="font-serif font-bold text-light-blue mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gold" />
            我的收藏
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/favorites')}
              className="bg-card-bg rounded-2xl p-4 border border-card-border hover:border-gold/50 transition-colors text-center"
            >
              <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <p className="font-semibold text-light-blue text-lg">{stories.length}</p>
              <p className="text-xs text-gray-500 mt-1">收藏故事</p>
            </button>
            <button 
              onClick={() => navigate('/companions')}
              className="bg-card-bg rounded-2xl p-4 border border-card-border hover:border-gold/50 transition-colors text-center"
            >
              <Users className="w-8 h-8 mx-auto mb-2 text-gold" />
              <p className="font-semibold text-light-blue text-lg">{companions.length}</p>
              <p className="text-xs text-gray-500 mt-1">收藏旅伴</p>
            </button>
          </div>
        </section>

        <section className="mb-8">
          <h3 className="font-serif font-bold text-light-blue mb-4">功能菜单</h3>
          <div className="bg-card-bg rounded-2xl border border-card-border overflow-hidden">
            {menuItems.map((item) => (
              <button 
                key={item.label}
                onClick={() => navigate(item.path)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-card-border/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-gold" />
                  <span className="text-light-blue">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
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

        <section className="mb-8">
          <div className="bg-gradient-to-r from-card-bg to-card-border rounded-2xl p-5 border border-card-border">
            <h3 className="font-serif font-bold text-light-blue mb-2">关于AI旅伴</h3>
            <p className="text-sm text-gray-400">
              AI旅伴是一款沉浸式音频导览应用，让你在旅途中一键召唤会讲故事、会共情、会带时代感的AI旅伴。
            </p>
            <p className="text-xs text-gray-600 mt-3">版本 1.0.0</p>
          </div>
        </section>
      </main>
    </div>
  );
};
