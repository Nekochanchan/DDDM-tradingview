import React from 'react';
import { AssetQuote } from '../types';

interface TickerTapeProps {
  assets: AssetQuote[];
  onSelectAsset: (asset: AssetQuote) => void;
  flashingSymbols?: { [symbol: string]: 'green' | 'red' };
}

export const TickerTape: React.FC<TickerTapeProps> = ({
  assets,
  onSelectAsset,
  flashingSymbols = {}
}) => {
  const displayItems = assets.slice(0, 10);

  return (
    <div className="w-full bg-[#131722] border-b border-[#2A2E39] overflow-hidden py-1.5 px-2 select-none">
      <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar whitespace-nowrap text-xs">
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#8d90a2] tracking-wider pl-1 pr-2 border-r border-[#2A2E39]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#089981] animate-ping" />
          <span>Live Ticker</span>
        </div>

        <div className="flex items-center gap-6 animate-none">
          {displayItems.map((asset) => {
            const isPos = asset.changePercent >= 0;
            const flash = flashingSymbols[asset.symbol];

            return (
              <div
                key={asset.id}
                onClick={() => onSelectAsset(asset)}
                className={`flex items-center gap-2 cursor-pointer hover:bg-[#1E222D] px-2 py-0.5 rounded transition-colors ${
                  flash === 'green' ? 'flash-green' : flash === 'red' ? 'flash-red' : ''
                }`}
              >
                <span className="font-bold text-[#dfe2f2]">{asset.symbol}</span>
                <span className="font-data-tabular text-[#dfe2f2]">
                  {asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span
                  className={`font-data-tabular text-[11px] font-semibold flex items-center ${
                    isPos ? 'text-[#089981]' : 'text-[#F23645]'
                  }`}
                >
                  {isPos ? '+' : ''}{asset.changePercent.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
