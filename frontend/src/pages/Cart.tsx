import React from 'react';
import { ArrowLeft, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartProps {
  onBack: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ onBack, onCheckout }) => {
  const { items, updateQuantity, removeItem, subtotal, totalItems } = useCart();

  const frete = subtotal > 500 ? 0 : 25.00; // Frete grátis Russas acima de R$ 500
  const total = subtotal + frete;

  if (items.length === 0) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-surface-low p-6 rounded-full mb-6">
          <ShoppingBag size={48} className="text-slate-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Seu carrinho está vazio</h2>
        <p className="text-slate-500 mt-2">Adicione produtos do catálogo para começar seu pedido.</p>
        <button 
          onClick={onBack}
          className="mt-8 bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary/20"
        >
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen pb-40">
      <header className="px-4 py-6 flex items-center gap-4 bg-white sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-surface-low rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-900" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Meu Carrinho</h1>
        <span className="ml-auto bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase">
          {totalItems} Itens
        </span>
      </header>

      <main className="px-4 mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.product.id} className="card p-4 flex gap-4">
            <div className="w-20 h-20 bg-surface-low rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
              {item.product.image ? (
                <img src={item.product.image} alt={item.product.name} className="object-cover w-full h-full" />
              ) : (
                <div className="text-[10px] font-bold text-surface-high uppercase">Produto</div>
              )}
            </div>
            
            <div className="flex-grow min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">{item.product.name}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">R$ {item.priceAtQty.toFixed(2)} / un</p>
              
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center bg-surface-low rounded-lg p-1">
                  <button 
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-1 hover:bg-white rounded-md transition-all active:scale-90"
                  >
                    <Minus size={14} className="text-primary" />
                  </button>
                  <span className="px-3 text-sm font-bold text-slate-900 min-w-[32px] text-center">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="p-1 hover:bg-white rounded-md transition-all active:scale-90"
                  >
                    <Plus size={14} className="text-primary" />
                  </button>
                </div>
                
                <button 
                  onClick={() => removeItem(item.product.id)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        <section className="bg-white rounded-2xl p-6 mt-8 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest text-[10px]">Resumo do Pedido</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-bold text-slate-900">R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Frete</span>
                <span className="text-[8px] bg-surface-low px-1.5 py-0.5 rounded uppercase text-slate-400">Russas/CE</span>
              </div>
              <span className={frete === 0 ? 'text-green-600 font-bold' : 'font-bold text-slate-900'}>
                {frete === 0 ? 'GRÁTIS' : `R$ ${frete.toFixed(2)}`}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-low flex justify-between items-center">
            <span className="text-base font-bold text-slate-900">Total</span>
            <span className="text-2xl font-black text-primary">R$ {total.toFixed(2)}</span>
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white px-4 py-6 border-t border-surface-low shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <button 
          onClick={onCheckout}
          className="w-full bg-primary hover:bg-primary-container text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
        >
          Finalizar Pedido
        </button>
      </footer>
    </div>
  );
};

export default Cart;
