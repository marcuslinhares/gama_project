export type OrderStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'BOLETO_FATURADO' | 'PIX' | 'CARD';

export interface Order {
    id: string;
    userId: string;
    status: OrderStatus;
    totalAmount: number;
    paymentMethod: PaymentMethod;
    shippingAddress?: string;
    createdAt: Date;
    items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    priceAtPurchase: number;
}
