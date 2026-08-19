import React, { useState, useEffect } from 'react';

interface Level2OrderBookProps {
  currentPrice: number;
}

interface OrderLevel {
  price: number;
  size: number;
  total: number;
}

export const Level2OrderBook: React.FC<Level2OrderBookProps> = ({ currentPrice }) => {
  const [bids, setBids] = useState<OrderLevel[]>([]);
  const [asks, setAsks] = useState<OrderLevel[]>([]);

  useEffect(() => {
    const spread = currentPrice * 0.0003;
    const generateLevels = () => {
      let bTotal = 0;
      let aTotal = 0;

      const newBids: OrderLevel[] = [];
      const newAsks: OrderLevel[] = [];

      for (let i = 1; i <= 5; i++) {
        const bPrice = currentPrice - spread * i;
        const bSize = Math.floor(50 + Math.random() * 400);
        bTotal += bSize;
        newBids.push({ price: bPrice, size: bSize, total: bTotal });

        const aPrice = currentPrice + spread * i;
        const aSize = Math.floor(50 + Math.random() * 400);
        aTotal += aSize;
        newAsks.push({ price: aPrice, size: aSize, total: aTotal });
      }

      setBids(newBids);
      setAsks(newAsks);
    };

    generateLevels();
    const interval = setInterval(generateLevels, 2400);
    return () => clearInterval(interval);
  }, [currentPrice]);

  const maxTotal = Math.max(
    bids[bids.length - 1]?.total || 1,
    asks[asks.length - 1]?.total || 1
  );

  return (
    <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl p-3.5 space-y-2.5 font-data-tabular">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[#8d90a2] uppercase tracking-wider">Level 2 Order Book</span>
        <span className="text-[11px] text-[#089981] bg-[#089981]/15 px-1.5 py-0.5 rounded font-semibold">
          Spread: ${(currentPrice * 0.0003).toFixed(2)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        {/* Bids (Green) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-[#8d90a2] border-b border-[#2A2E39] pb-0.5">
            <span>Bid Price</span>
            <span>Size</span>
          </div>
          {bids.map((b, i) => {
            const widthPct = (b.total / maxTotal) * 100;
            return (
              <div key={i} className="relative flex justify-between py-0.5 px-1 rounded overflow-hidden">
                <div
                  className="absolute inset-0 bg-[#089981]/15 pointer-events-none"
                  style={{ width: `${widthPct}%` }}
                />
                <span className="text-[#089981] font-semibold relative z-10">{b.price.toFixed(2)}</span>
                <span className="text-[#dfe2f2] relative z-10">{b.size}</span>
              </div>
            );
          })}
        </div>

        {/* Asks (Red) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-[#8d90a2] border-b border-[#2A2E39] pb-0.5">
            <span>Ask Price</span>
            <span>Size</span>
          </div>
          {asks.map((a, i) => {
            const widthPct = (a.total / maxTotal) * 100;
            return (
              <div key={i} className="relative flex justify-between py-0.5 px-1 rounded overflow-hidden">
                <div
                  className="absolute inset-0 bg-[#F23645]/15 pointer-events-none"
                  style={{ width: `${widthPct}%` }}
                />
                <span className="text-[#F23645] font-semibold relative z-10">{a.price.toFixed(2)}</span>
                <span className="text-[#dfe2f2] relative z-10">{a.size}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
