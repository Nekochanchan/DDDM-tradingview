import React, { useState, useRef } from 'react';
import { AssetQuote, PricePoint } from '../types';

interface InteractiveChartProps {
  asset: AssetQuote;
  height?: number;
  showControls?: boolean;
}

type TimeFrame = '1D' | '5D' | '1M' | '6M' | '1Y' | 'ALL';
type ChartType = 'area' | 'candle' | 'heikin' | 'line';

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  asset,
  height = 280,
  showControls = true
}) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>('1D');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [showSMA, setShowSMA] = useState<boolean>(true);
  const [showRSI, setShowRSI] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<PricePoint | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get data points based on timeframe
  const getData = (): PricePoint[] => {
    switch (timeframe) {
      case '1M':
        return asset.history1M || asset.history1D;
      case '6M':
      case '1Y':
      case 'ALL':
        return asset.history1Y || asset.history1D;
      case '1D':
      case '5D':
      default:
        return asset.history1D;
    }
  };

  const rawData = getData();

  // Calculate Heikin Ashi if enabled
  const data = chartType === 'heikin' ? rawData.map((d, i, arr) => {
    const prev = i > 0 ? arr[i - 1] : d;
    const prevOpen = prev.open || prev.price;
    const prevClose = prev.close || prev.price;
    const haClose = ((d.open || d.price) + (d.high || d.price) + (d.low || d.price) + (d.close || d.price)) / 4;
    const haOpen = (prevOpen + prevClose) / 2;
    const haHigh = Math.max(d.high || d.price, haOpen, haClose);
    const haLow = Math.min(d.low || d.price, haOpen, haClose);
    return {
      ...d,
      open: haOpen,
      close: haClose,
      high: haHigh,
      low: haLow,
      price: haClose
    };
  }) : rawData;

  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.998;
  const maxPrice = Math.max(...prices) * 1.002;
  const priceRange = maxPrice - minPrice || 1;

  const isPositive = asset.changePercent >= 0;
  const strokeColor = isPositive ? '#089981' : '#F23645';

  const width = 600;
  const rsiHeight = showRSI ? 60 : 0;
  const paddingBottom = (showVolume ? 36 : 20) + rsiHeight;
  const paddingTop = 15;
  const paddingLeft = 10;
  const paddingRight = 65; // room for y-axis price labels
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Calculate coordinates
  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartW;
    const y = paddingTop + chartH - ((d.price - minPrice) / priceRange) * chartH;
    return { x, y, data: d };
  });

  const pathD = points.length > 0 ? `M ${points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}` : '';
  const areaD = points.length > 0 ? `${pathD} L ${points[points.length - 1].x.toFixed(1)},${paddingTop + chartH} L ${points[0].x.toFixed(1)},${paddingTop + chartH} Z` : '';

  // Calculate simple moving average (SMA 5)
  const smaPoints = points.map((p, idx) => {
    if (idx < 4) return null;
    const slice = data.slice(idx - 4, idx + 1);
    const avg = slice.reduce((sum, item) => sum + item.price, 0) / 5;
    const y = paddingTop + chartH - ((avg - minPrice) / priceRange) * chartH;
    return `${p.x.toFixed(1)},${y.toFixed(1)}`;
  }).filter(Boolean);

  const smaPathD = smaPoints.length > 0 ? `M ${smaPoints.join(' L ')}` : '';

  // Calculate RSI (14) points if enabled
  const rsiPoints = data.map((_, i) => {
    if (i < 5) return null;
    const pct = ((data[i].price - data[i - 5].price) / data[i - 5].price) * 100;
    const rsiVal = Math.min(90, Math.max(10, 50 + pct * 15));
    const x = paddingLeft + (i / (data.length - 1)) * chartW;
    const y = height - rsiHeight + 10 + (1 - (rsiVal / 100)) * (rsiHeight - 20);
    return { x, y, rsiVal };
  }).filter(Boolean) as { x: number; y: number; rsiVal: number }[];

  const rsiPathD = rsiPoints.length > 0 ? `M ${rsiPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}` : '';

  // Max volume for volume bars
  const maxVol = Math.max(...data.map(d => d.volume || 10000));

  // Mouse interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = (mouseX / rect.width) * width;
    
    let closest = points[0];
    let minDist = Infinity;
    for (const p of points) {
      const dist = Math.abs(p.x - relativeX);
      if (dist < minDist) {
        minDist = dist;
        closest = p;
      }
    }
    if (closest) {
      setHoveredPoint(closest.data);
      setHoverPos({ x: closest.x, y: closest.y });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setHoverPos(null);
  };

  const currentPriceDisplay = hoveredPoint ? hoveredPoint.price : asset.price;
  const currentDiff = hoveredPoint ? hoveredPoint.price - asset.previousClose : asset.change;
  const currentDiffPercent = hoveredPoint 
    ? ((hoveredPoint.price - asset.previousClose) / asset.previousClose) * 100 
    : asset.changePercent;
  const isCurrentPositive = currentDiffPercent >= 0;

  return (
    <div className="w-full select-none" ref={containerRef}>
      {/* Price Header & Timeframe / Type Toolbars */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold font-data-tabular tracking-tight">
              {asset.currency === 'USD' ? '$' : ''}{currentPriceDisplay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </span>
            <div className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded ${
              isCurrentPositive 
                ? 'text-[#089981] bg-[#089981]/15' 
                : 'text-[#F23645] bg-[#F23645]/15'
            }`}>
              <span className="material-symbols-outlined text-[14px] mr-0.5">
                {isCurrentPositive ? 'arrow_upward' : 'arrow_downward'}
              </span>
              <span>{Math.abs(currentDiff).toFixed(2)} ({isCurrentPositive ? '+' : ''}{currentDiffPercent.toFixed(2)}%)</span>
            </div>
            {hoveredPoint && (
              <span className="text-xs text-[#B2B5BE] font-data-tabular">
                {hoveredPoint.time} • O:{hoveredPoint.open || hoveredPoint.price} H:{hoveredPoint.high || hoveredPoint.price} L:{hoveredPoint.low || hoveredPoint.price}
              </span>
            )}
          </div>

          {/* Controls: Timeframes */}
          <div className="flex items-center gap-1 bg-[#1E222D] p-0.5 rounded-lg border border-[#2A2E39]">
            {(['1D', '5D', '1M', '6M', '1Y', 'ALL'] as TimeFrame[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  timeframe === tf
                    ? 'bg-[#2962ff] text-white font-semibold shadow-sm'
                    : 'text-[#B2B5BE] hover:text-[#dfe2f2] hover:bg-[#262a35]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chart Canvas Area */}
      <div 
        className="relative w-full bg-[#171b26]/50 rounded-lg border border-[#2A2E39]/80 p-1 cursor-crosshair overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Toggle tools toolbar */}
        {showControls && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-[#1E222D]/90 backdrop-blur-sm px-2 py-1 rounded border border-[#2A2E39] text-[11px]">
            <button
              onClick={() => setChartType(chartType === 'area' ? 'candle' : chartType === 'candle' ? 'heikin' : 'area')}
              className="px-1.5 py-0.5 rounded text-[11px] font-medium text-[#b6c4ff] hover:bg-[#262a35] transition-colors"
              title="Toggle Chart Type"
            >
              {chartType === 'candle' ? '🕯️ Candles' : chartType === 'heikin' ? '📊 Heikin-Ashi' : '📈 Line'}
            </button>
            <span className="text-[#2A2E39]">|</span>
            <button
              onClick={() => setShowSMA(!showSMA)}
              className={`px-1.5 py-0.5 rounded text-[11px] transition-colors ${
                showSMA ? 'text-[#e6a23c] font-semibold' : 'text-[#B2B5BE]'
              }`}
              title="Toggle SMA 5 Indicator"
            >
              SMA
            </button>
            <span className="text-[#2A2E39]">|</span>
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`px-1.5 py-0.5 rounded text-[11px] transition-colors ${
                showVolume ? 'text-[#089981] font-semibold' : 'text-[#B2B5BE]'
              }`}
              title="Toggle Volume"
            >
              VOL
            </button>
            <span className="text-[#2A2E39]">|</span>
            <button
              onClick={() => setShowRSI(!showRSI)}
              className={`px-1.5 py-0.5 rounded text-[11px] transition-colors ${
                showRSI ? 'text-[#2962ff] font-semibold' : 'text-[#B2B5BE]'
              }`}
              title="Toggle RSI Oscillator"
            >
              RSI(14)
            </button>
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`chart-grad-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.32" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.01" />
            </linearGradient>
            <pattern id="chart-grid" width="100" height="40" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 40" fill="none" stroke="#2A2E39" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
          </defs>

          {/* Grid lines */}
          <rect x={paddingLeft} y={paddingTop} width={chartW} height={chartH} fill="url(#chart-grid)" />

          {/* Y-Axis Price Ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const priceVal = maxPrice - ratio * priceRange;
            const yPos = paddingTop + ratio * chartH;
            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={paddingLeft + chartW}
                  y2={yPos}
                  stroke="#2A2E39"
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                />
                <text
                  x={paddingLeft + chartW + 6}
                  y={yPos + 3}
                  fill="#8d90a2"
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  textAnchor="start"
                >
                  {priceVal.toFixed(priceVal > 500 ? 0 : 2)}
                </text>
              </g>
            );
          })}

          {/* Volume bars */}
          {showVolume && data.map((d, i) => {
            const barW = Math.max(2, (chartW / data.length) * 0.65);
            const x = paddingLeft + (i / (data.length - 1)) * chartW - barW / 2;
            const volRatio = (d.volume || 10000) / maxVol;
            const barH = volRatio * 24;
            const y = height - paddingBottom + (26 - barH);
            const isBarGreen = (d.close || d.price) >= (d.open || d.price);
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barW}
                height={barH}
                fill={isBarGreen ? '#089981' : '#F23645'}
                opacity={0.35}
                rx={1}
              />
            );
          })}

          {/* Area & Line Chart */}
          {(chartType === 'area' || chartType === 'line') && (
            <>
              {chartType === 'area' && <path d={areaD} fill={`url(#chart-grad-${asset.id})`} />}
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Candlestick & Heikin-Ashi Chart */}
          {(chartType === 'candle' || chartType === 'heikin') && data.map((d, i) => {
            const x = paddingLeft + (i / (data.length - 1)) * chartW;
            const open = d.open || d.price * 0.999;
            const close = d.close || d.price;
            const high = d.high || Math.max(open, close) * 1.002;
            const low = d.low || Math.min(open, close) * 0.998;

            const yHigh = paddingTop + chartH - ((high - minPrice) / priceRange) * chartH;
            const yLow = paddingTop + chartH - ((low - minPrice) / priceRange) * chartH;
            const yOpen = paddingTop + chartH - ((open - minPrice) / priceRange) * chartH;
            const yClose = paddingTop + chartH - ((close - minPrice) / priceRange) * chartH;

            const isGreen = close >= open;
            const candleColor = isGreen ? '#089981' : '#F23645';
            const bodyTop = Math.min(yOpen, yClose);
            const bodyH = Math.max(2, Math.abs(yOpen - yClose));
            const candleW = Math.max(3, (chartW / data.length) * 0.65);

            return (
              <g key={i}>
                <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={candleColor} strokeWidth="1" />
                <rect
                  x={x - candleW / 2}
                  y={bodyTop}
                  width={candleW}
                  height={bodyH}
                  fill={candleColor}
                  stroke={candleColor}
                  strokeWidth="0.5"
                  rx="0.5"
                />
              </g>
            );
          })}

          {/* Simple Moving Average line */}
          {showSMA && smaPathD && (
            <path
              d={smaPathD}
              fill="none"
              stroke="#e6a23c"
              strokeWidth="1.25"
              strokeDasharray="4,3"
            />
          )}

          {/* RSI Oscillator Subchart */}
          {showRSI && (
            <g>
              <line
                x1={paddingLeft}
                y1={height - rsiHeight + 10}
                x2={paddingLeft + chartW}
                y2={height - rsiHeight + 10}
                stroke="#2A2E39"
                strokeWidth="1"
              />
              <line
                x1={paddingLeft}
                y1={height - rsiHeight + 10 + (1 - 0.7) * (rsiHeight - 20)}
                x2={paddingLeft + chartW}
                y2={height - rsiHeight + 10 + (1 - 0.7) * (rsiHeight - 20)}
                stroke="#F23645"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
              <line
                x1={paddingLeft}
                y1={height - rsiHeight + 10 + (1 - 0.3) * (rsiHeight - 20)}
                x2={paddingLeft + chartW}
                y2={height - rsiHeight + 10 + (1 - 0.3) * (rsiHeight - 20)}
                stroke="#089981"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
              {rsiPathD && (
                <path d={rsiPathD} fill="none" stroke="#2962ff" strokeWidth="1.5" />
              )}
              <text
                x={paddingLeft + 4}
                y={height - rsiHeight + 22}
                fill="#2962ff"
                fontSize="8"
                fontWeight="bold"
              >
                RSI (14)
              </text>
            </g>
          )}

          {/* Latest Live Price Line */}
          {points.length > 0 && (
            <g>
              <line
                x1={paddingLeft}
                y1={points[points.length - 1].y}
                x2={paddingLeft + chartW}
                y2={points[points.length - 1].y}
                stroke={strokeColor}
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.8"
              />
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="3.5"
                fill={strokeColor}
                className="animate-ping opacity-75"
              />
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="3"
                fill="#ffffff"
              />
            </g>
          )}

          {/* Crosshair & Tooltip */}
          {hoverPos && hoveredPoint && (
            <g>
              <line
                x1={hoverPos.x}
                y1={paddingTop}
                x2={hoverPos.x}
                y2={paddingTop + chartH}
                stroke="#dfe2f2"
                strokeWidth="0.75"
                strokeDasharray="3,3"
                opacity="0.6"
              />
              <line
                x1={paddingLeft}
                y1={hoverPos.y}
                x2={paddingLeft + chartW}
                y2={hoverPos.y}
                stroke="#dfe2f2"
                strokeWidth="0.75"
                strokeDasharray="3,3"
                opacity="0.6"
              />
              <circle
                cx={hoverPos.x}
                cy={hoverPos.y}
                r="4.5"
                fill={strokeColor}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <rect
                x={paddingLeft + chartW}
                y={hoverPos.y - 8}
                width={56}
                height={16}
                fill="#2962ff"
                rx="2"
              />
              <text
                x={paddingLeft + chartW + 28}
                y={hoverPos.y + 4}
                fill="#ffffff"
                fontSize="9"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
                fontWeight="600"
              >
                {hoveredPoint.price.toFixed(2)}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Time Legend at bottom */}
      <div className="flex justify-between items-center px-2 pt-1.5 text-[10px] text-[#8d90a2] font-data-tabular">
        <span>{data[0]?.time || '09:30'}</span>
        <span>{data[Math.floor(data.length / 2)]?.time || '12:30'}</span>
        <span>{data[data.length - 1]?.time || '16:00'} (EDT)</span>
      </div>
    </div>
  );
};

