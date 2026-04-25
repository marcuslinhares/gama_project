# Spec: Sistema de Checkout e Pedidos - Marketplace B2B Russas

## 1. Objetivo
Implementar o fluxo de finalização de compra para lojistas, permitindo a transição do carrinho (local) para um pedido formal (banco de dados) com validação de preços escalonados e suporte a múltiplas formas de pagamento B2B.

## 2. Arquitetura do Checkout
O processo será dividido em duas etapas para garantir integridade:

### A. Preview do Pedido (`POST /api/orders/preview`)
- **Entrada:** Lista de IDs de produtos e quantidades.
- **Lógica:**
    - Recalcula preços com base nas faixas de volume (`tiered pricing`) vigentes.
    - Calcula frete (Regra atual: Grátis para Russas/CE acima de R$ 500,00; caso contrário, R$ 25,00).
    - Valida disponibilidade de estoque (soft check).
- **Saída:** Objeto formatado com subtotal, descontos, frete e total, sem persistência.

### B. Criação do Pedido (`POST /api/orders`)
- **Entrada:** Itens do carrinho, forma de pagamento escolhida e endereço.
- **Lógica:**
    - Persiste o cabeçalho na tabela `orders`.
    - Persiste os itens na tabela `order_items` com o preço unitário "congelado" (snapshot).
    - Atualiza (reserva) o estoque dos produtos.
    - Status inicial: `PENDING_APPROVAL`.

## 3. Modelo de Dados (PostgreSQL)

### Tabela `orders`
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Identificador único. |
| `user_id` | UUID (FK) | Referência ao lojista. |
| `status` | VARCHAR | `PENDING_APPROVAL`, `APPROVED`, `SHIPPED`, `DELIVERED`, `CANCELLED`. |
| `total_amount` | DECIMAL | Valor total do pedido. |
| `payment_method` | VARCHAR | `BOLETO_FATURADO`, `PIX`, `CARD`. |
| `created_at` | TIMESTAMP | Data de criação. |

### Tabela `order_items`
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Identificador único. |
| `order_id` | UUID (FK) | Referência ao pedido pai. |
| `product_id` | UUID (FK) | Referência ao produto. |
| `quantity` | INTEGER | Quantidade comprada. |
| `price_at_purchase` | DECIMAL | Preço unitário no momento da compra. |

## 4. Fluxo de Interface (PWA)
1. **Revisão do Carrinho:** Exibição clara dos itens e do benefício acumulado pelo preço de atacado.
2. **Seleção de Pagamento:** Opções focadas no B2B de Russas (Boleto Faturado e PIX).
3. **Tela de Sucesso:**
    - Número do pedido gerado.
    - Botão "Enviar para WhatsApp": Abre conversa com o distribuidor contendo o resumo do pedido para agilizar a aprovação.

## 5. Estratégia de Testes
- **Unidade:** Validação dos cálculos de preço e frete.
- **Integração:** Teste de fluxo completo (Preview -> Create) verificando persistência e reserva de estoque.
- **E2E:** Simulação de finalização de compra no PWA com verificação da tela de sucesso.
