# Spec: Dashboard de Vendas (BI) - Marketplace B2B Russas

## 1. Objetivo
Prover inteligência competitiva ao distribuidor através da visualização gráfica de dados transacionais, permitindo análise de tendências de faturamento, performance de produtos e comportamento de compra dos lojistas.

## 2. Indicadores Chave (KPIs)
O dashboard deve destacar quatro métricas fundamentais:
- **Faturamento Total (Mensal):** Soma de todos os pedidos `APPROVED` ou superiores no mês vigente.
- **Ticket Médio:** Valor médio gasto por pedido.
- **Pedidos Totais:** Volume absoluto de transações.
- **Taxa de Crescimento:** Comparação percentual de faturamento vs. mês anterior.

## 3. Visualizações (Gráficos)

### A. Evolução de Vendas (Linha/Área)
- **Eixo X:** Dias do mês.
- **Eixo Y:** Valor total (R$).
- **Finalidade:** Identificar picos de demanda durante o mês.

### B. Mix de Categorias (Pizza/Donut)
- **Segmentação:** Faturamento por Categoria (Construção, Alimentos, etc.).
- **Finalidade:** Entender a diversificação do portfólio.

### C. Top 5 Produtos (Barras Horizontais)
- **Métrica:** Quantidade total vendida.
- **Finalidade:** Gestão de estoque e promoções.

## 4. Arquitetura de Dados
- **Backend:** Novo endpoint `GET /api/admin/reports/sales` que processa agregações SQL (`GROUP BY`, `SUM`, `COUNT`) para otimizar a transferência de dados.
- **Frontend:** Uso da biblioteca **Recharts** para renderização responsiva e interativa (tooltips).

## 5. Estratégia de Testes
- **Precisão:** Validar se a soma dos gráficos bate com a soma individual dos pedidos na tabela `orders`.
- **Performance:** Garantir que a consulta de BI não trave o banco de dados (uso de índices em `created_at`).
