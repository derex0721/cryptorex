import React from 'react';
import { TrendAnalysisResult, LanguageCode } from '../types';
import { TargetIcon, ShieldIcon, ZapIcon } from './Icons';
import { TRANSLATIONS } from '../constants';

interface TrendAnalysisCardProps {
  data: TrendAnalysisResult;
  language: LanguageCode;
}

const TrendAnalysisCard: React.FC<TrendAnalysisCardProps> = ({ data, language }) => {
  const t = TRANSLATIONS[language];
  
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400';
    if (score <= 30) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getProgressBarColor = (score: number) => {
     if (score >= 70) return 'bg-emerald-500';
     if (score <= 30) return 'bg-red-500';
     return 'bg-yellow-500';
  };

  const getTrendLabel = (trend: string) => {
    switch(trend) {
      case 'Bullish': return t.bullish;
      case 'Bearish': return t.bearish;
      case 'Neutral': return t.neutral;
      default: return trend;
    }
  }

  return (
    <div className="bg-crypto-card border border-indigo-500/30 rounded-xl p-5 shadow-lg w-full max-w-md mx-auto my-2 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-crypto-text font-bold flex items-center gap-2">
          <ZapIcon className="w-4 h-4 text-indigo-400" />
          {t.deepScan}
        </h4>
        <span className={`text-xs font-mono px-2 py-1 rounded bg-crypto-subtle border border-crypto-border ${getScoreColor(data.sentimentScore)}`}>
          {getTrendLabel(data.trend).toUpperCase()}
        </span>
      </div>

      {/* Sentiment Meter */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-crypto-muted mb-1">
          <span>{t.bearish}</span>
          <span className="text-crypto-text font-bold">{data.sentimentScore}/100</span>
          <span>{t.bullish}</span>
        </div>
        <div className="h-2 w-full bg-crypto-subtle rounded-full overflow-hidden">
          <div 
            className={`h-full ${getProgressBarColor(data.sentimentScore)} transition-all duration-1000 ease-out`} 
            style={{ width: `${data.sentimentScore}%` }}
          ></div>
        </div>
      </div>

      {/* Narrative */}
      <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
        <p className="text-sm text-crypto-text italic leading-relaxed">"{data.keyNarrative}"</p>
      </div>

      {/* Levels Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-crypto-muted uppercase tracking-wider font-semibold">
            <ShieldIcon className="w-3 h-3 text-emerald-500" /> {t.support}
          </div>
          {data.supportLevels.map((level, i) => (
            <div key={i} className="text-sm font-mono text-crypto-text bg-crypto-subtle/50 px-2 py-1 rounded border border-crypto-border">
              ${level.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-crypto-muted uppercase tracking-wider font-semibold">
            <TargetIcon className="w-3 h-3 text-red-500" /> {t.resistance}
          </div>
          {data.resistanceLevels.map((level, i) => (
            <div key={i} className="text-sm font-mono text-crypto-text bg-crypto-subtle/50 px-2 py-1 rounded border border-crypto-border">
              ${level.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Insight */}
      <div className="mt-4 pt-4 border-t border-crypto-border">
        <p className="text-xs text-indigo-300 font-semibold mb-1">{t.strategy.toUpperCase()}</p>
        <p className="text-sm text-crypto-muted">{data.actionableInsight}</p>
      </div>
      
      <div className="mt-2 text-[10px] text-crypto-muted text-center">
        *{t.generatedBy}
      </div>
    </div>
  );
};

export default TrendAnalysisCard;