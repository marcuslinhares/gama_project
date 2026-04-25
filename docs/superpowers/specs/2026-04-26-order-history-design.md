# Spec: Histórico de Pedidos e Recorrência - Marketplace B2B Russas

## 1. Objetivo
Permitir que o lojista acompanhe o status de seus pedidos realizados, veja o detalhamento financeiro e técnico de cada compra e facilite novas compras através da funcionalidade de "Repetir Pedido".

## 2. Arquitetura de Endpoints
Os endpoints devem ser protegidos pelo middleware `authenticateJWT`.

### A. Listagem de Pedidos (`GET /api/orders`)
- **Lógica:** Busca todos os registros na tabela `orders` onde `user_id` corresponde ao ID do token.
- **Ordenação:** `created_at DESC` (mais recentes primeiro).
- **Saída:** Lista de pedidos simplificada (ID, status, total, data).

### B. Detalhes do Pedido (`GET /api/orders/:id`)
- **Lógica:** Busca o cabeçalho e os itens vinculados na tabela `order_items`, incluindo nomes e imagens dos produtos (via JOIN com `products`).
- **Segurança:** Validar se o `user_id` do pedido pertence ao usuário logado.

## 3. Fluxo de Interface (PWA)

### Tela "Meus Pedidos"
- Acessível via ícone de prancheta/lista na barra de navegação inferior.
- Exibição de cards com status visíveis por cores:
    - `PENDING_APPROVAL`: Amarelo
    - `APPROVED`: Azul
    - `SHIPPED` / `IN_ROUTE`: Roxo
    - `DELIVERED`: Verde
    - `CANCELLED`: Cinza

### Funcionalidade "Repetir Pedido"
- Botão "Comprar Novamente" no card do pedido.
- **Ação:** Limpa o carrinho atual (ou pergunta se deseja mesclar) e adiciona os itens do pedido antigo respeitando as quantidades originais.
- **Validação:** Verificar se o produto ainda existe e se há estoque disponível.

## 4. Estratégia de Testes
- **Backend:** Testar se um usuário não consegue ver pedidos de outro usuário através do ID na URL.
- **Frontend:** Verificar se o botão de repetir pedido atualiza corretamente o `CartContext`.
