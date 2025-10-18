'use client';

import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface ChartData {
  label: string;
  value: number;
  change?: number;
}

interface ModernChartProps {
  title: string;
  data: ChartData[];
  type?: 'bar' | 'line' | 'area';
  className?: string;
}

export default function ModernChart({ 
  title, 
  data, 
  type = 'bar',
  className = '' 
}: ModernChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className={`modern-chart ${className}`}>
      <div className="modern-chart-header">
        <h3 className="modern-chart-title">{title}</h3>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            Last 3 months
          </div>
          <button className="modern-btn modern-btn-ghost">
            <BarChart3 className="w-4 h-4" />
            View Details
          </button>
        </div>
      </div>
      
      <div className="h-80 flex items-center justify-center">
        {type === 'bar' ? (
          <div className="w-full h-full flex items-end justify-between space-x-2 p-4">
            {data.map((item, index) => {
              const height = (item.value / maxValue) * 100;
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg mb-2 relative group">
                    <div 
                      className="bg-gradient-to-t from-purple-600 to-purple-500 rounded-t-lg transition-all duration-300 hover:from-purple-700 hover:to-purple-600"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.value}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 text-center">
                    {item.label}
                  </div>
                  {item.change && (
                    <div className={`text-xs flex items-center mt-1 ${
                      item.change > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {item.change > 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {Math.abs(item.change)}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <p className="text-gray-400">Chart visualization will be implemented here</p>
            <p className="text-sm text-gray-500 mt-2">Interactive {type} chart showing data trends</p>
          </div>
        )}
      </div>
    </div>
  );
}
