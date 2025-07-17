import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { 
  Trophy, 
  Calendar, 
  Music, 
  Users, 
  Clock, 
  TrendingUp, 
  Award,
  BarChart3,
  Headphones,
  Smartphone,
  Play
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

const TopListCard = ({ title, items, icon: Icon }) => (
  <div className="cyber-card p-6">
    <div className="flex items-center gap-3 mb-4">
      <Icon className="w-5 h-5 text-cyber-blue" />
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    <div className="space-y-3">
      {items.slice(0, 10).map((item, index) => (
        <div key={index} className="flex items-center gap-3 p-3 bg-card-bg/50 rounded-lg hover:bg-card-bg/70 transition-colors">
          <span className="text-sm font-mono text-cyber-blue w-6 text-right">
            {index + 1}
          </span>
          <div className="flex-1">
            <p className="text-white font-medium">{item[0]}</p>
            <p className="text-sm text-gray-400">{item[1].toLocaleString()} plays</p>
          </div>
          <div className="w-16 bg-gray-700 rounded-full h-2">
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

const HoursListenedChart = ({ data }) => {
  const years = Object.keys(data).sort();
  const hoursData = years.map(year => Math.round(data[year].year_stats.total_hours));
  
  const chartData = {
    labels: years,
    datasets: [{
      label: 'Hours Listened',
      data: hoursData,
      borderColor: '#00f5ff',
      backgroundColor: 'rgba(0, 245, 255, 0.1)',
      fill: true,
      pointStyle: 'circle',
      pointBackgroundColor: '#00f5ff',
      pointBorderColor: '#00f5ff',
      pointRadius: 4,
      tension: 0.3
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 26, 0.9)',
        titleColor: '#00f5ff',
        bodyColor: '#ffffff',
        borderColor: '#00f5ff',
        borderWidth: 1,
        callbacks: {
          label: (context) => `${context.parsed.y.toLocaleString()} hours`
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ffffff'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ffffff'
        },
        title: {
          display: true,
          text: 'Hours Listened',
          color: '#ffffff'
        }
      }
    }
  };

  return (
    <div className="cyber-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="w-5 h-5 text-cyber-blue" />
        <h3 className="text-lg font-semibold text-white">Hours Listened by Year</h3>
      </div>
      <div className="chart-container" style={{ height: '300px' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

const LeaderboardTab = ({ data }) => {
  const [selectedYear, setSelectedYear] = useState(null);

  if (!data) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">Loading your annual leaderboards...</p>
      </div>
    );
  }

  const years = Object.keys(data).sort().reverse();
  const currentYear = selectedYear || years[0];
  const currentData = data[currentYear];

  if (!currentData) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">No data available for the selected year.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Annual Leaderboards</h1>
        <p className="text-gray-400">
          Explore your musical evolution year by year • {years.length} years of data
        </p>
      </div>

      {/* Hours Listened Chart */}
      <HoursListenedChart data={data} />

      {/* Sticky Year Selection */}
      <div className="sticky top-16 z-20 bg-dark-bg/95 backdrop-blur-md border-b border-cyber-blue/20 py-4">
        <div className="max-w-md mx-auto">
          <label className="block text-sm font-medium text-gray-300 mb-2">Select Year</label>
          <select
            value={currentYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-4 py-3 bg-card-bg border border-gray-600 rounded-lg text-white focus:border-cyber-blue focus:outline-none appearance-none cursor-pointer"
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year} • {data[year].year_stats.total_plays.toLocaleString()} plays • {Math.round(data[year].year_stats.total_hours)}h
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Year Overview */}
      <div className="text-center border-t border-gray-700 pt-8">
        <h2 className="text-3xl font-bold text-white mb-4">{currentYear} Music Recap</h2>
        <div className="flex justify-center items-center gap-4 text-gray-400">
          <span>{formatDate(currentData.year_stats.first_play)}</span>
          <span>•</span>
          <span>{formatDate(currentData.year_stats.last_play)}</span>
        </div>
      </div>

      {/* Key Stats for Selected Year */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Play}
          label="Total Plays"
          value={currentData.year_stats.total_plays.toLocaleString()}
          subtitle={`${Math.round(currentData.year_stats.total_plays / 365)} per day`}
          gradient={true}
        />
        <StatCard
          icon={Clock}
          label="Total Hours"
          value={Math.round(currentData.year_stats.total_hours)}
          subtitle={`${Math.round(currentData.year_stats.average_daily_minutes)} min/day`}
        />
        <StatCard
          icon={Users}
          label="Unique Artists"
          value={currentData.year_stats.unique_artists}
          subtitle={`${currentData.year_stats.unique_tracks} unique tracks`}
        />
        <StatCard
          icon={Calendar}
          label="Peak Month"
          value={currentData.year_stats.peak_month}
          subtitle={`${currentData.year_stats.peak_month_plays} plays`}
        />
      </div>

      {/* Listening Behavior for Selected Year */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={TrendingUp}
          label="Completion Rate"
          value={`${Math.round(currentData.year_stats.completion_rate_percentage)}%`}
          subtitle="Tracks played fully"
        />
        <StatCard
          icon={Headphones}
          label="Skip Rate"
          value={`${Math.round(currentData.year_stats.skip_rate_percentage)}%`}
          subtitle="Tracks skipped"
        />
        <StatCard
          icon={Award}
          label="Offline Listening"
          value={`${Math.round(currentData.year_stats.offline_percentage)}%`}
          subtitle="Offline plays"
        />
        <StatCard
          icon={Smartphone}
          label="Top Platform"
          value={currentData.year_stats.top_platform[0]}
          subtitle={`${currentData.year_stats.top_platform[1]} plays`}
        />
      </div>

      {/* Provider Breakdown */}
      <div className="cyber-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Music className="w-5 h-5 text-cyber-blue" />
          <h3 className="text-lg font-semibold text-white">Streaming Providers</h3>
        </div>
        <div className="space-y-4">
          {Object.entries(currentData.year_stats.provider_breakdown).map(([provider, plays]) => (
            <div key={provider} className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white font-medium">{provider}</span>
                <span className="text-cyber-blue font-bold">{plays.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-cyber-blue to-cyber-purple h-3 rounded-full" 
                  style={{ width: `${(plays / currentData.year_stats.total_plays) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">
                {Math.round((plays / currentData.year_stats.total_plays) * 100)}% of total plays
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Lists for Selected Year */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopListCard
          title="Top Artists"
          items={currentData.top_artists}
          icon={Users}
        />
        <TopListCard
          title="Top Tracks"
          items={currentData.top_tracks}
          icon={Music}
        />
        <TopListCard
          title="Top Albums"
          items={currentData.top_albums}
          icon={Award}
        />
      </div>

      {/* Historical Context */}
      <div className="cyber-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-5 h-5 text-cyber-blue" />
          <h3 className="text-lg font-semibold text-white">Historical Context</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-card-bg/50 rounded-lg">
              <p className="text-sm text-gray-400">Peak Listening Year</p>
              <p className="text-white font-medium">
                {Object.entries(data)
                  .sort(([,a], [,b]) => b.year_stats.total_plays - a.year_stats.total_plays)[0][0]}
              </p>
              <p className="text-cyber-blue text-sm">
                {Object.entries(data)
                  .sort(([,a], [,b]) => b.year_stats.total_plays - a.year_stats.total_plays)[0][1]
                  .year_stats.total_plays.toLocaleString()} plays
              </p>
            </div>
            <div className="p-4 bg-card-bg/50 rounded-lg">
              <p className="text-sm text-gray-400">Most Diverse Year</p>
              <p className="text-white font-medium">
                {Object.entries(data)
                  .sort(([,a], [,b]) => b.year_stats.unique_artists - a.year_stats.unique_artists)[0][0]}
              </p>
              <p className="text-cyber-blue text-sm">
                {Object.entries(data)
                  .sort(([,a], [,b]) => b.year_stats.unique_artists - a.year_stats.unique_artists)[0][1]
                  .year_stats.unique_artists} unique artists
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-card-bg/50 rounded-lg">
              <p className="text-sm text-gray-400">Highest Completion Rate</p>
              <p className="text-white font-medium">
                {Object.entries(data)
                  .sort(([,a], [,b]) => b.year_stats.completion_rate_percentage - a.year_stats.completion_rate_percentage)[0][0]}
              </p>
              <p className="text-cyber-blue text-sm">
                {Math.round(Object.entries(data)
                  .sort(([,a], [,b]) => b.year_stats.completion_rate_percentage - a.year_stats.completion_rate_percentage)[0][1]
                  .year_stats.completion_rate_percentage)}% completion rate
              </p>
            </div>
            <div className="p-4 bg-card-bg/50 rounded-lg">
              <p className="text-sm text-gray-400">Most Consistent Year</p>
              <p className="text-white font-medium">
                {Object.entries(data)
                  .sort(([,a], [,b]) => b.year_stats.unique_days_with_listening - a.year_stats.unique_days_with_listening)[0][0]}
              </p>
              <p className="text-cyber-blue text-sm">
                {Object.entries(data)
                  .sort(([,a], [,b]) => b.year_stats.unique_days_with_listening - a.year_stats.unique_days_with_listening)[0][1]
                  .year_stats.unique_days_with_listening} days with music
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardTab;
