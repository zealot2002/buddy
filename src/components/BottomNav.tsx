import { Compass, Footprints, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  onNavigate: (path: string) => void;
}

const navItems = [
  { path: '/', icon: Compass, label: '发现' },
  { path: '/walk', icon: Footprints, label: '边走边听' },
  { path: '/profile', icon: User, label: '我的' },
];

export const BottomNav = ({ onNavigate }: BottomNavProps) => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-app bg-card-bg/95 backdrop-blur-md border-t border-card-border pb-safe">
      <div className="flex items-center justify-around py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => onNavigate(item.path)}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 rounded-xl transition-all duration-300 touch-target',
                isActive
                  ? 'text-gold bg-gold/10'
                  : 'text-gray-500 active:text-light-blue active:bg-card-border/50',
              )}
            >
              <Icon className={cn('w-6 h-6', isActive && 'animate-float')} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
