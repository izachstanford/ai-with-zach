import React, { useState, useMemo } from 'react';
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
  Calendar, 
  Music, 
  TrendingUp, 
  MapPin, 
  Star, 
  CheckCircle, 
  Circle,
  Users,
  Clock
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore, addMonths, subMonths } from 'date-fns';
import { formatNumber, formatTimeToReadable, generateMonthlyData, getTopByTime } from '../utils/dataUtils';

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

const ConcertCompassTab = ({ streamingData, concertData }) => {
  const [selectedArtist, setSelectedArtist] = useState(null);
  
  // Get top 20 artists by listening time
  const topArtists = useMemo(() => {
    return getTopByTime(streamingData, 'artist_name', 20);
  }, [streamingData]);

  // Get artists with concerts (filter out null dates)
  const concertArtists = useMemo(() => {
    return concertData.filter(concert => concert.date && concert.artist);
  }, [concertData]);

  // Create artist chart data
  const createArtistChartData = (artistName) => {
    const artistStreams = streamingData.filter(item => item.artist_name === artistName);
    const artistConcerts = concertArtists.filter(concert => concert.artist === artistName);
    
    if (artistStreams.length === 0) return null;
    
    // Get date range (6 months before first concert to 6 months after last concert, or full data range)
    const concertDates = artistConcerts.map(c => parseISO(c.date)).sort((a, b) => a - b);
    const firstStream = parseISO(artistStreams[0].ts);
    const lastStream = parseISO(artistStreams[artistStreams.length - 1].ts);
    
    let startDate, endDate;
    if (concertDates.length > 0) {
      startDate = subMonths(concertDates[0], 6);
      endDate = addMonths(concertDates[concertDates.length - 1], 6);
      // Ensure we don't go beyond actual data range
      if (isBefore(startDate, firstStream)) startDate = firstStream;
      if (isAfter(endDate, lastStream)) endDate = lastStream;
    } else {
      startDate = firstStream;
      endDate = lastStream;
    }
    
    // Generate monthly listening data
    const monthlyData = generateMonthlyData(artistStreams, startDate, endDate);
    
    // Convert to chart format
    const labels = Object.keys(monthlyData).sort();
    const data = labels.map(month => monthlyData[month] / (1000 * 60 * 60)); // Convert to hours
    
    // Mark concert months
    const concertMonths = concertDates.map(date => format(date, 'yyyy-MM'));
    const pointStyles = labels.map(month => 
      concertMonths.includes(month) ? 'rectRot' : 'circle'
    );
    const pointColors = labels.map(month => 
      concertMonths.includes(month) ? '#f472b6' : '#00f5ff'
    );
    const pointSizes = labels.map(month => 
      concertMonths.includes(month) ? 8 : 4
    );
    
    return {
      labels: labels.map(month => format(parseISO(month + '-01'), 'MMM yyyy')),
      datasets: [{
        label: 'Hours Listened',
        data: data,
        borderColor: '#00f5ff',
        backgroundColor: 'rgba(0, 245, 255, 0.1)',
        fill: true,
        pointStyle: pointStyles,
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointRadius: pointSizes,
        tension: 0.3
      }],
      concerts: artistConcerts
    };
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
          label: (context) => `${context.parsed.y.toFixed(1)} hours`
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

  const bucketListData = useMemo(() => {
    return topArtists.map(artist => {
      const hasSeenLive = concertArtists.some(concert => concert.artist === artist.name);
      return {
        ...artist,
        hasSeenLive
      };
    });
  }, [topArtists, concertArtists]);

  const seenLiveCount = bucketListData.filter(artist => artist.hasSeenLive).length;
  const bucketListProgress = (seenLiveCount / bucketListData.length) * 100;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-cyber mb-4">
          <span className="bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
            Concert Compass
          </span>
        </h1>
        <p className="text-gray-400 text-lg">
          Discover how concerts impact your listening habits
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Concert Impact Chart */}
        <div className="cyber-card p-6">
          <h3 className="text-xl font-bold text-cyber-blue mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Concert Impact Analysis
          </h3>
          
          <div className="mb-4">
            <select 
              value={selectedArtist || ''} 
              onChange={(e) => setSelectedArtist(e.target.value || null)}
              className="cyber-input w-full"
            >
              <option value="">Select an artist...</option>
              {concertArtists.map(concert => (
                <option key={concert.artist} value={concert.artist}>
                  {concert.artist}
                </option>
              ))}
            </select>
          </div>

          {selectedArtist && (
            <div className="space-y-4">
              <div className="chart-container">
                <Line 
                  data={createArtistChartData(selectedArtist)} 
                  options={chartOptions}
                />
              </div>
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <Circle className="w-3 h-3 text-cyber-blue" />
                <span>Regular listening</span>
                <div className="w-3 h-3 bg-cyber-pink rotate-45 ml-4"></div>
                <span>Concert month</span>
              </div>
            </div>
          )}
        </div>

        {/* Bucket List */}
        <div className="cyber-card p-6">
          <h3 className="text-xl font-bold text-cyber-purple mb-4 flex items-center gap-2">
            <Music className="w-5 h-5" />
            Bucket List Progress
          </h3>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Artists Seen Live</span>
              <span className="text-cyber-purple font-bold">{seenLiveCount}/20</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-cyber-purple to-cyber-pink h-3 rounded-full transition-all duration-500"
                style={{ width: `${bucketListProgress}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {bucketListProgress.toFixed(1)}% of your top 20 artists
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {bucketListData.map((artist, index) => (
              <div 
                key={artist.name} 
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-gradient-to-r ${
                  artist.hasSeenLive 
                    ? 'hover:from-cyber-green/10 hover:to-transparent' 
                    : 'hover:from-cyber-purple/10 hover:to-transparent'
                }`}
              >
                <div className="flex-shrink-0">
                  {artist.hasSeenLive ? (
                    <CheckCircle className="w-5 h-5 text-cyber-green" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{artist.name}</div>
                  <div className="text-gray-400 text-sm">
                    {formatTimeToReadable(artist.time)} • {formatNumber(artist.count)} plays
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-cyber-blue font-bold">#{index + 1}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Concert History */}
      <div className="cyber-card p-6">
        <h3 className="text-xl font-bold text-cyber-pink mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Concert History
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {concertArtists
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((concert, index) => (
              <div key={index} className="bg-gradient-to-br from-card-bg to-border-glow p-4 rounded-lg border border-cyber-pink/20">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-white">{concert.artist}</div>
                    <div className="text-sm text-gray-400">{concert.venue}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">{concert.vibe_rating}</span>
                  </div>
                </div>
                <div className="text-sm text-cyber-pink">
                  {format(parseISO(concert.date), 'MMM dd, yyyy')}
                </div>
                <div className="text-xs text-gray-500 mt-1 capitalize">
                  {concert.type}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="cyber-card p-6 text-center">
          <div className="text-3xl font-bold text-cyber-blue mb-2">
            {concertArtists.length}
          </div>
          <div className="text-gray-400">Concerts Attended</div>
        </div>
        
        <div className="cyber-card p-6 text-center">
          <div className="text-3xl font-bold text-cyber-purple mb-2">
            {new Set(concertArtists.map(c => c.artist)).size}
          </div>
          <div className="text-gray-400">Unique Artists</div>
        </div>
        
        <div className="cyber-card p-6 text-center">
          <div className="text-3xl font-bold text-cyber-pink mb-2">
            {new Set(concertArtists.map(c => c.venue)).size}
          </div>
          <div className="text-gray-400">Venues Visited</div>
        </div>
        
        <div className="cyber-card p-6 text-center">
          <div className="text-3xl font-bold text-cyber-green mb-2">
            {(concertArtists.reduce((sum, c) => sum + (c.vibe_rating || 0), 0) / concertArtists.filter(c => c.vibe_rating).length).toFixed(1)}
          </div>
          <div className="text-gray-400">Avg Vibe Rating</div>
        </div>
      </div>
    </div>
  );
};

export default ConcertCompassTab;
