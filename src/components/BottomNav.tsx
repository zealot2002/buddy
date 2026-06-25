import { Home, Users, Navigation, Heart } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface BottomNavProps {
  onNavigate: (path: string) => void;
}

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/companions', icon: Users, label: '旅伴' },
  { path: '/routes', icon: Navigation, label: '路线' },
  { path: '/favorites', icon: Heart, label: '收藏' },
];

export const BottomNav = ({ onNavigate }: BottomNavProps) => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card-bg/95 backdrop-blur-md border-t border-card-border pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'text-gold bg-gold/10' 
                  : 'text-gray-500 hover:text-light-blue hover:bg-card-border/50'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'animate-float' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
