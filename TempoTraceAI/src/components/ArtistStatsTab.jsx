import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  Music, 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Search,
  Award,
  Play,
  Headphones,
  MapPin,
  Star,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';

const ArtistCard = ({ artist, data, isExpanded, onClick }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div 
      className={`cyber-card p-6 cursor-pointer transition-all duration-300 ${
        isExpanded ? 'ring-2 ring-cyber-blue' : 'hover:scale-102'
      }`}
      onClick={() => onClick(artist)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">{artist}</h3>
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-gray-400">{data.total_streams} plays</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-400">Total Time</p>
          <p className="text-white font-medium">{Math.round(data.total_hours)}h</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Unique Tracks</p>
          <p className="text-white font-medium">{data.unique_tracks}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Peak Year</p>
          <p className="text-white font-medium">{data.peak_year}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Active Years</p>
          <p className="text-white font-medium">{data.years_active}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>First: {formatDate(data.first_played)}</span>
        <span>Last: {formatDate(data.last_played)}</span>
      </div>

      {isExpanded && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-3">Top Tracks</h4>
              <div className="space-y-2">
                {data.top_tracks.slice(0, 5).map((track, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-card-bg/30 rounded">
                    <span className="text-white text-sm">{track[0]}</span>
                    <span className="text-cyber-blue text-sm">{track[1]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Listening Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Completion Rate</span>
                  <span className="text-white">{Math.round(data.completion_rate_percentage)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Skip Rate</span>
                  <span className="text-white">{Math.round(data.skip_rate_percentage)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Offline Listening</span>
                  <span className="text-white">{Math.round(data.offline_percentage)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Track Length</span>
                  <span className="text-white">{Math.round(data.avg_track_length_minutes)}m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, subtitle, gradient = false }) => (
  <div className="cyber-card p-6">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${gradient ? 'bg-gradient-to-r from-cyber-blue to-cyber-purple' : 'bg-cyber-blue/20'}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const TopArtistsChart = ({ artists }) => {
  const maxStreams = Math.max(...artists.map(([, data]) => data.total_streams));
  
  return (
    <div className="cyber-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="w-5 h-5 text-cyber-blue" />
        <h3 className="text-lg font-semibold text-white">Top Artists by Streams</h3>
      </div>
      <div className="space-y-3">
        {artists.slice(0, 10).map(([artist, data], index) => (
          <div key={artist} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-cyber-blue w-6 text-right">
                  {index + 1}
                </span>
                <span className="text-white font-medium">{artist}</span>
              </div>
              <div className="text-right">
                <p className="text-cyber-blue font-bold">{data.total_streams.toLocaleString()}</p>
                <p className="text-xs text-gray-400">{Math.round(data.total_hours)}h</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-cyber-blue to-cyber-purple h-2 rounded-full" 
                style={{ width: `${(data.total_streams / maxStreams) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ArtistStatsTab = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('streams');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterMinStreams, setFilterMinStreams] = useState(0);
  const [expandedArtist, setExpandedArtist] = useState(null);

  if (!data) {
    return (
      <div className="text-center py-12">
        <Compass className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">Loading your artist compass...</p>
      </div>
    );
  }

  const artists = Object.entries(data);
  const totalArtists = artists.length;
  
  const filteredAndSortedArtists = useMemo(() => {
    let filtered = artists.filter(([artist, artistData]) => {
      const matchesSearch = artist.toLowerCase().includes(searchTerm.toLowerCase());
      const meetsMinStreams = artistData.total_streams >= filterMinStreams;
      return matchesSearch && meetsMinStreams;
    });

    filtered.sort(([, a], [, b]) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'streams':
          aVal = a.total_streams;
          bVal = b.total_streams;
          break;
        case 'hours':
          aVal = a.total_hours;
          bVal = b.total_hours;
          break;
        case 'tracks':
          aVal = a.unique_tracks;
          bVal = b.unique_tracks;
          break;
        case 'years':
          aVal = a.years_active;
          bVal = b.years_active;
          break;
        case 'alphabetical':
          return sortOrder === 'asc' 
            ? a.localeCompare(b)
            : b.localeCompare(a);
        default:
          aVal = a.total_streams;
          bVal = b.total_streams;
      }
      
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    // If no search term, limit to top 20 for performance
    if (!searchTerm.trim() && filterMinStreams === 0) {
      return filtered.slice(0, 20);
    }

    return filtered;
  }, [artists, searchTerm, sortBy, sortOrder, filterMinStreams]);

  const displayedCount = filteredAndSortedArtists.length;
  const isShowingAll = searchTerm.trim() || filterMinStreams > 0;
  
  const totalStreams = artists.reduce((sum, [, data]) => sum + data.total_streams, 0);
  const totalHours = artists.reduce((sum, [, data]) => sum + data.total_hours, 0);
  const avgStreamsPerArtist = totalStreams / totalArtists;

  const getLoyaltyArtists = () => {
    return artists
      .filter(([, data]) => data.years_active >= 3)
      .sort(([, a], [, b]) => b.years_active - a.years_active)
      .slice(0, 5);
  };

  const getDiscoveryArtists = () => {
    const currentYear = new Date().getFullYear();
    return artists
      .filter(([, data]) => new Date(data.first_played).getFullYear() === currentYear)
      .sort(([, a], [, b]) => b.total_streams - a.total_streams)
      .slice(0, 5);
  };

  const getConsistentArtists = () => {
    return artists
      .filter(([, data]) => data.days_active >= 30)
      .sort(([, a], [, b]) => (b.total_streams / b.days_active) - (a.total_streams / a.days_active))
      .slice(0, 5);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Artist Stats</h1>
        <p className="text-gray-400">
          Navigate your musical universe • {totalArtists} artists discovered
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Artists"
          value={totalArtists.toLocaleString()}
          subtitle="in your library"
          gradient={true}
        />
        <StatCard
          icon={Play}
          label="Total Streams"
          value={totalStreams.toLocaleString()}
          subtitle="across all artists"
        />
        <StatCard
          icon={Clock}
          label="Total Hours"
          value={Math.round(totalHours).toLocaleString()}
          subtitle="of music"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg per Artist"
          value={Math.round(avgStreamsPerArtist)}
          subtitle="streams per artist"
        />
      </div>

      {/* Artist Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="cyber-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-5 h-5 text-cyber-blue" />
            <h3 className="text-lg font-semibold text-white">Loyalty Champions</h3>
          </div>
          <div className="space-y-3">
            {getLoyaltyArtists().map(([artist, data], index) => (
              <div key={artist} className="flex items-center justify-between p-3 bg-card-bg/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{artist}</p>
                  <p className="text-sm text-gray-400">{data.years_active} years</p>
                </div>
                <div className="text-right">
                  <p className="text-cyber-blue font-bold">{data.total_streams}</p>
                  <p className="text-xs text-gray-400">streams</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cyber-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-5 h-5 text-cyber-blue" />
            <h3 className="text-lg font-semibold text-white">New Discoveries</h3>
          </div>
          <div className="space-y-3">
            {getDiscoveryArtists().map(([artist, data], index) => (
              <div key={artist} className="flex items-center justify-between p-3 bg-card-bg/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{artist}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(data.first_played).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-cyber-blue font-bold">{data.total_streams}</p>
                  <p className="text-xs text-gray-400">streams</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cyber-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Headphones className="w-5 h-5 text-cyber-blue" />
            <h3 className="text-lg font-semibold text-white">Consistent Favorites</h3>
          </div>
          <div className="space-y-3">
            {getConsistentArtists().map(([artist, data], index) => (
              <div key={artist} className="flex items-center justify-between p-3 bg-card-bg/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{artist}</p>
                  <p className="text-sm text-gray-400">{data.days_active} days</p>
                </div>
                <div className="text-right">
                  <p className="text-cyber-blue font-bold">
                    {Math.round(data.total_streams / data.days_active)}
                  </p>
                  <p className="text-xs text-gray-400">per day</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Artists Chart */}
      <TopArtistsChart artists={artists} />

      {/* Search and Filter Controls */}
      <div className="cyber-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-cyber-blue" />
          <h3 className="text-lg font-semibold text-white">Explore Artists</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search artists..."
              className="w-full pl-10 pr-4 py-2 bg-card-bg border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyber-blue focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 bg-card-bg border border-gray-600 rounded-lg text-white focus:border-cyber-blue focus:outline-none"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="streams">Sort by Streams</option>
            <option value="hours">Sort by Hours</option>
            <option value="tracks">Sort by Tracks</option>
            <option value="years">Sort by Years Active</option>
            <option value="alphabetical">Sort Alphabetically</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-card-bg border border-gray-600 rounded-lg text-white hover:border-cyber-blue transition-colors"
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </button>
          <input
            type="number"
            placeholder="Min streams"
            className="px-4 py-2 bg-card-bg border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyber-blue focus:outline-none"
            value={filterMinStreams}
            onChange={(e) => setFilterMinStreams(parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Artist Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Artists
          </h2>
          <div className="flex items-center gap-4">
            <p className="text-gray-400">
              Showing {displayedCount.toLocaleString()} of {totalArtists.toLocaleString()} artists
            </p>
            {!isShowingAll && (
              <p className="text-sm text-cyber-blue">
                Search to see all artists
              </p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedArtists.map(([artist, artistData]) => (
            <ArtistCard
              key={artist}
              artist={artist}
              data={artistData}
              isExpanded={expandedArtist === artist}
              onClick={setExpandedArtist}
            />
          ))}
        </div>
        
        {filteredAndSortedArtists.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No artists found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistStatsTab;
