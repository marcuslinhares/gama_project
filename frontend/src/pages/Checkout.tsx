import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Landmark, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CheckoutProps {
  onBack: () => void;
  onSuccess: (orderId: string) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onBack, onSuccess }) => {
  const { items, subtotal } = useCart();
  const [method, setMethod] = useState('BOLETO_FATURADO');
  const [isProcessing, setIsProcessing] = useState(false);

  const frete = subtotal > 500 ? 0 : 25.00;
  const total = subtotal + frete;

  const handleFinish = async () => {
    setIsProcessing(true);
    const token = localStorage.getItem('auth_token');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
          paymentMethod: method,
          shippingAddress: 'Russas, CE' // Placeholder
        })
      });

      if (response.ok) {
        const data = await response.json();
        onSuccess(data.id);
      } else {
        const data = await response.json();
        alert(data.message || 'Erro ao processar pedido');
      }
    } catch (err) {
      alert('Erro de conexão com o servidor');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen pb-10">
      <header className="px-4 py-6 flex items-center gap-4 bg-white dark:bg-surface-lowest sticky top-0 z-30 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-surface-low rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-900 dark:text-slate-100" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Finalizar Pedido</h1>
      </header>

      <main className="px-4 mt-6 space-y-6">
        <section className="bg-white dark:bg-surface-lowest rounded-2xl p-6 shadow-sm border border-surface-low">
          <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-4">Itens do Pedido</h3>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300 truncate mr-4">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{item.quantity}x</span> {item.product.name}
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 flex-shrink-0">
                  R$ {(item.priceAtQty * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-surface-low flex justify-between items-center">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Total</span>
            <span className="text-xl font-black text-primary">R$ {total.toFixed(2)}</span>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest px-1">Forma de Pagamento</h3>
          
          <div className="grid gap-3">
            {[
              { id: 'BOLETO_FATURADO', label: 'Boleto Faturado', icon: <Landmark size={20} />, sub: 'Aprox. 28 dias para pagar' },
              { id: 'PIX', label: 'PIX', icon: <CreditCard size={20} />, sub: 'Aprovação imediata' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  method === m.id
                    ? 'border-primary bg-primary/5'
                    : 'border-white dark:border-surface-lowest bg-white dark:bg-surface-lowest hover:border-surface-low'
                }`}
              >
                <div className={`${method === m.id ? 'text-primary' : 'text-slate-400'}`}>
                  {m.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{m.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{m.sub}</div>
                </div>
                <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  method === m.id ? 'border-primary bg-primary' : 'border-surface-high'
                }`}>
                  {method === m.id && <CheckCircle2 size={12} className="text-white" />}
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-900 backdrop-blur-md border-t border-surface-low dark:border-slate-700">
        <button 
          onClick={handleFinish}
          disabled={isProcessing}
          className={`w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-3 transition-all ${
            isProcessing ? 'opacity-70 scale-[0.98]' : 'hover:bg-primary-container active:scale-95'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processando...
            </>
          ) : (
            'Confirmar Pedido'
          )}
        </button>
      </footer>
    </div>
  );
};

export default Checkout;
