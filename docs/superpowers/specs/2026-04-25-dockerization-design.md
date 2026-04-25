# Spec: Dockerização do Ambiente de Desenvolvimento - Marketplace B2B Russas

## 1. Objetivo
Criar um ambiente de desenvolvimento isolado, reprodutível e performático utilizando Docker e Docker Compose, garantindo que todos os serviços (Frontend, Backend e Banco de Dados) rodem de forma integrada com suporte a hot-reload.

## 2. Componentes da Arquitetura

### A. Banco de Dados (`db`)
- **Imagem:** `postgres:15-alpine`.
- **Porta:** `5432` (exposta para o host apenas para debug).
- **Persistência:** Volume nomeado `postgres_data` para manter os dados entre reinicializações.
- **Inicialização:** Scripts de migração SQL existentes serão vinculados ao entrypoint do Postgres para setup automático.

### B. Backend (`api`)
- **Base:** Node.js (Alpine).
- **Execução:** `npm run dev` (via `nodemon`).
- **Volumes:** Bind mount da pasta `./backend` para `./app` no container.
- **Dependências:** O container aguardará o banco estar pronto (`healthcheck`).

### C. Frontend (`client`)
- **Base:** Node.js (Alpine).
- **Execução:** `npm run dev` (Vite).
- **Volumes:** Bind mount da pasta `./frontend`.
- **Rede:** Exposto na porta `5173`.

## 3. Configuração de Rede e Variáveis
- **Rede Docker:** Rede interna do tipo `bridge` chamada `marketplace-net`.
- **Variáveis de Ambiente:** Centralizadas em um arquivo `.env` na raiz do projeto.

## 4. Fluxo de Desenvolvimento
1. O desenvolvedor executa `docker-compose up`.
2. O banco de dados sobe e inicializa o schema.
3. O Backend e Frontend instalam dependências (se necessário) e iniciam os servidores de dev.
4. Qualquer alteração no código local é refletida instantaneamente dentro dos containers via volumes.

## 5. Estratégia de Validação
- Verificar se o Backend consegue conectar no Postgres usando o nome do serviço `db`.
- Verificar se o Frontend consegue consumir a API do Backend.
- Testar a persistência de dados após um `docker-compose down`.
