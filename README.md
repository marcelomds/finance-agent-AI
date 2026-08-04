# FinanceAgent

**AI-powered expense processing system with multi-agent orchestration**

Developed at **ME2** | 2026

---

## 🎯 Overview

FinanceAgent automates expense processing: users upload a receipt (PDF/image), Claude Vision extracts the data, a second Claude call classifies it into the organization's own categories, and everything is tracked in a Bull/Redis queue you can watch in real time.

**Status:** working end-to-end for upload → extraction → classification, behind JWT auth (email/password + Google login). Validation and bank reconciliation are not implemented yet.

---

## 🏗️ Tech Stack

### Backend
- **Runtime**: Node.js 20 (Alpine, via Docker)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM 7 (`@prisma/adapter-pg` driver adapter), multi-tenant (`Organization` as tenant root)
- **AI**: Claude API (`@anthropic-ai/sdk`), model configurable via `CLAUDE_MODEL` env var (default: `claude-haiku-4-5`)
- **Storage**: AWS S3 (`@aws-sdk/client-s3`), private bucket + signed URLs
- **Queue**: Bull + Redis, dashboard via Bull Board
- **Auth**: JWT (`jsonwebtoken` + `bcryptjs`) for email/password, Google Identity Services (`google-auth-library`) for social login — see [Authentication](#-authentication)
- **Planned**: validation/reconciliation logic, rate limiting

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

# .env at repo root — used by docker-compose for POSTGRES_*, JWT_SECRET, GOOGLE_CLIENT_ID
cp .env.example .env
# generate a JWT_SECRET, e.g.: openssl rand -base64 48
# GOOGLE_CLIENT_ID is optional — leave empty to disable "Login with Google" (see Authentication section)

# backend/.env — used by the app itself
# fill in AWS_*, ANTHROPIC_API_KEY as needed

docker compose up -d --build

# apply migrations (first run only, or after schema changes)
# `migrate dev` needs a TTY and will error inside `docker exec` — use `migrate deploy`
docker exec finance_agent_app npx prisma migrate deploy

# regenerate the Prisma client inside the container after any schema/migration change
# (the bind mount shares source, but node_modules is a separate volume)
docker exec finance_agent_app npx prisma generate

# seed default org/user/categories
docker exec finance_agent_app npx prisma db seed
# prints the dev login: test@test.com / password123
```

**API runs on:** `http://localhost:3000`
**Queue dashboard:** `http://localhost:3000/admin/queues` (requires login)
**Postgres:** `localhost:5432` · **Redis:** `localhost:6379`

### Run frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`. Set `VITE_GOOGLE_CLIENT_ID` in `frontend/.env` (same value as the root `GOOGLE_CLIENT_ID`) to enable the Google login button — it's hidden if unset.

---

## 📁 Project Structure

```
finance-agent/
├── docker/node/Dockerfile
├── docker-compose.yml          # postgres, redis, app
├── .env                        # POSTGRES_*, JWT_SECRET, GOOGLE_CLIENT_ID for docker-compose
├── .env.example                # documents the vars above, no real values
│
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/          # auth, health, expenses, categories, queueDashboard
│   │   │   ├── controllers/     # authController (login/register/google/me) + others
│   │   │   ├── middleware/      # errorHandler, requireAuth, upload (multer)
│   │   │   ├── errors/          # AppError + subclasses
│   │   │   ├── types/           # express.d.ts (req.user), apiResponse
│   │   │   ├── utils/           # authContext (getAuthUser), apiResponse
│   │   ├── services/
│   │   │   ├── ai/              # claudeClient, visionAgent, classificationAgent
│   │   │   ├── storage/         # s3Client, uploadFile, getFileBuffer, getFileUrl
│   │   │   ├── queue/           # expenseQueue.ts, queues.ts (central registry)
│   │   │   ├── authService.ts, expenseService.ts, categoryService.ts, expensePipeline.ts
│   │   ├── db/prisma.ts
│   │   └── index.ts
│   ├── prisma/{schema.prisma,migrations/,seed.ts}
│   └── .env                     # DATABASE_URL, AWS, Anthropic, CLAUDE_MODEL, REDIS_URL
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── auth/            # ProtectedRoute
│       │   ├── layout/          # Sidebar (shows user email + logout), AppLayout
│       ├── contexts/            # AuthContext (JWT + user, replaces old OrganizationContext)
│       ├── lib/                 # authStorage (token/user persistence in localStorage)
│       ├── features/
│       │   ├── auth/            # LoginPage, RegisterPage, GoogleLoginButton, hooks, service
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
id, organizationId, email, name, passwordHash?, googleId?, createdAt, updatedAt
```
`passwordHash` and `googleId` are both nullable — a user has at least one of the two, depending on how they signed up.

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

## 🔐 Authentication

Every `/api/expenses/*`, `/api/categories/*`, and `/admin/queues` route requires a `Bearer` JWT — `organizationId` is read from the token, never from a client-supplied query param or body field.

**Endpoints** (`backend/src/api/routes/auth.ts`):
| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | `email, password, name` | Creates a brand-new organization (`"{name}'s Organization"`) with the user as its first member — no invite flow yet |
| POST | `/api/auth/login` | `email, password` | |
| POST | `/api/auth/google` | `idToken` | Verifies the Google ID token server-side; links to an existing account by email, or creates a new organization the same way `register` does |
| GET | `/api/auth/me` | — | requires `Authorization: Bearer <token>` |

All four return/accept the same shape: `{ token, user: { id, email, name, organizationId } }`. Tokens expire after 1 day (`JWT_EXPIRES_IN` in `authService.ts`).

**Frontend:** `AuthContext` persists `{ token, user }` in `localStorage` (`lib/authStorage.ts`), an axios interceptor (`services/api.ts`) attaches the `Bearer` header to every request and redirects to `/login` on a 401. `ProtectedRoute` gates the authenticated app; `/login` and `/register` are the only public routes.

**Google login setup** (optional — the button auto-hides if unconfigured):
1. Google Cloud Console → APIs & Services → Credentials → **Create OAuth client ID** → Web application.
2. Authorized JavaScript origins: add your frontend dev URL (e.g. `http://localhost:5173`). No redirect URI needed — the frontend uses Google Identity Services' token flow (`GoogleLoginButton.tsx`), not a redirect.
3. Put the client ID in **both** the root `.env` (`GOOGLE_CLIENT_ID`, read by the backend to verify tokens) and `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`, read by the browser to render the button).

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

Manual re-trigger for testing: `POST /api/expenses/:id/process` with `Authorization: Bearer <token>` (runs synchronously, outside the queue).

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
- Invite flow to join an existing organization (registration currently always creates a new one)
- Approval/escalation workflow + Slack notifications
- Tests

---

## 📄 License

MIT License - See LICENSE file for details
