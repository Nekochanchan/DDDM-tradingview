import React, { useState } from 'react';
import { TradeIdea } from '../types';

interface IdeasScreenProps {
  ideas: TradeIdea[];
  onSelectSymbol?: (symbol: string) => void;
}

export const IdeasScreen: React.FC<IdeasScreenProps> = ({ ideas: initialIdeas, onSelectSymbol }) => {
  const [ideas, setIdeas] = useState<TradeIdea[]>(initialIdeas);

  const toggleLike = (id: string) => {
    setIdeas(prev =>
      prev.map(item => {
        if (item.id === id) {
          const isLiked = !item.isLiked;
          return {
            ...item,
            isLiked,
            likes: isLiked ? item.likes + 1 : item.likes - 1
          };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold font-headline text-[#dfe2f2]">Community Ideas</h1>
        <p className="text-xs text-[#B2B5BE] mt-0.5">Top technical analysis, trading setups, and market strategies</p>
      </div>

      {/* Ideas list */}
      <div className="space-y-4">
        {ideas.map((idea) => (
          <div
            key={idea.id}
            className="bg-[#1E222D] border border-[#2A2E39] rounded-xl p-4 sm:p-5 space-y-4 hover:border-[#2962ff]/60 transition-all shadow-sm"
          >
            {/* Author Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={idea.author.avatar}
                  alt={idea.author.name}
                  className="w-9 h-9 rounded-full object-cover border border-[#2A2E39]"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#dfe2f2]">{idea.author.name}</span>
                    {idea.author.badge && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-[#2962ff] text-white rounded">
                        {idea.author.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#8d90a2]">{idea.author.followers} followers • {idea.timeAgo}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  onClick={() => onSelectSymbol?.(idea.symbol)}
                  className="px-2.5 py-1 rounded bg-[#0f131e] border border-[#2A2E39] text-[#b6c4ff] text-xs font-bold font-data-tabular cursor-pointer hover:border-[#2962ff]"
                >
                  {idea.symbol}
                </span>
                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                    idea.sentiment === 'Long'
                      ? 'bg-[#089981]/20 text-[#089981]'
                      : idea.sentiment === 'Short'
                      ? 'bg-[#F23645]/20 text-[#F23645]'
                      : 'bg-[#262a35] text-[#8d90a2]'
                  }`}
                >
                  {idea.sentiment}
                </span>
              </div>
            </div>

            {/* Title & Timeframe */}
            <div>
              <h3 className="text-base font-bold text-[#dfe2f2] leading-snug">{idea.title}</h3>
              <div className="text-[11px] text-[#8d90a2] mt-0.5 font-medium">Timeframe: {idea.timeframe}</div>
            </div>

            {/* Description */}
            <p className="text-xs text-[#B2B5BE] leading-relaxed">
              {idea.description}
            </p>

            {/* Target Price & Stop Loss Badges */}
            {(idea.targetPrice || idea.stopLoss) && (
              <div className="flex items-center gap-4 text-xs font-data-tabular bg-[#171b26] p-2.5 rounded-lg border border-[#2A2E39]">
                {idea.targetPrice && (
                  <div className="flex items-center gap-1">
                    <span className="text-[#8d90a2]">Target:</span>
                    <span className="font-bold text-[#089981]">${idea.targetPrice.toLocaleString()}</span>
                  </div>
                )}
                {idea.stopLoss && (
                  <div className="flex items-center gap-1">
                    <span className="text-[#8d90a2]">Stop Loss:</span>
                    <span className="font-bold text-[#F23645]">${idea.stopLoss.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Footer / Social Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#2A2E39] text-xs text-[#8d90a2]">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleLike(idea.id)}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    idea.isLiked ? 'text-[#2962ff] font-bold' : 'hover:text-[#dfe2f2]'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${idea.isLiked ? 'fill' : ''}`}>
                    thumb_up
                  </span>
                  <span>{idea.likes}</span>
                </button>
                <div className="flex items-center gap-1.5 hover:text-[#dfe2f2] cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                  <span>{idea.comments}</span>
                </div>
              </div>
              <button className="hover:text-[#dfe2f2] flex items-center gap-1 text-[11px]">
                <span className="material-symbols-outlined text-[16px]">share</span>
                <span>Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
