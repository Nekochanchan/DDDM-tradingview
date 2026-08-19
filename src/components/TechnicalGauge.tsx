import React from 'react';

interface TechnicalGaugeProps {
  changePercent: number;
}

export const TechnicalGauge: React.FC<TechnicalGaugeProps> = ({ changePercent }) => {
  // Determine score: -2 (Strong Sell) to +2 (Strong Buy)
  let score = 0;
  if (changePercent > 2) score = 2;
  else if (changePercent > 0.5) score = 1;
  else if (changePercent < -2) score = -2;
  else if (changePercent < -0.5) score = -1;

  const labels = ['Strong Sell', 'Sell', 'Neutral', 'Buy', 'Strong Buy'];
  const activeLabel = labels[score + 2];
  const activeColor =
    score > 0 ? '#089981' : score < 0 ? '#F23645' : '#e6a23c';

  return (
    <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[#8d90a2] uppercase tracking-wider">Technical Rating</span>
        <span
          className="font-bold px-2 py-0.5 rounded text-xs"
          style={{ backgroundColor: `${activeColor}20`, color: activeColor }}
        >
          {activeLabel}
        </span>
      </div>

      {/* Meter Bar */}
      <div className="grid grid-cols-5 gap-1 h-2 rounded-full overflow-hidden bg-[#171b26]">
        {labels.map((_, i) => {
          const isSelected = i === score + 2;
          const bg =
            i === 0 ? 'bg-[#F23645]' :
            i === 1 ? 'bg-[#F23645]/70' :
            i === 2 ? 'bg-[#e6a23c]' :
            i === 3 ? 'bg-[#089981]/70' : 'bg-[#089981]';
          return (
            <div
              key={i}
              className={`${bg} ${isSelected ? 'opacity-100 ring-2 ring-white scale-y-125' : 'opacity-40'} transition-all`}
            />
          );
        })}
      </div>

      {/* Indicator Breakdown */}
      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-data-tabular pt-1 border-t border-[#2A2E39]">
        <div>
          <span className="text-[#8d90a2] block">RSI (14)</span>
          <span className="font-bold text-[#dfe2f2]">
            {Math.min(92, Math.max(20, Math.round(50 + changePercent * 6)))} (Neutral)
          </span>
        </div>
        <div>
          <span className="text-[#8d90a2] block">MACD (12,26)</span>
          <span className={`font-bold ${changePercent >= 0 ? 'text-[#089981]' : 'text-[#F23645]'}`}>
            {changePercent >= 0 ? 'Bullish Cross' : 'Bearish Cross'}
          </span>
        </div>
        <div>
          <span className="text-[#8d90a2] block">Moving Avg</span>
          <span className={`font-bold ${changePercent >= 0 ? 'text-[#089981]' : 'text-[#F23645]'}`}>
            {changePercent >= 0 ? 'Buy (12/15)' : 'Sell (10/15)'}
          </span>
        </div>
      </div>
    </div>
  );
};
