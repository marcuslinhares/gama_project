import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, Users, ArrowUpRight, LogOut, Moon, Sun, Tag } from 'lucide-react';
import { SalesEvolutionChart, CategoryMixChart } from '../../components/admin/SalesCharts';
import { useTheme } from '../../context/ThemeContext';

const AdminDashboard: React.FC<{ onNavigate: (view: any) => void, onLogout: () => void }> = ({ onNavigate, onLogout }) => {
  const [stats, setStats] = useState<any>({ salesToday: 0, pendingOrders: 0 });
  const [report, setReport] = useState<any>({ dailySales: [], categorySales: [], kpis: {} });
  const [loading, setLoading] = useState(true);
  const [promoCount, setPromoCount] = useState(0);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    Promise.all([
      fetch('/api/admin/stats', { headers }).then(res => res.json()),
      fetch('/api/admin/reports/sales', { headers }).then(res => res.json()),
      fetch('/api/admin/promotions', { headers }).then(res => res.json()),
    ])
      .then(([statsData, reportData, promosData]) => {
        setStats(statsData);
        setReport(reportData);
        setPromoCount(Array.isArray(promosData) ? promosData.filter((p: any) => p.active).length : 0);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const cards = [
    { title: 'Vendas Hoje', value: `R$ ${stats.salesToday.toFixed(2)}`, icon: <TrendingUp className="text-green-500" />, color: 'bg-green-50 dark:bg-green-900/20' },
    { title: 'Pedidos Pendentes', value: stats.pendingOrders, icon: <Package className="text-amber-500" />, color: 'bg-amber-50 dark:bg-amber-900/20', action: () => onNavigate('admin_orders') },
    { title: 'Faturamento Mês', value: `R$ ${(report.kpis.totalMonth || 0).toFixed(2)}`, icon: <TrendingUp className="text-blue-500" />, color: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Ticket Médio', value: `R$ ${(report.kpis.avgTicket || 0).toFixed(2)}`, icon: <Users className="text-purple-500" />, color: 'bg-purple-50 dark:bg-purple-900/20' },
    { title: 'Promoções Ativas', value: promoCount, icon: <Tag className="text-rose-500" />, color: 'bg-rose-50 dark:bg-rose-900/20', action: () => onNavigate('admin_promo') },
    { title: 'Produtos', value: 'Gerenciar', icon: <Package className="text-teal-500" />, color: 'bg-teal-50 dark:bg-teal-900/20', action: () => onNavigate('admin_products') },
  ];

  return (
    <div className="bg-slate-50 dark:bg-surface min-h-screen p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Olá, Distribuidor 👋</h1>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-xl bg-white dark:bg-surface-lowest shadow-sm transition-colors" aria-label="Alternar tema">
            {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-400" />}
          </button>
          <button onClick={onLogout} className="flex items-center gap-2 bg-white dark:bg-surface-lowest text-red-500 font-bold px-4 py-2 rounded-xl shadow-sm border border-red-50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        {cards.map((card, i) => (
          <div key={i} onClick={card.action} className={`p-6 rounded-3xl bg-white dark:bg-surface-lowest shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-40 ${card.action ? 'cursor-pointer hover:scale-[1.02] transition-all' : ''}`}>
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl ${card.color}`}>{card.icon}</div>
              {card.action && <ArrowUpRight size={18} className="text-slate-300" />}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest block mb-1">{card.title}</span>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2"><SalesEvolutionChart data={report.dailySales} /></div>
          <div className="lg:col-span-1"><CategoryMixChart data={report.categorySales} /></div>
        </div>
      )}

      <section className="bg-primary rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2">Pronto para a entrega?</h2>
          <p className="text-white/70 text-sm max-w-sm mb-6">Existem {stats.pendingOrders} pedidos aguardando sua revisão financeira para irem para a rota.</p>
          <button onClick={() => onNavigate('admin_orders')} className="bg-white text-primary font-black px-8 py-3 rounded-xl shadow-lg active:scale-95 transition-all">Ver Pedidos Pendentes</button>
        </div>
        <div className="absolute right-[-40px] bottom-[-40px] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </section>
    </div>
  );
};

export default AdminDashboard;
