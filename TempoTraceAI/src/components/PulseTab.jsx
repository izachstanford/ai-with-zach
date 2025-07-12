import React from 'react';
import { Music, Clock, Users, Disc, PlayCircle, SkipForward, Headphones, Smartphone } from 'lucide-react';
import { formatNumber, formatTimeToHours, formatTimeToReadable, calculateStats } from '../utils/dataUtils';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'cyber-blue' }) => (
  <div className="stat-card">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg bg-gradient-to-br from-${color}/20 to-${color}/10`}>
        <Icon className={`w-6 h-6 text-${color}`} />
      </div>
      <div className="text-right">
        <div className={`text-2xl font-bold text-${color} glow-text`}>{value}</div>
        <div className="text-gray-400 text-sm">{subtitle}</div>
      </div>
    </div>
    <div className="text-gray-300 font-medium">{title}</div>
  </div>
);

const PulseTab = ({ data }) => {
  const stats = calculateStats(data);
  
  const statCards = [
    {
      title: 'Total Streams',
      value: formatNumber(stats.totalStreams),
      subtitle: 'lifetime plays',
      icon: PlayCircle,
      color: 'cyber-blue'
    },
    {
      title: 'Hours Listened',
      value: formatNumber(Math.round(stats.totalTime / (1000 * 60 * 60))),
      subtitle: formatTimeToHours(stats.totalTime) + ' hours',
      icon: Clock,
      color: 'cyber-purple'
    },
    {
      title: 'Unique Artists',
      value: formatNumber(stats.uniqueArtists),
      subtitle: 'discovered artists',
      icon: Users,
      color: 'cyber-pink'
    },
    {
      title: 'Unique Albums',
      value: formatNumber(stats.uniqueAlbums),
      subtitle: 'albums explored',
      icon: Disc,
      color: 'cyber-green'
    },
    {
      title: 'Unique Tracks',
      value: formatNumber(stats.uniqueTracks),
      subtitle: 'songs in library',
      icon: Music,
      color: 'neon-blue'
    },
    {
      title: 'Skip Rate',
      value: (stats.skipRate * 100).toFixed(1) + '%',
      subtitle: 'of tracks skipped',
      icon: SkipForward,
      color: 'neon-purple'
    },
    {
      title: 'Average Session',
      value: formatTimeToReadable(stats.avgSessionLength),
      subtitle: 'per song',
      icon: Headphones,
      color: 'cyber-blue'
    },
    {
      title: 'Peak Hour',
      value: stats.peakHour + ':00',
      subtitle: 'most active time',
      icon: Smartphone,
      color: 'cyber-purple'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-cyber mb-4">
          <span className="bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
            The Pulse
          </span>
        </h1>
        <p className="text-gray-400 text-lg">
          Your lifetime musical journey at a glance
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <StatCard {...stat} />
          </div>
        ))}
      </div>
      
      {/* Additional insights section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="cyber-card p-6">
          <h3 className="text-xl font-bold text-cyber-blue mb-4">Listening Habits</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Most Active Platform</span>
              <span className="text-cyber-blue font-semibold capitalize">{stats.topPlatform}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Discovery Rate</span>
              <span className="text-cyber-purple font-semibold">
                {((stats.uniqueTracks / stats.totalStreams) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Repeat Listening</span>
              <span className="text-cyber-pink font-semibold">
                {(stats.totalStreams / stats.uniqueTracks).toFixed(1)}x per song
              </span>
            </div>
          </div>
        </div>
        
        <div className="cyber-card p-6">
          <h3 className="text-xl font-bold text-cyber-green mb-4">Music Variety</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Songs per Artist</span>
              <span className="text-cyber-green font-semibold">
                {(stats.uniqueTracks / stats.uniqueArtists).toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Albums per Artist</span>
              <span className="text-neon-blue font-semibold">
                {(stats.uniqueAlbums / stats.uniqueArtists).toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Songs per Album</span>
              <span className="text-neon-purple font-semibold">
                {(stats.uniqueTracks / stats.uniqueAlbums).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PulseTab;
