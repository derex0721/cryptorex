import { CoinData, FundingRound, TrendingCoin, IntelEntity, IntelTransaction } from "../types";
import { COINS } from "../constants";

// CoinGecko API
const CG_API_BASE = "https://api.coingecko.com/api/v3";
// DefiLlama API
const LLAMA_API_BASE = "https://api.llama.fi";

// --- Market Data ---

export const fetchMarketData = async (): Promise<CoinData[]> => {
  try {
    // Fetch Top 50 coins (increased from 20 to get more depth)
    const response = await fetch(
      `${CG_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h`
    );

    if (!response.ok) {
      if (response.status === 429) {
        console.warn("CoinGecko Rate Limit hit. Using fallback data.");
        return COINS;
      }
      throw new Error("Failed to fetch market data");
    }

    const data = await response.json();

    return data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h,
      volume: formatNumber(coin.total_volume),
      marketCap: formatNumber(coin.market_cap),
      history: coin.sparkline_in_7d?.price.slice(-24).map((price: number, index: number) => ({
        time: `${index}:00`,
        price: price
      })) || [],
      description: `${coin.name} rank #${coin.market_cap_rank}. Market Cap: ${formatNumber(coin.market_cap)}.`,
      image: coin.image,
      high24h: coin.high_24h,
      low24h: coin.low_24h,
      rank: coin.market_cap_rank
    }));
  } catch (error) {
    console.error("Error fetching market data:", error);
    return COINS; 
  }
};

// --- Trending Data ("Blave" / Hot) ---

export const fetchTrendingCoins = async (): Promise<TrendingCoin[]> => {
  try {
    const response = await fetch(`${CG_API_BASE}/search/trending`);
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.coins.map((item: any) => ({
      id: item.item.id,
      name: item.item.name,
      symbol: item.item.symbol,
      market_cap_rank: item.item.market_cap_rank,
      thumb: item.item.thumb,
      price_btc: item.item.price_btc
    }));
  } catch (error) {
    console.error("Error fetching trending data", error);
    return [];
  }
};

// --- Financing Data (DefiLlama -> ICO Analytics style) ---

export const fetchFundingData = async (): Promise<FundingRound[]> => {
  try {
    const response = await fetch(`${LLAMA_API_BASE}/raises`);
    if (!response.ok) throw new Error("Failed to fetch funding data");
    
    const data = await response.json();
    const raises = data.raises || [];
    
    // Sort by date descending
    const sortedRaises = raises.sort((a: any, b: any) => b.date - a.date);

    return sortedRaises.slice(0, 60).map((item: any, index: number) => ({
      id: `${item.name}-${item.date}-${index}`,
      date: new Date(item.date * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      name: item.name,
      round: item.round,
      amount: formatAmount(item.amount),
      rawAmount: item.amount,
      // Prioritize lead investors, then other investors
      leadInvestors: item.leadInvestors || [],
      investors: item.otherInvestors || [],
      valuation: item.valuation ? formatNumber(item.valuation) : "-",
      category: item.category || "Web3",
      description: item.description,
      link: item.url
    }));
  } catch (error) {
    console.error("Error fetching funding data:", error);
    return [];
  }
};

// --- Intel Data (Simulated Arkham) ---

export const fetchIntelData = async (): Promise<{ entities: IntelEntity[], transactions: IntelTransaction[] }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const entities: IntelEntity[] = [
    { id: '1', name: 'Vitalik.eth', type: 'Whale', label: 'Vitalik Buterin', balanceUsd: '$4.2M', pnl24h: 1.2, tags: ['ENS', 'Founder'] },
    { id: '2', name: 'Alameda Remediation', type: 'Fund', label: 'FTX Liquidators', balanceUsd: '$240M', pnl24h: -0.5, tags: ['Liquidator', 'Exchange'] },
    { id: '3', name: 'Binance Hot Wallet 6', type: 'Exchange', label: 'Binance', balanceUsd: '$2.1B', pnl24h: 0.1, tags: ['CEX', 'Hot Wallet'] },
    { id: '4', name: 'Justin Sun', type: 'Whale', label: 'Justin Sun', balanceUsd: '$345M', pnl24h: 3.4, tags: ['TRON', 'Founder'] },
    { id: '5', name: 'Wintermute Trading', type: 'Fund', label: 'Wintermute', balanceUsd: '$89M', pnl24h: 0.8, tags: ['MM', 'VC'] },
    { id: '6', name: 'Uniswap V3: USDC-ETH', type: 'Defi Protocol', label: 'Uniswap', balanceUsd: '$120M', pnl24h: 0.0, tags: ['DEX', 'Pool'] },
  ];

  const transactions: IntelTransaction[] = [];
  const tokens = ['ETH', 'USDC', 'USDT', 'WBTC', 'PEPE', 'SHIB', 'MKR'];
  
  for (let i = 0; i < 20; i++) {
    const isInflow = Math.random() > 0.5;
    const amount = Math.random() * 1000000;
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    const price = token === 'ETH' ? 3000 : token === 'WBTC' ? 60000 : 1;
    
    transactions.push({
      id: `tx-${i}`,
      time: `${Math.floor(Math.random() * 60)} mins ago`,
      fromAddress: isInflow ? '0x' + Math.random().toString(16).substr(2, 4) + '...' : entities[Math.floor(Math.random() * entities.length)].label,
      fromLabel: isInflow ? 'Unknown Wallet' : undefined,
      toAddress: !isInflow ? '0x' + Math.random().toString(16).substr(2, 4) + '...' : entities[Math.floor(Math.random() * entities.length)].label,
      toLabel: !isInflow ? 'Binance Deposit' : undefined,
      tokenSymbol: token,
      tokenAmount: Math.floor(Math.random() * 1000),
      valueUsd: Math.floor(amount * price / 1000), // scaled down for realism
      hash: '0x' + Math.random().toString(16).substr(2, 10) + '...'
    });
  }

  // Sort by value desc
  transactions.sort((a, b) => b.valueUsd - a.valueUsd);

  return { entities, transactions };
};

// Helper for formatting large numbers
const formatNumber = (num: number): string => {
  if (!num) return "-";
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toString();
};

const formatAmount = (amount: number): string => {
  if (!amount) return "Undisclosed";
  return "$" + formatNumber(amount);
}