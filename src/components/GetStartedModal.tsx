import React, { useState } from 'react';

interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountBalance: number;
}

export const GetStartedModal: React.FC<GetStartedModalProps> = ({
  isOpen,
  onClose,
  accountBalance
}) => {
  if (!isOpen) return null;
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJoined(true);
    setTimeout(() => {
      onClose();
      setJoined(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#171b26] border border-[#2A2E39] rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#2962ff] flex items-center justify-center font-bold text-white text-xs">
              TV
            </div>
            <h3 className="text-lg font-bold font-headline text-[#dfe2f2]">Get Started with TradingView</h3>
          </div>
          <button onClick={onClose} className="text-[#8d90a2] hover:text-[#dfe2f2]">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {joined ? (
          <div className="p-4 bg-[#089981]/20 border border-[#089981] text-[#089981] rounded-xl text-center text-xs font-bold">
            🎉 Welcome! Your $100,000 Paper Trading account is active!
          </div>
        ) : (
          <>
            <p className="text-xs text-[#B2B5BE] leading-relaxed">
              Join over 60 million traders and investors globally. Track global markets, simulate trades risk-free with $100,000 in paper capital, and publish your trade ideas.
            </p>

            <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-[#8d90a2]">
                <span>Paper Trading Balance:</span>
                <span className="font-bold text-[#dfe2f2] font-data-tabular">
                  ${accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[#8d90a2]">
                <span>Market Feeds:</span>
                <span className="font-bold text-[#089981]">Real-time Streaming</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-[#8d90a2] block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0f131e] border border-[#2A2E39] rounded-xl px-3.5 py-2.5 text-xs text-[#dfe2f2] focus:outline-none focus:border-[#2962ff]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#2962ff] hover:bg-[#2962ff]/90 text-white font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer shadow-md"
              >
                Create Free Trading Account
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
