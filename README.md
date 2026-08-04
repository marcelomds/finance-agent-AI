# FinanceAgent

**AI-powered expense processing system with multi-agent orchestration**

Developed at **ME2** | 2026

---

## 🎯 Overview

FinanceAgent automates expense processing: users upload a receipt (PDF/image), Claude Vision extracts the data, a second Claude call classifies it into the organization's own categories, and everything is tracked in a Bull/Redis queue you can watch in real time.

**Status:** working end-to-end for upload → extraction → classification. Validation, bank reconciliation, and auth are not implemented yet.

---

## 🏗️ Tech Stack

### Backend
- **Runtime**: Node.js 20 (Alpine, via Docker)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM 7 (`@prisma/adapter-pg` driver adapter), multi-tenant (`Organization` as tenant root)
- **AI**: Claude API (`@anthropic-ai/sdk`), model configurable via `CLAUDE_MODEL` env var (default: `claude-haiku-4-5`)
- **Storage**: AWS S3 (`@aws-sdk/client-s3`), private bucket + signed URLs
- **Queue**: Bull + Redis, dashboard via Bull Board
- **Planned**: validation/reconciliation logic, JWT auth, rate limiting

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind v4
- **Data fetching**: TanStack Query
- **i18n**: i18next, default Portuguese, language switcher persisted in localStorage

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

# backend/.env — used by the app itself
# fill in AWS_*, ANTHROPIC_API_KEY as needed

docker compose up -d --build

# apply migrations (first run only, or after schema changes)
docker exec finance_agent_app npx prisma migrate dev

# seed default org/user/categories
docker exec finance_agent_app npx prisma db seed
```

**API runs on:** `http://localhost:3000`
**Queue dashboard:** `http://localhost:3000/admin/queues`
**Postgres:** `localhost:5432` · **Redis:** `localhost:6379`

### Run frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`.

---

## 📁 Project Structure

```
finance-agent/
├── docker/node/Dockerfile
├── docker-compose.yml          # postgres, redis, app
├── .env                        # POSTGRES_* for docker-compose interpolation
│
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/          # health, expenses, categories, queueDashboard
│   │   │   ├── controllers/
│   │   │   ├── middleware/      # errorHandler, upload (multer)
│   │   │   ├── errors/          # AppError + subclasses
│   │   │   ├── types/, utils/   # ApiResponse envelope
│   │   ├── services/
│   │   │   ├── ai/              # claudeClient, visionAgent, classificationAgent
│   │   │   ├── storage/         # s3Client, uploadFile, getFileBuffer, getFileUrl
│   │   │   ├── queue/           # expenseQueue.ts, queues.ts (central registry)
│   │   │   ├── expenseService.ts, categoryService.ts, expensePipeline.ts
│   │   ├── db/prisma.ts
│   │   └── index.ts
│   ├── prisma/{schema.prisma,migrations/,seed.ts}
│   └── .env                     # DATABASE_URL, AWS, Anthropic, CLAUDE_MODEL, REDIS_URL
│
├── frontend/
│   └── src/
│       ├── components/layout/   # Sidebar, AppLayout
│       ├── contexts/            # OrganizationContext (tenant, no auth yet)
│       ├── features/
│       │   ├── dashboard/, expenses/, categories/
│       └── i18n/locales/{pt,en}.json
│
└── README.md
```

---

## 🗄️ Database Schema

Multi-tenant: every model below belongs to an `Organization`.

### Organization
```
id, name, slug, createdAt, updatedAt
```

### User
```
id, organizationId, email, name, passwordHash, createdAt, updatedAt
```

### Category
```
id, organizationId, name, slug, isActive, createdAt, updatedAt
```
Per-tenant. Claude can only classify into a category that already exists — it never invents one.

### Expense
```
id, organizationId, userId, fileName, s3Key, status
extractedData (JSON: vendor/amount/currency/date/description/confidence)
categoryId, categoryConfidence
validationIssues, validationPassed
matchedBankTxnId, reconciled
approvedAt, approvedBy, rejectionReason
escalatedAt, escalationReason, escalationStatus
createdAt, updatedAt
```

### BankTransaction
```
id, organizationId, userId, amount, currency, date, description, transactionId, createdAt
```

### ProcessingLog
```
id, expenseId, step, status, message, error, duration (ms), tokensUsed, createdAt
```
One row per pipeline step (`vision_extract`, `classification`, ...) — the audit trail for what the AI did and how much it cost.

---

## 🤖 AI Pipeline

```
Upload (PDF/JPG/PNG, ≤10MB)
  → S3 (private bucket, signed URLs for viewing)
  → Expense created (status: processing)
  → enqueued on the expense-processing queue
      → visionAgent: Claude extracts vendor/amount/date/description (status: extracted)
      → classificationAgent: Claude picks one of the org's own categories (status: classified)
```

Each step logs to `ProcessingLog` (success/failure, duration, tokens used) regardless of outcome. Upload is rejected upfront (422) if the organization has no active categories yet — avoids paying for S3 + Vision on something that can't be classified.

Model is swappable anytime via `CLAUDE_MODEL` in `backend/.env` (no code change, just restart) — cheapest to most capable: `claude-haiku-4-5`, `claude-sonnet-5`, `claude-opus-5`, `claude-fable-5`.

Manual re-trigger for testing: `POST /api/expenses/:id/process?organizationId=...` (runs synchronously, outside the queue).

---

## 🔄 Queue & Background Jobs

Background processing runs on **Bull + Redis**, not inline in the request — an upload responds immediately and the AI pipeline runs as a queued job (3 retries, exponential backoff on failure).

**Dashboard:** `http://localhost:3000/admin/queues` (Bull Board — shows waiting/active/completed/failed jobs per queue, retry/inspect from the UI).

Queues are centrally registered in `backend/src/services/queue/queues.ts` — adding a new queue later (e.g. bank reconciliation, notifications) means creating its file next to `expenseQueue.ts` and adding it to that one array; the dashboard picks it up automatically.

| Queue | Purpose |
|---|---|
| `expense-processing` | vision extraction → classification for uploaded expenses |

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

```bash
cd frontend

npm run dev          # vite
npm run build         # tsc -b && vite build
npm run lint          # oxlint
```

---

## 🐳 Docker

`docker-compose.yml` (repo root) runs three services:
- `postgres` — Postgres 15, container `finance_agent_db`, named volume `pgdata`
- `redis` — Redis 7, container `finance_agent_redis`, named volume `redisdata`
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

- Validation agent (deterministic: date sanity, duplicate detection) — no LLM needed
- Bank reconciliation (deterministic matching against `BankTransaction`) — no LLM needed
- Auth (JWT) — frontend currently uses a hardcoded tenant/user, no login
- Approval/escalation workflow + Slack notifications
- Tests

---

## 📄 License

MIT License - See LICENSE file for details
