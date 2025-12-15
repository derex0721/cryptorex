import React, { useState, useEffect } from 'react';
import { COINS, TRANSLATIONS, LANGUAGES, THEMES } from './constants';
import { CoinData, FundingRound, TrendingCoin, LanguageCode, ThemeId } from './types';
import PriceChart from './components/PriceChart';
import AIAnalyst from './components/AIAnalyst';
import CoinDetail from './components/CoinDetail';
import IntelDashboard from './components/IntelDashboard';
import { ActivityIcon, TrendingUpIcon, TrendingDownIcon, SearchIcon, BanknoteIcon, MaximizeIcon, FireIcon, GlobeIcon, PaletteIcon, RadarIcon } from './components/Icons';
import { fetchMarketData, fetchFundingData, fetchTrendingCoins } from './services/api';

enum ViewMode {
  MARKET = 'market',
  FINANCING = 'financing',
  INTEL = 'intel'
}

enum AppState {
  DASHBOARD = 'dashboard',
  DETAIL = 'detail'
}

const App = () => {
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [fundingData, setFundingData] = useState<FundingRound[]>([]);
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.MARKET);
  const [appState, setAppState] = useState<AppState>(AppState.DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<LanguageCode>('zh-TW');
  const [theme, setTheme] = useState<ThemeId>('dark');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  // Helper for translations
  const t = TRANSLATIONS[language];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      const [marketData, funding, trending] = await Promise.all([
        fetchMarketData(),
        fetchFundingData(),
        fetchTrendingCoins()
      ]);

      setCoins(marketData);
      setFundingData(funding);
      setTrendingCoins(trending);
      
      if (marketData.length > 0) {
        setSelectedCoin(marketData[0]);
      } else {
        setSelectedCoin(COINS[0]);
        setCoins(COINS);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const filteredCoins = coins.filter(coin => 
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFunding = fundingData.filter(round => 
    round.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    round.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    round.investors.some(inv => inv.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeCoin = selectedCoin || coins[0] || COINS[0];
  const isPositive = activeCoin.change24h >= 0;
  const color = isPositive ? '#10B981' : '#EF4444';

  const handleOpenDetail = () => {
    setAppState(AppState.DETAIL);
  };

  const handleBackToDashboard = () => {
    setAppState(AppState.DASHBOARD);
  };

  return (
    <div className={`min-h-screen bg-crypto-main text-crypto-text selection:bg-indigo-500/30 font-sans theme-${theme} main-container`}>
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-crypto-main/80 border-b border-crypto-border h-16 flex items-center px-6 justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleBackToDashboard}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ActivityIcon className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-crypto-text hidden sm:inline">CryptoSight<span className="text-indigo-400">.AI</span></span>
        </div>
        
        {appState === AppState.DASHBOARD && (
          <div className="flex items-center gap-1 bg-crypto-subtle p-1 rounded-xl border border-crypto-border">
             <button 
               onClick={() => setViewMode(ViewMode.MARKET)}
               className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${viewMode === ViewMode.MARKET ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-crypto-muted hover:text-crypto-text hover:bg-white/5'}`}
             >
               <ActivityIcon className="w-4 h-4" /> <span className="hidden sm:inline">{t.market}</span>
             </button>
             <button 
               onClick={() => setViewMode(ViewMode.FINANCING)}
               className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${viewMode === ViewMode.FINANCING ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-crypto-muted hover:text-crypto-text hover:bg-white/5'}`}
             >
               <BanknoteIcon className="w-4 h-4" /> <span className="hidden sm:inline">{t.financing}</span>
             </button>
             <button 
               onClick={() => setViewMode(ViewMode.INTEL)}
               className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${viewMode === ViewMode.INTEL ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-crypto-muted hover:text-crypto-text hover:bg-white/5'}`}
             >
               <RadarIcon className="w-4 h-4" /> <span className="hidden sm:inline">{t.intel}</span>
             </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          {appState === AppState.DASHBOARD && (
            <div className="flex items-center bg-crypto-subtle border border-crypto-border rounded-full px-4 py-1.5 w-40 sm:w-56">
              <SearchIcon className="w-4 h-4 text-crypto-muted mr-2" />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder}
                className="bg-transparent border-none outline-none text-sm w-full text-crypto-text placeholder-crypto-muted"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          {/* Theme Selector */}
          <div className="relative">
            <button 
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className="p-2 rounded-full bg-crypto-subtle border border-crypto-border hover:bg-crypto-card transition-colors"
              title={t.theme}
            >
              <PaletteIcon className="w-5 h-5 text-crypto-muted" />
            </button>
            {themeMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-crypto-card border border-crypto-border rounded-xl shadow-xl overflow-hidden z-50">
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      setTheme(th.id);
                      setThemeMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-crypto-subtle flex items-center gap-3 ${theme === th.id ? 'text-indigo-400 bg-crypto-subtle' : 'text-crypto-text'}`}
                  >
                    <div className="w-4 h-4 rounded-full border border-gray-500" style={{background: th.colors.bg}}></div>
                    {th.name}
                  </button>
                ))}
              </div>
            )}
            {themeMenuOpen && (
               <div className="fixed inset-0 z-40" onClick={() => setThemeMenuOpen(false)}></div>
            )}
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="p-2 rounded-full bg-crypto-subtle border border-crypto-border hover:bg-crypto-card transition-colors"
            >
              <GlobeIcon className="w-5 h-5 text-crypto-muted" />
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-crypto-card border border-crypto-border rounded-xl shadow-xl overflow-hidden z-50">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-crypto-subtle flex items-center gap-2 ${language === lang.code ? 'text-indigo-400 bg-crypto-subtle' : 'text-crypto-text'}`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
            {langMenuOpen && (
               <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)}></div>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)] min-h-[800px]">
          
          <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-y-auto pr-2 relative no-scrollbar">
            
            {appState === AppState.DETAIL ? (
              <CoinDetail coin={activeCoin} onBack={handleBackToDashboard} language={language} />
            ) : (
              // DASHBOARD
              viewMode === ViewMode.INTEL ? (
                <IntelDashboard language={language} />
              ) :
              viewMode === ViewMode.MARKET ? (
                <>
                  {/* Trending Section (Blave/Hot) */}
                  {trendingCoins.length > 0 && (
                    <div className="w-full">
                       <div className="flex items-center gap-2 mb-3 px-1">
                          <FireIcon className="w-5 h-5 text-orange-500" />
                          <h3 className="text-sm font-bold text-crypto-muted uppercase tracking-wider">{t.trending}</h3>
                       </div>
                       <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                          {trendingCoins.map(trend => (
                            <div key={trend.id} className="min-w-[160px] bg-crypto-subtle/50 border border-crypto-border rounded-xl p-3 hover:border-indigo-500/50 transition-all cursor-pointer group shadow-sm">
                               <div className="flex items-center gap-3 mb-2">
                                  <img src={trend.thumb} alt={trend.symbol} className="w-6 h-6 rounded-full" />
                                  <span className="font-bold text-sm text-crypto-text group-hover:text-indigo-400">{trend.symbol}</span>
                               </div>
                               <div className="text-xs text-crypto-muted">{t.rank} #{trend.market_cap_rank}</div>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {/* Featured Coin Card */}
                  <div className="bg-crypto-card rounded-2xl p-6 border border-crypto-border shadow-xl relative overflow-hidden group shrink-0 transition-all hover:border-gray-500/50">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700"></div>
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 relative z-10 w-full">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            {activeCoin.image && <img src={activeCoin.image} alt={activeCoin.name} className="w-8 h-8" />}
                            <h1 className="text-3xl font-bold text-crypto-text">{activeCoin.name}</h1>
                            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-crypto-subtle text-crypto-muted border border-crypto-border">{activeCoin.symbol}</span>
                          </div>
                          <p className="text-crypto-muted max-w-lg text-sm line-clamp-2">{activeCoin.description}</p>
                        </div>
                        <div className="text-right mt-4 md:mt-0 flex flex-col items-end">
                          <div className="text-4xl font-mono font-bold text-crypto-text mb-1">
                            ${activeCoin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                          </div>
                          <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-crypto-success' : 'text-crypto-danger'}`}>
                            {isPositive ? <TrendingUpIcon className="w-4 h-4" /> : <TrendingDownIcon className="w-4 h-4" />}
                            <span className="font-bold">{Math.abs(activeCoin.change24h).toFixed(2)}% (24h)</span>
                          </div>
                          <button 
                             onClick={handleOpenDetail}
                             className="mt-3 flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-all border border-indigo-500/20"
                          >
                            <MaximizeIcon className="w-3 h-3" /> {t.analysis}
                          </button>
                        </div>
                     </div>
                     <div className="border-t border-crypto-border pt-4 relative z-10">
                       <h3 className="text-sm font-semibold text-crypto-muted mb-2">{t.priceAction7d}</h3>
                       {activeCoin.history.length > 0 ? (
                          <PriceChart data={activeCoin.history} color={color} />
                       ) : (
                          <div className="h-[200px] flex items-center justify-center text-crypto-muted text-sm">{t.chartDataUnavailable}</div>
                       )}
                     </div>
                  </div>

                  {/* Market Table */}
                  <div className="bg-crypto-card rounded-2xl border border-crypto-border shadow-xl flex-1 overflow-hidden flex flex-col min-h-[400px]">
                    <div className="p-4 border-b border-crypto-border bg-crypto-subtle/50 flex justify-between items-center">
                      <h3 className="font-bold text-crypto-text">{t.marketOverview}</h3>
                      <span className="text-xs text-crypto-muted">{t.source}: CoinGecko</span>
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-2">
                          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-sm text-crypto-muted">{t.loading}</p>
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-crypto-subtle/30 sticky top-0 backdrop-blur-sm z-10">
                            <tr>
                              <th className="p-4 text-xs font-semibold text-crypto-muted uppercase">{t.asset}</th>
                              <th className="p-4 text-xs font-semibold text-crypto-muted uppercase text-right">{t.price}</th>
                              <th className="p-4 text-xs font-semibold text-crypto-muted uppercase text-right">{t.change}</th>
                              <th className="p-4 text-xs font-semibold text-crypto-muted uppercase text-right hidden sm:table-cell">{t.vol}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredCoins.map((coin) => (
                              <tr 
                                key={coin.id} 
                                onClick={() => setSelectedCoin(coin)}
                                onDoubleClick={handleOpenDetail}
                                className={`border-b border-crypto-border hover:bg-white/5 cursor-pointer transition-colors ${activeCoin.id === coin.id ? 'bg-indigo-500/10 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'}`}
                              >
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    {coin.image ? (
                                      <img src={coin.image} alt={coin.symbol} className="w-8 h-8 rounded-full" />
                                    ) : (
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-crypto-subtle text-crypto-muted`}>
                                        {coin.symbol[0]}
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-bold text-sm text-crypto-text">{coin.name}</p>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-crypto-muted px-1.5 py-0.5 bg-crypto-subtle rounded">{coin.rank}</span>
                                        <p className="text-xs text-crypto-muted">{coin.symbol}</p>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 text-right font-mono text-sm text-crypto-muted">
                                  ${coin.price.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                                </td>
                                <td className={`p-4 text-right font-mono text-sm ${coin.change24h >= 0 ? 'text-crypto-success' : 'text-crypto-danger'}`}>
                                  {coin.change24h > 0 ? '+' : ''}{coin.change24h?.toFixed(2)}%
                                </td>
                                <td className="p-4 text-right font-mono text-sm text-crypto-muted hidden sm:table-cell">
                                  {coin.volume}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                // FINANCING VIEW
                <div className="bg-crypto-card rounded-2xl border border-crypto-border shadow-xl flex-1 overflow-hidden flex flex-col h-full">
                  <div className="p-6 border-b border-crypto-border bg-crypto-subtle/50 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-crypto-text text-lg flex items-center gap-2">
                         <BanknoteIcon className="text-indigo-400 w-5 h-5" />
                         {t.recentRaises}
                      </h3>
                      <p className="text-xs text-crypto-muted mt-1">Simulating ICO Analytics style data feed</p>
                    </div>
                    <div className="bg-crypto-subtle px-3 py-1 rounded-full border border-crypto-border">
                      <span className="text-xs text-crypto-muted font-mono">{t.source}: DefiLlama</span>
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-crypto-muted">{t.loading}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-0">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-crypto-subtle/30 sticky top-0 backdrop-blur-sm z-10">
                            <tr>
                               <th className="p-4 text-xs font-semibold text-crypto-muted uppercase tracking-wider">{t.projectSector}</th>
                               <th className="p-4 text-xs font-semibold text-crypto-muted uppercase tracking-wider hidden sm:table-cell">{t.round}</th>
                               <th className="p-4 text-xs font-semibold text-crypto-muted uppercase tracking-wider text-right">{t.amountVal}</th>
                               <th className="p-4 text-xs font-semibold text-crypto-muted uppercase tracking-wider hidden lg:table-cell w-1/3">{t.investors}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredFunding.map((round) => (
                               <tr key={round.id} className="border-b border-crypto-border hover:bg-white/5 transition-colors group">
                                 {/* Project & Category */}
                                 <td className="p-4 align-top">
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-crypto-text group-hover:text-indigo-400 transition-colors">{round.name}</span>
                                        <span className="text-[10px] text-crypto-muted font-mono">{round.date}</span>
                                      </div>
                                      <div className="flex flex-wrap gap-1 mt-1.5">
                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${
                                          round.category.includes('DeFi') ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                                          round.category.includes('Game') ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                                          round.category.includes('Infra') ? 'bg-gray-500/10 border-gray-500/30 text-gray-400' :
                                          'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                                        }`}>
                                          {round.category}
                                        </span>
                                      </div>
                                    </div>
                                 </td>

                                 {/* Round Info */}
                                 <td className="p-4 align-top hidden sm:table-cell">
                                    <span className="px-2 py-1 rounded bg-crypto-subtle border border-crypto-border text-xs text-crypto-muted font-medium">
                                      {round.round}
                                    </span>
                                 </td>

                                 {/* Financials */}
                                 <td className="p-4 align-top text-right">
                                    <div className="font-mono text-sm font-bold text-emerald-400">{round.amount}</div>
                                    <div className="text-xs text-crypto-muted mt-1">Val: {round.valuation}</div>
                                 </td>

                                 {/* Investors (Detailed) */}
                                 <td className="p-4 align-top hidden lg:table-cell">
                                    <div className="flex flex-wrap gap-1.5">
                                      {round.leadInvestors && round.leadInvestors.length > 0 && (
                                         round.leadInvestors.map((inv, i) => (
                                          <span key={`lead-${i}`} className="text-xs px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded flex items-center gap-1">
                                            ★ {inv}
                                          </span>
                                         ))
                                      )}
                                      {round.investors.slice(0, 3).map((inv, i) => (
                                        <span key={i} className="text-xs px-2 py-0.5 bg-crypto-subtle border border-crypto-border text-crypto-muted rounded">
                                          {inv}
                                        </span>
                                      ))}
                                      {round.investors.length > 3 && (
                                        <span className="text-xs text-crypto-muted px-1 py-0.5">+{round.investors.length - 3}</span>
                                      )}
                                    </div>
                                 </td>
                               </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Right Column: AI Analyst */}
          <div className="lg:col-span-4 h-full">
            <AIAnalyst selectedCoin={activeCoin} language={language} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;