# Dockerization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dockerize the entire project for a seamless development experience with hot-reload and persistent database.

**Architecture:** Docker Compose orchestrating three containers (Postgres, Node/Express, Node/Vite).

**Tech Stack:** Docker, Docker Compose, PostgreSQL.

---

### Task 1: Root Configuration & Environment

**Files:**
- Create: `.env`
- Create: `.dockerignore`

- [x] **Step 1: Create .env with database and port defaults**

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=russas_b2b
POSTGRES_DB=marketplace
DB_HOST=db
DB_PORT=5432

# Ports
BACKEND_PORT=3001
FRONTEND_PORT=5173
```

- [x] **Step 2: Create .dockerignore to skip node_modules and dist**

```text
node_modules
dist
.git
.env
```

- [x] **Step 3: Commit**

---

### Task 2: Backend Dockerfile

**Files:**
- Create: `backend/Dockerfile.dev`

- [x] **Step 1: Create development Dockerfile for Backend**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]
```

- [x] **Step 2: Commit**

---

### Task 3: Frontend Dockerfile

**Files:**
- Create: `frontend/Dockerfile.dev`

- [x] **Step 1: Create development Dockerfile for Frontend**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
```

- [x] **Step 2: Commit**

---

### Task 4: Docker Compose Orchestration

**Files:**
- Create: `docker-compose.yml`

- [x] **Step 1: Create docker-compose.yml**

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/src/db/migrations:/docker-entrypoint-initdb.d
    networks:
      - marketplace-net

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "${BACKEND_PORT}:3001"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
    depends_on:
      - db
    networks:
      - marketplace-net

  client:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "${FRONTEND_PORT}:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - api
    networks:
      - marketplace-net

networks:
  marketplace-net:
    driver: bridge

volumes:
  postgres_data:
```

- [x] **Step 2: Commit**
