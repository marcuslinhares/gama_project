# Design Spec: Order Schema and Models

**Date:** 2026-04-25
**Status:** Approved
**Topic:** Database Schema and TypeScript Models for Orders

## Purpose
Implement a robust storage system for orders and order items in a B2B marketplace, ensuring price consistency through snapshots and following existing project patterns (UUIDs, timestamps, TDD).

## Database Schema

### 1. `orders` Table
Stores high-level order information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT `uuid_generate_v4()` | Unique identifier |
| `user_id` | UUID | NOT NULL | Customer identifier |
| `status` | VARCHAR(50) | NOT NULL, DEFAULT 'PENDING_APPROVAL' | Order lifecycle state |
| `total_amount` | DECIMAL(12, 2) | NOT NULL | Final calculated price |
| `payment_method` | VARCHAR(50) | NOT NULL | Payment provider/method |
| `shipping_address` | TEXT | | Delivery destination |
| `created_at` | TIMESTAMP | DEFAULT `CURRENT_TIMESTAMP` | Record creation |
| `updated_at` | TIMESTAMP | DEFAULT `CURRENT_TIMESTAMP` | Last modification |

### 2. `order_items` Table
Stores individual products within an order.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT `uuid_generate_v4()` | Unique identifier |
| `order_id` | UUID | FK `orders.id` ON DELETE CASCADE | Parent order |
| `product_id` | UUID | NOT NULL | Reference to `products` |
| `quantity` | INTEGER | NOT NULL | Units purchased |
| `price_at_purchase`| DECIMAL(12, 2) | NOT NULL | Snapshot of price at order time |
| `created_at` | TIMESTAMP | DEFAULT `CURRENT_TIMESTAMP` | Record creation |
| `updated_at` | TIMESTAMP | DEFAULT `CURRENT_TIMESTAMP` | Last modification |

## TypeScript Models

### `Order` Interface
```typescript
export type OrderStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'CANCELLED' | 'SHIPPED';

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}
```

### `OrderItem` Interface
```typescript
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Testing Strategy (TDD)
- **Model Tests:** Verify that interfaces correctly represent the data structure.
- **Integration Tests:** (Future) Verify that the migration creates the tables correctly and that constraints (FKs) are enforced.

## Success Criteria
- SQL Migration `002_create_orders.sql` follows project conventions.
- TypeScript models are available for backend logic.
- Snapshot pricing is explicitly supported in both DB and Models.
