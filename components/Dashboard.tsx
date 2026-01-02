
import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { Transaction, TransactionType } from '../types';
import { CURRENCY_SYMBOL } from '../constants';

interface DashboardProps {
  transactions: Transaction[];
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const isDark = document.documentElement.classList.contains('dark');

  const income = useMemo(() => 
    transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0)
  , [transactions]);

  const expenses = useMemo(() => 
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0)
  , [transactions]);

  const balance = income - expenses;

  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        data[t.category] = (data[t.category] || 0) + t.amount;
      });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Inflow', val: income, color: 'text-green-600 dark:text-green-400', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
          { label: 'Outflow', val: expenses, color: 'text-red-600 dark:text-red-400', icon: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6' },
          { label: 'Net Capital', val: balance, color: 'text-blue-600 dark:text-blue-400', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-transform hover:scale-[1.02]">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{item.label}</p>
               <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 ${item.color.split(' ')[0]}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
                 </svg>
               </div>
            </div>
            <p className={`text-3xl font-black tracking-tight ${item.color}`}>
              {CURRENCY_SYMBOL}{item.val.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">Portfolio Split</h3>
          <div className="h-72">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)', background: isDark ? '#1e293b' : '#ffffff' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(value: number) => `P${value.toLocaleString()}`} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium italic">No allocation data</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">Velocity Trend</h3>
          <div className="h-72">
            {transactions.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
                  <XAxis 
                    dataKey="name" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{fill: isDark ? '#64748b' : '#94a3b8', fontWeight: 700}}
                    dy={10}
                  />
                  <YAxis 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{fill: isDark ? '#64748b' : '#94a3b8', fontWeight: 700}}
                  />
                  <Tooltip cursor={{fill: isDark ? '#334155' : '#f8fafc'}} />
                  <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 8, 8]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium italic">Awaiting transaction flow</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
