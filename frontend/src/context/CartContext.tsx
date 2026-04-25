import React, { createContext, useContext, useState, useEffect } from 'react';

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
  image?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  priceAtQty: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addMultipleItems: (items: { product: Product, quantity: number }[]) => void;
  subtotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const calculatePriceAtQty = (product: Product, qty: number) => {
  const pricing = product.tieredPricing || [];
  const applicableTier = [...pricing]
    .reverse()
    .find(tier => qty >= tier.minQty);
  return applicableTier ? Number(applicableTier.price) : Number(product.unitPrice);
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('russas_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('russas_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, quantity: number) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      const newQty = existing ? existing.quantity + quantity : quantity;
      const priceAtQty = calculatePriceAtQty(product, newQty);

      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: newQty, priceAtQty } 
            : item
        );
      }
      return [...prev, { product, quantity: newQty, priceAtQty }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return removeItem(productId);
    
    setItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        const priceAtQty = calculatePriceAtQty(item.product, quantity);
        return { ...item, quantity, priceAtQty };
      }
      return item;
    }));
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => setItems([]);

  const addMultipleItems = (newItems: { product: Product, quantity: number }[]) => {
    const formattedItems = newItems.map(item => ({
      product: item.product,
      quantity: item.quantity,
      priceAtQty: calculatePriceAtQty(item.product, item.quantity)
    }));
    setItems(formattedItems);
  };

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.priceAtQty), 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, addMultipleItems, subtotal, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
