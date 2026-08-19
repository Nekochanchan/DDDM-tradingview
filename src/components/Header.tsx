import React from 'react';

interface HeaderProps {
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onOpenAccount: () => void;
  accountBalance: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMenu,
  onOpenSearch,
  onOpenAccount,
  accountBalance
}) => {
  return (
    <header className="bg-[#0f131e] text-[#b6c4ff] border-b border-[#2A2E39] flex items-center justify-between px-4 h-12 sticky top-0 z-40">
      {/* Left: Menu trigger & TradingView Brand */}
      <div className="flex items-center gap-3">
        <button
          id="btn-header-menu"
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="hover:bg-[#313441] text-[#dfe2f2] transition-colors rounded p-1 flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          {/* TradingView Icon */}
          <div className="w-6 h-6 flex items-center justify-center text-[#2962ff]">
            <svg viewBox="0 0 36 28" fill="currentColor" className="w-5 h-4">
              <path d="M14 22H7V6h7v16zm15-16h-7v16h7V6zm-8 6h-6v10h6V12z" />
            </svg>
          </div>
          <span className="text-[20px] leading-6 font-bold font-headline text-[#dfe2f2] tracking-tight">
            TradingView
          </span>
        </div>
      </div>

      {/* Right: Search & Get started / Account balance */}
      <div className="flex items-center gap-3">
        {/* Market Status Dot (Hidden on smallest mobile, visible on sm+) */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#B2B5BE] bg-[#1E222D] px-2 py-1 rounded-full border border-[#2A2E39]">
          <span className="w-2 h-2 rounded-full bg-[#089981] animate-pulse"></span>
          <span>US Markets Open</span>
        </div>

        <button
          id="btn-header-search"
          onClick={onOpenSearch}
          aria-label="Search symbols"
          className="hover:bg-[#313441] text-[#dfe2f2] transition-colors rounded p-1 flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">search</span>
        </button>

        <button
          id="btn-header-getstarted"
          onClick={onOpenAccount}
          className="bg-[#2962ff] text-white px-3.5 py-1.5 rounded-full text-xs font-semibold hover:bg-[#2962ff]/90 transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <span>Get started</span>
        </button>
      </div>
    </header>
  );
};
