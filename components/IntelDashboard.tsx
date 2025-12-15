import React, { useEffect, useState } from 'react';
import { IntelEntity, IntelTransaction, LanguageCode } from '../types';
import { fetchIntelData } from '../services/api';
import { TRANSLATIONS } from '../constants';
import { RadarIcon, TargetIcon, ActivityIcon } from './Icons';

interface IntelDashboardProps {
  language: LanguageCode;
}

const IntelDashboard: React.FC<IntelDashboardProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [entities, setEntities] = useState<IntelEntity[]>([]);
  const [transactions, setTransactions] = useState<IntelTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchIntelData();
      setEntities(data.entities);
      setTransactions(data.transactions);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="bg-crypto-card rounded-2xl border border-crypto-border shadow-xl flex-1 overflow-hidden flex flex-col h-full">
       <div className="p-6 border-b border-crypto-border bg-crypto-subtle/50 flex justify-between items-center">
         <div>
           <h3 className="font-bold text-crypto-text text-lg flex items-center gap-2">
              <RadarIcon className="text-emerald-400 w-5 h-5" />
              {t.intel} Dashboard
           </h3>
           <p className="text-xs text-crypto-muted mt-1">Simulating Arkham Intelligence Data Feed</p>
         </div>
         <div className="bg-crypto-subtle px-3 py-1 rounded-full border border-crypto-border">
            <span className="text-xs text-crypto-muted font-mono">{t.source}: Simulated Feed</span>
         </div>
       </div>
       
       <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-full gap-2">
               <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-sm text-crypto-muted">{t.loading}</p>
             </div>
          ) : (
            <>
              {/* Entity Watchlist */}
              <div>
                 <h4 className="text-crypto-text font-bold mb-4 flex items-center gap-2">
                    <TargetIcon className="w-4 h-4 text-indigo-400" />
                    {t.entities} Watchlist
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {entities.map(entity => (
                       <div key={entity.id} className="bg-crypto-subtle/30 border border-crypto-border rounded-xl p-4 hover:bg-crypto-subtle/50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                             <div>
                                <h5 className="font-bold text-crypto-text text-sm">{entity.name}</h5>
                                <span className="text-xs text-crypto-muted">{entity.label}</span>
                             </div>
                             <span className={`text-xs px-2 py-0.5 rounded font-mono ${entity.pnl24h >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {entity.pnl24h > 0 ? '+' : ''}{entity.pnl24h}%
                             </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-3 mb-3">
                             {entity.tags.map(tag => (
                                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-crypto-card border border-crypto-border text-crypto-muted">
                                   {tag}
                                </span>
                             ))}
                          </div>
                          <div className="flex justify-between items-end border-t border-crypto-border pt-3">
                             <span className="text-xs text-crypto-muted">Balance</span>
                             <span className="text-sm font-mono font-bold text-crypto-text">{entity.balanceUsd}</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Transactions Table */}
              <div>
                 <h4 className="text-crypto-text font-bold mb-4 flex items-center gap-2">
                    <ActivityIcon className="w-4 h-4 text-orange-400" />
                    {t.transactions}
                 </h4>
                 <div className="overflow-x-auto rounded-xl border border-crypto-border">
                    <table className="w-full text-left border-collapse">
                       <thead className="bg-crypto-subtle/50">
                          <tr>
                             <th className="p-3 text-xs font-semibold text-crypto-muted uppercase">Time</th>
                             <th className="p-3 text-xs font-semibold text-crypto-muted uppercase">{t.from}</th>
                             <th className="p-3 text-xs font-semibold text-crypto-muted uppercase">{t.to}</th>
                             <th className="p-3 text-xs font-semibold text-crypto-muted uppercase text-right">{t.value}</th>
                             <th className="p-3 text-xs font-semibold text-crypto-muted uppercase text-right">{t.token}</th>
                          </tr>
                       </thead>
                       <tbody className="bg-crypto-card">
                          {transactions.map((tx) => (
                             <tr key={tx.id} className="border-b border-crypto-border last:border-0 hover:bg-crypto-subtle/20 transition-colors">
                                <td className="p-3 text-xs text-crypto-muted font-mono whitespace-nowrap">{tx.time}</td>
                                <td className="p-3">
                                   <div className="flex flex-col">
                                      <span className="text-xs font-bold text-crypto-text">{tx.fromLabel || tx.fromAddress}</span>
                                      {tx.fromLabel && <span className="text-[10px] text-crypto-muted truncate w-24">{tx.fromAddress}</span>}
                                   </div>
                                </td>
                                <td className="p-3">
                                   <div className="flex flex-col">
                                      <span className="text-xs font-bold text-crypto-text">{tx.toLabel || tx.toAddress}</span>
                                      {tx.toLabel && <span className="text-[10px] text-crypto-muted truncate w-24">{tx.toAddress}</span>}
                                   </div>
                                </td>
                                <td className="p-3 text-right text-xs font-mono font-bold text-crypto-text">
                                   ${tx.valueUsd.toLocaleString()}
                                </td>
                                <td className="p-3 text-right">
                                   <div className="flex flex-col items-end">
                                      <span className="text-xs font-bold text-crypto-text">{tx.tokenSymbol}</span>
                                      <span className="text-[10px] text-crypto-muted">{tx.tokenAmount.toFixed(2)}</span>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            </>
          )}
       </div>
    </div>
  );
};

export default IntelDashboard;