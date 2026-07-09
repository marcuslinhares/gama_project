// Shared API types for frontend
export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'MERCHANT' | 'ADMIN';
  distributorId?: string;
}

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
  discountPercent?: number;
  image?: string;
}

export interface Promotion {
  id: string;
  type: 'CATEGORY' | 'PRODUCT';
  target: string;
  discountPercent: number;
  active: boolean;
  title: string;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
}

export type OrderStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type PaymentMethod = 'BOLETO_FATURADO' | 'PIX' | 'CARD';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  name?: string;
  category?: string;
  sku?: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  shippingAddress?: string;
  createdAt: string;
  items?: OrderItem[];
}

export interface AdminOrder extends Order {
  clientName: string;
  clientPhone: string;
}

export interface PreviewOrderResponse {
  subtotal: number;
  frete: number;
  total: number;
}

export interface AdminStats {
  salesToday: number;
  pendingOrders: number;
}

export interface SalesReport {
  dailySales: Array<{ date: string; total: number }>;
  categorySales: Array<{ name: string; value: number }>;
  kpis: {
    totalMonth: number;
    avgTicket: number;
    totalOrders: number;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const CATEGORIES = ['Construção', 'Alimentos', 'Limpeza', 'Higiene', 'Bebidas'];
