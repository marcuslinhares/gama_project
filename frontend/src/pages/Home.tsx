import React, { useState } from 'react';
import { Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['Tudo', 'Alimentos', 'Limpeza', 'Higiene', 'Bebidas'];

const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Lava Louças Neutro - Caixa 24x500ml',
    sku: '11202-C',
    category: 'Limpeza',
    stock: 50,
    unitPrice: 4.16,
    tieredPricing: [
      { minQty: 1, price: 50.00 },
      { minQty: 6, price: 47.00 },
      { minQty: 11, price: 44.00 }
    ]
  },
  {
    id: '2',
    name: 'Arroz Branco Tipo 1 - Fardo 10x1kg',
    sku: '22301-F',
    category: 'Alimentos',
    stock: 120,
    unitPrice: 5.50,
    tieredPricing: [
      { minQty: 1, price: 60.00 },
      { minQty: 5, price: 58.00 },
      { minQty: 20, price: 55.00 }
    ]
  },
  {
    id: '3',
    name: 'Sabonete em Barra 90g - Caixa 48 unidades',
    sku: '33405-C',
    category: 'Higiene',
    stock: 80,
    unitPrice: 1.80,
    tieredPricing: [
      { minQty: 1, price: 90.00 },
      { minQty: 10, price: 86.40 }
    ]
  }
];

const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tudo');

  return (
    <div className="pb-24">
      {/* Header / Search */}
      <header className="bg-surface-lowest px-4 py-6 sticky top-0 z-10 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="O que você precisa hoje?" 
            className="w-full bg-surface-low rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </header>

      <main className="px-4 mt-6">
        {/* Banner */}
        <section className="bg-primary-container rounded-2xl p-6 text-white mb-8 overflow-hidden relative">
          <div className="relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Ofertas da Semana</span>
            <h2 className="text-2xl font-bold mt-1">Até 15% OFF em Limpeza</h2>
            <button className="mt-4 bg-white text-primary text-xs font-bold px-4 py-2 rounded-lg">Aproveitar</button>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        </section>

        {/* Categories */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Categorias</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === category 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-surface-low text-slate-500'
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
            <h2 className="text-lg font-bold text-slate-900">Para você</h2>
            <span className="text-primary text-xs font-bold">Ver tudo</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {MOCK_PRODUCTS
              .filter(p => selectedCategory === 'Tudo' || p.category === selectedCategory)
              .map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
