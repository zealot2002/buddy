import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronRight, Crosshair, Building2, Mountain, Camera } from 'lucide-react';
import { useLocationStore } from '../store/location';
import { useStories } from '../hooks/useApi';

const hotCities = [
  { name: '北京', lat: 39.9042, lng: 116.4074 },
  { name: '上海', lat: 31.2304, lng: 121.4737 },
  { name: '西安', lat: 34.3416, lng: 108.9398 },
  { name: '成都', lat: 30.5728, lng: 104.0668 },
  { name: '杭州', lat: 30.2741, lng: 120.1551 },
  { name: '南京', lat: 32.0603, lng: 118.7969 },
  { name: '苏州', lat: 31.2990, lng: 120.5853 },
  { name: '重庆', lat: 29.4316, lng: 106.9123 },
];

export const MapPage = () => {
  const { lat, lng, city, setLocation } = useLocationStore();
  const { stories } = useStories();
  const [searchQuery, setSearchQuery] = useState('');
  const [showPanel, setShowPanel] = useState(true);
  const [showStoriesList, setShowStoriesList] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setShowStoriesList(searchQuery.length > 0);
  }, [searchQuery]);

  const handleCitySelect = (cityData: { name: string; lat: number; lng: number }) => {
    setLocation(cityData.lat, cityData.lng, cityData.name);
    setShowPanel(false);
  };

  const handleLocate = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords.latitude, position.coords.longitude, '当前位置');
        },
        (error) => {
          console.error('Failed to get location:', error);
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    }
  };

  const handleConfirm = () => {
    navigate('/');
  };

  const filteredCities = hotCities.filter(c => 
    c.name.includes(searchQuery)
  );

  const filteredStories = stories.filter(story => 
    story.title.includes(searchQuery) || 
    story.location.name.includes(searchQuery)
  );

  const staticMapUrl = `https://static-maps.yandex.ru/1.x/?ll=${lng},${lat}&z=12&size=600,450&l=map`;

  return (
    <div className="min-h-screen min-h-dvh bg-deep-navy flex flex-col pb-safe">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-app bg-gradient-to-b from-deep-navy via-deep-navy/95 to-transparent pt-safe pb-4 px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-3">
          <button 
            type="button"
            onClick={() => navigate('/')}
            className="p-2 rounded-full bg-card-bg/50 border border-card-border touch-target shrink-0"
          >
            <ChevronRight className="w-5 h-5 text-light-blue rotate-180" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input 
                type="search"
                placeholder="搜索城市或地点..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card-bg/80 backdrop-blur-sm border border-card-border rounded-full py-2 pl-9 pr-4 text-light-blue text-sm placeholder-gray-500 focus:outline-none focus:border-gold/50"
              />
            </div>
          </div>
        </div>

        {showPanel && !showStoriesList && (
          <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl border border-card-border overflow-hidden max-h-52 overflow-y-auto">
            <div className="p-3 border-b border-card-border">
              <p className="text-sm text-gray-400 font-medium">热门城市</p>
            </div>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 p-2">
              {filteredCities.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handleCitySelect(c)}
                  className={`py-2 px-1 sm:px-2 rounded-xl text-xs sm:text-sm active:bg-card-border transition-colors flex flex-col items-center gap-1 touch-target ${
                    c.name === city ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-card-bg text-light-blue'
                  }`}
                >
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="truncate w-full text-center">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {showStoriesList && (
          <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl border border-card-border overflow-hidden max-h-52 overflow-y-auto">
            <div className="p-3 border-b border-card-border">
              <p className="text-sm text-gray-400 font-medium">搜索结果</p>
            </div>
            <div className="p-2 space-y-2">
              {filteredStories.length > 0 ? (
                filteredStories.map((story) => (
                  <button
                    key={story.id}
                    type="button"
                    onClick={() => {
                      setLocation(story.location.lat, story.location.lng, story.location.name);
                      navigate(`/story/${story.id}`);
                    }}
                    className="w-full flex items-center gap-3 p-2 bg-card-bg/50 rounded-xl active:bg-card-border/50 transition-colors min-w-0 touch-target"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm text-light-blue font-medium truncate">{story.title}</p>
                      <p className="text-xs text-gray-500 truncate">{story.location.name}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  未找到相关地点
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 relative mt-28 sm:mt-32 min-h-0">
        <div className="absolute inset-0 bg-card-bg rounded-t-3xl overflow-hidden">
          <img 
            src={staticMapUrl} 
            alt="地图" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/60 to-transparent" />
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gold/30 border-4 border-gold flex items-center justify-center animate-pulse">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gold" />
              </div>
              <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-light-blue text-xs sm:text-sm font-medium whitespace-nowrap max-w-[120px] truncate">
                {city}
              </p>
            </div>
          </div>

          {stories.slice(0, 4).map((story, index) => {
            const angle = (index * 90 - 90) * (Math.PI / 180);
            const radius = 72;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return (
              <button
                key={story.id}
                type="button"
                className="absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card-bg border-2 border-gold flex items-center justify-center cursor-pointer active:scale-110 transition-transform shadow-lg touch-target"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
                onClick={() => navigate(`/story/${story.id}`)}
              >
                <img 
                  src={story.coverImage} 
                  alt={story.title}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowPanel(!showPanel)}
          className="absolute top-3 right-3 z-40 p-2.5 sm:p-3 bg-card-bg/90 backdrop-blur-sm rounded-full border border-card-border shadow-lg touch-target"
        >
          {showPanel ? (
            <Mountain className="w-5 h-5 text-gold" />
          ) : (
            <Camera className="w-5 h-5 text-light-blue" />
          )}
        </button>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-40 w-full max-w-app px-3 sm:px-4 pb-safe">
        <div className="bg-card-bg/95 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-card-border shadow-xl mb-3">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-5 h-5 text-gold shrink-0" />
              <span className="font-serif font-semibold text-light-blue truncate">当前位置</span>
            </div>
            <button 
              type="button"
              onClick={handleConfirm}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-gold to-amber text-deep-navy text-sm font-medium rounded-xl active:opacity-90 transition-opacity shrink-0 touch-target"
            >
              确认
            </button>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button 
              type="button"
              onClick={handleLocate}
              className="flex-1 py-2 bg-card-border rounded-xl text-gray-300 text-xs sm:text-sm flex items-center justify-center gap-1.5 active:bg-card-border/80 transition-colors touch-target min-w-0"
            >
              <Crosshair className="w-4 h-4 shrink-0" />
              <span className="truncate">重新定位</span>
            </button>
            <button 
              type="button"
              onClick={() => setShowPanel(true)}
              className="flex-1 py-2 bg-card-border rounded-xl text-gray-300 text-xs sm:text-sm flex items-center justify-center gap-1.5 active:bg-card-border/80 transition-colors touch-target min-w-0"
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span className="truncate">切换城市</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
