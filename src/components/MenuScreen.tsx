import React, { useState } from 'react';
import { PaperTradePosition, EconomicEvent } from '../types';
import { ECONOMIC_CALENDAR } from '../data/marketData';

interface MenuScreenProps {
  isOpen: boolean;
  onClose: () => void;
  accountBalance: number;
  positions: PaperTradePosition[];
  onResetAccount: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  isOpen,
  onClose,
  accountBalance,
  positions,
  onResetAccount
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'portfolio' | 'calendar' | 'settings'>('portfolio');

  if (!isOpen) return null;

  const totalPortfolioValue = positions.reduce((acc, p) => acc + p.shares * p.currentPrice, accountBalance);
  const totalProfitLoss = totalPortfolioValue - 100000;
  const isProfitable = totalProfitLoss >= 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-black/75 backdrop-blur-sm">
      <div className="bg-[#171b26] border-r border-[#2A2E39] w-full max-w-md h-full flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-left duration-200">
        
        {/* Top Header */}
        <div className="p-4 border-b border-[#2A2E39] bg-[#1E222D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2962ff] flex items-center justify-center font-bold text-white shadow-md">
              TV
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#dfe2f2]">TradingView Pro Hub</h3>
              <p className="text-[11px] text-[#B2B5BE]">Paper Trading & Market Tools</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#262a35] text-[#8d90a2] hover:text-[#dfe2f2] hover:bg-[#313441]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Sub Nav Tabs */}
        <div className="flex border-b border-[#2A2E39] bg-[#131722]">
          {(['portfolio', 'calendar', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                activeSubTab === tab
                  ? 'text-[#2962ff] border-b-2 border-[#2962ff] bg-[#1E222D]'
                  : 'text-[#8d90a2] hover:text-[#dfe2f2]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-4 overflow-y-auto flex-grow space-y-4">
          {activeSubTab === 'portfolio' && (
            <div className="space-y-4">
              {/* Portfolio Summary Card */}
              <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl p-4 space-y-3">
                <span className="text-xs text-[#8d90a2] uppercase tracking-wider font-semibold">
                  Virtual Portfolio Net Worth
                </span>
                <div className="text-2xl font-bold font-data-tabular text-[#dfe2f2]">
                  ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#2A2E39]">
                  <span className="text-[#8d90a2]">Available Cash:</span>
                  <span className="font-bold font-data-tabular text-[#dfe2f2]">
                    ${accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8d90a2]">Total P&L:</span>
                  <span className={`font-bold font-data-tabular ${isProfitable ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                    {isProfitable ? '+' : ''}${totalProfitLoss.toFixed(2)} ({(totalProfitLoss / 1000).toFixed(2)}%)
                  </span>
                </div>
              </div>

              {/* Positions List */}
              <div>
                <h4 className="text-xs font-semibold text-[#8d90a2] uppercase tracking-wider mb-2">
                  Open Positions ({positions.length})
                </h4>
                {positions.length === 0 ? (
                  <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl p-6 text-center text-xs text-[#8d90a2]">
                    No open paper trading positions. Open any stock or index to execute simulated trades.
                  </div>
                ) : (
                  <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl divide-y divide-[#2A2E39] overflow-hidden">
                    {positions.map((pos, i) => {
                      const pnl = (pos.currentPrice - pos.avgPrice) * pos.shares;
                      return (
                        <div key={i} className="p-3 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-[#dfe2f2]">{pos.symbol}</div>
                            <div className="text-[11px] text-[#8d90a2]">
                              {pos.shares} shares @ ${pos.avgPrice.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold font-data-tabular text-[#dfe2f2]">
                              ${(pos.shares * pos.currentPrice).toFixed(2)}
                            </div>
                            <div className={`font-semibold font-data-tabular text-[11px] ${pnl >= 0 ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                              {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={onResetAccount}
                className="w-full py-2.5 rounded-xl border border-[#F23645]/40 text-[#F23645] hover:bg-[#F23645]/10 text-xs font-semibold cursor-pointer transition-colors"
              >
                Reset Virtual Account to $100,000
              </button>
            </div>
          )}

          {activeSubTab === 'calendar' && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#8d90a2] uppercase tracking-wider">
                Today's Key Economic Releases
              </h4>
              <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl divide-y divide-[#2A2E39] overflow-hidden">
                {ECONOMIC_CALENDAR.map((ev) => (
                  <div key={ev.id} className="p-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#dfe2f2]">
                        <span>{ev.flag}</span>
                        <span>{ev.event}</span>
                      </div>
                      <span className="text-[11px] text-[#b6c4ff] font-data-tabular font-semibold">
                        {ev.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] font-data-tabular text-[#8d90a2]">
                      <span>Forecast: {ev.forecast}</span>
                      <span>Previous: {ev.previous}</span>
                      {ev.actual && <span className="text-[#089981] font-bold">Actual: {ev.actual}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'settings' && (
            <div className="space-y-3">
              <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl p-4 space-y-3 text-xs">
                <h4 className="font-semibold text-[#8d90a2] uppercase tracking-wider">General Preferences</h4>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#dfe2f2]">Dark Terminal Theme</span>
                  <span className="text-[#089981] font-bold">Active</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#dfe2f2]">Currency Display</span>
                  <span className="text-[#b6c4ff] font-bold">USD ($)</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#dfe2f2]">Real-time Price Flashes</span>
                  <span className="text-[#089981] font-bold">Enabled</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#dfe2f2]">Chart Engine</span>
                  <span className="text-[#b6c4ff] font-bold">SVG Vector 60FPS</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
