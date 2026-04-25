# Spec: Estratégia de Testes E2E (Playwright) - Marketplace B2B Russas

## 1. Objetivo
Garantir a estabilidade e a corretude do fluxo principal de compra (Catálogo -> Carrinho -> Checkout) através de testes automatizados de ponta a ponta, simulando o comportamento real do lojista.

## 2. Infraestrutura de Teste
- **Framework:** Playwright (com suporte a navegadores Chromium, Firefox e WebKit).
- **Ambiente:** Testes executados contra os containers Docker em execução (`http://localhost:5173`).
- **Autenticação Automática:** 
    - Implementação de um "Test Phone" (`5588000000000`) no banco de dados.
    - O Backend reconhecerá o código `999999` como válido exclusivamente para este número (apenas em ambiente de teste/dev).

## 3. Fluxos de Teste (Cenários)

### A. Fluxo Crítico (Happy Path)
1. Abrir aplicação.
2. Login com Telefone de Teste e OTP Mágico.
3. Adicionar "Cimento CP II" (10 unidades) ao carrinho.
4. Validar se o subtotal reflete o preço do Tier de Atacado.
5. Ir para o Checkout.
6. Escolher "PIX".
7. Finalizar Pedido.
8. Verificar se a tela de sucesso exibe um ID de pedido válido.

### B. Validação de Regras B2B
1. Adicionar 50 unidades de um produto.
2. Verificar se o preço unitário caiu conforme a tabela de preços escalonados.
3. Diminuir a quantidade e verificar se o preço voltou ao valor original.

## 4. Estratégia de Implementação
1. Instalar `@playwright/test` no projeto.
2. Criar o arquivo de configuração `playwright.config.ts`.
3. Implementar a "Porta dos Fundos" (Magic OTP) no `auth.controller.ts`.
4. Criar o script de teste `frontend/tests/checkout.spec.ts`.

## 5. Validação
- O teste deve rodar com `npx playwright test` e passar em todos os navegadores.
