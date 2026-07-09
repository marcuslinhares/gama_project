import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';

const COLORS = ['#003f87', '#005bb5', '#4a90e2', '#82ca9d', '#ffc658'];

export const SalesEvolutionChart: React.FC<{ data: Array<{ date: string; total: number }> }> = ({ data }) => (
  <div className="h-[300px] w-full bg-white dark:bg-surface-lowest p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
    <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-4">Evolução de Vendas (30 dias)</h3>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#003f87" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#003f87" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} tickFormatter={(v) => `R$ ${v}`} />
        <Tooltip 
          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          formatter={(value: number | undefined) => value ? [`R$ ${value.toFixed(2)}`, 'Vendas'] : ['R$ 0,00', 'Vendas']}
        />
        <Area type="monotone" dataKey="total" stroke="#003f87" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const CategoryMixChart: React.FC<{ data: Array<{ name: string; value: number }> }> = ({ data }) => (
  <div className="h-[300px] w-full bg-white dark:bg-surface-lowest p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
    <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-4">Mix por Categoria</h3>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  </div>
);
