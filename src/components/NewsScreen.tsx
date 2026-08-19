import React, { useState } from 'react';
import { NewsItem } from '../types';

interface NewsScreenProps {
  news: NewsItem[];
  onSelectSymbol?: (symbol: string) => void;
}

export const NewsScreen: React.FC<NewsScreenProps> = ({ news, onSelectSymbol }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);

  const categories = ['All', 'Tech & Semiconductors', 'Macroeconomics', 'Crypto', 'Commodities'];
  const filtered = selectedCategory === 'All' ? news : news.filter(n => n.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold font-headline text-[#dfe2f2]">Market News</h1>
        <p className="text-xs text-[#B2B5BE] mt-0.5">Live reporting, earnings updates & economic analysis</p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              selectedCategory === cat
                ? 'bg-[#2962ff] text-white'
                : 'bg-[#1E222D] text-[#8d90a2] border border-[#2A2E39] hover:text-[#dfe2f2]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* News Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveArticle(item)}
            className="bg-[#1E222D] border border-[#2A2E39] rounded-xl p-4 flex flex-col justify-between hover:border-[#2962ff] transition-all cursor-pointer group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#b6c4ff]">{item.source}</span>
                  <span className="text-[#8d90a2]">• {item.timeAgo}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    item.sentiment === 'bullish'
                      ? 'bg-[#089981]/20 text-[#089981]'
                      : item.sentiment === 'bearish'
                      ? 'bg-[#F23645]/20 text-[#F23645]'
                      : 'bg-[#313441] text-[#8d90a2]'
                  }`}
                >
                  {item.sentiment}
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#dfe2f2] group-hover:text-white leading-snug mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-[#B2B5BE] line-clamp-2 leading-relaxed">
                {item.snippet}
              </p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#2A2E39] text-xs">
              <div className="flex items-center gap-1.5">
                {item.relatedSymbols.map((sym) => (
                  <span
                    key={sym}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSymbol?.(sym);
                    }}
                    className="px-2 py-0.5 rounded bg-[#0f131e] border border-[#2A2E39] text-[#b6c4ff] hover:border-[#2962ff] font-data-tabular font-medium text-[11px]"
                  >
                    {sym}
                  </span>
                ))}
              </div>
              <span className="text-[#8d90a2] text-[11px]">{item.readTime}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#171b26] border border-[#2A2E39] rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2A2E39] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#b6c4ff] text-sm">{activeArticle.source}</span>
                <span className="text-xs text-[#8d90a2]">• {activeArticle.timeAgo}</span>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-1 rounded bg-[#1E222D] text-[#8d90a2] hover:text-[#dfe2f2]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <h2 className="text-lg font-bold font-headline text-[#dfe2f2] leading-tight">
              {activeArticle.title}
            </h2>

            <div className="p-3 bg-[#1E222D] rounded-xl border border-[#2A2E39] text-xs text-[#b6c4ff]">
              <strong>Summary:</strong> {activeArticle.snippet}
            </div>

            <div className="text-sm text-[#dfe2f2] leading-relaxed space-y-3 font-normal">
              <p>{activeArticle.fullContent}</p>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-[#2A2E39]">
              <span className="text-xs text-[#8d90a2]">Related Symbols:</span>
              {activeArticle.relatedSymbols.map((sym) => (
                <span key={sym} className="px-2.5 py-1 rounded bg-[#1E222D] border border-[#2A2E39] text-xs font-semibold text-[#b6c4ff]">
                  {sym}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
