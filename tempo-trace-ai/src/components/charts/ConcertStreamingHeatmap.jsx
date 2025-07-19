import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';

const ConcertStreamingHeatmap = ({ data, concertData, artistSummary }) => {
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);

  const processedData = useMemo(() => {
    if (!concertData || !data?.temporal_patterns?.monthly_breakdown || !artistSummary) {
      return { heatmapData: [], artists: [], months: [], scales: null };
    }

    // Filter concerts with actual dates and artists in our data
    const validConcerts = concertData.filter(concert => 
      concert.date && concert.date !== '2010-01-01' && artistSummary[concert.artist]
    );

    if (validConcerts.length === 0) {
      return { heatmapData: [], artists: [], months: [], scales: null };
    }

    const monthlyData = data.temporal_patterns.monthly_breakdown;
    const months = Object.keys(monthlyData).sort();
    const artists = [...new Set(validConcerts.map(c => c.artist))];

    const heatmapData = [];

    artists.forEach(artist => {
      const concerts = validConcerts.filter(c => c.artist === artist);
      const artistData = artistSummary[artist];
      
      if (!artistData) return;

      months.forEach(month => {
        const monthDate = new Date(month);
        const monthPlays = monthlyData[month]?.plays || 0;
        
        // Calculate concert effect
        let concertEffect = 0;
        let nearestConcert = null;
        let daysSinceConcert = Infinity;

        concerts.forEach(concert => {
          const concertDate = new Date(concert.date);
          const daysDiff = Math.abs((monthDate - concertDate) / (1000 * 60 * 60 * 24));
          
          if (daysDiff < daysSinceConcert) {
            daysSinceConcert = daysDiff;
            nearestConcert = concert;
          }

          // Concert effect decays over time (strongest within 30 days)
          const effect = Math.max(0, 1 - daysDiff / 90); // 90-day window
          concertEffect = Math.max(concertEffect, effect);
        });

        // Estimate artist's monthly plays (simplified calculation)
        const artistMonthlyPlays = Math.round(
          (artistData.total_streams / artistData.years_active / 12) * (1 + concertEffect)
        );

        const correlationStrength = concertEffect * (concert => {
          if (daysSinceConcert <= 7) return 1.0;
          if (daysSinceConcert <= 30) return 0.8;
          if (daysSinceConcert <= 60) return 0.5;
          if (daysSinceConcert <= 90) return 0.3;
          return 0.1;
        })();

        heatmapData.push({
          artist,
          month,
          plays: artistMonthlyPlays,
          concertEffect,
          correlationStrength,
          nearestConcert,
          daysSinceConcert: daysSinceConcert === Infinity ? null : Math.round(daysSinceConcert),
          monthDate
        });
      });
    });

    // Create scales
    const width = 1000;
    const height = 400;
    const cellWidth = (width - 100) / months.length;
    const cellHeight = (height - 100) / artists.length;

    const timeScale = d3.scaleBand()
      .domain(months)
      .range([80, width - 20])
      .padding(0.05);

    const artistScale = d3.scaleBand()
      .domain(artists)
      .range([20, height - 80])
      .padding(0.05);

    const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
      .domain([0, 1]);

    const intensityScale = d3.scaleLinear()
      .domain([0, d3.max(heatmapData, d => d.correlationStrength)])
      .range([0, 1]);

    return {
      heatmapData,
      artists,
      months,
      scales: { timeScale, artistScale, colorScale, intensityScale },
      dimensions: { width, height, cellWidth, cellHeight }
    };
  }, [data, concertData, artistSummary]);

  const handleCellHover = (cellData, event) => {
    setTooltipData({
      data: cellData,
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleCellLeave = () => {
    setTooltipData(null);
  };

  if (!processedData.heatmapData.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <p>No concert correlation data available</p>
          <p className="text-sm mt-1">Need concert dates and streaming data for analysis</p>
        </div>
      </div>
    );
  }

  const { heatmapData, artists, months, scales, dimensions } = processedData;

  return (
    <div className="relative w-full h-full">
      <svg width="100%" height="100%" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background grid */}
        <g className="opacity-10">
          {months.filter((_, i) => i % 6 === 0).map(month => (
            <line
              key={month}
              x1={scales.timeScale(month)}
              y1="20"
              x2={scales.timeScale(month)}
              y2={dimensions.height - 80}
              stroke="#ffffff"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          ))}
        </g>

        {/* Heatmap cells */}
        {heatmapData.map((cell, index) => {
          const isHighlighted = selectedArtist === null || selectedArtist === cell.artist;
          const opacity = isHighlighted ? Math.max(0.1, cell.correlationStrength) : 0.1;
          const glowIntensity = cell.correlationStrength > 0.5 ? 'url(#glow)' : 'none';

          return (
            <rect
              key={index}
              x={scales.timeScale(cell.month)}
              y={scales.artistScale(cell.artist)}
              width={scales.timeScale.bandwidth()}
              height={scales.artistScale.bandwidth()}
              fill={cell.concertEffect > 0 ? '#00f5ff' : scales.colorScale(cell.correlationStrength)}
              opacity={opacity}
              stroke={cell.concertEffect > 0 ? '#ffffff' : 'none'}
              strokeWidth={cell.concertEffect > 0.7 ? '2' : '1'}
              filter={glowIntensity}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={(e) => handleCellHover(cell, e)}
              onMouseLeave={handleCellLeave}
            />
          );
        })}

        {/* Concert event markers */}
        {heatmapData
          .filter(cell => cell.concertEffect > 0 && cell.daysSinceConcert <= 7)
          .map((cell, index) => (
            <g key={index}>
              <circle
                cx={scales.timeScale(cell.month) + scales.timeScale.bandwidth() / 2}
                cy={scales.artistScale(cell.artist) + scales.artistScale.bandwidth() / 2}
                r="4"
                fill="#ff0080"
                stroke="#ffffff"
                strokeWidth="2"
                filter="url(#glow)"
                className="animate-pulse"
              />
            </g>
          ))}

        {/* Artist labels */}
        {artists.map(artist => {
          const isHighlighted = selectedArtist === null || selectedArtist === artist;
          return (
            <text
              key={artist}
              x="75"
              y={scales.artistScale(artist) + scales.artistScale.bandwidth() / 2}
              fill={isHighlighted ? "#ffffff" : "#666666"}
              fontSize="10"
              textAnchor="end"
              dominantBaseline="middle"
              className="font-medium cursor-pointer transition-colors"
              onClick={() => setSelectedArtist(selectedArtist === artist ? null : artist)}
            >
              {artist}
            </text>
          );
        })}

        {/* Month labels */}
        {months.filter((_, i) => i % 3 === 0).map(month => (
          <text
            key={month}
            x={scales.timeScale(month) + scales.timeScale.bandwidth() / 2}
            y={dimensions.height - 60}
            fill="#ffffff"
            fontSize="9"
            textAnchor="middle"
            transform={`rotate(-45, ${scales.timeScale(month) + scales.timeScale.bandwidth() / 2}, ${dimensions.height - 60})`}
          >
            {new Date(month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
          </text>
        ))}

        {/* Legend */}
        <g transform={`translate(${dimensions.width - 150}, 40)`}>
          <text x="0" y="0" fill="#ffffff" fontSize="12" fontWeight="bold">Concert Effect</text>
          
          {/* Color scale legend */}
          {[0, 0.25, 0.5, 0.75, 1].map((value, i) => (
            <g key={i} transform={`translate(0, ${20 + i * 20})`}>
              <rect
                width="15"
                height="15"
                fill={scales.colorScale(value)}
                opacity="0.8"
              />
              <text x="20" y="12" fill="#ffffff" fontSize="10">
                {value === 0 ? 'None' : 
                 value === 0.25 ? 'Low' :
                 value === 0.5 ? 'Medium' :
                 value === 0.75 ? 'High' : 'Very High'}
              </text>
            </g>
          ))}

          {/* Concert marker legend */}
          <g transform="translate(0, 120)">
            <circle cx="7" cy="7" r="4" fill="#ff0080" stroke="#ffffff" strokeWidth="2" />
            <text x="20" y="12" fill="#ffffff" fontSize="10">Concert Week</text>
          </g>
        </g>
      </svg>

      {/* Tooltip */}
      {tooltipData && (
        <div
          className="fixed bg-black/90 border border-cyber-blue rounded-lg p-3 text-xs z-50 pointer-events-none"
          style={{
            left: `${tooltipData.x + 10}px`,
            top: `${tooltipData.y - 10}px`,
          }}
        >
          <div className="text-white font-semibold">{tooltipData.data.artist}</div>
          <div className="text-gray-300">
            {new Date(tooltipData.data.month).toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </div>
          <div className="text-cyber-blue">
            Estimated Plays: {tooltipData.data.plays.toLocaleString()}
          </div>
          {tooltipData.data.nearestConcert && (
            <div className="text-pink-400 mt-1">
              Concert Effect: {Math.round(tooltipData.data.concertEffect * 100)}%
              {tooltipData.data.daysSinceConcert !== null && (
                <div className="text-xs">
                  {tooltipData.data.daysSinceConcert} days from concert
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-2 right-2 bg-black/70 rounded-lg p-3">
        <div className="text-white text-xs font-semibold mb-2">Filters</div>
        <button
          onClick={() => setSelectedArtist(null)}
          className={`px-2 py-1 text-xs rounded transition-colors mr-2 ${
            selectedArtist === null 
              ? 'bg-cyber-blue text-white' 
              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
          }`}
        >
          All Artists
        </button>
      </div>

      {/* Info panel */}
      <div className="absolute bottom-2 left-2 bg-black/70 rounded-lg p-3 max-w-sm">
        <h4 className="text-white text-xs font-semibold mb-2">Concert Correlation Analysis</h4>
        <p className="text-gray-400 text-xs">
          Brighter colors indicate stronger correlation between concert attendance and streaming spikes. 
          Pink dots mark concert weeks with immediate impact.
        </p>
      </div>
    </div>
  );
};

export default ConcertStreamingHeatmap;
