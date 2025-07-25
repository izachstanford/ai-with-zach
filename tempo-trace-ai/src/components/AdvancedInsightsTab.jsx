import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  BarElement
} from 'chart.js';
import { Line, Radar, Doughnut, Bar } from 'react-chartjs-2';
import { Activity } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

const ChartCard = ({ title, children, className = "" }) => (
  <div className={`cyber-card p-6 w-full h-auto flex flex-col justify-start items-stretch my-8 ${className}`}> 
    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
      <Activity className="w-5 h-5 text-cyber-blue" />
      {title}
    </h3>
    <div className="flex-1 w-full h-full">{children}</div>
  </div>
);

const HeatmapGrid = ({ data }) => {
  const generateHeatmapData = () => {
    const days = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const intensity = Math.random();
      days.push({ date, intensity });
    }
    return days;
  };
  const heatmapData = generateHeatmapData();
  return (
    <div className="grid grid-cols-53 gap-1 p-2 overflow-hidden">
      {heatmapData.map((day, index) => (
        <div
          key={index}
          className="w-2 h-2 rounded-sm transition-all duration-200 hover:scale-150"
          style={{
            backgroundColor: `rgba(0, 245, 255, ${day.intensity * 0.8})`,
            boxShadow: day.intensity > 0.7 ? '0 0 4px rgba(0, 245, 255, 0.5)' : 'none'
          }}
          title={`${day.date.toDateString()}: ${Math.round(day.intensity * 100)}% activity`}
        />
      ))}
    </div>
  );
};

const GenreEvolution = ({ data }) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const genreData = {
    labels: months,
    datasets: [
      {
        label: 'Pop',
        data: [30,35,40,45,35,30,25,20,25,30,35,40],
        backgroundColor: 'rgba(0, 245, 255, 0.6)',
        borderColor: '#00f5ff',
        borderWidth: 2,
        fill: true
      },
      {
        label: 'Rock',
        data: [25,20,15,20,25,30,35,40,35,30,25,20],
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: '#8b5cf6',
        borderWidth: 2,
        fill: true
      },
      {
        label: 'Electronic',
        data: [20,25,30,20,25,20,25,30,25,20,25,30],
        backgroundColor: 'rgba(244, 114, 182, 0.6)',
        borderColor: '#f472b6',
        borderWidth: 2,
        fill: true
      }
    ]
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: '#ffffff', font: { size: 10 } } } },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#ffffff', font: { size: 10 } } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { display: false } }
    }
  };
  return <Line data={genreData} options={options} />;
};

const IntensityDistribution = ({ data }) => {
  const dailyMinutes = [];
  const totalDays = data?.time_stats?.tracking_span_days || 365;
  const totalMinutes = (data?.time_stats?.total_hours || 0) * 60;
  const avgDaily = totalMinutes / totalDays;
  for (let i = 0; i < 100; i++) {
    const variation = (Math.random() - 0.5) * avgDaily;
    dailyMinutes.push(Math.max(0, avgDaily + variation));
  }
  const bins = [0,30,60,120,180,240,300,400,500];
  const distribution = bins.map((bin,i) => {
    const nextBin = bins[i+1] || Infinity;
    return dailyMinutes.filter(min => min >= bin && min < nextBin).length;
  });
  const distributionData = {
    labels: bins.slice(0,-1).map((bin,i) => `${bin}-${bins[i+1] || '500+'}m`),
    datasets: [{
      data: distribution,
      backgroundColor: [
        'rgba(0, 245, 255, 0.8)',
        'rgba(0, 245, 255, 0.7)',
        'rgba(0, 245, 255, 0.6)',
        'rgba(139, 92, 246, 0.6)',
        'rgba(139, 92, 246, 0.7)',
        'rgba(244, 114, 182, 0.6)',
        'rgba(244, 114, 182, 0.7)',
        'rgba(244, 114, 182, 0.8)'
      ],
      borderWidth: 0
    }]
  };
  const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
  return <Doughnut data={distributionData} options={options} />;
};

const AdvancedInsightsTab = ({ data }) => {
  if (!data) {
    return (
      <div className="text-center py-12">
        <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">Loading advanced insights...</p>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Advanced Insights</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Listening Heatmap">
          <HeatmapGrid data={data} />
        </ChartCard>
        <ChartCard title="Genre Evolution">
          <GenreEvolution data={data} />
        </ChartCard>
        <ChartCard title="Intensity Distribution">
          <IntensityDistribution data={data} />
        </ChartCard>
      </div>
    </div>
  );
};

export default AdvancedInsightsTab;
