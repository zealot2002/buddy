import { MapPin, Search, User } from 'lucide-react';
import { useLocationStore } from '../store/location';

export const Header = () => {
  const { city, isLocating } = useLocationStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-deep-navy/80 backdrop-blur-md border-b border-card-border">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gold to-amber flex items-center justify-center">
            <span className="text-deep-navy font-serif font-bold text-sm">听</span>
          </div>
          <span className="font-serif text-xl font-bold text-gradient">AI旅伴</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-card-bg border border-card-border text-light-blue text-sm">
            <MapPin className={`w-4 h-4 text-gold ${isLocating ? 'animate-pulse' : ''}`} />
            <span>{city}</span>
          </button>
          <button className="p-2 rounded-full hover:bg-card-bg transition-colors">
            <Search className="w-5 h-5 text-light-blue" />
          </button>
          <button className="p-2 rounded-full hover:bg-card-bg transition-colors">
            <User className="w-5 h-5 text-light-blue" />
          </button>
        </div>
      </div>
    </header>
  );
};
