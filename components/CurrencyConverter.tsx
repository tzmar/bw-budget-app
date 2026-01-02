
import React, { useState, useEffect } from 'react';

const CurrencyConverter: React.FC = () => {
  const [fromCurrency, setFromCurrency] = useState('ZAR');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('https://open.er-api.com/v6/latest/BWP');
        if (!response.ok) throw new Error('API Sync Error');
        const data = await response.json();
        if (data && data.rates) setRates(data.rates);
        else throw new Error('Invalid Data');
      } catch (err) {
        setError('Market sync offline');
        setRates({ 'ZAR': 1.38, 'USD': 0.074, 'GBP': 0.058, 'EUR': 0.068 });
      } finally {
        setIsLoading(false);
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    if (amount && !isNaN(Number(amount)) && rates[fromCurrency]) {
      setResult(Number(amount) / rates[fromCurrency]);
    } else {
      setResult(null);
    }
  }, [amount, fromCurrency, rates]);

  return (
    <div className="bg-slate-900 dark:bg-slate-800 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
         </svg>
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Exchange Rates</h3>
          {isLoading && (
            <div className="animate-spin h-3 w-3 border-2 border-blue-400 border-t-transparent rounded-full"></div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex gap-2 items-center bg-slate-800/50 dark:bg-slate-900/50 p-1.5 rounded-2xl">
            <select 
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="bg-slate-700 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
            >
              <option value="ZAR">ZAR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
            </select>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent border-none px-4 py-2.5 text-sm font-bold focus:ring-0 outline-none text-right"
            />
          </div>

          {result !== null && (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-2xl text-center shadow-xl shadow-blue-900/50 animate-in zoom-in-95 duration-300">
              <span className="text-blue-100 text-[9px] font-black uppercase tracking-[0.2em] block mb-1">Local Value (BWP)</span>
              <span className="text-2xl font-black text-white">P{result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}

          {error && <p className="text-[10px] text-amber-400 font-bold text-center uppercase tracking-widest">{error}</p>}
        </div>
        
        {!isLoading && !error && (
          <p className="text-[9px] text-slate-500 font-bold text-center uppercase tracking-widest">Market Live • Real-time Data</p>
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;
