import { useStories } from '../hooks/useApi';
import { StoryCard } from '../components/StoryCard';
import { Header } from '../components/Header';
import { PageContent, PageShell } from '../components/PageShell';
import { Search, ListMusic } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Discover = () => {
  const { stories, loading, error } = useStories();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const navigate = useNavigate();

  const allTags = stories.reduce((acc, story) => {
    story.tags.forEach((tag) => {
      if (!acc.includes(tag)) acc.push(tag);
    });
    return acc;
  }, [] as string[]);

  const filteredStories = stories.filter((story) => {
    const matchesSearch =
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || story.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <PageShell>
      <Header />

      <PageContent>
        <div className="mb-5">
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-light-blue mb-1">发现</h1>
          <p className="text-sm text-gray-500 mb-3">城市故事，随时随地可听</p>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="搜索故事..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card-bg border border-card-border rounded-xl text-light-blue placeholder-gray-500 focus:outline-none focus:border-gold text-base"
            />
          </div>

          <div className="horizontal-scroll -mx-1 px-1">
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors shrink-0 ${
                !selectedTag
                  ? 'bg-gold text-deep-navy'
                  : 'bg-card-bg text-gray-400 border border-card-border'
              }`}
            >
              全部
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors shrink-0 ${
                  selectedTag === tag
                    ? 'bg-gold text-deep-navy'
                    : 'bg-card-bg text-gray-400 border border-card-border'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-center py-8 text-red-400 text-sm">
            <p>加载失败: {error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/5] bg-card-bg rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredStories.map((story) => (
              <StoryCard key={story.id} story={story} compact layout="grid" />
            ))}
          </div>
        )}
      </PageContent>

      <button
        type="button"
        onClick={() => navigate('/playlist')}
        className="fixed bottom-[calc(var(--nav-height,4.5rem)+1rem)] right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gold text-deep-navy shadow-lg shadow-gold/20 active:scale-95 transition-transform touch-target"
        aria-label="故事连播"
      >
        <ListMusic className="w-5 h-5" />
        <span className="text-sm font-semibold">故事连播</span>
      </button>
    </PageShell>
  );
};
