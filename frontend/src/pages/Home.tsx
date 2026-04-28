import React, { useState, useEffect } from 'react';
import { Search, Moon, Sun, LogOut } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = ['Tudo', 'Construção', 'Alimentos', 'Limpeza', 'Higiene', 'Bebidas'];

interface HomeProps {
  user: any;
  onSelectProduct: (product: any) => void;
  onLogout: () => void;
}

const Home: React.FC<HomeProps> = ({ user, onSelectProduct, onLogout }) => {
  const [selectedCategory, setSelectedCategory] = useState('Tudo');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState<any[]>([]);
  const { isDark, toggleTheme } = useTheme();
  const promo = promotions[0];

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    fetch('/api/promotions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setPromotions(data) : setPromotions([]))
      .catch(() => setPromotions([]));
  }, []);

  const lowerSearch = searchQuery.toLowerCase();

  return (
    <div className="pb-24">
      {/* Header / Search */}
      <header className="bg-surface-lowest px-4 py-6 sticky top-0 z-30 shadow-sm">
        {user && (
          <div className="mb-4 px-1 flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest block">Bem-vindo</span>
              <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight">Olá, {user.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-surface-low transition-colors"
                aria-label="Alternar tema"
              >
                {isDark
                  ? <Sun size={18} className="text-yellow-400" />
                  : <Moon size={18} className="text-slate-400" />}
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 bg-surface-low text-red-500 font-bold px-3 py-2 rounded-xl transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
                aria-label="Sair"
              >
                <LogOut size={18} />
                <span className="text-xs">Sair</span>
              </button>
            </div>
          </div>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="O que você precisa hoje?"
            className="w-full bg-surface-low rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </header>

      <main className="px-4 mt-6">
        {/* Banner — dynamic promotion */}
        {promo && (
          <section className="bg-primary-container rounded-2xl p-6 text-white mb-8 overflow-hidden relative">
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Ofertas da Semana</span>
              <h2 className="text-2xl font-bold mt-1">{promo.title}</h2>
              {promo.type === 'CATEGORY' && (
                <button
                  onClick={() => setSelectedCategory(promo.target)}
                  className="mt-4 bg-white text-primary text-xs font-bold px-4 py-2 rounded-lg"
                >
                  Aproveitar
                </button>
              )}
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          </section>
        )}

        {/* Categories */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Categorias</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-surface-low text-slate-500 dark:text-slate-400'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Para você</h2>
            <span className="text-primary text-xs font-bold">Ver tudo</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-surface-low h-48 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {products
                .filter(p => selectedCategory === 'Tudo' || p.category === selectedCategory)
                .filter(p => !lowerSearch || p.name.toLowerCase().includes(lowerSearch))
                .map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => onSelectProduct(product)}
                  />
                ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
