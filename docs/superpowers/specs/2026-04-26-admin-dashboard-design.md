# Spec: Dashboard Administrativo do Distribuidor - Marketplace B2B Russas

## 1. Objetivo
Prover uma interface de gestão centralizada para o distribuidor, permitindo o controle total sobre o ciclo de vida dos pedidos, monitoramento de vendas e ajuste rápido de catálogo e estoque.

## 2. Arquitetura de Permissões e Segurança

### A. Papéis de Usuário (Roles)
- A tabela `users` passará a ter o campo `role` (`VARCHAR`).
- Valores: `MERCHANT` (Padrão) e `ADMIN`.

### B. Middleware de Autorização (`authorizeAdmin`)
- Novo middleware no backend que intercepta requisições às rotas `/api/admin/*`.
- Verifica se `req.user.role === 'ADMIN'`.

## 3. Endpoints da API Administrativa

### A. Gestão de Pedidos
- **`GET /api/admin/orders`**: Lista pedidos com suporte a paginação e filtros.
- **`PATCH /api/admin/orders/:id/status`**: Altera status (ex: de `PENDING_APPROVAL` para `APPROVED`).

### B. Estatísticas (Dashboard)
- **`GET /api/admin/stats`**: Retorna:
    - Faturamento total do dia.
    - Contagem de pedidos pendentes de aprovação.
    - Top 5 produtos mais vendidos.

## 4. Interface do Usuário (Admin PWA)

### Layout
- **Sidebar persistente** (Desktop) ou **Menu Hamburguer** (Mobile Admin).
- **Tela de Pedidos**: Tabela densa com ações rápidas para mudança de status.
- **Feedback Visual**: Cores associadas a cada estágio logístico (conforme spec de histórico).

## 5. Estratégia de Transição de Status (Workflow)
O fluxo manual seguirá a ordem:
1. `PENDING_APPROVAL` (Lojista acabou de fechar)
2. `APPROVED` (Financieiro validou crédito)
3. `IN_SEPARATION` (Armazém separando itens)
4. `SHIPPED` (Caminhão saiu para entrega em Russas/Região)
5. `DELIVERED` (Finalizado)

## 6. Estratégia de Testes
- **Segurança:** Tentar acessar rotas de admin com token de lojista (Deve retornar 403).
- **Integridade:** Verificar se ao cancelar um pedido, o estoque é devolvido aos produtos.
