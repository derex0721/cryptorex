import React, { useState, useRef, useEffect } from 'react';
import { CoinData, ChatMessage, MessageRole, LanguageCode } from '../types';
import { streamMarketAnalysis, generateTrendAnalysis } from '../services/gemini';
import { BrainCircuitIcon, SendIcon, ZapIcon } from './Icons';
import TrendAnalysisCard from './TrendAnalysisCard';
import { TRANSLATIONS } from '../constants';

interface AIAnalystProps {
  selectedCoin: CoinData;
  language: LanguageCode;
}

const AIAnalyst: React.FC<AIAnalystProps> = ({ selectedCoin, language }) => {
  const t = TRANSLATIONS[language];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset chat when coin changes or language changes
  useEffect(() => {
    setMessages([
      {
        id: `init-${selectedCoin.id}-${language}`,
        role: MessageRole.MODEL,
        text: t.aiGreeting.replace('{coin}', `${selectedCoin.name} (${selectedCoin.symbol})`)
      }
    ]);
  }, [selectedCoin.id, language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getContext = () => `
    Current Coin: ${selectedCoin.name} (${selectedCoin.symbol})
    Price: $${selectedCoin.price}
    24h Change: ${selectedCoin.change24h}%
    Market Cap: ${selectedCoin.marketCap}
    Volume: ${selectedCoin.volume}
    Description: ${selectedCoin.description}
    Price History (Last 24h): ${JSON.stringify(selectedCoin.history.map(h => h.price))}
  `;

  const handleDeepScan = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const analysisId = Date.now().toString();
    
    setMessages(prev => [...prev, {
      id: analysisId + '_req',
      role: MessageRole.USER,
      text: t.deepScan
    }]);

    setMessages(prev => [...prev, {
      id: analysisId,
      role: MessageRole.MODEL,
      text: "",
      isThinking: true
    }]);

    try {
      const result = await generateTrendAnalysis(selectedCoin.name, getContext(), language);
      
      setMessages(prev => prev.map(msg => {
        if (msg.id === analysisId) {
          if (result) {
            return {
              ...msg,
              isThinking: false,
              text: t.analysisComplete,
              trendResult: result
            };
          } else {
            return {
              ...msg,
              isThinking: false,
              text: t.analysisError
            };
          }
        }
        return msg;
      }));

    } catch (error) {
       setMessages(prev => prev.map(msg => 
        msg.id === analysisId 
          ? { ...msg, text: t.analysisError, isThinking: false } 
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const responseId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: responseId, role: MessageRole.MODEL, text: '', isThinking: true }]);

    try {
      let accumulatedText = "";
      const stream = streamMarketAnalysis(userMessage.text, getContext(), language);
      
      for await (const chunk of stream) {
        accumulatedText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === responseId 
            ? { ...msg, text: accumulatedText, isThinking: false } 
            : msg
        ));
      }
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === responseId 
          ? { ...msg, text: t.analysisError, isThinking: false } 
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-crypto-card border border-crypto-border rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-crypto-border flex items-center gap-3 bg-gradient-to-r from-crypto-subtle to-crypto-card">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <BrainCircuitIcon className="text-indigo-400 w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-crypto-text text-sm">{t.aiAnalyst}</h3>
          <p className="text-xs text-indigo-400">Powered by Gemini 2.5 Flash</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === MessageRole.USER
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-crypto-subtle text-crypto-text rounded-tl-none border border-crypto-border'
              }`}
            >
              {msg.isThinking && !msg.text ? (
                 <div className="flex space-x-2 items-center h-5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 </div>
              ) : (
                <div className="whitespace-pre-wrap markdown-body">{msg.text}</div>
              )}
            </div>
            
            {/* Render Trend Card if present */}
            {msg.trendResult && (
              <div className="w-full max-w-[95%] mt-2">
                <TrendAnalysisCard data={msg.trendResult} language={language} />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-crypto-subtle/50 border-t border-crypto-border">
        <div className="flex items-center gap-2">
          {/* Deep Scan Button */}
          <button
             onClick={handleDeepScan}
             disabled={isLoading}
             className="p-2.5 rounded-xl bg-crypto-subtle border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500 transition-all flex items-center gap-2 group"
             title={t.deepScan}
          >
            <ZapIcon className="w-5 h-5 group-hover:text-indigo-300" />
            <span className="hidden sm:block text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t.deepScan}</span>
          </button>

          <div className="flex-1 flex items-center gap-2 bg-crypto-subtle rounded-xl p-2 border border-crypto-border focus-within:border-indigo-500 transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`${t.askPlaceholder} ${selectedCoin.symbol}...`}
              className="flex-1 bg-transparent border-none outline-none text-crypto-text text-sm px-2 placeholder-crypto-muted"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`p-2 rounded-lg transition-all ${
                isLoading || !input.trim()
                  ? 'bg-crypto-card text-crypto-muted cursor-not-allowed border border-crypto-border'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
              }`}
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalyst;