
import React, { useState } from 'react';
import { SavingsGoal } from '../types';
import { CURRENCY_SYMBOL } from '../constants';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: SavingsGoal) => void;
  onUpdateGoal: (id: string, amount: number) => void;
  onDeleteGoal: (id: string) => void;
}

const SavingsGoals: React.FC<SavingsGoalsProps> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newTarget) return;
    onAddGoal({
      id: crypto.randomUUID(),
      name: newName,
      targetAmount: Number(newTarget),
      currentAmount: 0
    });
    setNewName('');
    setNewTarget('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Wealth Accumulation</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-5 py-2.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
        >
          {isAdding ? 'Cancel' : 'New Goal'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in slide-in-from-top-4">
          <input
            type="text"
            placeholder="Investment Name"
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Target Amount (P)"
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
            Secure Goal
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-6">
        {goals.map(goal => {
          const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          return (
            <div key={goal.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none transition-all hover:translate-y-[-2px]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{goal.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                    {CURRENCY_SYMBOL}{goal.currentAmount.toLocaleString()} saved of {CURRENCY_SYMBOL}{goal.targetAmount.toLocaleString()}
                  </p>
                </div>
                <button 
                  onClick={() => onDeleteGoal(goal.id)}
                  className="text-slate-300 dark:text-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full mb-6 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-blue-400 h-full transition-all duration-1000 ease-out shadow-inner" 
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Inject Capital"
                  className="flex-1 px-4 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = Number((e.target as HTMLInputElement).value);
                      if (!isNaN(val)) {
                        onUpdateGoal(goal.id, goal.currentAmount + val);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <button 
                  className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:scale-90"
                  onClick={(e) => {
                    const input = (e.currentTarget.previousSibling as HTMLInputElement);
                    const val = Number(input.value);
                    if (!isNaN(val)) {
                      onUpdateGoal(goal.id, goal.currentAmount + val);
                      input.value = '';
                    }
                  }}
                >
                  Fund
                </button>
              </div>
            </div>
          );
        })}
        {goals.length === 0 && !isAdding && (
          <div className="text-center py-12 px-6 text-slate-400 font-bold uppercase tracking-widest text-[10px] bg-slate-50/50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
            No active wealth strategies
          </div>
        )}
      </div>
    </div>
  );
};

export default SavingsGoals;
