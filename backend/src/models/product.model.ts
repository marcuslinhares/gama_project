export interface TieredPrice {
  minQty: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  sku: string;
  stock: number;
  unitPrice: number;
  tieredPricing: TieredPrice[];
}
