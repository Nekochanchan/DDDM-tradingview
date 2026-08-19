import React, { useState, useMemo } from 'react';
import { AssetQuote, AssetCategory } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  allAssets: AssetQuote[];
  onSelectAsset: (asset: AssetQuote) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  allAssets,
  onSelectAsset
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredAssets = useMemo(() => {
    return allAssets.filter((asset) => {
      const matchCat = filterCategory === 'all' || asset.category === filterCategory;
      const matchQuery =
        asset.symbol.toLowerCase().includes(query.toLowerCase()) ||
        asset.name.toLowerCase().includes(query.toLowerCase()) ||
        (asset.subName && asset.subName.toLowerCase().includes(query.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [allAssets, query, filterCategory]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:pt-16 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#171b26] border border-[#2A2E39] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        {/* Search Input */}
        <div className="p-4 border-b border-[#2A2E39] bg-[#1E222D] flex items-center gap-3">
          <span className="material-symbols-outlined text-[#8d90a2] text-[22px]">search</span>
          <input
            type="text"
            placeholder="Search symbol, company, crypto, or forex..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-[#dfe2f2] placeholder-[#8d90a2] focus:outline-none font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[#8d90a2] hover:text-[#dfe2f2]">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2 py-1 rounded bg-[#262a35] text-[#dfe2f2] hover:bg-[#313441]"
          >
            ESC
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-1.5 p-2.5 overflow-x-auto hide-scrollbar bg-[#131722] border-b border-[#2A2E39]">
          {['all', 'stocks', 'indices', 'crypto', 'forex', 'futures', 'bonds'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[#2962ff] text-white'
                  : 'bg-[#1E222D] text-[#8d90a2] hover:text-[#dfe2f2]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto flex-grow divide-y divide-[#2A2E39]">
          {filteredAssets.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#8d90a2]">
              No instruments found matching "{query}"
            </div>
          ) : (
            filteredAssets.map((asset) => {
              const isPos = asset.changePercent >= 0;
              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    onSelectAsset(asset);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3.5 hover:bg-[#1E222D] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1E222D] border border-[#2A2E39] flex items-center justify-center text-[10px] font-bold text-[#b6c4ff] shrink-0">
                      {asset.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#dfe2f2]">{asset.symbol}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#262a35] text-[#8d90a2] uppercase">
                          {asset.category}
                        </span>
                      </div>
                      <div className="text-xs text-[#B2B5BE]">{asset.name}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-semibold font-data-tabular text-[#dfe2f2]">
                      ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className={`text-[11px] font-semibold font-data-tabular ${isPos ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                      {isPos ? '+' : ''}{asset.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
