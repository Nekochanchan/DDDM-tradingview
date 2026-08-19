import React from 'react';
import { AssetQuote } from '../types';

interface MarketHeatmapProps {
  assets: AssetQuote[];
  onSelectAsset: (asset: AssetQuote) => void;
}

export const MarketHeatmap: React.FC<MarketHeatmapProps> = ({ assets, onSelectAsset }) => {
  const stockAssets = assets.filter(a => a.category === 'stocks' || a.category === 'indices');

  const getColor = (pct: number) => {
    if (pct >= 3) return 'bg-[#089981] text-white';
    if (pct >= 1.5) return 'bg-[#089981]/80 text-white';
    if (pct > 0) return 'bg-[#089981]/50 text-white';
    if (pct === 0) return 'bg-[#313441] text-[#dfe2f2]';
    if (pct > -1.5) return 'bg-[#F23645]/50 text-white';
    if (pct > -3) return 'bg-[#F23645]/80 text-white';
    return 'bg-[#F23645] text-white';
  };

  return (
    <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2962ff] text-[20px]">grid_view</span>
          <h3 className="text-sm font-bold font-headline text-[#dfe2f2]">Stock Market Heatmap</h3>
        </div>
        <span className="text-[11px] text-[#8d90a2]">Performance Map</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 min-h-[220px]">
        {stockAssets.map((asset, index) => {
          const isBig = index === 0 || index === 1;
          const colorClass = getColor(asset.changePercent);

          return (
            <div
              key={asset.id}
              onClick={() => onSelectAsset(asset)}
              className={`${colorClass} ${
                isBig ? 'col-span-2 row-span-2 min-h-[120px]' : 'col-span-1 min-h-[64px]'
              } rounded-lg p-2.5 flex flex-col justify-between cursor-pointer transition-transform hover:scale-[1.02] shadow-sm hover:z-10`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm leading-tight">{asset.symbol}</span>
                {isBig && <span className="text-[10px] opacity-80 uppercase font-semibold">{asset.name}</span>}
              </div>

              <div className="text-right">
                <div className="font-data-tabular text-xs font-semibold">
                  ${asset.price.toFixed(2)}
                </div>
                <div className="font-data-tabular text-[11px] font-bold">
                  {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] text-[#8d90a2] pt-1 font-data-tabular">
        <span className="text-[#F23645] font-semibold">-3% Bearish</span>
        <span>0% Neutral</span>
        <span className="text-[#089981] font-semibold">+3% Bullish</span>
      </div>
    </div>
  );
};
