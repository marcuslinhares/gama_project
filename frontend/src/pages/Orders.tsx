import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, Truck, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';

const STATUS_MAP: any = {
  'PENDING_APPROVAL': { label: 'Pendente', icon: <Clock size={14}/>, color: 'bg-amber-100 text-amber-600 border-amber-200' },
  'APPROVED': { label: 'Aprovado', icon: <CheckCircle2 size={14}/>, color: 'bg-blue-100 text-blue-600 border-blue-200' },
  'SHIPPED': { label: 'Em Rota', icon: <Truck size={14}/>, color: 'bg-purple-100 text-purple-600 border-purple-200' },
  'DELIVERED': { label: 'Entregue', icon: <Package size={14}/>, color: 'bg-green-100 text-green-600 border-green-200' },
  'CANCELLED': { label: 'Cancelado', icon: <XCircle size={14}/>, color: 'bg-slate-100 text-slate-500 border-slate-200' },
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addMultipleItems } = useCart();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching orders:', err);
        setLoading(false);
      });
  }, []);

  const handleRepeatOrder = async (orderId: string) => {
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const order = await res.json();
      
      if (order.items) {
        const itemsToRepeat = order.items.map((item: any) => ({
          product: {
            id: item.productId,
            name: item.name,
            sku: item.sku || '',
            category: item.category,
            unitPrice: Number(item.priceAtPurchase),
            tieredPricing: [] // Recalculated by context
          },
          quantity: item.quantity
        }));
        
        addMultipleItems(itemsToRepeat);
        alert('Itens adicionados ao carrinho!');
      }
    } catch (err) {
      alert('Erro ao repetir pedido');
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6">Meus Pedidos</h1>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-white dark:bg-surface-lowest rounded-2xl animate-pulse border border-surface-low" />
        ))}
      </div>
    );
  }

  return (
    <div className="pb-24 p-4">
      <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6">Meus Pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-surface-lowest rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <Package size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 dark:text-slate-500 font-bold">Você ainda não fez nenhum pedido.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const status = STATUS_MAP[order.status] || STATUS_MAP.PENDING_APPROVAL;
            return (
              <div key={order.id} className="bg-white dark:bg-surface-lowest rounded-2xl p-5 shadow-sm border border-surface-low relative active:scale-[0.98] transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest block mb-1">
                      Pedido #{order.id.split('-')[0]}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase ${status.color}`}>
                    {status.icon} {status.label}
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest block mb-0.5">Total</span>
                    <span className="text-lg font-black text-primary">R$ {Number(order.totalAmount).toFixed(2)}</span>
                  </div>
                  
                  <button className="bg-surface-low hover:bg-surface-high p-3 rounded-xl text-slate-600 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                <button 
                  onClick={() => handleRepeatOrder(order.id)}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 border-2 border-primary/10 text-primary text-xs font-black rounded-xl hover:bg-primary/5 transition-all"
                >
                  <RotateCcw size={14} /> REPETIR PEDIDO
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
