import React from 'react';
import { AssetQuote } from '../types';
import { Sparkline } from './Sparkline';

interface WorldIndicesProps {
  indices: AssetQuote[];
  onSelectIndex: (asset: AssetQuote) => void;
  onViewAllIndices: () => void;
}

export const WorldIndices: React.FC<WorldIndicesProps> = ({
  indices,
  onSelectIndex,
  onViewAllIndices
}) => {
  return (
    <section className="mb-10">
      <div 
        onClick={onViewAllIndices}
        className="flex items-center gap-1 mb-4 cursor-pointer group w-fit"
      >
        <h2 className="text-[20px] leading-7 font-semibold font-headline text-[#dfe2f2] group-hover:text-white transition-colors">
          World indices
        </h2>
        <span className="material-symbols-outlined text-[20px] text-[#dfe2f2] group-hover:translate-x-0.5 transition-transform">
          chevron_right
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {indices.map((idx) => {
          const isPos = idx.changePercent >= 0;
          return (
            <div
              key={idx.id}
              onClick={() => onSelectIndex(idx)}
              className="bg-[#1E222D] border border-[#2A2E39] rounded-xl p-4 flex flex-col h-40 relative overflow-hidden group hover:border-[#2962ff] transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              {/* Header inside card */}
              <div className="flex items-start justify-between mb-2 z-10">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: idx.badgeBgColor || '#2962ff' }}
                  >
                    {idx.badgeNumber || 'IDX'}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-[#dfe2f2] group-hover:text-white">
                      {idx.name}
                    </div>
                    {idx.subName && (
                      <div className="text-[11px] text-[#B2B5BE]">
                        {idx.subName}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold font-data-tabular text-[#dfe2f2]">
                    {idx.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className={`text-[11px] font-semibold font-data-tabular flex items-center justify-end ${
                    isPos ? 'text-[#089981]' : 'text-[#F23645]'
                  }`}>
                    <span>{isPos ? '+' : ''}{idx.changePercent.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              {/* Sparkline chart / "No data here yet" area */}
              <div className="flex-grow flex items-center justify-center text-[#B2B5BE] text-[11px] z-10 w-full px-2 pt-2">
                <Sparkline 
                  data={idx.history1D} 
                  isPositive={isPos} 
                  height={52} 
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-[#1E222D] via-transparent to-transparent opacity-40 pointer-events-none"></div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
