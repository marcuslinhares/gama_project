# Spec: Real Product Data Integration

## 1. Overview
Replace static mock data in the product controller with real PostgreSQL queries using the existing database utility.

## 2. Architecture & Data Flow
- **Controller**: `product.controller.ts`
- **Database Utility**: `backend/src/db/index.ts` (`query` function)
- **Data Transformation**: SQL Aliasing will be used to map snake_case database columns to camelCase model properties.

## 3. SQL Queries
### fetch all products
```sql
SELECT 
    id, 
    name, 
    description, 
    category, 
    sku, 
    stock, 
    unit_price AS "unitPrice", 
    tiered_pricing AS "tieredPricing" 
FROM products 
ORDER BY name ASC;
```

### fetch product by ID
```sql
SELECT 
    id, 
    name, 
    description, 
    category, 
    sku, 
    stock, 
    unit_price AS "unitPrice", 
    tiered_pricing AS "tieredPricing" 
FROM products 
WHERE id = $1;
```

## 4. Error Handling
- Use `try/catch` blocks around all database calls.
- Return HTTP 500 on database errors.
- Return HTTP 404 if a specific ID does not exist.

## 5. Testing
- Mock the `query` utility in `backend/tests/product.test.ts`.
- Verify that the controller calls the utility with the correct SQL and parameters.
- Verify that it returns the data in the expected format.

## 6. Cleanup
- Remove the `mockProducts` array from `product.controller.ts`.
