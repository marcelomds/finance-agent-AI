# FinanceAgent

**AI-powered expense processing system with multi-agent orchestration**

Developed at **ME2** | 2026

---

## 🎯 Overview

FinanceAgent will automate expense processing using AI agents that extract receipt data via Claude Vision, classify expenses, validate entries, and reconcile with bank transactions.

**Status:** early stage — database schema and Docker environment are set up; API, agents and frontend are not implemented yet.

---

## 🏗️ Tech Stack

### Backend (in progress)
- **Runtime**: Node.js 20 (Alpine, via Docker)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM 7 (`@prisma/adapter-pg` driver adapter)
- **AI**: Claude API (`@anthropic-ai/sdk`)
- **Planned**: Express.js API, Bull/Redis queue, AWS S3 storage

### Frontend
Not started yet.

---

## 🚀 Quick Start

### Prerequisites
```
Docker + Docker Compose
```

### Run with Docker

```bash
git clone <repo>
cd finance-agent

# .env at repo root — used by docker-compose for POSTGRES_* interpolation
cat .env
# POSTGRES_USER=postgres
# POSTGRES_PASSWORD=postgres
# POSTGRES_DB=finance_agent

# backend/.env — used by the app itself (Prisma, AWS, Anthropic, etc)
# fill in AWS_*, ANTHROPIC_API_KEY as needed

docker compose up -d --build

# apply migrations (first run only, or after schema changes)
docker exec finance_agent_app npx prisma migrate dev
```

**App runs on:** `http://localhost:3000`
**Postgres runs on:** `localhost:5432`

### Run locally without Docker

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

---

## 📁 Project Structure

```
finance-agent/
├── docker/
│   └── node/
│       └── Dockerfile
├── docker-compose.yml
├── .env                        # POSTGRES_* for docker-compose interpolation
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts
│   │   ├── types.ts
│   │   └── index.ts            # entry point (Prisma connectivity check)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── prisma.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                    # app-level env (DATABASE_URL, AWS, Anthropic...)
│
└── README.md
```

---

## 🗄️ Database Schema

### User
```
id, email, name, passwordHash, createdAt, updatedAt
```

### Expense
```
id, userId, fileName, s3Key, status
extractedData (JSON), category, categoryConfidence
validationIssues, validationPassed
matchedBankTxnId, reconciled
approvedAt, approvedBy, rejectionReason
escalatedAt, escalationReason, escalationStatus
createdAt, updatedAt
```

### BankTransaction
```
id, userId, amount, currency, date, description, transactionId, createdAt
```

### ProcessingLog
```
id, expenseId, step, status, message, error
duration (ms), tokensUsed, createdAt
```

---

## 🛠️ Development Scripts

```bash
cd backend

npm run dev          # tsx watch src/index.ts
npm run build        # tsc
npm run db:migrate   # prisma migrate dev
npm run db:push      # prisma db push
npx prisma studio    # Prisma GUI
```

---

## 🐳 Docker

`docker-compose.yml` (repo root) runs two services:
- `postgres` — Postgres 15, container `finance_agent_db`, named volume `pgdata`
- `app` — builds `docker/node/Dockerfile` with build context `backend/`, container `finance_agent_app`, bind-mounts `backend/` into `/app`

```bash
docker compose up -d --build     # build + start
docker compose logs -f app       # tail app logs
docker compose down              # stop
```

---

## ⚙️ CI/CD

`.github/workflows/ci.yml` runs on every push/PR to `main`, 3 jobs:
- **backend** — `npm ci` → `prisma generate` → `npm run build` (tsc)
- **frontend** — `npm ci` → `npm run lint` (oxlint) → `npm run build` (tsc + vite)
- **docker** — builds the backend image from `docker/node/Dockerfile` (no push yet)

No deploy step configured yet — added as the project grows.

---

## 🗺️ Roadmap (not implemented yet)

- Express.js REST API (`/api/expenses`, `/api/dashboard`, `/api/admin`)
- Multi-agent pipeline: vision extraction → classification → validation → bank reconciliation
- Bull/Redis job queue
- AWS S3 receipt storage
- JWT auth, rate limiting
- React + Vite frontend with real-time dashboard
- Tests

---

## 📄 License

MIT License - See LICENSE file for details
