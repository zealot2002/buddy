import { useStories } from '../hooks/useApi';
import { StoryCard } from '../components/StoryCard';
import { Header } from '../components/Header';
import { Search, Filter } from 'lucide-react';
import { useState } from 'react';

export const StoriesPage = () => {
  const { stories, loading, error } = useStories();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags from stories
  const allTags = stories.reduce((acc, story) => {
    story.tags.forEach(tag => {
      if (!acc.includes(tag)) acc.push(tag);
    });
    return acc;
  }, [] as string[]);

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          story.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || story.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-deep-navy">
      <Header />
      
      <main className="pt-16 pb-24 px-4">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-light-blue mb-4">全部故事</h1>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索故事..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-card-bg border border-card-border rounded-xl text-light-blue placeholder-gray-500 focus:outline-none focus:border-gold"
            />
          </div>

          {/* Category filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                !selectedTag 
                  ? 'bg-gold text-deep-navy' 
                  : 'bg-card-bg text-gray-400 border border-card-border'
              }`}
            >
              全部
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
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
          <div className="text-center py-8 text-red-400">
            <p>加载失败: {error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/5] bg-card-bg rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredStories.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredStories.map((story) => (
              <StoryCard key={story.id} story={story} compact />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>没有找到匹配的故事</p>
          </div>
        )}
      </main>
    </div>
  );
};