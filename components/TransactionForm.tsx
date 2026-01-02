
import React, { useState } from 'react';
import { TransactionType, Transaction } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, CURRENCY_SYMBOL } from '../constants';

interface TransactionFormProps {
  onAdd: (transaction: Transaction) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    onAdd({
      id: crypto.randomUUID(),
      type,
      amount: Number(amount),
      category,
      description,
      date,
    });
    setAmount('');
    setDescription('');
  };

  const categories = type === TransactionType.INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
      <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <button
          type="button"
          onClick={() => { setType(TransactionType.EXPENSE); setCategory(EXPENSE_CATEGORIES[0]); }}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
            type === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-lg shadow-slate-200/50 dark:shadow-none' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => { setType(TransactionType.INCOME); setCategory(INCOME_CATEGORIES[0]); }}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
            type === TransactionType.INCOME ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-lg shadow-slate-200/50 dark:shadow-none' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          Income
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Capital Amount ({CURRENCY_SYMBOL})</label>
          <input
            type="number"
            required
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/10 transition-all outline-none text-slate-900 dark:text-white font-bold"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Classification</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/10 transition-all outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold appearance-none cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Memo</label>
          <input
            type="text"
            placeholder="Business details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/10 transition-all outline-none text-slate-900 dark:text-white font-bold"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Booking Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/10 transition-all outline-none text-slate-900 dark:text-white font-bold"
          />
        </div>
      </div>

      <button
        type="submit"
        className={`w-full py-4 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] ${
          type === TransactionType.INCOME 
            ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20' 
            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
        }`}
      >
        Post {type === TransactionType.INCOME ? 'Inflow' : 'Outflow'}
      </button>
    </form>
  );
};

export default TransactionForm;
