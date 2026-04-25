# Sales Dashboard BI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a visual sales dashboard with charts using Recharts and backend data aggregation.

**Architecture:** Data aggregation in SQL for efficiency. Responsive charts on the frontend. Protected Admin access.

**Tech Stack:** React, Recharts, Node.js, Express, PostgreSQL.

---

### Task 1: BI Data Aggregation API

**Files:**
- Modify: `backend/src/controllers/admin.controller.ts`
- Modify: `backend/src/routes/admin.routes.ts`

- [ ] **Step 1: Implement `getSalesReport` controller**
    - Query 1: Daily sales for the last 30 days (Line Chart).
    - Query 2: Sales by Category (Pie Chart).
    - Query 3: KPIs (Total Month, Average Ticket).
- [ ] **Step 2: Register route `GET /api/admin/reports/sales`**
- [ ] **Step 3: Commit**

---

### Task 2: Recharts Integration

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Install `recharts` in the frontend directory**
- [ ] **Step 2: Commit**

---

### Task 3: Sales Chart Components

**Files:**
- Create: `frontend/src/components/admin/SalesCharts.tsx`

- [ ] **Step 1: Implement `SalesLineChart` component**
- [ ] **Step 2: Implement `CategoryPieChart` component**
- [ ] **Step 3: Commit**

---

### Task 4: UI Integration in Admin Dashboard

**Files:**
- Modify: `frontend/src/pages/admin/AdminDashboard.tsx`

- [ ] **Step 1: Fetch data from the new report endpoint**
- [ ] **Step 2: Render the chart components below the metric cards**
- [ ] **Step 3: Commit**
