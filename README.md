<div align="center">

# ⚡ RajatBuilds — Performance Arena

**Real benchmarks. Real databases. Real proof.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-00ff88?style=for-the-badge&logo=vercel&logoColor=black)](https://rajat-builds.vercel.app)
[![API Docs](https://img.shields.io/badge/API_Docs-Railway-7B2FBE?style=for-the-badge&logo=railway&logoColor=white)](https://rajatbuilds-production.up.railway.app/docs)
[![GitHub](https://img.shields.io/badge/Source-GitHub-0d1117?style=for-the-badge&logo=github)](https://github.com/shriramrajat/RajatBuilds)

</div>

---

## 🎯 What Is This?

A full-stack performance engineering case study — not a tutorial, not a toy. Built to answer one question:

> *Can you prove backend optimizations with real data, not just theory?*

**Answer: Yes. 98.5% latency reduction. Measured. Repeatable. Live.**

---

## 📊 Phase 1 — PostgreSQL Index Optimization

| Metric | BEFORE (Full Table Scan) | AFTER (B-Tree Index) | Change |
|---|---|---|---|
| Avg Latency | ~979ms | ~2.91ms | **↓ 98.5%** |
| Min Latency | ~356ms | ~1.2ms | **↓ 99.6%** |
| Max Latency | ~1077ms | ~8ms | **↓ 99.2%** |
| Success Rate | 100% | 100% | — |

**What we did:** 100,000 rows of realistic user data in PostgreSQL. Ran 50 concurrent requests against an unindexed `city` column (full table scan). Result: ~980ms average. Applied a single `CREATE INDEX`. Same 50 concurrent requests: **2.91ms**.

---

## 🎮 Phase 2 & 3 — Live Load Tester + Gaming Dashboard

A cyberpunk-themed dashboard built in Next.js that lets you:
- **FIRE** real concurrent HTTP requests at any API endpoint
- **Watch the Boss HP bar** drain as latency increases
- **Pin a baseline** and get Before vs. After comparison with delta %
- **See full battle history** with P95, max, RPS, and success rate per run

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           Vercel (Frontend)             │
│  Next.js 14 · Tailwind v4 · Framer      │
│  Recharts · TypeScript                  │
└─────────────────┬───────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────┐
│           Railway (Backend)             │
│  FastAPI · SQLAlchemy (async)           │
│  asyncpg · Connection Pool (20)         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│     Railway PostgreSQL (100k rows)      │
│  B-Tree index on city column            │
│  Query time: 2.91ms (was 979ms)         │
└─────────────────────────────────────────┘
```

---

## 🚀 Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS v4, Framer Motion, Recharts |
| **Backend** | FastAPI, Python 3.12, SQLAlchemy (async), asyncpg |
| **Database** | PostgreSQL (Railway), B-Tree indexing |
| **Deployment** | Vercel (frontend) + Railway (backend + DB) |
| **Load Testing** | Custom async engine using `httpx` + `asyncio.gather` |

---

## 🧪 Run It Locally

**Backend:**
```bash
cd phase-1-performance
pip install -r requirements.txt
# Set DATABASE_URL in .env
python seed.py       # Seeds 100k rows
python attack.py     # Applies B-Tree index
python main.py       # Starts FastAPI on :8000
```

**Frontend:**
```bash
cd frontend
npm install
# Set NEXT_PUBLIC_API_URL=http://localhost:8000 in .env.local
npm run dev          # Starts Next.js on :3000
```

---

## 📁 Project Structure

```
RajatBuilds/
├── main.py              # FastAPI backend (Phase 1 + 2)
├── models.py            # SQLAlchemy User model
├── seed.py              # 100k row seeder
├── attack.py            # B-Tree index applier
├── routers/
│   └── test.py          # Load tester API (/api/v1/test)
├── loader/
│   ├── engine.py        # Async concurrent HTTP engine
│   └── schemas.py       # Request/response schemas
└── frontend/            # Next.js app
    ├── app/             # App router
    ├── components/      # Dashboard, BossHP, History, Config
    └── lib/             # API client, types
```

---

## 💡 Key Engineering Decisions

- **asyncpg over psycopg2** — native async driver, no thread-pool overhead
- **Connection pooling (size=20)** — no cold connections under load
- **B-Tree index on city** — O(log n) lookup vs O(n) full scan
- **`asyncio.gather`** — true concurrent requests, not sequential loops
- **P95 reporting** — avg latency lies; P95 tells the truth

---

<div align="center">

**Built by [Rajat](https://github.com/shriramrajat) · Proof over promises.**

</div>
