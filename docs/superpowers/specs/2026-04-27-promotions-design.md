# Spec: Sistema de Promoções

## 1. Objetivo

Permitir que o distribuidor crie e gerencie promoções de desconto (por categoria ou produto específico), com exibição dinâmica no banner da home, badge nos cards e preço riscado para lojistas.

## 2. Abordagem

Tabela `promotions` no PostgreSQL. Backend calcula `discountedPrice` ao servir produtos. Frontend exibe desconto condicionalmente. Admin gerencia via nova página `AdminPromos`.

## 3. DB Schema

```sql
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('CATEGORY', 'PRODUCT')),
  target VARCHAR(255) NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL CHECK (discount_percent BETWEEN 0.01 AND 100),
  active BOOLEAN NOT NULL DEFAULT true,
  title VARCHAR(255) NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Campo `target`:**
- type = `CATEGORY`: nome da categoria (ex: `"Construção"`)
- type = `PRODUCT`: UUID do produto

**Validade de uma promo:**
```sql
active = true
AND (starts_at IS NULL OR starts_at <= NOW())
AND (ends_at IS NULL OR ends_at > NOW())
```

**Conflito:** produto com promo PRODUCT + promo CATEGORY simultâneas → aplica maior `discount_percent`.

**Preço descontado:**
```
discountedPrice = ROUND(originalPrice * (1 - discount_percent / 100), 2)
```

## 4. API Backend

### Rotas públicas (lojista autenticado)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/promotions` | Lista promos ativas agora |
| `GET` | `/api/products` | Retorna produtos + `discountedPrice` e `discountPercent` calculados |

### Rotas admin

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/admin/promotions` | Lista todas as promos |
| `POST` | `/api/admin/promotions` | Cria promo |
| `PATCH` | `/api/admin/promotions/:id` | Edita ou toggle `active` |
| `DELETE` | `/api/admin/promotions/:id` | Remove promo |

### Cálculo no `GET /api/products`

```sql
SELECT
  p.*,
  COALESCE(
    MAX(
      CASE
        WHEN pr.type = 'PRODUCT' AND pr.target = p.id::text THEN pr.discount_percent
        WHEN pr.type = 'CATEGORY' AND pr.target = p.category THEN pr.discount_percent
      END
    ), 0
  ) AS discount_percent
FROM products p
LEFT JOIN promotions pr ON pr.active = true
  AND (pr.starts_at IS NULL OR pr.starts_at <= NOW())
  AND (pr.ends_at IS NULL OR pr.ends_at > NOW())
GROUP BY p.id
```

`discountedPrice` calculado no controller:
```ts
discountPercent > 0
  ? Math.round(unitPrice * (1 - discountPercent / 100) * 100) / 100
  : null
```

## 5. Arquivos Backend

| Arquivo | Ação |
|---------|------|
| `backend/src/db/migrations/005_create_promotions.sql` | novo |
| `backend/src/models/promotion.model.ts` | novo |
| `backend/src/controllers/promotion.controller.ts` | novo |
| `backend/src/routes/promotion.routes.ts` | novo |
| `backend/src/routes/admin.routes.ts` | adicionar rotas promotions |
| `backend/src/app.ts` | registrar `/api/promotions` |
| `backend/src/controllers/product.controller.ts` | JOIN com promotions em `getProducts` e `getProductById` |

## 6. Frontend Lojista

### `ProductCard.tsx`

Se `product.discountPercent > 0`:
- Badge vermelho `"${discountPercent}% OFF"` no canto superior direito do card
- Preço original riscado: `~~R$ 35,90~~` (text-slate-400 line-through)
- `discountedPrice` em destaque (text-primary, font-bold)

### `ProductDetails.tsx`

Mesma lógica de badge + preço riscado na seção de preço.

### `Home.tsx`

- Remover texto hardcoded do banner
- `useEffect` busca `GET /api/promotions`
- Se há promos ativas: exibe `title` da mais recente, botão "Aproveitar" filtra categoria se `type === 'CATEGORY'`
- Se nenhuma promo ativa: banner oculto (sem renderizar a section)

## 7. Frontend Admin

### `App.tsx`

Adicionar view `'admin_promo'` ao tipo `View`. Renderizar `<AdminPromos onBack={() => setView('admin_dashboard')} />`.

### `AdminDashboard.tsx`

Novo card "Promoções Ativas" com `count` de promos ativas + link para `admin_promo`.

### `AdminPromos.tsx` (novo)

**Lista:**
- Tabela: Título | Tipo | Target | Desconto | Ativo | Validade | Ações
- Toggle ativo direto na linha
- Botão "Nova Promoção" abre form

**Form (inline, não modal):**
- Tipo: select CATEGORY / PRODUCT
- Target: se CATEGORY → select das categorias existentes; se PRODUCT → busca produto por nome
- Desconto %: input number 0.01–100
- Título: input text
- Data início (opcional): date input
- Data fim (opcional): date input
- Botão Salvar / Cancelar

**Validações:**
- `discount_percent` entre 0.01 e 100
- `ends_at` > `starts_at` se ambos preenchidos
- `title` não vazio

## 8. Testes Backend

- `GET /api/products` retorna `discountPercent` e `discountedPrice` quando promo ativa existe
- `GET /api/products` retorna `discountPercent: 0` e `discountedPrice: null` sem promo
- Conflito PRODUCT + CATEGORY: retorna maior desconto
- `POST /api/admin/promotions` cria promo (admin autenticado)
- `PATCH /api/admin/promotions/:id` toggle active
- `DELETE /api/admin/promotions/:id` remove

## 9. Categorias disponíveis

Hardcoded no frontend (mesmas do filtro): `['Construção', 'Alimentos', 'Limpeza', 'Higiene', 'Bebidas']`
