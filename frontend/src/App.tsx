import React, { useState } from 'react';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import { useCart } from './context/CartContext';
import { Home as HomeIcon, ShoppingCart, ClipboardList } from 'lucide-react';

type View = 'home' | 'details' | 'cart';

function App() {
  const [view, setView] = useState<View>('home');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { totalItems } = useCart();

  const navigateToDetails = (product: any) => {
    setSelectedProduct(product);
    setView('details');
  };

  const navigateToHome = () => {
    setSelectedProduct(null);
    setView('home');
  };

  return (
    <div className="min-h-screen bg-surface">
      {view === 'home' && <Home onSelectProduct={navigateToDetails} />}
      {view === 'details' && <ProductDetails product={selectedProduct} onBack={navigateToHome} />}
      {view === 'cart' && <Cart onBack={navigateToHome} />}
      
      {/* Bottom Nav */}
      {view !== 'details' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
          <button 
            onClick={() => setView('home')}
            className={`flex flex-col items-center gap-1 transition-all ${view === 'home' ? 'text-primary scale-110' : 'text-slate-400'}`}
          >
            <HomeIcon size={20} />
            <span className="text-[10px] font-bold">Início</span>
          </button>
          
          <button 
            onClick={() => setView('cart')}
            className={`flex flex-col items-center gap-1 relative transition-all ${view === 'cart' ? 'text-primary scale-110' : 'text-slate-400'}`}
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                {totalItems}
              </span>
            )}
            <span className="text-[10px] font-bold">Carrinho</span>
          </button>
          
          <button className="text-slate-400 flex flex-col items-center gap-1 opacity-50 cursor-not-allowed">
            <ClipboardList size={20} />
            <span className="text-[10px] font-bold">Pedidos</span>
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;
