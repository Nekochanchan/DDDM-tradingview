export type AssetCategory = 'indices' | 'crypto' | 'futures' | 'forex' | 'bonds' | 'stocks' | 'commodities';

export interface PricePoint {
  time: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

export interface AssetQuote {
  id: string;
  symbol: string;
  name: string;
  subName?: string;
  category: AssetCategory;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
  volume: string;
  marketCap?: string;
  peRatio?: number;
  dividendYield?: number;
  logoUrl?: string;
  badgeNumber?: string;
  badgeBgColor?: string;
  history1D: PricePoint[];
  history1M: PricePoint[];
  history1Y: PricePoint[];
  description?: string;
  exchange?: string;
  currency?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  category: string;
  readTime: string;
  snippet: string;
  fullContent: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  relatedSymbols: string[];
  imageUrl?: string;
}

export interface TradeIdea {
  id: string;
  title: string;
  symbol: string;
  author: {
    name: string;
    avatar: string;
    badge?: string;
    followers: string;
  };
  timeAgo: string;
  sentiment: 'Long' | 'Short' | 'Neutral';
  timeframe: string;
  description: string;
  chartUrl?: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  targetPrice?: number;
  stopLoss?: number;
}

export interface PaperTradePosition {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  type: 'BUY' | 'SELL';
  timestamp: string;
}

export interface EconomicEvent {
  id: string;
  time: string;
  country: string;
  flag: string;
  event: string;
  impact: 'high' | 'medium' | 'low';
  actual?: string;
  forecast: string;
  previous: string;
}
