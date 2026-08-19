import React, { useState, useEffect, useMemo } from 'react';
import { AssetQuote, AssetCategory, PaperTradePosition } from './types';
import {
  INITIAL_WORLD_INDICES,
  INITIAL_US_STOCKS,
  OTHER_MARKET_ASSETS,
  ALL_ASSETS,
  FINANCIAL_NEWS,
  TRADING_IDEAS
} from './data/marketData';
import { Header } from './components/Header';
import { ChipNav } from './components/ChipNav';
import { WorldIndices } from './components/WorldIndices';
import { StockList } from './components/StockList';
import { BottomNavBar, TabType } from './components/BottomNavBar';
import { AssetDetailModal } from './components/AssetDetailModal';
import { SearchModal } from './components/SearchModal';
import { WatchlistScreen } from './components/WatchlistScreen';
import { NewsScreen } from './components/NewsScreen';
import { IdeasScreen } from './components/IdeasScreen';
import { MenuScreen } from './components/MenuScreen';
import { GetStartedModal } from './components/GetStartedModal';

export default function App() {
  // Navigation & Active Screen state
  const [activeTab, setActiveTab] = useState<TabType>('markets');
  const [activeCategory, setActiveCategory] = useState<AssetCategory>('indices');
  const [marketRegionDropdown, setMarketRegionDropdown] = useState<string>('everywhere');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Asset Quotes State with Live Sim
  const [worldIndices, setWorldIndices] = useState<AssetQuote[]>(INITIAL_WORLD_INDICES);
  const [usStocks, setUsStocks] = useState<AssetQuote[]>(INITIAL_US_STOCKS);
  const [otherAssets, setOtherAssets] = useState<AssetQuote[]>(OTHER_MARKET_ASSETS);
  const [flashingSymbols, setFlashingSymbols] = useState<{ [symbol: string]: 'green' | 'red' }>({});

  // Modals & Panels state
  const [selectedAsset, setSelectedAsset] = useState<AssetQuote | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isGetStartedOpen, setIsGetStartedOpen] = useState<boolean>(false);

  // Watchlist & Paper Trading state
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(['NVDA', 'AAPL', 'SPX', 'BTC/USD']);
  const [accountBalance, setAccountBalance] = useState<number>(100000);
  const [positions, setPositions] = useState<PaperTradePosition[]>([
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      shares: 20,
      avgPrice: 130.50,
      currentPrice: 135.58,
      type: 'BUY',
      timestamp: '10:15 AM'
    },
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      shares: 15,
      avgPrice: 228.00,
      currentPrice: 226.34,
      type: 'BUY',
      timestamp: '11:30 AM'
    }
  ]);

  // Combined asset list
  const allCurrentAssets = useMemo(() => {
    return [...worldIndices, ...usStocks, ...otherAssets];
  }, [worldIndices, usStocks, otherAssets]);

  // Active category assets for main view
  const categoryAssets = useMemo(() => {
    if (activeCategory === 'stocks') return usStocks;
    if (activeCategory === 'indices') return worldIndices;
    return otherAssets.filter(a => a.category === activeCategory);
  }, [activeCategory, usStocks, worldIndices, otherAssets]);

  // Watchlist items
  const watchlistItems = useMemo(() => {
    return allCurrentAssets.filter(a => watchlistSymbols.includes(a.symbol));
  }, [allCurrentAssets, watchlistSymbols]);

  // Simulated Live Market Price Fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      const all = [...allCurrentAssets];
      if (all.length === 0) return;
      const target = all[Math.floor(Math.random() * all.length)];
      const deltaFactor = (Math.random() - 0.49) * 0.004; // -0.2% to +0.2%
      const newPrice = Number((target.price * (1 + deltaFactor)).toFixed(target.price < 10 ? 4 : 2));
      const isUp = newPrice >= target.price;

      // Update in appropriate state
      const updateList = (list: AssetQuote[]) =>
        list.map(item => {
          if (item.symbol === target.symbol) {
            const newHistory = [...item.history1D];
            if (newHistory.length > 0) {
              newHistory[newHistory.length - 1] = {
                ...newHistory[newHistory.length - 1],
                price: newPrice
              };
            }
            return {
              ...item,
              price: newPrice,
              change: Number((newPrice - item.previousClose).toFixed(2)),
              changePercent: Number((((newPrice - item.previousClose) / item.previousClose) * 100).toFixed(2)),
              history1D: newHistory
            };
          }
          return item;
        });

      setWorldIndices(prev => updateList(prev));
      setUsStocks(prev => updateList(prev));
      setOtherAssets(prev => updateList(prev));

      // Trigger flash highlight
      setFlashingSymbols(prev => ({ ...prev, [target.symbol]: isUp ? 'green' : 'red' }));
      setTimeout(() => {
        setFlashingSymbols(prev => {
          const next = { ...prev };
          delete next[target.symbol];
          return next;
        });
      }, 1200);

      // Also update selectedAsset if modal is open
      setSelectedAsset(prev => {
        if (prev && prev.symbol === target.symbol) {
          return {
            ...prev,
            price: newPrice,
            change: Number((newPrice - prev.previousClose).toFixed(2)),
            changePercent: Number((((newPrice - prev.previousClose) / prev.previousClose) * 100).toFixed(2))
          };
        }
        return prev;
      });

      // Update paper trading position prices
      setPositions(prev =>
        prev.map(p => {
          if (p.symbol === target.symbol) {
            return { ...p, currentPrice: newPrice };
          }
          return p;
        })
      );
    }, 3200);

    return () => clearInterval(interval);
  }, [allCurrentAssets]);

  // Watchlist Toggle
  const handleToggleWatchlist = (asset: AssetQuote) => {
    setWatchlistSymbols(prev =>
      prev.includes(asset.symbol)
        ? prev.filter(s => s !== asset.symbol)
        : [...prev, asset.symbol]
    );
  };

  // Trade Execution
  const handleExecuteTrade = (newPos: PaperTradePosition) => {
    if (newPos.type === 'BUY') {
      setAccountBalance(prev => prev - newPos.shares * newPos.avgPrice);
      setPositions(prev => {
        const existing = prev.find(p => p.symbol === newPos.symbol);
        if (existing) {
          const totalShares = existing.shares + newPos.shares;
          const weightedAvg = (existing.shares * existing.avgPrice + newPos.shares * newPos.avgPrice) / totalShares;
          return prev.map(p =>
            p.symbol === newPos.symbol
              ? { ...p, shares: totalShares, avgPrice: weightedAvg }
              : p
          );
        }
        return [...prev, newPos];
      });
    } else {
      // Sell
      setAccountBalance(prev => prev + newPos.shares * newPos.avgPrice);
      setPositions(prev =>
        prev
          .map(p => {
            if (p.symbol === newPos.symbol) {
              const rem = p.shares - newPos.shares;
              return rem > 0 ? { ...p, shares: rem } : null;
            }
            return p;
          })
          .filter(Boolean) as PaperTradePosition[]
      );
    }
  };

  const handleSelectSymbolByName = (symbol: string) => {
    const found = allCurrentAssets.find(a => a.symbol === symbol);
    if (found) {
      setSelectedAsset(found);
    }
  };

  return (
    <div className="bg-[#0f131e] text-[#dfe2f2] min-h-screen pb-24 font-body-md selection:bg-[#2962ff]/30 selection:text-white">
      {/* Top App Bar Header */}
      <Header
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAccount={() => setIsGetStartedOpen(true)}
        accountBalance={accountBalance}
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* TAB 1: MARKETS (Default screen matching screenshot) */}
        {activeTab === 'markets' && (
          <div>
            {/* Header: Title + Dropdown */}
            <div className="relative mb-6">
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 cursor-pointer w-fit select-none group"
              >
                <h1 className="text-[32px] leading-10 font-bold font-headline tracking-tight text-[#dfe2f2] group-hover:text-white">
                  Markets, {marketRegionDropdown}
                </h1>
                <span className={`material-symbols-outlined text-[32px] text-[#dfe2f2] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-12 left-0 z-30 bg-[#1E222D] border border-[#2A2E39] rounded-xl py-2 w-64 shadow-2xl animate-in fade-in zoom-in-95">
                  {[
                    { id: 'everywhere', label: 'Markets, everywhere' },
                    { id: 'US', label: 'Markets, United States' },
                    { id: 'Europe', label: 'Markets, Europe' },
                    { id: 'Asia', label: 'Markets, Asia-Pacific' },
                    { id: 'Crypto', label: 'Markets, Crypto' }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setMarketRegionDropdown(option.id);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-[#262a35] text-[#dfe2f2] flex items-center justify-between cursor-pointer"
                    >
                      <span>{option.label}</span>
                      {marketRegionDropdown === option.id && (
                        <span className="material-symbols-outlined text-[16px] text-[#2962ff]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Horizontal Chip Filter Navigation */}
            <ChipNav
              activeCategory={activeCategory}
              onSelectCategory={(cat) => setActiveCategory(cat)}
            />

            {/* If 'indices' is active, show World Indices Grid + US Stocks */}
            {activeCategory === 'indices' ? (
              <>
                {/* World Indices Section */}
                <WorldIndices
                  indices={worldIndices}
                  onSelectIndex={(asset) => setSelectedAsset(asset)}
                  onViewAllIndices={() => {}}
                />

                {/* US Stocks Section */}
                <StockList
                  title="US stocks"
                  stocks={usStocks}
                  onSelectStock={(asset) => setSelectedAsset(asset)}
                  flashingSymbols={flashingSymbols}
                />
              </>
            ) : (
              /* If another category is active (Crypto, Futures, Forex, Bonds, Stocks), show category list */
              <div className="space-y-6">
                <StockList
                  title={`${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} instruments`}
                  stocks={categoryAssets}
                  onSelectStock={(asset) => setSelectedAsset(asset)}
                  flashingSymbols={flashingSymbols}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WATCHLIST */}
        {activeTab === 'watchlist' && (
          <WatchlistScreen
            watchlist={watchlistItems}
            onSelectAsset={(asset) => setSelectedAsset(asset)}
            onRemoveFromWatchlist={(sym) => handleToggleWatchlist(allCurrentAssets.find(a => a.symbol === sym)!)}
            onOpenSearch={() => setIsSearchOpen(true)}
            flashingSymbols={flashingSymbols}
          />
        )}

        {/* TAB 3: NEWS */}
        {activeTab === 'news' && (
          <NewsScreen
            news={FINANCIAL_NEWS}
            onSelectSymbol={handleSelectSymbolByName}
          />
        )}

        {/* TAB 4: IDEAS */}
        {activeTab === 'ideas' && (
          <IdeasScreen
            ideas={TRADING_IDEAS}
            onSelectSymbol={handleSelectSymbolByName}
          />
        )}

        {/* TAB 5: MENU (When selected from bottom tab) */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <h1 className="text-[28px] font-bold font-headline text-[#dfe2f2]">TradingView Hub</h1>
            <div className="bg-[#1E222D] border border-[#2A2E39] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#2962ff] flex items-center justify-center font-bold text-white text-lg">
                  TV
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#dfe2f2]">TradingView Pro Hub</h3>
                  <p className="text-xs text-[#8d90a2]">Paper Trading: ${accountBalance.toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(true)}
                className="w-full bg-[#2962ff] text-white py-3 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Open Full Trading Dashboard & Calendar
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        watchlistCount={watchlistSymbols.length}
      />

      {/* Asset Interactive Detail & Trading Modal */}
      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          isInWatchlist={watchlistSymbols.includes(selectedAsset.symbol)}
          onToggleWatchlist={handleToggleWatchlist}
          onExecuteTrade={handleExecuteTrade}
          accountBalance={accountBalance}
        />
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        allAssets={allCurrentAssets}
        onSelectAsset={(asset) => setSelectedAsset(asset)}
      />

      {/* Side Menu & Paper Trading Drawer */}
      <MenuScreen
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        accountBalance={accountBalance}
        positions={positions}
        onResetAccount={() => {
          setAccountBalance(100000);
          setPositions([]);
        }}
      />

      {/* Get Started Modal */}
      <GetStartedModal
        isOpen={isGetStartedOpen}
        onClose={() => setIsGetStartedOpen(false)}
        accountBalance={accountBalance}
      />
    </div>
  );
}
