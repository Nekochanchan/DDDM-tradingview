import React from 'react';
import { PricePoint } from '../types';

interface SparklineProps {
  data: PricePoint[];
  isPositive: boolean;
  width?: number | string;
  height?: number;
  showGradient?: boolean;
  strokeWidth?: number;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  isPositive,
  width = '100%',
  height = 40,
  showGradient = true,
  strokeWidth = 1.75,
  className = ''
}) => {
  if (!data || data.length < 2) {
    return (
      <div className={`flex items-center justify-center text-xs text-[#B2B5BE] ${className}`} style={{ height }}>
        No data here yet
      </div>
    );
  }

  const prices = data.map(d => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min === 0 ? 1 : max - min;
  
  const w = 120;
  const h = typeof height === 'number' ? height : 40;
  const padding = 4;
  const chartHeight = h - padding * 2;

  const points = prices.map((price, index) => {
    const x = (index / (prices.length - 1)) * w;
    const y = h - padding - ((price - min) / range) * chartHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${w},${h} L 0,${h} Z`;

  const strokeColor = isPositive ? '#089981' : '#F23645';
  const gradientId = `spark-grad-${isPositive ? 'green' : 'red'}-${Math.random().toString(36).substr(2, 5)}`;

  return (
    <div className={`relative overflow-hidden w-full ${className}`} style={{ height }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={showGradient ? 0.25 : 0} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        {showGradient && (
          <path
            d={areaD}
            fill={`url(#${gradientId})`}
            className="transition-all duration-300"
          />
        )}

        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />
      </svg>
    </div>
  );
};
