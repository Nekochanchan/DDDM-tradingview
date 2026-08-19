import React from 'react';
import { AssetQuote } from '../types';

interface StockListProps {
  title?: string;
  stocks: AssetQuote[];
  onSelectStock: (stock: AssetQuote) => void;
  onViewAll?: () => void;
  flashingSymbols?: { [symbol: string]: 'green' | 'red' };
}

export const StockList: React.FC<StockListProps> = ({
  title = 'US stocks',
  stocks,
  onSelectStock,
  onViewAll,
  flashingSymbols = {}
}) => {
  return (
    <section>
      <div 
        onClick={onViewAll}
        className="flex items-center gap-2 mb-4 cursor-pointer group w-fit"
      >
        {/* Flag Icon */}
        <div className="w-6 h-6 rounded-full overflow-hidden bg-[#1E222D] border border-[#2A2E39] flex items-center justify-center text-xs">
          🇺🇸
        </div>
        <h2 className="text-[28px] leading-8 font-bold font-headline text-[#dfe2f2] group-hover:text-white transition-colors">
          {title}
        </h2>
        <span className="material-symbols-outlined text-[28px] text-[#dfe2f2] group-hover:translate-x-0.5 transition-transform">
          chevron_right
        </span>
      </div>

      {/* List Container with 1px border gutters */}
      <div className="flex flex-col gap-[1px] bg-[#2A2E39] rounded-xl overflow-hidden border border-[#2A2E39]">
        {stocks.map((stock) => {
          const isPos = stock.changePercent >= 0;
          const flash = flashingSymbols[stock.symbol];

          return (
            <div
              key={stock.id}
              onClick={() => onSelectStock(stock)}
              className={`bg-[#0f131e] flex items-center justify-between p-4 min-h-[64px] hover:bg-[#313441] transition-colors cursor-pointer ${
                flash === 'green' ? 'flash-green' : flash === 'red' ? 'flash-red' : ''
              }`}
            >
              {/* Left: Logo & Names */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1E222D] flex items-center justify-center border border-[#2A2E39] overflow-hidden p-1.5 shrink-0">
                  {stock.logoUrl ? (
                    <img
                      src={stock.logoUrl}
                      alt={stock.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs font-bold text-[#b6c4ff]">
                      {stock.symbol.slice(0, 3)}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-base font-semibold text-[#dfe2f2]">
                    {stock.name}
                  </div>
                  <div className="text-[11px] text-[#B2B5BE] font-data-tabular">
                    {stock.symbol}
                  </div>
                </div>
              </div>

              {/* Right: Tabular Price & Colored Change */}
              <div className="text-right">
                <div className="text-sm font-semibold font-data-tabular text-[#dfe2f2]">
                  {stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </div>
                <div
                  className={`text-xs font-semibold font-data-tabular flex items-center justify-end ${
                    isPos ? 'text-[#089981]' : 'text-[#F23645]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {isPos ? 'arrow_upward' : 'arrow_downward'}
                  </span>
                  <span>{Math.abs(stock.changePercent).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
