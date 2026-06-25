import { Play, Clock, MapPin, Users } from 'lucide-react';
import type { Story } from '../../api/data/stories.js';
import { usePlayerStore } from '../store/player';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getStoryCoverImage, DEFAULT_STORY_COVER } from '../../api/data/media.js';

interface StoryCardProps {
  story: Story;
  compact?: boolean;
  /** scroll: 横向滚动列表；grid: 双列网格 */
  layout?: 'scroll' | 'grid';
}

export const StoryCard = ({ story, compact = false, layout = 'grid' }: StoryCardProps) => {
  const { play } = usePlayerStore();
  const navigate = useNavigate();
  const defaultDuration = story.narrators[0]?.duration || story.duration;
  const coverSrc = getStoryCoverImage(story.id, story.coverImage);

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

  const cardWidthClass = layout === 'scroll'
    ? compact
      ? 'w-[72vw] max-w-[260px] flex-shrink-0'
      : 'w-[82vw] max-w-[320px] flex-shrink-0'
    : 'w-full';

  const imageBlock = (
    <div className={cn('relative w-full bg-card-border overflow-hidden', compact ? 'aspect-[4/3]' : 'aspect-[16/10]')}>
      <img
        src={coverSrc}
        alt={story.title}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          if (!e.currentTarget.src.includes(DEFAULT_STORY_COVER)) {
            e.currentTarget.src = DEFAULT_STORY_COVER;
          }
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/80 via-deep-navy/20 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          type="button"
          onClick={handlePlay}
          className={cn(
            'rounded-full bg-gradient-to-r from-gold to-amber flex items-center justify-center shadow-lg active:scale-95 transition-transform touch-target',
            compact ? 'w-11 h-11' : 'w-14 h-14 animate-pulse-glow',
          )}
        >
          <Play className={cn('text-deep-navy ml-0.5', compact ? 'w-5 h-5' : 'w-7 h-7')} />
        </button>
      </div>
    </div>
  );

  if (compact) {
    return (
      <div
        className={cn('story-card', cardWidthClass)}
        onClick={() => navigate(`/story/${story.id}`)}
      >
        {imageBlock}
        <div className="p-2.5 sm:p-3">
          <h3 className="font-serif font-semibold text-sm text-light-blue mb-1 line-clamp-1">{story.title}</h3>
          <p className="text-xs text-gray-400 mb-2 line-clamp-2">{story.description}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500">
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3" />
              {formatDuration(defaultDuration)}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <MapPin className="w-3 h-3" />
              {formatDistance(story.distance ?? 0)}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Users className="w-3 h-3" />
              {story.narrators.length}位
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {story.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="px-2 py-0.5 text-[10px] bg-card-border rounded-full text-gold/70">
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
      className={cn('story-card', cardWidthClass)}
      onClick={() => navigate(`/story/${story.id}`)}
    >
      {imageBlock}
      <div className="p-3 sm:p-4">
        <h3 className="font-serif font-bold text-base sm:text-lg text-light-blue mb-1.5 line-clamp-1">{story.title}</h3>
        <p className="text-xs sm:text-sm text-gray-400 mb-2 line-clamp-2">{story.description}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-500">
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {formatDuration(defaultDuration)}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {formatDistance(story.distance ?? 0)}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {story.narrators.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {story.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="px-2 py-0.5 text-[10px] sm:text-xs bg-card-border rounded-full text-gold">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
