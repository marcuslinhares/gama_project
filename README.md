# 🛒 Gama Project — B2B Marketplace

> Marketplace B2B para distribuidores em Russas/CE. Catálogo de produtos, gestão de pedidos, promoções dinâmicas, dashboard admin e autenticação via WhatsApp OTP.

![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tech Stack](#-tech-stack)
- [Arquitetura](#-arquitetura)
- [Como Rodar](#-como-rodar)
- [API](#-api)
- [Testes](#-testes)
- [CI/CD](#-cicd)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

O **Gama Project** é um marketplace B2B desenvolvido para atender distribuidores da região de **Russas/CE**, conectando fornecedores a comerciantes locais. A plataforma permite que distribuidores naveguem por um catálogo de produtos, realizem pedidos e acompanhem entregas, enquanto administradores gerenciam produtos, pedidos, promoções e visualizam relatórios de vendas.

A autenticação é feita via **OTP pelo WhatsApp** usando a Evolution API, eliminando a necessidade de senhas tradicionais.

### Público-alvo

- 🏪 **Distribuidores** — comerciantes que compram para revenda
- 👑 **Administradores** — gestores que operam a plataforma
- 🚚 **Fornecedores** — parceiros que disponibilizam produtos

---

## ✨ Funcionalidades

### Para Distribuidores

| Funcionalidade | Descrição |
|---|---|
| 📦 **Catálogo de Produtos** | Navegue com busca e filtros por categoria |
| 🛒 **Carrinho de Compras** | Adicione/remova itens, veja preços e promoções |
| 📋 **Pedidos** | Acompanhe status, histórico e entregas |
| 🏷️ **Promoções** | Descontos dinâmicos aplicados automaticamente |

### Para Administradores

| Funcionalidade | Descrição |
|---|---|
| 📊 **Dashboard** | Relatórios de vendas e métricas |
| 🛍️ **Gestão de Produtos** | CRUD completo com imagens e estoque |
| 📑 **Gestão de Pedidos** | Visualize, atualize status e gerencie |
| 🎯 **Promoções** | Crie e gerencie campanhas promocionais |
| 👥 **Usuários** | Gerencie distribuidores e permissões |

---

## 🛠️ Tech Stack

### Backend

| Tecnologia | Versão | Função |
|---|---|---|
| **Express** | 4.x | Framework HTTP |
| **TypeScript** | 5.x | Tipagem estática |
| **PostgreSQL** | 15 | Banco de dados relacional |
| **pg** | — | Driver SQL nativo (sem ORM) |
| **JWT** | — | Autenticação stateless |
| **Evolution API** | — | Gateway WhatsApp para OTP |
| **Jest** | — | Testes unitários |
| **Husky + lint-staged** | — | Git hooks de qualidade |

### Frontend

| Tecnologia | Versão | Função |
|---|---|---|
| **React** | 18 | UI组件 library |
| **TypeScript** | 5.x | Tipagem estática |
| **Vite** | — | Build tool e dev server |
| **Tailwind CSS** | — | Estilização utilitária |
| **Playwright** | — | Testes E2E |

### DevOps

| Tecnologia | Função |
|---|---|
| **Docker Compose** | Orquestração de containers |
| **GitHub Actions** | CI/CD automatizado |
| **Husky** | Git hooks de pré-commit |

---

## 🏗️ Arquitetura

### Monorepo

```
gama_project/
├── backend/                 # API Express + TypeScript
│   ├── src/
│   │   ├── index.ts        # Entry point
│   │   ├── app.ts          # Express app + middlewares
│   │   ├── routes/         # Rotas (auth, product, order, admin, promotion)
│   │   ├── controllers/    # Handlers das requisições
│   │   ├── models/         # Interfaces TypeScript
│   │   ├── db/             # Pool pg, migrations, seed
│   │   ├── middleware/      # authenticateJWT, authorizeAdmin
│   │   └── services/       # Evolution API (WhatsApp OTP)
│   ├── tests/              # Testes unitários (Jest + Supertest)
│   └── package.json
├── frontend/               # React + Vite PWA
│   ├── src/
│   │   ├── App.tsx         # Gerenciamento de views
│   │   ├── components/     # Componentes reutilizáveis
│   │   └── contexts/       # CartContext, ThemeContext
│   ├── tests/              # Testes E2E (Playwright)
│   └── package.json
├── docker-compose.yml      # PostgreSQL 15 + API + Frontend
└── CLAUDE.md               # Guia para IA (Claude Code)
```

### Fluxo de Autenticação

```
Usuário → WhatsApp OTP → Evolution API → Backend → JWT Token
```

Não há senhas. O usuário solicita um código OTP via WhatsApp, que é enviado pela Evolution API. Ao verificar o código, recebe um JWT.

### API Routes

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/api/auth/request` | ❌ | Solicitar OTP via WhatsApp |
| POST | `/api/auth/verify` | ❌ | Verificar OTP → JWT |
| GET | `/api/products` | ❌ | Listar produtos (público) |
| GET | `/api/orders` | ✅ JWT | Pedidos do usuário |
| POST | `/api/orders/preview` | ❌ | Preview do carrinho com promoções |
| POST | `/api/orders` | ✅ JWT | Criar pedido |
| GET | `/api/promotions` | ✅ JWT | Promoções ativas |
| /api/admin/* | ✅ JWT + ADMIN | Endpoints administrativos |

---

## 🚀 Como Rodar

### Pré-requisitos

- Node.js 18+
- Docker + Docker Compose
- Conta na Evolution API (para WhatsApp OTP)

### Desenvolvimento

```bash
# Clone o repositório
git clone https://github.com/marcuslinhares/gama_project.git
cd gama_project

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Suba os serviços com Docker
docker compose up --build
```

A API estará disponível em `http://localhost:3001` e o frontend em `http://localhost:5173`.

### Backend (standalone)

```bash
cd backend
npm install
npm run dev     # Desenvolvimento com hot reload
npm run build   # Build para produção
npm run seed    # Popular banco com dados iniciais
```

### Frontend (standalone)

```bash
cd frontend
npm install
npm run dev     # Dev server com Vite
npm run build   # Build para produção
```

---

## 🧪 Testes

```bash
# Backend — testes unitários (Jest + Supertest)
npm --prefix backend run test

# Backend — teste específico
npm --prefix backend run test -- backend/tests/product.test.ts

# Frontend — testes E2E (Playwright)
npm --prefix frontend run test
```

Os testes de backend mockam o módulo `db` (`jest.mock('../src/db')`), sem conexão real com PostgreSQL. Os testes E2E do frontend usam Playwright com navegador headless.

---

## 🔄 CI/CD

O projeto utiliza **GitHub Actions** para:

- ✅ **Lint** — ESLint em backend e frontend
- ✅ **Testes** — Jest no backend + Playwright no frontend
- ✅ **Build** — Verificação de compilação TypeScript
- ✅ **Docker** — Build e validação das imagens

---

## 📄 Licença

MIT © Marcus Linhares

---

<p align="center">
  <a href="https://github.com/marcuslinhares/gama_project">🔗 Repositório</a>
  &nbsp;·&nbsp;
  <a href="https://marcuslinhares.com">🌐 Portfolio</a>
</p>
