'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'positive' | 'negative' | 'neutral';
    period: string;
  };
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  className = '',
  style
}: MetricCardProps) {
  const getChangeIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case 'positive':
        return <TrendingUp className="w-4 h-4" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getChangeColor = () => {
    if (!change) return '';
    
    switch (change.type) {
      case 'positive':
        return 'positive';
      case 'negative':
        return 'negative';
      default:
        return 'neutral';
    }
  };

  return (
    <div className={`modern-metric-card ${className}`} style={style}>
      <div className="flex items-center justify-between mb-4">
        <div className="modern-metric-label">{title}</div>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>
      
      <div className="modern-metric-value">{value}</div>
      
      {change && (
        <div className={`modern-metric-change ${getChangeColor()}`}>
          {getChangeIcon()}
          <span>
            {change.value > 0 ? '+' : ''}{change.value}% {change.period}
          </span>
        </div>
      )}
    </div>
  );
}
