export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: string;
  marketCap: string;
  history: { time: string; price: number }[];
  description: string;
  image?: string;
  high24h?: number;
  low24h?: number;
  rank?: number;
}

export interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string; // URL to small image
  price_btc: number;
}

export interface FundingRound {
  id: string; // unique key
  date: string;
  name: string;
  round: string;
  amount: string;
  rawAmount: number; // For sorting
  investors: string[]; // Changed to array for better rendering
  leadInvestors: string[]; 
  valuation: string;
  category: string;
  description: string;
  link?: string; // Project link
}

export interface IntelEntity {
  id: string;
  name: string;
  type: 'Exchange' | 'Fund' | 'Whale' | 'Defi Protocol';
  label: string;
  balanceUsd: string;
  pnl24h: number;
  tags: string[];
}

export interface IntelTransaction {
  id: string;
  time: string;
  fromAddress: string;
  fromLabel?: string;
  toAddress: string;
  toLabel?: string;
  tokenSymbol: string;
  tokenAmount: number;
  valueUsd: number;
  hash: string;
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export interface TrendAnalysisResult {
  sentimentScore: number; // 0 to 100
  trend: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  supportLevels: number[];
  resistanceLevels: number[];
  keyNarrative: string;
  actionableInsight: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  isThinking?: boolean;
  trendResult?: TrendAnalysisResult; // Optional field for structured analysis
}

export interface AnalysisConfig {
  coinId: string;
  context: string;
}

export type LanguageCode = 'zh-TW' | 'en' | 'ru' | 'ko' | 'fr' | 'id';

export type ThemeId = 'dark' | 'light' | 'midnight' | 'ocean' | 'sunset';

export interface Theme {
  id: ThemeId;
  name: string;
  colors: {
    bg: string;
    card: string;
    primary: string;
  }
}