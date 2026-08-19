import React, { useState } from 'react';
import { AssetQuote, PaperTradePosition } from '../types';
import { InteractiveChart } from './InteractiveChart';
import { Level2OrderBook } from './Level2OrderBook';
import { TechnicalGauge } from './TechnicalGauge';
import { sounds } from '../utils/audio';

interface AssetDetailModalProps {
  asset: AssetQuote | null;
  onClose: () => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (asset: AssetQuote) => void;
  onExecuteTrade: (position: PaperTradePosition) => void;
  accountBalance: number;
}

type OrderType = 'MARKET' | 'LIMIT' | 'STOP';

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  onClose,
  isInWatchlist,
  onToggleWatchlist,
  onExecuteTrade,
  accountBalance
}) => {
  if (!asset) return null;

  const [activeTab, setActiveTab] = useState<'chart' | 'orderbook' | 'technicals'>('chart');
  const [tradeAction, setTradeAction] = useState<'BUY' | 'SELL' | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [tradeShares, setTradeShares] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(asset.price);
  const [leverage, setLeverage] = useState<number>(1);
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [tradeSuccessToast, setTradeSuccessToast] = useState<string | null>(null);

  const effectivePrice = orderType === 'LIMIT' ? limitPrice : asset.price;
  const totalCost = (tradeShares * effectivePrice) / leverage;

  const handleConfirmTrade = () => {
    if (!tradeAction) return;
    if (tradeAction === 'BUY' && totalCost > accountBalance) {
      alert('Insufficient paper trading balance!');
      return;
    }

    // Play institutional audio confirmation
    sounds.playTradeFilled();

    onExecuteTrade({
      symbol: asset.symbol,
      name: asset.name,
      shares: tradeShares,
      avgPrice: effectivePrice,
      currentPrice: asset.price,
      type: tradeAction,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setTradeSuccessToast(`Filled ${orderType} ${tradeAction} ${tradeShares}x ${asset.symbol} @ $${effectivePrice.toFixed(2)} (${leverage}x leverage)`);
    setTimeout(() => {
      setTradeSuccessToast(null);
      setTradeAction(null);
    }, 2400);
  };

  // 52-week position calculation
  const yearRange = asset.yearHigh - asset.yearLow || 1;
  const yearPct = Math.min(100, Math.max(0, ((asset.price - asset.yearLow) / yearRange) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#171b26] border border-[#2A2E39] rounded-2xl w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-3.5 border-b border-[#2A2E39] bg-[#1E222D]">
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
                <h3 className="text-base sm:text-lg font-bold font-headline text-[#dfe2f2]">{asset.name}</h3>
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

        {/* Pro Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#131722] border-b border-[#2A2E39] text-xs">
          {[
            { id: 'chart', label: 'Interactive Chart', icon: 'show_chart' },
            { id: 'orderbook', label: 'Level 2 Depth', icon: 'table_chart' },
            { id: 'technicals', label: 'Technicals & Rating', icon: 'speed' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#2962ff] text-white shadow-sm'
                  : 'text-[#8d90a2] hover:text-[#dfe2f2] hover:bg-[#1E222D]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-grow">
          {/* Toast */}
          {tradeSuccessToast && (
            <div className="p-3 bg-[#089981]/20 border border-[#089981] text-[#089981] rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>{tradeSuccessToast}</span>
            </div>
          )}

          {/* TAB 1: CHART */}
          {activeTab === 'chart' && (
            <InteractiveChart asset={asset} height={270} />
          )}

          {/* TAB 2: ORDER BOOK */}
          {activeTab === 'orderbook' && (
            <div className="space-y-4">
              <Level2OrderBook currentPrice={asset.price} />
            </div>
          )}

          {/* TAB 3: TECHNICALS */}
          {activeTab === 'technicals' && (
            <div className="space-y-4">
              <TechnicalGauge changePercent={asset.changePercent} />
            </div>
          )}

          {/* 52-Week Range Visual Slider */}
          <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between text-xs text-[#8d90a2]">
              <span>52-Wk Low: ${asset.yearLow.toFixed(2)}</span>
              <span className="font-semibold text-[#dfe2f2]">Current: ${asset.price.toFixed(2)}</span>
              <span>52-Wk High: ${asset.yearHigh.toFixed(2)}</span>
            </div>
            <div className="relative w-full h-2 rounded-full bg-[#131722] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#F23645]/40 via-[#e6a23c]/40 to-[#089981]/40" />
              <div
                className="absolute top-0 bottom-0 w-2.5 bg-white rounded-full shadow-md"
                style={{ left: `calc(${yearPct}% - 5px)` }}
              />
            </div>
          </div>

          {/* Key Statistics Grid */}
          <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl p-4">
            <h4 className="text-xs font-semibold text-[#8d90a2] uppercase tracking-wider mb-3">
              Key Market Data & Fundamentals
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
              <div>
                <span className="text-[#8d90a2] block">Volatility</span>
                <span className="text-sm font-semibold text-[#dfe2f2]">{(Math.abs(asset.changePercent) * 1.4).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {asset.description && (
            <div className="text-xs text-[#B2B5BE] leading-relaxed bg-[#1E222D]/60 p-3 rounded-xl border border-[#2A2E39]">
              <p>{asset.description}</p>
            </div>
          )}

          {/* Pro Trade Order Ticket Panel */}
          {tradeAction && (
            <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#dfe2f2]">
                    Order Ticket: <span className={tradeAction === 'BUY' ? 'text-[#089981]' : 'text-[#F23645]'}>{tradeAction}</span> {asset.symbol}
                  </span>
                  <div className="flex gap-1 bg-[#131722] p-0.5 rounded border border-[#2A2E39]">
                    {(['MARKET', 'LIMIT', 'STOP'] as OrderType[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setOrderType(t)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          orderType === t ? 'bg-[#2962ff] text-white' : 'text-[#8d90a2]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-[#8d90a2] font-data-tabular">
                  Balance: ${accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {orderType === 'LIMIT' && (
                <div className="flex items-center justify-between gap-2 bg-[#131722] p-2.5 rounded-lg border border-[#2A2E39] text-xs">
                  <span className="text-[#8d90a2]">Limit Price ($):</span>
                  <input
                    type="number"
                    step="0.1"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(Number(e.target.value))}
                    className="bg-[#1E222D] text-right font-data-tabular font-bold text-white px-2 py-1 rounded border border-[#2A2E39] w-28 focus:outline-none focus:border-[#2962ff]"
                  />
                </div>
              )}

              {/* Quantity Preset */}
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs text-[#B2B5BE]">Shares / Qty:</label>
                <div className="flex items-center gap-1.5">
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

              {/* Leverage Selector */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-[#B2B5BE]">Leverage / Margin:</span>
                <div className="flex gap-1">
                  {[1, 2, 5, 10].map(lev => (
                    <button
                      key={lev}
                      onClick={() => setLeverage(lev)}
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        leverage === lev ? 'bg-[#e6a23c] text-black' : 'bg-[#131722] text-[#8d90a2]'
                      }`}
                    >
                      {lev}x
                    </button>
                  ))}
                </div>
              </div>

              {/* TP & SL Optional inputs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[#089981] text-[11px] block mb-1">Take Profit ($)</label>
                  <input
                    type="number"
                    placeholder={`e.g. ${(effectivePrice * 1.05).toFixed(2)}`}
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="w-full bg-[#131722] border border-[#2A2E39] rounded px-2 py-1 text-[#dfe2f2] font-data-tabular focus:outline-none focus:border-[#089981]"
                  />
                </div>
                <div>
                  <label className="text-[#F23645] text-[11px] block mb-1">Stop Loss ($)</label>
                  <input
                    type="number"
                    placeholder={`e.g. ${(effectivePrice * 0.95).toFixed(2)}`}
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="w-full bg-[#131722] border border-[#2A2E39] rounded px-2 py-1 text-[#dfe2f2] font-data-tabular focus:outline-none focus:border-[#F23645]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#2A2E39] text-xs">
                <span className="text-[#8d90a2]">Margin Required:</span>
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
                  Place {orderType} {tradeAction} ({tradeShares} {asset.symbol})
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

        {/* Modal Bottom Quick Trading Actions */}
        {!tradeAction && (
          <div className="p-3.5 border-t border-[#2A2E39] bg-[#1E222D] flex gap-3">
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

