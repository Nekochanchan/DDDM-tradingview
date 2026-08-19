import React from 'react';
import { AssetCategory } from '../types';

interface ChipNavProps {
  activeCategory: AssetCategory;
  onSelectCategory: (category: AssetCategory) => void;
}

export const ChipNav: React.FC<ChipNavProps> = ({
  activeCategory,
  onSelectCategory
}) => {
  const chips: { id: AssetCategory; label: string }[] = [
    { id: 'crypto', label: 'Crypto' },
    { id: 'indices', label: 'Indices' },
    { id: 'futures', label: 'Futures' },
    { id: 'forex', label: 'Forex' },
    { id: 'bonds', label: 'Government bonds' },
    { id: 'stocks', label: 'Stocks' }
  ];

  return (
    <div className="overflow-x-auto hide-scrollbar mb-8">
      <div className="flex gap-2 min-w-max">
        {chips.map((chip) => {
          const isActive = activeCategory === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => onSelectCategory(chip.id)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#2962ff] text-white shadow-sm'
                  : 'bg-[#1E222D] border border-[#2A2E39] text-[#B2B5BE] hover:text-[#dfe2f2] hover:border-[#434656]'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
