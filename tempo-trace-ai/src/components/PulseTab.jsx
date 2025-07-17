import React from 'react';
import { 
  Play, 
  Clock, 
  Music, 
  Users, 
  Calendar, 
  TrendingUp, 
  Headphones, 
  Globe,
  Award,
  Activity,
  BarChart3,
  Star
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, subtitle, gradient = false }) => (
  <div className="cyber-card p-6 hover:scale-105 transition-transform duration-300">
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

const TopListCard = ({ title, items, icon: Icon, showIndex = true }) => (
  <div className="cyber-card p-6">
    <div className="flex items-center gap-3 mb-4">
      <Icon className="w-5 h-5 text-cyber-blue" />
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    <div className="space-y-3">
      {items.slice(0, 10).map((item, index) => (
        <div key={index} className="flex items-center gap-3 p-3 bg-card-bg/50 rounded-lg hover:bg-card-bg/70 transition-colors">
          {showIndex && (
            <span className="text-sm font-mono text-cyber-blue w-6 text-right">
              {index + 1}
            </span>
          )}
          <div className="flex-1">
            <p className="text-white font-medium">{item[0]}</p>
            <p className="text-sm text-gray-400">{item[1].toLocaleString()} plays</p>
          </div>
          <div className="w-12 bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyber-blue to-cyber-purple h-2 rounded-full" 
              style={{ width: `${(item[1] / items[0][1]) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TimelineCard = ({ title, data, icon: Icon }) => (
  <div className="cyber-card p-6">
    <div className="flex items-center gap-3 mb-4">
      <Icon className="w-5 h-5 text-cyber-blue" />
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between p-3 bg-card-bg/50 rounded-lg">
          <span className="text-white font-medium">{key}</span>
          <div className="text-right">
            <p className="text-cyber-blue font-bold">{value.plays.toLocaleString()}</p>
            <p className="text-xs text-gray-400">{Math.round(value.ms_played / 60000).toLocaleString()} min</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PulseTab = ({ data, artistSummary }) => {
  if (!data) {
    return (
      <div className="text-center py-12">
        <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">Loading your musical pulse...</p>
      </div>
    );
  }

  const formatTime = (hours) => {
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo`;
    const years = Math.floor(days / 365);
    return `${years}y`;
  };

  const getTopHours = () => {
    const sortedHours = Object.entries(data.temporal_patterns.hourly_breakdown)
      .sort(([,a], [,b]) => b.plays - a.plays)
      .slice(0, 5);
    
    return sortedHours.map(([hour, stats]) => [
      `${hour}:00`, 
      stats.plays
    ]);
  };

  // New Discoveries helper function
  const getNewDiscoveries = () => {
    if (!artistSummary) return [];
    
    const artists = Object.entries(artistSummary);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    return artists
      .filter(([, artistData]) => {
        const firstPlayDate = new Date(artistData.first_played);
        return firstPlayDate >= oneYearAgo;
      })
      .sort(([, a], [, b]) => b.total_streams - a.total_streams)
      .slice(0, 10);
  };

  const diversityScore = Math.round(data.diversity_metrics.artist_diversity_score * 100);
  const trackingYears = Math.round(data.time_stats.tracking_span_days / 365);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Your Musical Pulse</h1>
        <p className="text-gray-400">
          {trackingYears} years of musical evolution • {data.metadata.total_records.toLocaleString()} total streams
        </p>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Clock}
          label="Total Listening Time"
          value={formatTime(data.time_stats.total_hours)}
          subtitle={`${Math.round(data.time_stats.total_days)} days of music`}
          gradient={true}
        />
        <StatCard
          icon={Play}
          label="Total Plays"
          value={data.content_stats.total_plays.toLocaleString()}
          subtitle={`${Math.round(data.content_stats.total_plays / (data.time_stats.tracking_span_days / 365))} per year`}
        />
        <StatCard
          icon={Users}
          label="Unique Artists"
          value={data.content_stats.unique_artists.toLocaleString()}
          subtitle={`${Math.round(data.content_stats.average_plays_per_artist)} plays per artist`}
        />
        <StatCard
          icon={Music}
          label="Unique Tracks"
          value={data.content_stats.unique_tracks.toLocaleString()}
          subtitle={`${Math.round(data.content_stats.average_plays_per_track)} plays per track`}
        />
      </div>

      {/* Listening Behavior */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={TrendingUp}
          label="Completion Rate"
          value={`${Math.round(data.listening_behavior.completion_rate_percentage)}%`}
          subtitle={`${data.listening_behavior.total_completions.toLocaleString()} full plays`}
        />
        <StatCard
          icon={Headphones}
          label="Offline Listening"
          value={`${Math.round(data.listening_behavior.offline_listening_percentage)}%`}
          subtitle={`${data.listening_behavior.total_offline_plays.toLocaleString()} offline plays`}
        />
        <StatCard
          icon={Award}
          label="Artist Diversity"
          value={`${diversityScore}%`}
          subtitle="Musical exploration score"
        />
        <StatCard
          icon={Globe}
          label="Countries"
          value={data.geographical_stats.countries_streamed_from}
          subtitle={`${data.geographical_stats.top_countries[0][0]} most played`}
        />
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopListCard
          title="Top Artists"
          items={data.top_lists.top_artists}
          icon={Users}
        />
        <TopListCard
          title="Top Tracks"
          items={data.top_lists.top_tracks}
          icon={Music}
        />
        <TopListCard
          title="Top Albums"
          items={data.top_lists.top_albums}
          icon={Award}
        />
      </div>

      {/* Temporal Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimelineCard
          title="Peak Listening Hours"
          data={Object.fromEntries(getTopHours().map(([hour, plays]) => [hour, { plays, ms_played: 0 }]))}
          icon={Clock}
        />
        <TimelineCard
          title="Seasonal Patterns"
          data={data.temporal_patterns.seasonal_breakdown}
          icon={Calendar}
        />
      </div>

      {/* New Discoveries */}
      <div className="cyber-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-5 h-5 text-cyber-blue" />
          <h3 className="text-lg font-semibold text-white">New Discoveries</h3>
        </div>
        <div className="space-y-3">
          {getNewDiscoveries().map(([artist, artistData], index) => (
            <div key={artist} className="flex items-center gap-3 p-3 bg-card-bg/50 rounded-lg hover:bg-card-bg/70 transition-colors">
              <span className="text-sm font-mono text-cyber-blue w-6 text-right">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="text-white font-medium">{artist}</p>
                <p className="text-sm text-gray-400">
                  First played: {new Date(artistData.first_played).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-cyber-blue font-bold">{artistData.total_streams.toLocaleString()}</p>
                <p className="text-xs text-gray-400">streams</p>
              </div>
              <div className="w-12 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyber-blue to-cyber-purple h-2 rounded-full" 
                  style={{ width: `${index === 0 ? 100 : (artistData.total_streams / getNewDiscoveries()[0][1].total_streams) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {getNewDiscoveries().length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No new discoveries found in the past year</p>
            </div>
          )}
        </div>
      </div>

      {/* Musical Milestones */}
      <div className="cyber-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-5 h-5 text-cyber-blue" />
          <h3 className="text-lg font-semibold text-white">Musical Milestones</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-card-bg/50 rounded-lg">
              <p className="text-sm text-gray-400">First Track Ever</p>
              <p className="text-white font-medium">{data.milestones.first_track_played.track}</p>
              <p className="text-cyber-blue text-sm">by {data.milestones.first_track_played.artist}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(data.milestones.first_track_played.timestamp).toLocaleDateString()}
              </p>
            </div>
            <div className="p-4 bg-card-bg/50 rounded-lg">
              <p className="text-sm text-gray-400">Longest Track</p>
              <p className="text-white font-medium">{data.milestones.longest_track_played.master_metadata_track_name}</p>
              <p className="text-cyber-blue text-sm">by {data.milestones.longest_track_played.master_metadata_album_artist_name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(data.milestones.longest_track_played.ms_played / 60000)} minutes
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-card-bg/50 rounded-lg">
              <p className="text-sm text-gray-400">Most Recent Track</p>
              <p className="text-white font-medium">{data.milestones.most_recent_track.track}</p>
              <p className="text-cyber-blue text-sm">by {data.milestones.most_recent_track.artist}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(data.milestones.most_recent_track.timestamp).toLocaleDateString()}
              </p>
            </div>
            <div className="p-4 bg-card-bg/50 rounded-lg">
              <p className="text-sm text-gray-400">Listening Consistency</p>
              <p className="text-white font-medium">{data.milestones.days_with_listening.toLocaleString()} days</p>
              <p className="text-cyber-blue text-sm">with music</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(data.milestones.average_daily_listening_minutes)} min/day average
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Music Providers - Full Width */}
      <div className="cyber-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-cyber-blue" />
          <h3 className="text-lg font-semibold text-white">Music Providers</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(data.provider_stats.distribution).map(([provider, plays]) => (
            <div key={provider} className="space-y-3 p-4 bg-card-bg/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium text-lg">{provider}</span>
                <span className="text-cyber-blue font-bold">{plays.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-cyber-blue to-cyber-purple h-4 rounded-full" 
                  style={{ width: `${(plays / data.content_stats.total_plays) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-400">
                {Math.round((plays / data.content_stats.total_plays) * 100)}% of total plays
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PulseTab;
