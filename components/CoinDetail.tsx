import React, { useEffect, useState } from 'react';
import { CoinData, TrendAnalysisResult, LanguageCode } from '../types';
import PriceChart from './PriceChart';
import TrendAnalysisCard from './TrendAnalysisCard';
import { generateTrendAnalysis } from '../services/gemini';
import { ArrowLeftIcon, TrendingUpIcon, TrendingDownIcon, ZapIcon } from './Icons';
import { TRANSLATIONS } from '../constants';

interface CoinDetailProps {
  coin: CoinData;
  onBack: () => void;
  language: LanguageCode;
}

const CoinDetail: React.FC<CoinDetailProps> = ({ coin, onBack, language }) => {
  const t = TRANSLATIONS[language];
  const [analysis, setAnalysis] = useState<TrendAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Trigger API Request on Load (initState equivalent)
  useEffect(() => {
    let isMounted = true;
    
    const fetchAnalysis = async () => {
      setLoading(true);
      const context = `
        Coin: ${coin.name} (${coin.symbol})
        Price: $${coin.price}
        24h Change: ${coin.change24h}%
        Market Cap: ${coin.marketCap}
        Volume: ${coin.volume}
        Description: ${coin.description}
        Recent History: ${JSON.stringify(coin.history.map(h => h.price).slice(-10))}
      `;
      
      const result = await generateTrendAnalysis(coin.name, context, language);
      
      if (isMounted) {
        setAnalysis(result);
        setLoading(false);
      }
    };

    fetchAnalysis();

    return () => { isMounted = false; };
  }, [coin.id, language]);

  const isPositive = coin.change24h >= 0;
  const color = isPositive ? '#10B981' : '#EF4444';

  return (
    <div className="flex flex-col h-full animate-fade-in-up">
      {/* Navigation Bar */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="p-2 rounded-full bg-crypto-subtle hover:bg-crypto-card text-crypto-text transition-colors border border-crypto-border"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
           {coin.image && <img src={coin.image} className="w-8 h-8 rounded-full" />}
           <h2 className="text-xl font-bold text-crypto-text tracking-wide">{coin.name} {t.details}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        
        {/* Hero Section: Price & Basic Info */}
        <div className="bg-gradient-to-br from-crypto-card to-crypto-subtle rounded-3xl p-8 border border-crypto-border shadow-2xl relative overflow-hidden">
           {/* Background Decorations */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end">
             <div>
               <div className="flex items-baseline gap-2 mb-2">
                 <h1 className="text-5xl md:text-6xl font-black text-crypto-text tracking-tight">
                   ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                 </h1>
               </div>
               <div className={`flex items-center gap-2 text-lg font-medium px-3 py-1 rounded-full w-fit ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {isPositive ? <TrendingUpIcon className="w-5 h-5" /> : <TrendingDownIcon className="w-5 h-5" />}
                  <span>{coin.change24h > 0 ? '+' : ''}{coin.change24h}% (24h)</span>
               </div>
             </div>
             
             <div className="mt-6 md:mt-0 flex gap-4 text-sm text-crypto-muted">
                <div className="flex flex-col items-end">
                   <span>{t.vol}</span>
                   <span className="text-crypto-text font-mono font-bold">{coin.volume}</span>
                </div>
                <div className="w-px bg-crypto-border h-10"></div>
                <div className="flex flex-col items-end">
                   <span>{t.marketCap}</span>
                   <span className="text-crypto-text font-mono font-bold">{coin.marketCap}</span>
                </div>
             </div>
           </div>

           {/* Large Chart */}
           <div className="h-[350px] w-full mt-8">
              <PriceChart data={coin.history} color={color} />
           </div>
        </div>

        {/* AI Analysis Section (Auto-Triggered) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left: Auto-Analysis Result */}
          <div className="md:col-span-12 lg:col-span-8">
            <div className="bg-crypto-card border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden h-full">
              <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none"></div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-indigo-500/20 rounded-lg animate-pulse">
                  <ZapIcon className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-crypto-text">Gemini Live Analysis</h3>
                  <p className="text-xs text-indigo-300">Generated automatically based on realtime data</p>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-indigo-200 animate-pulse">{t.loading}</p>
                </div>
              ) : analysis ? (
                <div className="grid md:grid-cols-2 gap-6 relative z-10">
                   <div className="space-y-4">
                      <div className="p-4 bg-crypto-subtle/50 rounded-xl border border-crypto-border">
                         <span className="text-xs text-crypto-muted uppercase tracking-widest">{t.sentiment}</span>
                         <div className="flex items-center gap-4 mt-2">
                            <div className="text-4xl font-bold text-crypto-text">{analysis.sentimentScore}</div>
                            <div className="h-2 flex-1 bg-gray-800 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-1000 ${analysis.sentimentScore > 60 ? 'bg-emerald-500' : analysis.sentimentScore < 40 ? 'bg-red-500' : 'bg-yellow-500'}`} style={{width: `${analysis.sentimentScore}%`}}></div>
                            </div>
                         </div>
                         <p className="mt-2 text-sm font-medium text-crypto-muted">{analysis.trend} Trend detected</p>
                      </div>

                      <div className="p-4 bg-crypto-subtle/50 rounded-xl border border-crypto-border">
                         <span className="text-xs text-crypto-muted uppercase tracking-widest">{t.strategy}</span>
                         <p className="mt-2 text-indigo-300 text-sm font-semibold">{analysis.actionableInsight}</p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="p-4 bg-crypto-subtle/50 rounded-xl border border-crypto-border h-full">
                         <span className="text-xs text-crypto-muted uppercase tracking-widest">{t.keyNarrative}</span>
                         <p className="mt-2 text-crypto-muted text-sm leading-relaxed italic">"{analysis.keyNarrative}"</p>
                         
                         <div className="mt-4 pt-4 border-t border-crypto-border grid grid-cols-2 gap-2">
                            <div>
                               <span className="text-xs text-emerald-500 block mb-1">{t.support}</span>
                               {analysis.supportLevels.slice(0,2).map((l, i) => (
                                 <div key={i} className="font-mono text-xs text-crypto-muted">${l.toLocaleString()}</div>
                               ))}
                            </div>
                            <div>
                               <span className="text-xs text-red-500 block mb-1">{t.resistance}</span>
                               {analysis.resistanceLevels.slice(0,2).map((l, i) => (
                                 <div key={i} className="font-mono text-xs text-crypto-muted">${l.toLocaleString()}</div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="text-center text-crypto-muted py-8">{t.analysisError}</div>
              )}
            </div>
          </div>
          
          {/* Right: Info Cards */}
          <div className="md:col-span-12 lg:col-span-4 space-y-4">
             <div className="bg-crypto-subtle/50 border border-crypto-border rounded-xl p-4">
                <h4 className="text-crypto-muted text-sm mb-2">{t.about} {coin.name}</h4>
                <p className="text-sm text-crypto-text leading-relaxed">{coin.description}</p>
             </div>
             <div className="bg-crypto-subtle/50 border border-crypto-border rounded-xl p-4">
                <h4 className="text-crypto-muted text-sm mb-2">{t.range24h}</h4>
                <div className="flex justify-between items-center text-sm font-mono text-crypto-text">
                   <span>L: ${coin.low24h?.toLocaleString() || 'N/A'}</span>
                   <div className="flex-1 mx-2 h-1 bg-crypto-border rounded-full"></div>
                   <span>H: ${coin.high24h?.toLocaleString() || 'N/A'}</span>
                </div>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CoinDetail;