# Spec: Marketplace B2B Russas (Whitelabel)

## 1. Objetivo
Digitalizar vendas de distribuidores em Russas/CE. Foco PMEs locais. PWA para lojistas (self-service).

## 2. Arquitetura
- **Frontend**: React (PWA) + Tailwind CSS (Nexus Merchant System).
- **Backend**: Node.js (Express) + TypeScript.
- **DB**: PostgreSQL (Relacional para consistência pedidos/estoque).
- **Infra**: Docker + CI/CD automatizado.

## 3. Componentes Principais
### PWA Lojista
- **Auth**: Convite via WhatsApp + Telefone/Senha.
- **Catálogo**: Busca elástica, filtros por categoria, preços escalonados.
- **Carrinho**: Checkout híbrido (PIX/Boleto).
- **Pedidos**: Status em tempo real (Pendente, Aprovado, Rota, Entregue).

### Admin Distribuidor
- **Dashboard**: Volume vendas, ticket médio.
- **Gestão Produtos**: Sincronização via API ou upload CSV.
- **Aprovação Pedidos**: Validação crédito lojista.

## 4. Fluxo de Dados (Pedido)
1. Lojista seleciona múltiplos itens (preço varia por volume).
2. Backend valida estoque e reserva itens por 30min.
3. Lojista escolhe "Boleto Faturado" ou "PIX".
4. Distribuidor recebe notificação via WebSocket/Push.
5. Integração ERP atualiza status para "Em Separação".

## 5. Design System (Nexus Merchant)
- **Cores**: Primária `#003f87`, Background `#f9f9ff`.
- **Tipografia**: Manrope (Headlines), Inter (Labels/Body).
- **Bordas**: "No-Line Rule" (uso de tonalidades para separação).

## 6. Estratégia de Testes
- **Unitários**: Regras de cálculo de preço/imposto (Jest).
- **Integração**: Fluxo checkout + API Pagamento (Supertest).
- **E2E**: Fluxo crítico "Login -> Compra -> Status" (Playwright).
