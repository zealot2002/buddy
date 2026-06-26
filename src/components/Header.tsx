import { MapPin } from 'lucide-react';
import { useLocationStore } from '../store/location';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { city, isLocating } = useLocationStore();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-app bg-deep-navy/90 backdrop-blur-md border-b border-card-border pt-safe">
      <div className="px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 min-w-0">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 min-w-0 shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gold to-amber flex items-center justify-center shrink-0">
            <span className="text-deep-navy font-serif font-bold text-sm">听</span>
          </div>
          <span className="font-serif text-lg sm:text-xl font-bold text-gradient truncate">AI旅伴</span>
        </button>
        
        <button 
          type="button"
          className="flex items-center gap-1 min-w-0 max-w-[45%] px-2.5 sm:px-3 py-1.5 rounded-full bg-card-bg border border-card-border text-light-blue text-xs sm:text-sm transition-colors touch-target"
        >
          <MapPin className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold shrink-0 ${isLocating ? 'animate-pulse' : ''}`} />
          <span className="truncate">{city}</span>
        </button>
      </div>
    </header>
  );
};
