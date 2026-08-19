import React from 'react';

export type TabType = 'watchlist' | 'markets' | 'news' | 'ideas' | 'menu';

interface BottomNavBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  watchlistCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  watchlistCount = 0
}) => {
  const tabs: { id: TabType; label: string; icon: string; filledIcon?: boolean }[] = [
    { id: 'watchlist', label: 'Watchlist', icon: 'star' },
    { id: 'markets', label: 'Markets', icon: 'trending_up', filledIcon: true },
    { id: 'news', label: 'News', icon: 'article' },
    { id: 'ideas', label: 'Ideas', icon: 'lightbulb' },
    { id: 'menu', label: 'Menu', icon: 'menu' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-40 flex justify-around items-center h-16 bg-[#262a35] border-t border-[#2A2E39] md:hidden">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 p-2 flex-1 h-full transition-colors cursor-pointer relative ${
              isActive
                ? 'text-[#b6c4ff] font-bold'
                : 'text-[#B2B5BE] hover:text-[#dfe2f2]'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] ${
                isActive && tab.filledIcon ? 'fill text-[#b6c4ff]' : ''
              }`}
            >
              {tab.icon}
            </span>
            <span className="text-[11px] leading-tight font-medium">
              {tab.label}
            </span>

            {tab.id === 'watchlist' && watchlistCount > 0 && (
              <span className="absolute top-1.5 right-[22%] w-4 h-4 rounded-full bg-[#2962ff] text-white text-[9px] font-bold flex items-center justify-center">
                {watchlistCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
