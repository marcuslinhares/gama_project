import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, RefreshCcw, MoreVertical, LogOut, Search, ChevronUp, ChevronDown, X, Package } from 'lucide-react';

const STATUS_OPTIONS = [
  { id: 'PENDING_APPROVAL', label: 'Pendente', color: 'bg-amber-100 text-amber-600' },
  { id: 'APPROVED', label: 'Aprovado', color: 'bg-blue-100 text-blue-600' },
  { id: 'IN_SEPARATION', label: 'Em Separação', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'SHIPPED', label: 'Em Rota', color: 'bg-purple-100 text-purple-600' },
  { id: 'DELIVERED', label: 'Entregue', color: 'bg-green-100 text-green-600' },
  { id: 'CANCELLED', label: 'Cancelado', color: 'bg-red-100 text-red-600' },
];

type SortField = 'createdAt' | 'totalAmount' | 'clientName';
type SortDir = 'asc' | 'desc';

const AdminOrders: React.FC<{ onBack: () => void, onLogout: () => void }> = ({ onBack, onLogout }) => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

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
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev: AdminOrder | null) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      alert('Erro ao atualizar status');
    }
  };

  const openOrderDetail = async (orderId: string) => {
    setLoadingDetail(true);
    setSelectedOrder({ id: orderId });
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSelectedOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp size={12} className="text-slate-300 inline ml-1" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-primary inline ml-1" />
      : <ChevronDown size={12} className="text-primary inline ml-1" />;
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders
      .filter(o => {
        const matchSearch = !q || o.id.toLowerCase().includes(q) || o.clientName?.toLowerCase().includes(q) || o.clientPhone?.includes(q);
        const matchStatus = !statusFilter || o.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        let va: AdminOrder, vb: AdminOrder;
        if (sortField === 'createdAt') { va = new Date(a.createdAt).getTime(); vb = new Date(b.createdAt).getTime(); }
        else if (sortField === 'totalAmount') { va = Number(a.totalAmount); vb = Number(b.totalAmount); }
        else { va = a.clientName?.toLowerCase() ?? ''; vb = b.clientName?.toLowerCase() ?? ''; }
        return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
      });
  }, [orders, search, statusFilter, sortField, sortDir]);

  return (
    <div className="bg-slate-50 dark:bg-surface min-h-screen p-6">
      <header className="flex justify-between items-center mb-6">
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

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por pedido, cliente ou telefone..."
            className="w-full bg-white dark:bg-surface-lowest rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-sm border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-white dark:bg-surface-lowest rounded-xl py-2.5 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-white dark:bg-surface-lowest rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-lowest rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-700">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-surface border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
                  <button onClick={() => toggleSort('createdAt')} className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                    Pedido <SortIcon field="createdAt" />
                  </button>
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
                  <button onClick={() => toggleSort('clientName')} className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                    Cliente <SortIcon field="clientName" />
                  </button>
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
                  <button onClick={() => toggleSort('totalAmount')} className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                    Total <SortIcon field="totalAmount" />
                  </button>
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Status</th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-slate-400">Nenhum pedido encontrado.</td>
                </tr>
              ) : filtered.map(order => (
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
                      className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border-none outline-none cursor-pointer ${STATUS_OPTIONS.find(s => s.id === order.status)?.color || 'bg-slate-100'}`}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openOrderDetail(order.id)}
                      className="text-slate-300 hover:text-slate-600 transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white dark:bg-surface-lowest rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  #{selectedOrder.id?.split('-')[0]}
                </h2>
                {selectedOrder.createdAt && (
                  <span className="text-xs text-slate-400">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                )}
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-surface transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-surface rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Cliente</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{selectedOrder.clientName}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Telefone</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{selectedOrder.clientPhone}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Pagamento</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center mt-3">
                    <span className="text-slate-500">Status</span>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                      className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border-none outline-none cursor-pointer ${STATUS_OPTIONS.find(s => s.id === selectedOrder.status)?.color || 'bg-slate-100'}`}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Package size={16} className="text-slate-400" />
                    <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Itens do Pedido</span>
                  </div>
                  <div className="space-y-3">
                    {selectedOrder.items?.length > 0 ? selectedOrder.items.map((item: AdminOrder['items'][0]) => (
                      <div key={item.id} className="flex justify-between items-center bg-slate-50 dark:bg-surface rounded-xl px-4 py-3">
                        <div>
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">{item.productName}</span>
                          <span className="text-[10px] text-slate-400">{item.sku} · {item.quantity}x</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-primary block">R$ {(item.quantity * item.priceAtPurchase).toFixed(2)}</span>
                          <span className="text-[10px] text-slate-400">R$ {Number(item.priceAtPurchase).toFixed(2)} un</span>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-slate-400 text-center py-2">Nenhum item encontrado.</p>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-sm font-black uppercase text-slate-400 tracking-widest">Total</span>
                    <span className="text-xl font-black text-primary">R$ {Number(selectedOrder.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
