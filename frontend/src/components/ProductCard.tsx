import React from 'react';
import { Plus } from 'lucide-react';

interface TieredPrice { minQty: number; price: number; }
interface Product {
  id: string; name: string; sku: string; category: string;
  stock: number; unitPrice: number; tieredPricing: TieredPrice[];
  image?: string; discountPercent?: number;
}
interface ProductCardProps { product: Product; onClick: () => void; }

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const basePrice = Number(product.tieredPricing[product.tieredPricing.length - 1].price);
  const hasDiscount = (product.discountPercent ?? 0) > 0;
  const discountedPrice = hasDiscount
    ? Math.round(basePrice * (1 - (product.discountPercent! / 100)) * 100) / 100
    : null;

  return (
    <div onClick={onClick} className="card p-4 flex flex-col h-full group cursor-pointer active:scale-[0.98] transition-all">
      <div className="relative bg-surface-low rounded-md h-40 mb-4 flex items-center justify-center overflow-hidden">
        {hasDiscount && (
          <span className="absolute top-2 right-2 z-10 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg">
            {product.discountPercent}% OFF
          </span>
        )}
        {product.image ? (
          <img src={product.image} alt={product.name} className="object-cover h-full w-full" />
        ) : (
          <div className="text-surface-high font-bold text-lg">SEM IMAGEM</div>
        )}
      </div>
      <div className="flex-grow">
        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{product.category}</span>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1 line-clamp-2 leading-tight">{product.name}</h3>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">SKU: {product.sku}</p>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block">A partir de</span>
          {hasDiscount ? (
            <>
              <span className="text-sm text-slate-400 dark:text-slate-500 line-through">
                R$ {basePrice.toFixed(2)}
              </span>
              <span className="text-lg font-bold text-primary block">
                R$ {discountedPrice!.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-primary">
              R$ {basePrice.toFixed(2)}
            </span>
          )}
          <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">/ Cx</span>
        </div>
        <button className="bg-primary hover:bg-primary-container text-white p-2 rounded-lg transition-colors shadow-md group-active:scale-95">
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
