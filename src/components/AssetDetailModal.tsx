import React, { useState } from 'react';
import { AssetQuote, PaperTradePosition } from '../types';
import { InteractiveChart } from './InteractiveChart';

interface AssetDetailModalProps {
  asset: AssetQuote | null;
  onClose: () => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (asset: AssetQuote) => void;
  onExecuteTrade: (position: PaperTradePosition) => void;
  accountBalance: number;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  onClose,
  isInWatchlist,
  onToggleWatchlist,
  onExecuteTrade,
  accountBalance
}) => {
  if (!asset) return null;

  const [tradeAction, setTradeAction] = useState<'BUY' | 'SELL' | null>(null);
  const [tradeShares, setTradeShares] = useState<number>(10);
  const [tradeSuccessToast, setTradeSuccessToast] = useState<string | null>(null);

  const isPos = asset.changePercent >= 0;
  const totalCost = tradeShares * asset.price;

  const handleConfirmTrade = () => {
    if (!tradeAction) return;
    if (tradeAction === 'BUY' && totalCost > accountBalance) {
      alert('Insufficient paper trading balance!');
      return;
    }

    onExecuteTrade({
      symbol: asset.symbol,
      name: asset.name,
      shares: tradeShares,
      avgPrice: asset.price,
      currentPrice: asset.price,
      type: tradeAction,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setTradeSuccessToast(`Successfully executed ${tradeAction} order for ${tradeShares} shares of ${asset.symbol}!`);
    setTimeout(() => {
      setTradeSuccessToast(null);
      setTradeAction(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#171b26] border border-[#2A2E39] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-[#2A2E39] bg-[#1E222D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0f131e] border border-[#2A2E39] flex items-center justify-center overflow-hidden p-1.5 shrink-0">
              {asset.logoUrl ? (
                <img src={asset.logoUrl} alt={asset.name} referrerPolicy="no-referrer" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs font-bold text-[#b6c4ff]">{asset.symbol.slice(0, 3)}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-headline text-[#dfe2f2]">{asset.name}</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#262a35] text-[#b6c4ff] border border-[#2A2E39]">
                  {asset.symbol}
                </span>
              </div>
              <p className="text-xs text-[#B2B5BE]">{asset.exchange || 'Global Market'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Watchlist Star */}
            <button
              onClick={() => onToggleWatchlist(asset)}
              className={`p-2 rounded-full border transition-colors cursor-pointer ${
                isInWatchlist
                  ? 'bg-[#2962ff]/20 border-[#2962ff] text-[#2962ff]'
                  : 'bg-[#171b26] border-[#2A2E39] text-[#B2B5BE] hover:text-[#dfe2f2]'
              }`}
              title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <span className={`material-symbols-outlined text-[20px] ${isInWatchlist ? 'fill text-[#2962ff]' : ''}`}>
                star
              </span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#171b26] border border-[#2A2E39] text-[#B2B5BE] hover:text-[#dfe2f2] hover:bg-[#313441] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-6 flex-grow">
          {/* Toast */}
          {tradeSuccessToast && (
            <div className="p-3 bg-[#089981]/20 border border-[#089981] text-[#089981] rounded-xl text-xs font-semibold text-center animate-bounce">
              {tradeSuccessToast}
            </div>
          )}

          {/* Interactive Chart */}
          <InteractiveChart asset={asset} height={260} />

          {/* Key Statistics Grid */}
          <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl p-4">
            <h4 className="text-xs font-semibold text-[#8d90a2] uppercase tracking-wider mb-3">
              Key Statistics & Overview
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-data-tabular">
              <div>
                <span className="text-[#8d90a2] block">Previous Close</span>
                <span className="text-sm font-semibold text-[#dfe2f2]">${asset.previousClose.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[#8d90a2] block">Day Range</span>
                <span className="text-sm font-semibold text-[#dfe2f2]">${asset.dayLow.toFixed(2)} - ${asset.dayHigh.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[#8d90a2] block">52-Wk Range</span>
                <span className="text-sm font-semibold text-[#dfe2f2]">${asset.yearLow.toFixed(2)} - ${asset.yearHigh.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[#8d90a2] block">Volume</span>
                <span className="text-sm font-semibold text-[#dfe2f2]">{asset.volume}</span>
              </div>
              {asset.marketCap && (
                <div>
                  <span className="text-[#8d90a2] block">Market Cap</span>
                  <span className="text-sm font-semibold text-[#dfe2f2]">${asset.marketCap}</span>
                </div>
              )}
              {asset.peRatio && (
                <div>
                  <span className="text-[#8d90a2] block">P/E Ratio</span>
                  <span className="text-sm font-semibold text-[#dfe2f2]">{asset.peRatio}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {asset.description && (
            <div className="text-xs text-[#B2B5BE] leading-relaxed bg-[#1E222D]/60 p-3 rounded-xl border border-[#2A2E39]">
              <p>{asset.description}</p>
            </div>
          )}

          {/* Trade Order Panel */}
          {tradeAction && (
            <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#dfe2f2]">
                  Order: <span className={tradeAction === 'BUY' ? 'text-[#089981]' : 'text-[#F23645]'}>{tradeAction}</span> {asset.symbol}
                </span>
                <span className="text-xs text-[#8d90a2] font-data-tabular">
                  Balance: ${accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs text-[#B2B5BE]">Shares / Qty:</label>
                <div className="flex items-center gap-2">
                  {[1, 5, 10, 50, 100].map((qty) => (
                    <button
                      key={qty}
                      onClick={() => setTradeShares(qty)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                        tradeShares === qty ? 'bg-[#2962ff] text-white' : 'bg-[#262a35] text-[#B2B5BE] hover:text-white'
                      }`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#2A2E39] text-xs">
                <span className="text-[#8d90a2]">Estimated Total:</span>
                <span className="font-bold text-sm font-data-tabular text-[#dfe2f2]">
                  ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleConfirmTrade}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold text-white shadow-md cursor-pointer transition-all ${
                    tradeAction === 'BUY' ? 'bg-[#089981] hover:bg-[#089981]/90' : 'bg-[#F23645] hover:bg-[#F23645]/90'
                  }`}
                >
                  Confirm {tradeAction} {tradeShares} {asset.symbol}
                </button>
                <button
                  onClick={() => setTradeAction(null)}
                  className="px-4 py-2.5 rounded-lg bg-[#262a35] hover:bg-[#313441] text-[#dfe2f2] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Trading Actions */}
        {!tradeAction && (
          <div className="p-4 border-t border-[#2A2E39] bg-[#1E222D] flex gap-3">
            <button
              onClick={() => setTradeAction('BUY')}
              className="flex-1 bg-[#089981] hover:bg-[#089981]/90 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98 shadow-md"
            >
              <span>BUY</span>
              <span className="font-data-tabular font-normal opacity-90">${asset.price.toFixed(2)}</span>
            </button>
            <button
              onClick={() => setTradeAction('SELL')}
              className="flex-1 bg-[#F23645] hover:bg-[#F23645]/90 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98 shadow-md"
            >
              <span>SELL</span>
              <span className="font-data-tabular font-normal opacity-90">${asset.price.toFixed(2)}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
