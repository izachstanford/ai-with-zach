import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';

const HourlyMoodRing = ({ data }) => {
  const [selectedHour, setSelectedHour] = useState(null);
  const [showWeekends, setShowWeekends] = useState(true);

  const processedData = useMemo(() => {
    if (!data?.temporal_patterns?.hourly_breakdown || !data?.temporal_patterns?.weekday_breakdown) {
      return { hourlyData: [], weekdayData: [], moodData: [], scales: null };
    }

    const hourlyBreakdown = data.temporal_patterns.hourly_breakdown;
    const weekdayBreakdown = data.temporal_patterns.weekday_breakdown;

    // Process hourly data with mood estimation
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourData = hourlyBreakdown[hour] || { plays: 0, ms_played: 0 };
      
      // Estimate mood/energy based on time of day and listening patterns
      let energy = 0.5; // baseline
      let mood = 'neutral';
      let color = '#666666';

      if (hour >= 6 && hour <= 11) {
        // Morning - building energy
        energy = 0.3 + (hour - 6) * 0.1;
        mood = 'building';
        color = '#fbbf24'; // amber
      } else if (hour >= 12 && hour <= 17) {
        // Afternoon - high energy
        energy = 0.8 + Math.sin((hour - 12) / 5 * Math.PI) * 0.2;
        mood = 'energetic';
        color = '#f59e0b'; // orange
      } else if (hour >= 18 && hour <= 22) {
        // Evening - social/relaxed
        energy = 0.7 - (hour - 18) * 0.1;
        mood = 'social';
        color = '#8b5cf6'; // purple
      } else {
        // Night - introspective/calm
        energy = 0.2 + Math.random() * 0.3;
        mood = 'introspective';
        color = '#3b82f6'; // blue
      }

      // Adjust based on actual listening activity
      const normalizedPlays = hourData.plays / (data.content_stats.total_plays / 24);
      energy *= Math.min(normalizedPlays * 2, 2); // Boost energy based on activity

      return {
        hour,
        plays: hourData.plays,
        ms_played: hourData.ms_played,
        energy: Math.min(energy, 1),
        mood,
        color,
        intensity: hourData.plays > 0 ? hourData.plays / Math.max(...Object.values(hourlyBreakdown).map(h => h.plays)) : 0,
        angle: (hour / 24) * 2 * Math.PI - Math.PI / 2 // Start at 12 o'clock
      };
    });

    // Process weekday patterns
    const weekdayData = Object.entries(weekdayBreakdown).map(([day, data]) => ({
      day,
      plays: data.plays,
      ms_played: data.ms_played,
      intensity: data.plays / Math.max(...Object.values(weekdayBreakdown).map(d => d.plays))
    }));

    // Seasonal overlay data
    const seasonalData = data.temporal_patterns.seasonal_breakdown;
    const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
    const seasonalMood = seasons.map((season, i) => ({
      season,
      plays: seasonalData[season]?.plays || 0,
      angle: (i / 4) * 2 * Math.PI,
      color: ['#10b981', '#f59e0b', '#dc2626', '#3b82f6'][i] // green, orange, red, blue
    }));

    // Create scales
    const radiusScale = d3.scaleLinear()
      .domain([0, Math.max(...hourlyData.map(h => h.plays))])
      .range([60, 120]);

    const energyScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, 40]);

    return {
      hourlyData,
      weekdayData,
      seasonalData,
      scales: { radiusScale, energyScale },
      centerX: 200,
      centerY: 200,
      maxRadius: 160
    };
  }, [data]);

  const generateArcPath = (startAngle, endAngle, innerRadius, outerRadius) => {
    const startAngleAdjusted = startAngle - Math.PI / 2;
    const endAngleAdjusted = endAngle - Math.PI / 2;
    
    const x1 = Math.cos(startAngleAdjusted) * innerRadius;
    const y1 = Math.sin(startAngleAdjusted) * innerRadius;
    const x2 = Math.cos(endAngleAdjusted) * innerRadius;
    const y2 = Math.sin(endAngleAdjusted) * innerRadius;
    
    const x3 = Math.cos(endAngleAdjusted) * outerRadius;
    const y3 = Math.sin(endAngleAdjusted) * outerRadius;
    const x4 = Math.cos(startAngleAdjusted) * outerRadius;
    const y4 = Math.sin(startAngleAdjusted) * outerRadius;
    
    const largeArcFlag = endAngleAdjusted - startAngleAdjusted <= Math.PI ? "0" : "1";
    
    return [
      "M", x1, y1, 
      "A", innerRadius, innerRadius, 0, largeArcFlag, 1, x2, y2,
      "L", x3, y3,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 0, x4, y4,
      "L", x1, y1,
      "Z"
    ].join(" ");
  };

  if (!processedData.hourlyData.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>Loading hourly mood ring...</p>
      </div>
    );
  }

  const { hourlyData, weekdayData, seasonalData, scales, centerX, centerY, maxRadius } = processedData;

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <svg width="100%" height="100%" viewBox="0 0 400 400">
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9"/>
            <stop offset="50%" stopColor="#00f5ff" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
          </radialGradient>
          
          {/* Mood gradients */}
          <linearGradient id="morningGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4"/>
          </linearGradient>
          <linearGradient id="afternoonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.4"/>
          </linearGradient>
          <linearGradient id="eveningGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4"/>
          </linearGradient>
          <linearGradient id="nightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0.4"/>
          </linearGradient>
          
          <filter id="moodGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background rings for reference */}
        <g opacity="0.1">
          {[80, 100, 120, 140].map((radius, i) => (
            <circle
              key={i}
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.5"
            />
          ))}
        </g>

        {/* Seasonal background arcs */}
        {seasonalData.map((season, i) => {
          const startAngle = season.angle - Math.PI / 4;
          const endAngle = season.angle + Math.PI / 4;
          return (
            <path
              key={season.season}
              d={generateArcPath(startAngle, endAngle, 40, 60)}
              transform={`translate(${centerX}, ${centerY})`}
              fill={season.color}
              opacity="0.2"
            />
          );
        })}

        {/* Hour segments */}
        {hourlyData.map((hour, i) => {
          const startAngle = hour.angle;
          const endAngle = ((i + 1) / 24) * 2 * Math.PI - Math.PI / 2;
          const innerRadius = 70;
          const outerRadius = 70 + scales.energyScale(hour.energy) + hour.intensity * 30;
          
          const isSelected = selectedHour === hour.hour;
          const opacity = selectedHour === null ? (0.6 + hour.intensity * 0.4) : (isSelected ? 1 : 0.3);
          
          let fillGradient = 'url(#nightGradient)';
          if (hour.mood === 'building') fillGradient = 'url(#morningGradient)';
          else if (hour.mood === 'energetic') fillGradient = 'url(#afternoonGradient)';
          else if (hour.mood === 'social') fillGradient = 'url(#eveningGradient)';

          return (
            <g key={hour.hour}>
              {/* Main hour segment */}
              <path
                d={generateArcPath(startAngle, endAngle, innerRadius, outerRadius)}
                transform={`translate(${centerX}, ${centerY})`}
                fill={fillGradient}
                stroke={hour.color}
                strokeWidth={isSelected ? "2" : "0.5"}
                opacity={opacity}
                filter={hour.intensity > 0.5 ? "url(#moodGlow)" : "none"}
                className="cursor-pointer transition-all duration-300 hover:opacity-100"
                onMouseEnter={() => setSelectedHour(hour.hour)}
                onMouseLeave={() => setSelectedHour(null)}
              />

              {/* Hour labels */}
              <text
                x={centerX + Math.cos(hour.angle) * (outerRadius + 15)}
                y={centerY + Math.sin(hour.angle) * (outerRadius + 15)}
                fill="#ffffff"
                fontSize="10"
                textAnchor="middle"
                dominantBaseline="central"
                className="pointer-events-none"
                opacity={isSelected || hour.hour % 3 === 0 ? 1 : 0.5}
              >
                {hour.hour === 0 ? '12AM' : 
                 hour.hour === 12 ? '12PM' :
                 hour.hour < 12 ? `${hour.hour}AM` : `${hour.hour - 12}PM`}
              </text>

              {/* Activity indicators */}
              {hour.plays > 0 && (
                <circle
                  cx={centerX + Math.cos(hour.angle) * (innerRadius + (outerRadius - innerRadius) / 2)}
                  cy={centerY + Math.sin(hour.angle) * (innerRadius + (outerRadius - innerRadius) / 2)}
                  r={2 + hour.intensity * 3}
                  fill="#ffffff"
                  opacity={opacity}
                  className="pointer-events-none"
                />
              )}
            </g>
          );
        })}

        {/* Center hub */}
        <circle
          cx={centerX}
          cy={centerY}
          r="25"
          fill="url(#centerGlow)"
          className="animate-pulse"
        />
        
        {/* Center text */}
        <text
          x={centerX}
          y={centerY - 5}
          fill="#ffffff"
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
        >
          24hr
        </text>
        <text
          x={centerX}
          y={centerY + 8}
          fill="#00f5ff"
          fontSize="10"
          textAnchor="middle"
        >
          Rhythm
        </text>

        {/* Weekday pattern overlay */}
        {showWeekends && (
          <g transform={`translate(${centerX + 180}, ${centerY - 50})`}>
            <rect width="140" height="100" fill="rgba(0, 0, 0, 0.8)" rx="8" />
            <text x="10" y="20" fill="#ffffff" fontSize="12" fontWeight="bold">
              Weekly Pattern
            </text>
            {weekdayData.slice(0, 7).map((day, i) => (
              <g key={day.day} transform={`translate(10, ${30 + i * 10})`}>
                <rect
                  width={day.intensity * 80}
                  height="8"
                  fill={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day.day) ? '#00f5ff' : '#8b5cf6'}
                  rx="2"
                />
                <text x="85" y="7" fill="#ffffff" fontSize="8">
                  {day.day.slice(0, 3)}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* Selected hour details */}
        {selectedHour !== null && (() => {
          const hourData = hourlyData.find(h => h.hour === selectedHour);
          if (!hourData) return null;

          return (
            <g transform={`translate(${centerX - 80}, ${centerY + 80})`}>
              <rect width="160" height="70" fill="rgba(0, 0, 0, 0.9)" rx="8" />
              <text x="10" y="20" fill={hourData.color} fontSize="14" fontWeight="bold">
                {selectedHour === 0 ? '12:00 AM' : 
                 selectedHour === 12 ? '12:00 PM' :
                 selectedHour < 12 ? `${selectedHour}:00 AM` : `${selectedHour - 12}:00 PM`}
              </text>
              <text x="10" y="35" fill="#ffffff" fontSize="10">
                {hourData.plays.toLocaleString()} plays
              </text>
              <text x="10" y="50" fill="#ffffff" fontSize="10">
                Mood: {hourData.mood}
              </text>
              <text x="10" y="65" fill="#ffffff" fontSize="10">
                Energy: {Math.round(hourData.energy * 100)}%
              </text>
            </g>
          );
        })()}

        {/* Mood legend */}
        <g transform="translate(20, 20)">
          <rect width="140" height="120" fill="rgba(0, 0, 0, 0.8)" rx="8" />
          <text x="10" y="20" fill="#ffffff" fontSize="12" fontWeight="bold">
            Daily Moods
          </text>
          
          {[
            { label: 'Morning (6-11)', color: '#fbbf24', mood: 'Building Energy' },
            { label: 'Afternoon (12-17)', color: '#f59e0b', mood: 'High Energy' },
            { label: 'Evening (18-22)', color: '#8b5cf6', mood: 'Social Time' },
            { label: 'Night (23-5)', color: '#3b82f6', mood: 'Introspective' }
          ].map((item, i) => (
            <g key={i} transform={`translate(10, ${35 + i * 20})`}>
              <rect width="12" height="12" fill={item.color} rx="2" />
              <text x="20" y="9" fill="#ffffff" fontSize="8">
                {item.label}
              </text>
              <text x="20" y="18" fill="#gray" fontSize="7">
                {item.mood}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {/* Controls */}
      <div className="absolute top-4 right-4 bg-black/70 rounded-lg p-3">
        <div className="text-white text-xs font-semibold mb-2">Views</div>
        <label className="flex items-center text-xs text-white mb-1">
          <input
            type="checkbox"
            checked={showWeekends}
            onChange={(e) => setShowWeekends(e.target.checked)}
            className="mr-2"
          />
          Weekly Pattern
        </label>
      </div>

      {/* Info panel */}
      <div className="absolute bottom-4 left-4 bg-black/70 rounded-lg p-3 max-w-sm">
        <h4 className="text-white text-xs font-semibold mb-2">24-Hour Musical Rhythm</h4>
        <p className="text-gray-400 text-xs">
          Ring segments show hourly listening patterns with mood-based colors. 
          Thickness indicates activity level, brightness shows energy.
          Hover over segments for details.
        </p>
      </div>
    </div>
  );
};

export default HourlyMoodRing;
