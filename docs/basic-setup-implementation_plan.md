# Nobby Restaurant Platform — Project Setup

## Background

Based on the **Software Design Document (SDD)** and **Functional Requirements Document (FRD)**, this plan sets up the full monorepo structure with:

- **`client/`** → Next.js 14 (App Router) + Tailwind CSS + Framer Motion
- **`server/`** → NestJS (Node.js, TypeScript) + PostgreSQL + Redis + WebSockets

Docker will be used to containerize the backend (NestJS, PostgreSQL, Redis).

---

## User Review Required

> [!WARNING]
> **Docker is NOT installed** on this machine. The plan includes installing Docker Engine (Community Edition) which requires `sudo` and internet access. Please confirm you are okay with this.

> [!IMPORTANT]
> **Stack as specified in SDD:**
> - Frontend: **Next.js + Tailwind CSS + Framer Motion**
> - Backend: **NestJS (TypeScript)**
> - Primary DB: **PostgreSQL** (ACID-compliant for orders)
> - Cache/Realtime: **Redis** + Socket.IO WebSockets
> - Deployment: Dockerized NestJS backend

---

## Open Questions

> [!IMPORTANT]
> 1. Should Docker be installed via `apt` (standard installation)? This requires `sudo`.
> 2. Do you want the `docker-compose.yml` to also spin up **PostgreSQL** and **Redis** containers alongside NestJS? (Recommended — all-in-one dev setup)
> 3. Should `.env` secrets be pre-populated with placeholder values, or left completely blank?

---

## Proposed Changes

### 1. Repository Structure

```
Nobby-Restaurant-Platform/
├── client/          ← Next.js 14 App Router + Tailwind + Framer Motion
│   ├── app/
│   ├── components/
│   ├── public/
│   └── package.json
├── server/          ← NestJS + TypeScript
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── auth/
│   │   ├── menu/
│   │   ├── orders/
│   │   ├── tables/
│   │   ├── service-calls/
│   │   └── gateway/  ← WebSocket Gateway (Socket.IO)
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml   ← NestJS + PostgreSQL + Redis
├── .gitignore
└── docs/
```

---

### 2. Server — NestJS Setup

#### [NEW] `server/` — NestJS project

**Packages to install (from SDD):**
- `@nestjs/cli` scaffolding
- `@nestjs/websockets` + `@nestjs/platform-socket.io` — real-time order/service alerts
- `@nestjs/typeorm` + `typeorm` + `pg` — PostgreSQL ORM
- `ioredis` + `@nestjs/cache-manager` + `cache-manager-ioredis` — Redis
- `@nestjs/schedule` — weekly cron job (Sunday reset per SDD §4)
- `@nestjs/config` — environment variables
- `@nestjs/jwt` + `passport` + `bcrypt` — auth for staff/admin dashboard
- `class-validator` + `class-transformer` — request validation
- `@nestjs/swagger` — API docs

**Core Modules:**
| Module | Purpose |
|--------|---------|
| `AuthModule` | Staff/admin JWT login |
| `MenuModule` | CRUD for menu items, categories, photos |
| `OrdersModule` | Place & track orders (customer → staff) |
| `TablesModule` | Table session management (Redis) |
| `ServiceCallsModule` | Waiter/Hostess/Cleaner call buttons |
| `GatewayModule` | WebSocket gateway for real-time dashboard |
| `ScheduleModule` | Weekly cron to purge old order data |

#### [NEW] `server/Dockerfile`
- Multi-stage build: `node:20-alpine` base
- Installs deps, builds TypeScript, runs production binary

---

### 3. Client — Next.js Setup

#### [NEW] `client/` — Next.js 14 App Router

**Packages to install (from SDD):**
- `next` 14 + `react` + `react-dom`
- `tailwindcss` + `postcss` + `autoprefixer`
- `framer-motion` — cinematic scroll animations (SDD §5)
- `socket.io-client` — WebSocket connection to NestJS backend
- `axios` — API calls
- `@tanstack/react-query` — server state management

**Key Pages:**
| Route | Description |
|-------|-------------|
| `/` | Landing / Table number entry |
| `/menu` | Customer-facing digital menu |
| `/menu/[tableId]` | Table-locked menu view |
| `/staff` | Live Request Dashboard (real-time) |
| `/admin` | Menu management (items, prices, photos, banners) |

---

### 4. Docker Setup

#### [NEW] `docker-compose.yml`

Services:
- **`postgres`** — PostgreSQL 15 (official image)
- **`redis`** — Redis 7 Alpine
- **`api`** — NestJS (built from `server/Dockerfile`)

#### [NEW] `server/Dockerfile`

Multi-stage build for the NestJS API server.

---

## Verification Plan

### Automated
```bash
# Start all containers
docker compose up --build

# Verify API is running
curl http://localhost:3000/health

# Verify Next.js dev server
cd client && npm run dev
```

### Manual
- [ ] `http://localhost:3000` → NestJS Swagger UI accessible
- [ ] `http://localhost:3001` → Next.js customer menu loads
- [ ] Docker containers (postgres, redis, api) all show `Up` in `docker compose ps`
