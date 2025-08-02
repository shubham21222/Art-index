import React from 'react';

// Simple Bar Chart Component
export const BarChart = ({ data, width = 400, height = 200, color = "#3b82f6" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-400">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));
  const barWidth = (width - 40) / data.length;
  const maxBarHeight = height - 60;

  return (
    <div className="w-full">
      <svg width={width} height={height} className="w-full">
        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * maxBarHeight;
          const x = 20 + index * barWidth + barWidth * 0.1;
          const y = height - 40 - barHeight;
          
          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth * 0.8}
                height={barHeight}
                fill={color}
                rx={4}
                className="transition-all duration-300 hover:opacity-80"
              />
              <text
                x={x + barWidth * 0.4}
                y={height - 15}
                textAnchor="middle"
                className="text-xs fill-zinc-400"
              >
                {item.label}
              </text>
              <text
                x={x + barWidth * 0.4}
                y={y - 5}
                textAnchor="middle"
                className="text-xs fill-white"
              >
                {item.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Simple Pie Chart Component
export const PieChart = ({ data, width = 200, height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-400">
        No data available
      </div>
    );
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  let currentAngle = 0;
  const radius = Math.min(width, height) / 2 - 20;
  const centerX = width / 2;
  const centerY = height / 2;

  return (
    <div className="w-full">
      <svg width={width} height={height} className="w-full">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angle = (item.value / total) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          
          const x1 = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
          const y1 = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
          const x2 = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
          const y2 = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');

          currentAngle += angle;

          return (
            <g key={index}>
              <path
                d={pathData}
                fill={colors[index % colors.length]}
                className="transition-all duration-300 hover:opacity-80"
              />
            </g>
          );
        })}
        
        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.3}
          fill="#1f2937"
          stroke="#374151"
          strokeWidth="2"
        />
        
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-medium fill-white"
        >
          {total}
        </text>
      </svg>
      
      {/* Legend */}
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-sm text-zinc-300">{item.label}</span>
            <span className="text-sm text-zinc-400 ml-auto">
              {((item.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Line Chart Component
export const LineChart = ({ data, width = 400, height = 200, color = "#3b82f6" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-400">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const range = maxValue - minValue || 1;
  
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = height - padding - ((item.value - minValue) / range) * chartHeight;
    return { x, y, value: item.value, label: item.label };
  });

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <div className="w-full">
      <svg width={width} height={height} className="w-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = padding + ratio * chartHeight;
          return (
            <line
              key={index}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#374151"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          );
        })}
        
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="3"
          className="transition-all duration-300"
        />
        
        {/* Points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill={color}
              className="transition-all duration-300 hover:r-6"
            />
            <text
              x={point.x}
              y={point.y - 10}
              textAnchor="middle"
              className="text-xs fill-zinc-400"
            >
              {point.value}
            </text>
            <text
              x={point.x}
              y={height - 10}
              textAnchor="middle"
              className="text-xs fill-zinc-400"
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// Metric Card Component
export const MetricCard = ({ title, value, change, icon: Icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-400",
    green: "bg-green-500/10 text-green-400",
    orange: "bg-orange-500/10 text-orange-400",
    purple: "bg-purple-500/10 text-purple-400",
    red: "bg-red-500/10 text-red-400"
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-zinc-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change >= 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}; 