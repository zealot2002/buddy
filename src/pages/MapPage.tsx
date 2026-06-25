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
    if (searchQuery.length > 0) {
      setShowStoriesList(true);
    } else {
      setShowStoriesList(false);
    }
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
    <div className="min-h-screen bg-deep-navy flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-deep-navy via-deep-navy/95 to-transparent pt-4 pb-8 px-4">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 rounded-full bg-card-bg/50 border border-card-border"
          >
            <ChevronRight className="w-5 h-5 text-light-blue rotate-180" />
          </button>
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="搜索城市或地点..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card-bg/80 backdrop-blur-sm border border-card-border rounded-full py-2 pl-10 pr-4 text-light-blue text-sm placeholder-gray-500 focus:outline-none focus:border-gold/50"
              />
            </div>
          </div>
        </div>

        {showPanel && !showStoriesList && (
          <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl border border-card-border overflow-hidden max-h-64 overflow-y-auto">
            <div className="p-3 border-b border-card-border">
              <p className="text-sm text-gray-400 font-medium">热门城市</p>
            </div>
            <div className="grid grid-cols-4 gap-2 p-2">
              {filteredCities.map((c) => (
                <button
                  key={c.name}
                  onClick={() => handleCitySelect(c)}
                  className={`py-2 px-3 rounded-xl text-sm hover:bg-card-border transition-colors flex flex-col items-center gap-1 ${
                    c.name === city ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-card-bg text-light-blue'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {showStoriesList && (
          <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl border border-card-border overflow-hidden max-h-64 overflow-y-auto">
            <div className="p-3 border-b border-card-border">
              <p className="text-sm text-gray-400 font-medium">搜索结果</p>
            </div>
            <div className="p-2 space-y-2">
              {filteredStories.length > 0 ? (
                filteredStories.map((story) => (
                  <button
                    key={story.id}
                    onClick={() => {
                      setLocation(story.location.lat, story.location.lng, story.location.name);
                      navigate(`/story/${story.id}`);
                    }}
                    className="w-full flex items-center gap-3 p-2 bg-card-bg/50 rounded-xl hover:bg-card-border/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden">
                      <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm text-light-blue font-medium">{story.title}</p>
                      <p className="text-xs text-gray-500">{story.location.name}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
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

      <div className="flex-1 relative mt-32">
        <div className="absolute inset-0 bg-card-bg rounded-t-3xl overflow-hidden">
          <img 
            src={staticMapUrl} 
            alt="地图" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/60 to-transparent" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gold/30 border-4 border-gold flex items-center justify-center animate-pulse">
                <div className="w-4 h-4 rounded-full bg-gold" />
              </div>
              <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-light-blue text-sm font-medium whitespace-nowrap">
                {city}
              </p>
            </div>
          </div>

          {stories.slice(0, 4).map((story, index) => {
            const angle = (index * 90 - 90) * (Math.PI / 180);
            const radius = 100;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return (
              <button
                key={story.id}
                className="absolute w-12 h-12 rounded-full bg-card-bg border-2 border-gold flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg"
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
                  className="w-10 h-10 rounded-full object-cover"
                />
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowPanel(!showPanel)}
          className="absolute top-4 right-4 z-40 p-3 bg-card-bg/90 backdrop-blur-sm rounded-full border border-card-border shadow-lg"
        >
          {showPanel ? (
            <Mountain className="w-5 h-5 text-gold" />
          ) : (
            <Camera className="w-5 h-5 text-light-blue" />
          )}
        </button>
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-40">
        <div className="bg-card-bg/95 backdrop-blur-sm rounded-2xl p-4 border border-card-border shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gold" />
              <span className="font-serif font-semibold text-light-blue">当前位置</span>
            </div>
            <button 
              onClick={handleConfirm}
              className="px-4 py-2 bg-gradient-to-r from-gold to-amber text-deep-navy font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              确认
            </button>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleLocate}
              className="flex-1 py-2 bg-card-border rounded-xl text-gray-300 text-sm flex items-center justify-center gap-2 hover:bg-card-border/80 transition-colors"
            >
              <Crosshair className="w-4 h-4" />
              重新定位
            </button>
            <button 
              onClick={() => setShowPanel(true)}
              className="flex-1 py-2 bg-card-border rounded-xl text-gray-300 text-sm flex items-center justify-center gap-2 hover:bg-card-border/80 transition-colors"
            >
              <Building2 className="w-4 h-4" />
              切换城市
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
