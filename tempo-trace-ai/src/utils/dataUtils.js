import { format, parseISO, subMonths, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';

export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatTime = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

export const formatTimeToHours = (milliseconds) => {
  const hours = milliseconds / (1000 * 60 * 60);
  return hours.toFixed(1);
};

export const formatTimeToReadable = (milliseconds) => {
  const totalMinutes = Math.floor(milliseconds / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

export const getDateRange = (range) => {
  const now = new Date();
  const ranges = {
    'last7days': subMonths(now, 0),
    'last30days': subMonths(now, 1),
    'last90days': subMonths(now, 3),
    'last6months': subMonths(now, 6),
    'last12months': subMonths(now, 12),
    'lifetime': new Date('2000-01-01')
  };
  
  return ranges[range] || ranges.lifetime;
};

export const filterDataByDateRange = (data, range) => {
  if (range === 'lifetime') return data;
  
  const startDate = getDateRange(range);
  const endDate = new Date();
  
  return data.filter(item => {
    const itemDate = parseISO(item.ts);
    return isWithinInterval(itemDate, { start: startDate, end: endDate });
  });
};

export const generateMonthlyData = (data, startDate, endDate) => {
  const monthlyData = {};
  
  // Initialize all months in range
  let currentDate = startOfMonth(startDate);
  while (currentDate <= endDate) {
    const monthKey = format(currentDate, 'yyyy-MM');
    monthlyData[monthKey] = 0;
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  }
  
  // Aggregate data by month
  data.forEach(item => {
    const itemDate = parseISO(item.ts);
    const monthKey = format(itemDate, 'yyyy-MM');
    
    if (monthlyData.hasOwnProperty(monthKey)) {
      monthlyData[monthKey] += item.ms_played;
    }
  });
  
  return monthlyData;
};

export const calculateStats = (streamingData) => {
  const totalStreams = streamingData.length;
  const totalTime = streamingData.reduce((sum, item) => sum + item.ms_played, 0);
  
  const uniqueArtists = new Set(streamingData.map(item => item.artist_name)).size;
  const uniqueAlbums = new Set(streamingData.map(item => item.album_name)).size;
  const uniqueTracks = new Set(streamingData.map(item => item.track_name)).size;
  
  const skipRate = streamingData.filter(item => item.skip).length / totalStreams;
  const avgSessionLength = totalTime / totalStreams;
  
  // Calculate top platforms
  const platformCounts = streamingData.reduce((acc, item) => {
    acc[item.platform] = (acc[item.platform] || 0) + 1;
    return acc;
  }, {});
  
  const topPlatform = Object.entries(platformCounts).reduce((a, b) => 
    platformCounts[a[0]] > platformCounts[b[0]] ? a : b
  )[0];
  
  // Calculate listening patterns
  const hourlyListening = streamingData.reduce((acc, item) => {
    const hour = new Date(item.ts).getHours();
    acc[hour] = (acc[hour] || 0) + item.ms_played;
    return acc;
  }, {});
  
  const peakHour = Object.entries(hourlyListening).reduce((a, b) => 
    hourlyListening[a[0]] > hourlyListening[b[0]] ? a : b
  )[0];
  
  return {
    totalStreams,
    totalTime,
    uniqueArtists,
    uniqueAlbums,
    uniqueTracks,
    skipRate,
    avgSessionLength,
    topPlatform,
    peakHour: parseInt(peakHour)
  };
};

export const getTopItems = (data, key, limit = 10) => {
  const counts = data.reduce((acc, item) => {
    const identifier = item[key];
    if (!acc[identifier]) {
      acc[identifier] = {
        name: identifier,
        count: 0,
        time: 0,
        artist: item.artist_name // For albums and tracks
      };
    }
    acc[identifier].count++;
    acc[identifier].time += item.ms_played;
    return acc;
  }, {});
  
  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

export const getTopByTime = (data, key, limit = 10) => {
  const counts = data.reduce((acc, item) => {
    const identifier = item[key];
    if (!acc[identifier]) {
      acc[identifier] = {
        name: identifier,
        count: 0,
        time: 0,
        artist: item.artist_name
      };
    }
    acc[identifier].count++;
    acc[identifier].time += item.ms_played;
    return acc;
  }, {});
  
  return Object.values(counts)
    .sort((a, b) => b.time - a.time)
    .slice(0, limit);
};
