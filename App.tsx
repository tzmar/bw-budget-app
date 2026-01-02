
import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, AppState, SavingsGoal, TransactionType } from './types';
import { loadState, saveState } from './utils/storage';
import { INITIAL_LIMITS, CURRENCY_SYMBOL } from './constants';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import SavingsGoals from './components/SavingsGoals';
import CurrencyConverter from './components/CurrencyConverter';
import { getFinancialAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    transactions: [],
    goals: [],
    limits: INITIAL_LIMITS
  });

  const [aiTip, setAiTip] = useState<string>("Commit thy works unto the LORD, and thy thoughts shall be established.");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'goals'>('dashboard');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>((localStorage.getItem('theme') as 'light' | 'dark') || 'light');

  // Monitor online status & PWA
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Theme management
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Initialization
  useEffect(() => {
    const saved = loadState();
    if (saved) setState(saved);
  }, []);

  // Save on state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    }
  };

  const handleAddTransaction = (t: Transaction) => {
    setState(prev => ({
      ...prev,
      transactions: [t, ...prev.transactions]
    }));

    if (t.type === TransactionType.EXPENSE) {
       const totalInCat = state.transactions
        .filter(trans => trans.category === t.category && trans.type === TransactionType.EXPENSE)
        .reduce((sum, trans) => sum + trans.amount, 0) + t.amount;
       
       const limit = state.limits.find(l => l.category === t.category)?.limit || 0;
       if (limit > 0 && totalInCat > limit) {
         alert(`Heed the warning: You have exceeded your P${limit} budget for ${t.category}.`);
       }
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  const handleAddGoal = (goal: SavingsGoal) => {
    setState(prev => ({ ...prev, goals: [...prev.goals, goal] }));
  };

  const handleUpdateGoal = (id: string, currentAmount: number) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, currentAmount } : g)
    }));
  };

  const refreshAiTip = async () => {
    if (isOffline) {
      setAiTip("AI wisdom is unavailable while offline. Connect to refresh!");
      return;
    }
    setIsLoadingAi(true);
    const tip = await getFinancialAdvice(state);
    setAiTip(tip);
    setIsLoadingAi(false);
  };

  const exportToCSV = () => {
    const headers = "Date,Type,Category,Description,Amount\n";
    const rows = state.transactions.map(t => 
      `${t.date},${t.type},${t.category},"${t.description}",${t.amount}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PulaPocket_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-24 md:pb-6 transition-colors duration-300">
      {/* Offline Status Pill */}
      {isOffline && (
        <div className="bg-amber-500 text-white text-[10px] font-bold py-1 px-4 text-center sticky top-0 z-50 animate-pulse">
          WORKING OFFLINE • DATA PERSISTED LOCALLY
        </div>
      )}

      {/* Header */}
      <header className="glass-header border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 dark:bg-blue-500 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">PulaPocket</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                Install
              </button>
            )}
            <button 
              onClick={exportToCSV}
              className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Export Report
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-10">
        {/* AI Tip Bar - Enhanced */}
        <div className={`group relative rounded-[2rem] p-8 text-white shadow-2xl transition-all duration-700 overflow-hidden ${
          isOffline ? 'bg-slate-700' : 'bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800'
        }`}>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Spiritual Wisdom</span>
              {isOffline && <span className="bg-amber-500/40 px-3 py-1 rounded-full text-[10px] font-black">Offline</span>}
            </div>
            <div className="flex items-start gap-6">
              <div className="text-xl md:text-2xl font-bold leading-tight flex-1">
                "{aiTip}"
              </div>
              <button 
                onClick={refreshAiTip}
                disabled={isLoadingAi}
                className={`mt-1 p-3 bg-white/10 rounded-2xl hover:bg-white/25 active:scale-95 transition-all ${isLoadingAi ? 'opacity-50' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isLoadingAi ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            {activeTab === 'dashboard' && <Dashboard transactions={state.transactions} />}
            
            {(activeTab === 'dashboard' || activeTab === 'transactions') && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Transaction Desk</h3>
                </div>
                <TransactionForm onAdd={handleAddTransaction} />
                
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Recent Statement</h3>
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <th className="px-8 py-5 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Description</th>
                            <th className="px-8 py-5 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Category</th>
                            <th className="px-8 py-5 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Amount</th>
                            <th className="px-8 py-5 w-20"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                          {state.transactions.slice(0, 15).map(t => (
                            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-8 py-5">
                                <p className="font-bold text-slate-800 dark:text-slate-200">{t.description || 'General Entry'}</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-tighter mt-0.5">{t.date}</p>
                              </td>
                              <td className="px-8 py-5">
                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                  t.type === TransactionType.INCOME 
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}>
                                  {t.category}
                                </span>
                              </td>
                              <td className={`px-8 py-5 text-right font-black ${t.type === TransactionType.INCOME ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>
                                {t.type === TransactionType.INCOME ? '+' : '-'}{CURRENCY_SYMBOL}{t.amount.toLocaleString()}
                              </td>
                              <td className="px-8 py-5 text-right">
                                <button 
                                  onClick={() => handleDeleteTransaction(t.id)}
                                  className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-all p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'goals' && (
              <SavingsGoals 
                goals={state.goals} 
                onAddGoal={handleAddGoal} 
                onUpdateGoal={handleUpdateGoal}
                onDeleteGoal={(id) => setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }))}
              />
            )}
          </div>

          <div className="lg:col-span-4 space-y-10">
            <CurrencyConverter />
            
            {activeTab !== 'goals' && (
              <SavingsGoals 
                goals={state.goals} 
                onAddGoal={handleAddGoal} 
                onUpdateGoal={handleUpdateGoal}
                onDeleteGoal={(id) => setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }))}
              />
            )}
            
            <div className="bg-slate-100 dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-slate-900 dark:text-white mb-6 tracking-tight">Financial Principles</h3>
              <ul className="space-y-6">
                {[
                  { id: 1, text: "A good man leaveth an inheritance to his children's children." },
                  { id: 2, text: "The borrower is servant to the lender; strive for freedom." },
                  { id: 3, text: "He that is faithful in that which is least is faithful also in much." }
                ].map(tip => (
                  <li key={tip.id} className="flex gap-4 group">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-xl flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform">
                      {tip.id}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{tip.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Navigation - Enhanced Glass effect */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav border-t border-slate-200 dark:border-slate-800 px-8 py-4 flex justify-between items-center md:hidden z-50 pb-safe">
        {[
          { tab: 'dashboard', label: 'Overview', icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
          { tab: 'transactions', label: 'Desk', icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
          { tab: 'goals', label: 'Wealth', icon: "M13 10V3L4 14h7v7l9-11h-7z" }
        ].map(item => (
          <button 
            key={item.tab}
            onClick={() => setActiveTab(item.tab as any)}
            className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${activeTab === item.tab ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === item.tab ? 2.5 : 2} d={item.icon} />
            </svg>
            <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === item.tab ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
