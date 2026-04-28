import React, { useState } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface TieredPrice {
  minQty: number;
  price: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  unitPrice: number;
  tieredPricing: TieredPrice[];
  description?: string;
  image?: string;
  discountPercent?: number;
}

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack }) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const getCurrentPrice = () => {
    const pricing = product.tieredPricing || [];
    const applicableTier = [...pricing]
      .reverse()
      .find(tier => quantity >= tier.minQty);
    return applicableTier ? Number(applicableTier.price) : Number(product.unitPrice);
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-surface-lowest min-h-screen pb-24">
      {/* Header */}
      <header className="px-4 py-6 flex items-center gap-4 sticky top-0 bg-white/80 dark:bg-slate-800 backdrop-blur-md z-30">
        <button onClick={onBack} className="p-2 hover:bg-surface-low rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-900 dark:text-slate-100" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-1">Detalhes do Produto</h1>
      </header>

      <main>
        {/* Product Image */}
        <div className="bg-surface-low w-full aspect-square flex items-center justify-center overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
          ) : (
            <div className="text-surface-high font-bold text-4xl uppercase tracking-widest">Produto</div>
          )}
        </div>

        <div className="px-4 mt-6">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">{product.category}</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{product.name}</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">SKU: {product.sku}</p>

          {(product.discountPercent ?? 0) > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-xl">
              <span className="text-red-500 font-black text-sm">{product.discountPercent}% OFF</span>
            </div>
          )}
          <div className="mt-2 flex items-baseline gap-2">
            {(product.discountPercent ?? 0) > 0 && (
              <span className="text-lg text-slate-400 dark:text-slate-500 line-through">
                R$ {getCurrentPrice().toFixed(2)}
              </span>
            )}
            <span className="text-3xl font-bold text-primary">
              R$ {(product.discountPercent ?? 0) > 0
                ? (Math.round(getCurrentPrice() * (1 - product.discountPercent! / 100) * 100) / 100).toFixed(2)
                : getCurrentPrice().toFixed(2)}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">/ Caixa</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Preço por unidade: R$ {(getCurrentPrice() / 24).toFixed(2)} (Ref. Caixa c/ 24)
          </p>

          {/* Tiered Pricing Table */}
          <section className="mt-8">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-widest text-[10px]">Preços por Atacado</h3>
            <div className="bg-surface-low rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-high/50 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider">Qtd. Mínima</th>
                    <th className="px-4 py-3 font-semibold text-[11px] uppercase tracking-wider">Valor Unit.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-high/30">
                  {product.tieredPricing.map((tier, idx) => {
                    const isActive = quantity >= tier.minQty && (idx === product.tieredPricing.length - 1 || quantity < product.tieredPricing[idx+1].minQty);
                    return (
                      <tr key={idx} className={isActive ? 'bg-primary/5 text-primary font-bold' : 'text-slate-600 dark:text-slate-300'}>
                        <td className="px-4 py-4">{tier.minQty} {tier.minQty === 1 ? 'Caixa' : 'Caixas'}</td>
                        <td className="px-4 py-4">R$ {tier.price.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Quantity Selector */}
          <section className="mt-8">
             <div className="flex items-center justify-between bg-surface-low p-2 rounded-2xl">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center bg-white dark:bg-surface-low rounded-xl shadow-sm active:scale-95 transition-all"
                >
                  <circle cx="12" cy="12" r="10" />
                  <Minus size={20} className="text-primary" />
                </button>
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{quantity} Cx</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center bg-white dark:bg-surface-low rounded-xl shadow-sm active:scale-95 transition-all"
                >
                  <Plus size={20} className="text-primary" />
                </button>
             </div>
          </section>

          {/* Description */}
          <section className="mt-8">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 uppercase tracking-widest text-[10px]">Descrição</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              {product.description || "Ideal para reposição de estoque em pequenos varejos. Produto de alta rotatividade com garantia de procedência do distribuidor líder da região de Russas."}
            </p>
          </section>
        </div>
      </main>

      {/* Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-surface-lowest px-4 py-4 border-t border-surface-low shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <button 
          onClick={handleAddToCart}
          disabled={added}
          className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all active:scale-[0.98] ${
            added 
              ? 'bg-green-500 text-white shadow-green-200' 
              : 'bg-primary hover:bg-primary-container text-white shadow-primary/20'
          }`}
        >
          {added ? (
            <>
              <Check size={20} />
              Adicionado!
            </>
          ) : (
            <>
              <ShoppingCart size={20} />
              Adicionar ao Carrinho
            </>
          )}
        </button>
      </footer>
    </div>
  );
};

export default ProductDetails;
