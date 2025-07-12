import React, { useState } from 'react';
import { Trophy, Clock, PlayCircle, Filter, TrendingUp, Music, Disc, Users } from 'lucide-react';
import { 
  formatNumber, 
  formatTimeToReadable, 
  filterDataByDateRange, 
  getTopItems, 
  getTopByTime 
} from '../utils/dataUtils';

const TimeRangeSelector = ({ selectedRange, onRangeChange }) => {
  const ranges = [
    { value: 'last7days', label: '7 Days' },
    { value: 'last30days', label: '30 Days' },
    { value: 'last90days', label: '90 Days' },
    { value: 'last6months', label: '6 Months' },
    { value: 'last12months', label: '12 Months' },
    { value: 'lifetime', label: 'Lifetime' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {ranges.map(range => (
        <button
          key={range.value}
          onClick={() => onRangeChange(range.value)}
          className={`cyber-tab ${selectedRange === range.value ? 'active' : ''}`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};

const LeaderboardSection = ({ title, data, icon: Icon, color, showArtist = false }) => (
  <div className="cyber-card p-6">
    <div className="flex items-center gap-3 mb-6">
      <div className={`p-2 rounded-lg bg-gradient-to-br from-${color}/20 to-${color}/10`}>
        <Icon className={`w-5 h-5 text-${color}`} />
      </div>
      <h3 className={`text-xl font-bold text-${color}`}>{title}</h3>
    </div>
    
    <div className="space-y-3">
      {data.map((item, index) => (
        <div 
          key={index} 
          className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-${color}/10 hover:to-transparent`}
        >
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-${color} to-${color}/60 flex items-center justify-center text-white font-bold text-sm`}>
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-medium truncate">{item.name}</div>
            {showArtist && item.artist && (
              <div className="text-gray-400 text-sm truncate">{item.artist}</div>
            )}
          </div>
          <div className="text-right">
            <div className={`text-${color} font-bold`}>{formatNumber(item.count)}</div>
            <div className="text-gray-400 text-sm">{formatTimeToReadable(item.time)}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MetricToggle = ({ selected, onToggle }) => (
  <div className="flex gap-2 mb-6">
    <button
      onClick={() => onToggle('plays')}
      className={`cyber-tab ${selected === 'plays' ? 'active' : ''}`}
    >
      <PlayCircle className="w-4 h-4 mr-2" />
      Most Played
    </button>
    <button
      onClick={() => onToggle('time')}
      className={`cyber-tab ${selected === 'time' ? 'active' : ''}`}
    >
      <Clock className="w-4 h-4 mr-2" />
      Most Time
    </button>
  </div>
);

const LeaderboardTab = ({ data }) => {
  const [selectedRange, setSelectedRange] = useState('lifetime');
  const [selectedMetric, setSelectedMetric] = useState('plays');
  
  const filteredData = filterDataByDateRange(data, selectedRange);
  
  const getLeaderboardData = (key, limit = 10) => {
    return selectedMetric === 'plays' 
      ? getTopItems(filteredData, key, limit)
      : getTopByTime(filteredData, key, limit);
  };
  
  const topArtists = getLeaderboardData('artist_name');
  const topAlbums = getLeaderboardData('album_name');
  const topTracks = getLeaderboardData('track_name');

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-cyber mb-4">
          <span className="bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
            Leaderboard
          </span>
        </h1>
        <p className="text-gray-400 text-lg">
          Your musical champions across all time
        </p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1">
          <TimeRangeSelector 
            selectedRange={selectedRange} 
            onRangeChange={setSelectedRange} 
          />
        </div>
        <MetricToggle 
          selected={selectedMetric} 
          onToggle={setSelectedMetric} 
        />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <LeaderboardSection
          title="Top Artists"
          data={topArtists}
          icon={Users}
          color="cyber-blue"
        />
        
        <LeaderboardSection
          title="Top Albums"
          data={topAlbums}
          icon={Disc}
          color="cyber-purple"
          showArtist={true}
        />
        
        <LeaderboardSection
          title="Top Tracks"
          data={topTracks}
          icon={Music}
          color="cyber-pink"
          showArtist={true}
        />
      </div>
      
      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="cyber-card p-6 text-center">
          <div className="text-3xl font-bold text-cyber-blue mb-2">
            {formatNumber(filteredData.length)}
          </div>
          <div className="text-gray-400">Total Streams</div>
          <div className="text-sm text-gray-500 mt-1">
            {selectedRange === 'lifetime' ? 'All Time' : selectedRange.replace('last', 'Last ')}
          </div>
        </div>
        
        <div className="cyber-card p-6 text-center">
          <div className="text-3xl font-bold text-cyber-purple mb-2">
            {formatNumber(Math.round(filteredData.reduce((sum, item) => sum + item.ms_played, 0) / (1000 * 60 * 60)))}
          </div>
          <div className="text-gray-400">Hours Listened</div>
          <div className="text-sm text-gray-500 mt-1">
            {formatTimeToReadable(filteredData.reduce((sum, item) => sum + item.ms_played, 0))}
          </div>
        </div>
        
        <div className="cyber-card p-6 text-center">
          <div className="text-3xl font-bold text-cyber-pink mb-2">
            {formatNumber(new Set(filteredData.map(item => item.artist_name)).size)}
          </div>
          <div className="text-gray-400">Unique Artists</div>
          <div className="text-sm text-gray-500 mt-1">
            Discovered in this period
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardTab;
