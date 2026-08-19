import React, { useState } from 'react';
import { AssetQuote } from '../types';
import { Sparkline } from './Sparkline';

interface WatchlistScreenProps {
  watchlist: AssetQuote[];
  onSelectAsset: (asset: AssetQuote) => void;
  onRemoveFromWatchlist: (symbol: string) => void;
  onOpenSearch: () => void;
  flashingSymbols?: { [symbol: string]: 'green' | 'red' };
}

export const WatchlistScreen: React.FC<WatchlistScreenProps> = ({
  watchlist,
  onSelectAsset,
  onRemoveFromWatchlist,
  onOpenSearch,
  flashingSymbols = {}
}) => {
  const [filterType, setFilterType] = useState<'all' | 'gainers' | 'losers'>('all');

  const filtered = watchlist.filter((item) => {
    if (filterType === 'gainers') return item.changePercent > 0;
    if (filterType === 'losers') return item.changePercent < 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold font-headline text-[#dfe2f2]">My Watchlist</h1>
          <p className="text-xs text-[#B2B5BE] mt-0.5">Real-time quotes & custom alerts</p>
        </div>
        <button
          onClick={onOpenSearch}
          className="bg-[#2962ff] text-white px-3.5 py-1.5 rounded-full text-xs font-semibold hover:bg-[#2962ff]/90 flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Add Symbol</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'gainers', 'losers'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer ${
              filterType === type
                ? 'bg-[#1E222D] text-[#b6c4ff] border border-[#2962ff]'
                : 'bg-[#171b26] text-[#8d90a2] border border-[#2A2E39]'
            }`}
          >
            {type} ({type === 'all' ? watchlist.length : watchlist.filter(w => type === 'gainers' ? w.changePercent > 0 : w.changePercent < 0).length})
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-[#1E222D] border border-[#2A2E39] rounded-2xl p-8 text-center space-y-3">
          <span className="material-symbols-outlined text-4xl text-[#8d90a2]">star_border</span>
          <h3 className="text-base font-bold text-[#dfe2f2]">Your Watchlist is Empty</h3>
          <p className="text-xs text-[#8d90a2] max-w-sm mx-auto">
            Click "Add Symbol" or tap the star icon on any market quote to track your favorite instruments.
          </p>
          <button
            onClick={onOpenSearch}
            className="bg-[#2962ff] text-white px-4 py-2 rounded-xl text-xs font-bold"
          >
            Browse Markets
          </button>
        </div>
      ) : (
        <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl divide-y divide-[#2A2E39] overflow-hidden">
          {filtered.map((item) => {
            const isPos = item.changePercent >= 0;
            const flash = flashingSymbols[item.symbol];

            return (
              <div
                key={item.id}
                onClick={() => onSelectAsset(item)}
                className={`p-4 flex items-center justify-between hover:bg-[#262a35] transition-colors cursor-pointer ${
                  flash === 'green' ? 'flash-green' : flash === 'red' ? 'flash-red' : ''
                }`}
              >
                {/* Symbol & Name */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0f131e] border border-[#2A2E39] flex items-center justify-center text-xs font-bold text-[#b6c4ff] shrink-0">
                    {item.logoUrl ? (
                      <img src={item.logoUrl} alt={item.name} referrerPolicy="no-referrer" className="w-6 h-6 object-contain" />
                    ) : (
                      item.symbol.slice(0, 3)
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#dfe2f2]">{item.symbol}</div>
                    <div className="text-xs text-[#8d90a2] truncate max-w-[120px]">{item.name}</div>
                  </div>
                </div>

                {/* Mini Sparkline */}
                <div className="hidden sm:block w-24">
                  <Sparkline data={item.history1D} isPositive={isPos} height={30} />
                </div>

                {/* Price & Change */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold font-data-tabular text-[#dfe2f2]">
                      ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div
                      className={`text-xs font-semibold font-data-tabular flex items-center justify-end ${
                        isPos ? 'text-[#089981]' : 'text-[#F23645]'
                      }`}
                    >
                      <span>{isPos ? '+' : ''}{item.changePercent.toFixed(2)}%</span>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromWatchlist(item.symbol);
                    }}
                    className="p-1 rounded text-[#8d90a2] hover:text-[#F23645] transition-colors"
                    title="Remove"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
