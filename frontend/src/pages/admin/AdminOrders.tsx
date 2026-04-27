import React, { useState, useEffect } from 'react';
import { ChevronLeft, RefreshCcw, MoreVertical, LogOut } from 'lucide-react';

const STATUS_OPTIONS = [
  { id: 'PENDING_APPROVAL', label: 'Pendente', color: 'bg-amber-100 text-amber-600' },
  { id: 'APPROVED', label: 'Aprovado', color: 'bg-blue-100 text-blue-600' },
  { id: 'IN_SEPARATION', label: 'Em Separação', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'SHIPPED', label: 'Em Rota', color: 'bg-purple-100 text-purple-600' },
  { id: 'DELIVERED', label: 'Entregue', color: 'bg-green-100 text-green-600' },
  { id: 'CANCELLED', label: 'Cancelado', color: 'bg-red-100 text-red-600' },
];

const AdminOrders: React.FC<{ onBack: () => void, onLogout: () => void }> = ({ onBack, onLogout }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      alert('Erro ao atualizar status');
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-surface min-h-screen p-6">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="bg-white dark:bg-surface-lowest p-2 rounded-lg shadow-sm"><ChevronLeft /></button>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Gestão de Pedidos</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchOrders} className="bg-white dark:bg-surface-lowest text-slate-600 dark:text-slate-300 p-2 rounded-lg shadow-sm hover:bg-slate-100 dark:hover:bg-surface-low transition-all">
            <RefreshCcw size={20} />
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 bg-white dark:bg-surface-lowest text-red-500 font-bold px-4 py-2 rounded-xl shadow-sm border border-red-50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut size={18} /> Sair
          </button>
        </div>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-white dark:bg-surface-lowest rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-lowest rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-700">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-surface border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Pedido</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Cliente</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Total</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Status</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-surface transition-colors">
                  <td className="p-4">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">#{order.id.split('-')[0]}</span>
                    <span className="text-[10px] block text-slate-400 dark:text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{order.clientName}</span>
                    <span className="text-[10px] block text-slate-400 dark:text-slate-500">{order.clientPhone}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-black text-primary">R$ {Number(order.totalAmount).toFixed(2)}</span>
                  </td>
                  <td className="p-4">
                    <select 
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border-none outline-none cursor-pointer ${
                        STATUS_OPTIONS.find(s => s.id === order.status)?.color || 'bg-slate-100'
                      }`}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-slate-300 hover:text-slate-600"><MoreVertical size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
