import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Orders from './pages/Orders';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPromos from './pages/admin/AdminPromos';
import AdminProducts from './pages/admin/AdminProducts';
import { useCart } from './context/CartContext';
import { User, Product } from './types/api';
import { Home as HomeIcon, ShoppingCart, ClipboardList, ShieldCheck } from 'lucide-react';

type View = 'home' | 'details' | 'cart' | 'checkout' | 'success' | 'orders' | 'admin_dashboard' | 'admin_orders' | 'admin_promo' | 'admin_products';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [view, setView] = useState<View>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const { totalItems, clearCart } = useCart();

  useEffect(() => {
    // Tenta recuperar o usuário do localStorage se houver um token
    const storedUser = localStorage.getItem('auth_user');
    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Se for admin e estiver na home, redireciona para dashboard
      if (parsedUser.role === 'ADMIN' && view === 'home') {
        setView('admin_dashboard');
      }
    }
  }, [token]);

  const handleLoginSuccess = (userData: User, userToken: string) => {
    localStorage.setItem('auth_token', userToken);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
    if (userData.role === 'ADMIN') {
      setView('admin_dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    setView('home');
  };

  const navigateToDetails = (product: Product) => {
    setSelectedProduct(product);
    setView('details');
  };

  const navigateToHome = () => {
    setSelectedProduct(null);
    setView('home');
  };

  const handleCheckoutSuccess = (orderId: string) => {
    setLastOrderId(orderId);
    clearCart();
    setView('success');
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-surface">
      {view === 'home' && <Home user={user} onSelectProduct={navigateToDetails} onLogout={handleLogout} />}
      {view === 'details' && <ProductDetails product={selectedProduct} onBack={navigateToHome} />}
      {view === 'cart' && <Cart onBack={navigateToHome} onCheckout={() => setView('checkout')} />}
      {view === 'checkout' && <Checkout onBack={() => setView('cart')} onSuccess={handleCheckoutSuccess} />}
      {view === 'success' && lastOrderId && <OrderSuccess orderId={lastOrderId} onHome={navigateToHome} />}
      {view === 'orders' && <Orders />}
      {view === 'admin_dashboard' && <AdminDashboard onNavigate={setView} onLogout={handleLogout} />}
      {view === 'admin_orders' && <AdminOrders onBack={() => setView('admin_dashboard')} onLogout={handleLogout} />}
      {view === 'admin_promo' && <AdminPromos onBack={() => setView('admin_dashboard')} onLogout={handleLogout} />}
      {view === 'admin_products' && <AdminProducts onBack={() => setView('admin_dashboard')} onLogout={handleLogout} />}
      
      {/* Bottom Nav */}
      {view !== 'details' && view !== 'checkout' && view !== 'success' && view !== 'cart' && !view.startsWith('admin') && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
          <button
            onClick={() => setView('home')}
            className={`flex flex-col items-center gap-1 transition-all ${view === 'home' ? 'text-primary scale-110' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <HomeIcon size={20} />
            <span className="text-[10px] font-bold">Início</span>
          </button>
          
          <button
            onClick={() => setView('cart')}
            className={`flex flex-col items-center gap-1 relative transition-all ${view === 'cart' ? 'text-primary scale-110' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                {totalItems}
              </span>
            )}
            <span className="text-[10px] font-bold">Carrinho</span>
          </button>
          
          <button
            onClick={() => setView('orders')}
            className={`flex flex-col items-center gap-1 transition-all ${view === 'orders' ? 'text-primary scale-110' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <ClipboardList size={20} />
            <span className="text-[10px] font-bold">Pedidos</span>
          </button>
        </nav>
      )}

      {/* Admin Quick Switch (Dev Only) */}
      {user?.role === 'ADMIN' && view !== 'admin_dashboard' && view !== 'admin_orders' && view !== 'admin_promo' && view !== 'admin_products' && (
        <button 
          onClick={() => setView('admin_dashboard')}
          className="fixed bottom-24 right-4 bg-slate-900 text-white p-3 rounded-full shadow-lg z-30 flex items-center gap-2"
        >
          <ShieldCheck size={20} />
          <span className="text-[10px] font-bold">Painel Admin</span>
        </button>
      )}
    </div>
  );
}

export default App;
