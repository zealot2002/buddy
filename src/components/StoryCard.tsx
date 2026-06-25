import { Play, Heart, Clock, MapPin } from 'lucide-react';
import type { Story } from '../../api/data/stories.js';
import { useFavoritesStore } from '../store/favorites';
import { usePlayerStore } from '../store/player';
import { useNavigate } from 'react-router-dom';

interface StoryCardProps {
  story: Story;
  compact?: boolean;
}

export const StoryCard = ({ story, compact = false }: StoryCardProps) => {
  const { isStoryFavorite, addStory, removeStory } = useFavoritesStore();
  const { play } = usePlayerStore();
  const navigate = useNavigate();
  const isFavorite = isStoryFavorite(story.id);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    play(story);
    navigate(`/story/${story.id}`);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      removeStory(story.id);
    } else {
      addStory(story);
    }
  };

  if (compact) {
    return (
      <div 
        className="story-card flex-shrink-0 w-64"
        onClick={() => navigate(`/story/${story.id}`)}
      >
        <div className="relative h-36">
          <img 
            src={story.coverImage} 
            alt={story.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/80 to-transparent" />
          <button 
            onClick={handlePlay}
            className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-gold/90 flex items-center justify-center hover:bg-gold transition-colors"
          >
            <Play className="w-5 h-5 text-deep-navy ml-0.5" />
          </button>
          <button 
            onClick={handleFavorite}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isFavorite ? 'bg-red-500/80' : 'bg-deep-navy/50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white text-white' : 'text-white'}`} />
          </button>
        </div>
        <div className="p-3">
          <h3 className="font-serif font-semibold text-light-blue mb-1 line-clamp-1">{story.title}</h3>
          <p className="text-xs text-gray-400 mb-2 line-clamp-2">{story.description}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(story.duration)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {formatDistance(story.distance)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {story.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="px-2 py-0.5 text-xs bg-card-border rounded-full text-gold/70">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="story-card flex-shrink-0 w-80"
      onClick={() => navigate(`/story/${story.id}`)}
    >
      <div className="relative h-44">
        <img 
          src={story.coverImage} 
          alt={story.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/90 via-deep-navy/20 to-transparent" />
        <button 
          onClick={handlePlay}
          className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-gold to-amber flex items-center justify-center hover:scale-110 transition-transform animate-pulse-glow"
        >
          <Play className="w-7 h-7 text-deep-navy ml-1" />
        </button>
        <button 
          onClick={handleFavorite}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isFavorite ? 'bg-red-500/80' : 'bg-deep-navy/50'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white text-white' : 'text-white'}`} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-serif font-bold text-lg text-light-blue mb-2">{story.title}</h3>
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{story.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDuration(story.duration)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {formatDistance(story.distance)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {story.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="px-2 py-0.5 text-xs bg-card-border rounded-full text-gold">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
